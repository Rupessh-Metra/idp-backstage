import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node';
import {
  createGithubRepoGrantAction,
  createGithubRepoRevokeAction,
} from './repoAccessActions';

export const githubRepoAccessActionsModule = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'github-repo-access-actions',
  register(reg) {
    reg.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig,
      },
      async init({ scaffolder, config }) {
        scaffolder.addActions(
          createGithubRepoGrantAction(config),
          createGithubRepoRevokeAction(config),
        );
      },
    });
  },
});
