import type { Config } from '@backstage/config';
import { InputError } from '@backstage/errors';
import type { RegistryTagResolver } from './types';
import { DockerHubTagResolver } from './dockerHub';

export type { RegistryTagResolver } from './types';

type ResolverFactory = () => RegistryTagResolver;

// Add new providers here (e.g. 'jfrog') as they're implemented. Factories
// are only invoked (and only then need their config to be present) once a
// deploy actually asks for that provider.
function buildResolverFactories(config: Config): Record<string, ResolverFactory> {
  return {
    dockerHub: () =>
      new DockerHubTagResolver({
        username: config.getString('kubernetes.dockerHub.username'),
        token: config.getString('kubernetes.dockerHub.token'),
      }),
  };
}

// Pluggable registry lookup: resolveLatestTag(provider, repo) dispatches to
// whichever RegistryTagResolver is registered for that provider.
export function createTagResolver(config: Config) {
  const factories = buildResolverFactories(config);

  return async function resolveLatestTag(
    provider: string,
    repo: string,
  ): Promise<string> {
    const factory = factories[provider];
    if (!factory) {
      throw new InputError(`Unknown registry provider '${provider}'`);
    }
    return factory().resolveLatestTag(repo);
  };
}
