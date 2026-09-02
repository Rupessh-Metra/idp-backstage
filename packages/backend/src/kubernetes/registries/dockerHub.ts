import { InputError } from '@backstage/errors';
import type { RegistryTagResolver } from './types';

const LOGIN_URL = 'https://hub.docker.com/v2/users/login/';

type DockerHubTag = {
  name: string;
  last_updated: string;
};

type DockerHubTagsResponse = {
  results: DockerHubTag[];
};

export type DockerHubConfig = {
  username: string;
  token: string;
};

function pickLatestTag(tags: DockerHubTag[]): string {
  if (tags.length === 0) {
    throw new InputError('Docker Hub repository has no tags to deploy');
  }

  // Skip a tag literally named "latest" unless it's the only tag - it's a
  // moving pointer, not a specific, traceable build.
  const nonLatest = tags.filter(tag => tag.name !== 'latest');
  const candidates = nonLatest.length > 0 ? nonLatest : tags;

  return candidates.reduce((newest, tag) =>
    new Date(tag.last_updated).getTime() >
    new Date(newest.last_updated).getTime()
      ? tag
      : newest,
  ).name;
}

export class DockerHubTagResolver implements RegistryTagResolver {
  constructor(private readonly config: DockerHubConfig) {}

  private async authenticate(): Promise<string> {
    const response = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: this.config.username,
        password: this.config.token,
      }),
    });

    if (!response.ok) {
      throw new InputError(
        `Failed to authenticate to Docker Hub as '${this.config.username}': ${response.status} ${response.statusText}`,
      );
    }

    const { token } = (await response.json()) as { token: string };
    return token;
  }

  async resolveLatestTag(repo: string): Promise<string> {
    const [namespace, name] = repo.split('/');
    if (!namespace || !name) {
      throw new InputError(
        `Docker Hub repo must be in "namespace/repo" form, got '${repo}'`,
      );
    }

    const jwt = await this.authenticate();

    const response = await fetch(
      `https://hub.docker.com/v2/repositories/${namespace}/${name}/tags/?page_size=100`,
      { headers: { Authorization: `JWT ${jwt}` } },
    );

    if (!response.ok) {
      throw new InputError(
        `Failed to list tags for Docker Hub repo '${repo}': ${response.status} ${response.statusText}`,
      );
    }

    const { results } = (await response.json()) as DockerHubTagsResponse;
    return pickLatestTag(results);
  }
}
