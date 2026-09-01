import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node';
import { createKubernetesDeployAction } from './deployAction';

export const kubernetesDeployActionModule = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'kubernetes-deploy-action',
  register(reg) {
    reg.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig,
      },
      async init({ scaffolder, config }) {
        scaffolder.addActions(createKubernetesDeployAction(config));
      },
    });
  },
});
