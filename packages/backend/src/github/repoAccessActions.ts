import type { Config } from '@backstage/config';
import { InputError } from '@backstage/errors';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { createOctokitForRepo } from './octokit';

// TODO: Org-level access is intentionally NOT implemented here:
//  - Inviting a user to the GitHub *organization* itself
//    (POST /orgs/{org}/invitations)
//  - Granting access via *team* membership rather than a per-repo
//    collaborator entry (team -> repo access)
// Both require a GitHub App (or a PAT owned by an org owner) with org-admin
// scopes, which our current integration token doesn't have. Add separate
// github:org:invite / github:team:add-repo actions once that's available.

function parseRepo(repo: string): { owner: string; name: string } {
  const [owner, name] = repo.split('/');
  if (!owner || !name) {
    throw new InputError(`repo must be in "owner/name" form, got '${repo}'`);
  }
  return { owner, name };
}

export function createGithubRepoGrantAction(config: Config) {
  return createTemplateAction({
    id: 'github:repo:grant',
    description: 'Grants a GitHub user collaborator access to a repository',
    schema: {
      input: {
        repo: z =>
          z.string().describe('Repository in "owner/name" form'),
        username: z =>
          z.string().describe('GitHub username to grant access to'),
        permission: z =>
          z
            .enum(['pull', 'triage', 'push', 'maintain', 'admin'])
            .describe('Collaborator permission level to grant'),
      },
    },
    async handler(ctx) {
      const { repo, username, permission } = ctx.input;
      const { owner, name } = parseRepo(repo);
      const octokit = await createOctokitForRepo(config, repo);

      const response = await octokit.rest.repos.addCollaborator({
        owner,
        repo: name,
        username,
        permission,
      });

      // 201: a new invitation was created (user wasn't already a
      // collaborator/org member with implicit access) - it's pending until
      // they accept it. 204: access was granted immediately (e.g. they were
      // already an org member, or already a collaborator whose permission
      // just got updated).
      if (response.status === 201) {
        const invitation = response.data as { html_url?: string } | undefined;
        ctx.logger.info(
          `Invited '${username}' to '${repo}' with '${permission}' access - pending until they accept${
            invitation?.html_url ? `: ${invitation.html_url}` : ''
          }`,
        );
      } else {
        ctx.logger.info(
          `Granted '${username}' '${permission}' access to '${repo}' immediately (status ${response.status})`,
        );
      }
    },
  });
}

export function createGithubRepoRevokeAction(config: Config) {
  return createTemplateAction({
    id: 'github:repo:revoke',
    description:
      "Revokes a GitHub user's collaborator access to a repository",
    schema: {
      input: {
        repo: z =>
          z.string().describe('Repository in "owner/name" form'),
        username: z =>
          z.string().describe('GitHub username to revoke access from'),
      },
    },
    async handler(ctx) {
      const { repo, username } = ctx.input;
      const { owner, name } = parseRepo(repo);
      const octokit = await createOctokitForRepo(config, repo);

      await octokit.rest.repos.removeCollaborator({
        owner,
        repo: name,
        username,
      });
      ctx.logger.info(`Revoked collaborator access for '${username}' on '${repo}'`);
    },
  });
}
