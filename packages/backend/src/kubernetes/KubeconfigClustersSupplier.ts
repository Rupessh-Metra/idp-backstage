import { KubeConfig } from '@kubernetes/client-node';
import type { Config } from '@backstage/config';
import type {
  BackstageCredentials,
  LoggerService,
} from '@backstage/backend-plugin-api';
import type {
  ClusterDetails,
  KubernetesClustersSupplier,
} from '@backstage/plugin-kubernetes-node';
import { ANNOTATION_KUBERNETES_AUTH_PROVIDER } from '@backstage/plugin-kubernetes-common';

// Reads a token-based kubeconfig file and exposes one ClusterDetails per
// context. Only bearer-token users are supported - contexts whose user
// relies on a client certificate or an exec plugin are skipped, since there
// is no credential here that can be forwarded as a Backstage auth strategy.
export class KubeconfigClustersSupplier implements KubernetesClustersSupplier {
  private readonly clusters: ClusterDetails[];

  constructor(config: Config, logger: LoggerService) {
    const kubeconfigPath =
      config.getOptionalString('kubernetes.kubeconfigPath') ??
      process.env.KUBECONFIG;

    if (!kubeconfigPath) {
      logger.warn(
        'No kubeconfig path configured (kubernetes.kubeconfigPath or KUBECONFIG env var) - no Kubernetes clusters will be available',
      );
      this.clusters = [];
      return;
    }

    const kubeConfig = new KubeConfig();
    kubeConfig.loadFromFile(kubeconfigPath);

    this.clusters = kubeConfig
      .getContexts()
      .map(context => {
        const cluster = kubeConfig.getCluster(context.cluster);
        const user = kubeConfig.getUser(context.user);

        if (!cluster) {
          logger.warn(
            `Skipping kubeconfig context '${context.name}': no cluster '${context.cluster}' found`,
          );
          return undefined;
        }

        if (!user?.token) {
          logger.warn(
            `Skipping kubeconfig context '${context.name}': user '${context.user}' has no bearer token (client-cert/exec auth is not supported)`,
          );
          return undefined;
        }

        const clusterDetails: ClusterDetails = {
          name: context.name,
          url: cluster.server,
          authMetadata: {
            [ANNOTATION_KUBERNETES_AUTH_PROVIDER]: 'serviceAccount',
            serviceAccountToken: user.token,
          },
          ...(cluster.caData
            ? { caData: cluster.caData }
            : { skipTLSVerify: true }),
        };
        return clusterDetails;
      })
      .filter((details): details is ClusterDetails => details !== undefined);
  }

  async getClusters(_options: {
    credentials: BackstageCredentials;
  }): Promise<ClusterDetails[]> {
    return this.clusters;
  }
}
