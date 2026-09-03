import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node';
import { createCatalogUserOnboardAction } from './onboardUserAction';

export const catalogUserOnboardActionModule = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'catalog-user-onboard-action',
  register(reg) {
    reg.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig,
        permissions: coreServices.permissions,
      },
      async init({ scaffolder, config, permissions }) {
        scaffolder.addActions(
          createCatalogUserOnboardAction(config, permissions),
        );
      },
    });
  },
});
