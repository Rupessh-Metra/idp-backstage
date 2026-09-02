import { KubeConfig, KubernetesObjectApi, PatchStrategy } from '@kubernetes/client-node';
import type { KubernetesObject } from '@kubernetes/client-node';
import type { Config } from '@backstage/config';
import { InputError } from '@backstage/errors';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { createTagResolver } from './registries';

const FIELD_MANAGER = 'backstage-scaffolder';
const REGISTRY_PROVIDER = 'dockerHub';

// Kubernetes Service names must satisfy DNS-1035: lowercase alphanumerics
// and '-' only, and must start with a letter. Deployment/label/selector
// names are kept identical to the Service name so they all refer to the
// same object consistently.
export function normalizeResourceName(name: string): string {
  const normalized = name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+$/, '');
  return /^[a-z]/.test(normalized) ? normalized : `app-${normalized}`;
}

type DeployInput = {
  name: string;
  image: string;
  replicas: number;
  namespace: string;
  containerPort: number;
  imagePullSecret: string;
};

function buildDeployment(input: DeployInput): KubernetesObject {
  return {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: input.name,
      namespace: input.namespace,
      labels: { 'backstage.io/kubernetes-id': input.name },
    },
    spec: {
      replicas: input.replicas,
      selector: { matchLabels: { app: input.name } },
      template: {
        metadata: {
          labels: {
            app: input.name,
            'backstage.io/kubernetes-id': input.name,
          },
        },
        spec: {
          imagePullSecrets: [{ name: input.imagePullSecret }],
          containers: [
            {
              name: input.name,
              image: input.image,
              ports: [{ containerPort: input.containerPort }],
            },
          ],
        },
      },
    },
  } as unknown as KubernetesObject;
}

function buildService(input: DeployInput): KubernetesObject {
  return {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: input.name,
      namespace: input.namespace,
      labels: { 'backstage.io/kubernetes-id': input.name },
    },
    spec: {
      type: 'ClusterIP',
      selector: { app: input.name },
      ports: [
        {
          port: input.containerPort,
          targetPort: input.containerPort,
        },
      ],
    },
  } as unknown as KubernetesObject;
}

export function createKubernetesDeployAction(config: Config) {
  const resolveLatestTag = createTagResolver(config);

  return createTemplateAction({
    id: 'kubernetes:deploy',
    description:
      'Deploys a private Docker Hub image to Kubernetes as a Deployment and a matching ClusterIP Service',
    schema: {
      input: {
        name: z =>
          z
            .string()
            .describe(
              'Name of the Deployment/Service; also set as the backstage.io/kubernetes-id label',
            ),
        repo: z =>
          z
            .string()
            .describe(
              'Docker Hub repository in "namespace/repo" form, e.g. rupessh/web-calci',
            ),
        tag: z =>
          z
            .string()
            .optional()
            .describe(
              'Explicit tag to deploy. If omitted, the most recently pushed tag is used',
            ),
        replicas: z =>
          z.number().default(1).describe('Number of pod replicas'),
        namespace: z =>
          z.string().default('default').describe('Kubernetes namespace'),
        containerPort: z =>
          z.number().default(80).describe('Container port to expose'),
      },
      output: {
        name: z => z.string(),
        namespace: z => z.string(),
        image: z => z.string(),
      },
    },
    async handler(ctx) {
      const {
        name,
        repo,
        tag: explicitTag,
        replicas: requestedReplicas = 1,
        namespace = 'default',
        containerPort = 80,
      } = ctx.input;

      const replicas = Math.max(1, requestedReplicas);

      const normalizedName = normalizeResourceName(name);
      if (normalizedName !== name) {
        ctx.logger.info(
          `'${name}' is not a valid Kubernetes resource name; using '${normalizedName}' for the Deployment, Service, and backstage.io/kubernetes-id label instead`,
        );
      }

      const kubeconfigPath = config.getOptionalString(
        'kubernetes.deployKubeconfigPath',
      );
      if (!kubeconfigPath) {
        throw new InputError(
          'No kubernetes.deployKubeconfigPath configured - cannot deploy',
        );
      }

      const imagePullSecret = config.getString(
        'kubernetes.dockerHub.imagePullSecret',
      );

      const tag =
        explicitTag ?? (await resolveLatestTag(REGISTRY_PROVIDER, repo));
      const image = `docker.io/${repo}:${tag}`;
      ctx.logger.info(`Resolved image to deploy: ${image}`);

      const kubeConfig = new KubeConfig();
      kubeConfig.loadFromFile(kubeconfigPath);
      const client = KubernetesObjectApi.makeApiClient(kubeConfig);

      const input: DeployInput = {
        name: normalizedName,
        image,
        replicas,
        namespace,
        containerPort,
        imagePullSecret,
      };

      for (const manifest of [buildDeployment(input), buildService(input)]) {
        ctx.logger.info(
          `Applying ${manifest.kind} ${namespace}/${normalizedName} to cluster`,
        );
        await client.patch(
          manifest,
          undefined,
          undefined,
          FIELD_MANAGER,
          true,
          PatchStrategy.ServerSideApply,
        );
      }

      ctx.output('name', normalizedName);
      ctx.output('namespace', namespace);
      ctx.output('image', image);
    },
  });
}
