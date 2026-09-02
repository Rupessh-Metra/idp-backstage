// A single registry provider knows how to look up the most recently pushed
// tag for a `namespace/repo`-style repository reference. New providers (e.g.
// JFrog) implement this interface and get registered in ./index.ts.
export interface RegistryTagResolver {
  resolveLatestTag(repo: string): Promise<string>;
}
