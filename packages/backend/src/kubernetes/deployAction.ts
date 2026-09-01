import { KubeConfig, KubernetesObjectApi, PatchStrategy } from '@kubernetes/client-node';
import type { KubernetesObject } from '@kubernetes/client-node';
import type { Config } from '@backstage/config';
import { InputError } from '@backstage/errors';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';

const FIELD_MANAGER = 'backstage-scaffolder';

type DeployInput = {
  name: string;
  image: string;
  replicas: number;
  namespace: string;
  containerPort: number;
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
  return createTemplateAction({
    id: 'kubernetes:deploy',
    description:
      'Deploys a container image to Kubernetes as a Deployment and a matching ClusterIP Service',
    schema: {
      input: {
        name: z =>
          z
            .string()
            .describe(
              'Name of the Deployment/Service; also set as the backstage.io/kubernetes-id label',
            ),
        image: z => z.string().describe('Container image to deploy'),
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
      },
    },
    async handler(ctx) {
      const {
        name,
        image,
        replicas = 1,
        namespace = 'default',
        containerPort = 80,
      } = ctx.input;

      const kubeconfigPath = config.getOptionalString(
        'kubernetes.deployKubeconfigPath',
      );
      if (!kubeconfigPath) {
        throw new InputError(
          'No kubernetes.deployKubeconfigPath configured - cannot deploy',
        );
      }

      const kubeConfig = new KubeConfig();
      kubeConfig.loadFromFile(kubeconfigPath);
      const client = KubernetesObjectApi.makeApiClient(kubeConfig);

      const input: DeployInput = {
        name,
        image,
        replicas,
        namespace,
        containerPort,
      };

      for (const manifest of [buildDeployment(input), buildService(input)]) {
        ctx.logger.info(
          `Applying ${manifest.kind} ${namespace}/${name} to cluster`,
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

      ctx.output('name', name);
      ctx.output('namespace', namespace);
    },
  });
}
