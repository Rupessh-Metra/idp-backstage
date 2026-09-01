import {
  ApiBlueprint,
  configApiRef,
  createFrontendModule,
} from '@backstage/frontend-plugin-api';
import { scmAuthApiRef } from '@backstage/integration-react';
import {
  githubActionsApiRef,
  GithubActionsClient,
} from '@backstage/plugin-github-actions';

const githubActionsApi = ApiBlueprint.make({
  name: 'github-actions',
  params: define =>
    define({
      api: githubActionsApiRef,
      deps: { configApi: configApiRef, scmAuthApi: scmAuthApiRef },
      factory: ({ configApi, scmAuthApi }) =>
        new GithubActionsClient({ configApi, scmAuthApi }),
    }),
});

export const githubActionsApiModule = createFrontendModule({
  pluginId: 'app',
  extensions: [githubActionsApi],
});
