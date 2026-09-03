import { Octokit } from '@octokit/rest';
import type { Config } from '@backstage/config';
import {
  DefaultGithubCredentialsProvider,
  ScmIntegrations,
} from '@backstage/integration';
import { InputError } from '@backstage/errors';

export async function createOctokitForRepo(
  config: Config,
  repo: string,
): Promise<Octokit> {
  const integrations = ScmIntegrations.fromConfig(config);
  const credentialsProvider =
    DefaultGithubCredentialsProvider.fromIntegrations(integrations);
  const url = `https://github.com/${repo}`;

  const integration = integrations.github.byUrl(url);
  if (!integration) {
    throw new InputError(
      `No GitHub integration configured that covers '${repo}'`,
    );
  }

  const { token } = await credentialsProvider.getCredentials({ url });
  if (!token) {
    throw new InputError(`No GitHub credentials available for '${repo}'`);
  }

  return new Octokit({
    auth: token,
    baseUrl: integration.config.apiBaseUrl,
  });
}
