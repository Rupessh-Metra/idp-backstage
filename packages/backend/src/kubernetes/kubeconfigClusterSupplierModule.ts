import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { kubernetesClusterSupplierExtensionPoint } from '@backstage/plugin-kubernetes-node';
import { KubeconfigClustersSupplier } from './KubeconfigClustersSupplier';

export const kubeconfigClusterSupplierModule = createBackendModule({
  pluginId: 'kubernetes',
  moduleId: 'kubeconfig-cluster-supplier',
  register(reg) {
    reg.registerInit({
      deps: {
        clusterSupplier: kubernetesClusterSupplierExtensionPoint,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
      },
      async init({ clusterSupplier, config, logger }) {
        clusterSupplier.addClusterSupplier(
          new KubeconfigClustersSupplier(config, logger),
        );
      },
    });
  },
});
