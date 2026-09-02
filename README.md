# Ksquare IDP

An internal developer portal built on [Backstage](https://backstage.io): a
software catalog, GitHub-backed sign-in with role-based access control,
software templates (including a "Deploy to kind" template that ships a
container straight to Kubernetes), and Kubernetes visibility on each
component's page.

## Prerequisites

- **Node.js 22 or 24** (see `engines` in `package.json`). If you use `nvm`,
  run `nvm use 22` before anything else - a mismatched Node version will
  fail at startup with a native-module error (`better-sqlite3` /
  `NODE_MODULE_VERSION`).
- **Yarn 4**, via [Corepack](https://nodejs.org/api/corepack.html) (bundled
  with Node): `corepack enable` if `yarn --version` doesn't already print
  `4.13.0`.
- A **GitHub account** and a small **GitHub OAuth App** (see below) - this
  app signs in with GitHub, there's no local username/password login.
- *(Optional)* A local **kind** ([kind.sigs.k8s.io](https://kind.sigs.k8s.io))
  cluster and a **Docker Hub** account, only needed if you want to use the
  Kubernetes tab or the "Deploy to kind" template.

## 1. Install

```sh
git clone <this-repo-url>
cd idp
yarn install
```

## 2. Configure `app-config.local.yaml`

This file is git-ignored (it holds credentials) and doesn't exist yet on a
fresh clone. Create it at the repo root:

```yaml
integrations:
  github:
    - host: github.com
      token: <a GitHub personal access token, needs repo + read:org scopes>

auth:
  environment: development
  providers:
    github:
      development:
        clientId: <your GitHub OAuth App client ID>
        clientSecret: <your GitHub OAuth App client secret>
        signIn:
          resolvers:
            - resolver: usernameMatchingUserEntityName
```

To get a GitHub OAuth App: GitHub → Settings → Developer settings → OAuth
Apps → New OAuth App. Set:

- **Homepage URL**: `http://localhost:3000`
- **Authorization callback URL**: `http://localhost:7007/api/auth/github/handler/frame`

The `token` above is a separate [personal access
token](https://github.com/settings/tokens) used by the backend to read
GitHub repos/orgs for the catalog - it's not the OAuth App's secret.

### Register yourself so sign-in works

The `usernameMatchingUserEntityName` resolver only lets in GitHub accounts
that already have a matching `User` entity in the catalog. Edit
[`examples/github-org.yaml`](./examples/github-org.yaml) and either replace
the existing `rupessh-metra` user with your **lowercase GitHub username**, or
add your own entry:

```yaml
apiVersion: backstage.io/v1alpha1
kind: User
metadata:
  name: <your-github-username>   # lowercase
spec:
  memberOf: [developers]         # or [platform-admins] for full access
```

`platform-admins` gets full access; `developers` can browse, register
components, and run templates but can't delete; anyone else who signs in
gets read-only access. See `packages/backend/src/permissions/` for the RBAC
policy itself.

## 3. Start it

```sh
yarn start
```

- Frontend: http://localhost:3000
- Backend: http://localhost:7007

The catalog database is a persistent SQLite file under
`packages/backend/.data/` (git-ignored), so registered components and
starred entities survive restarts.

## Optional: Kubernetes features

The Kubernetes tab and the "Deploy to kind" scaffolder template need two
more blocks in `app-config.local.yaml`:

```yaml
kubernetes:
  # Read-only kubeconfig used to show cluster status on entity pages
  kubeconfigPath: /path/to/a-read-only-kubeconfig.yaml
  # Write-capable kubeconfig used only by the kubernetes:deploy action
  deployKubeconfigPath: /path/to/a-write-capable-kubeconfig.yaml
  # Only needed to use "Deploy to kind" with a private Docker Hub image
  dockerHub:
    username: <docker hub username>
    token: <docker hub access token>
    imagePullSecret: <name of a kubernetes.io/dockerconfigjson secret in-cluster>
```

Both kubeconfig files just need a single context pointing at your cluster
(e.g. a local `kind` cluster) with a token-based user - see
`packages/backend/src/kubernetes/` for exactly what's expected. None of this
is required to run the rest of the portal.

## Troubleshooting

- **"NODE_MODULE_VERSION" error on startup**: your active Node version
  doesn't match what `node_modules` was installed with. Switch to Node 22/24
  and reinstall (`yarn install`) if needed.
- **Stuck on the sign-in page after authorizing with GitHub**: your GitHub
  username isn't in the catalog yet - see "Register yourself" above.
- **`EADDRINUSE` on port 3000 or 7007**: something else is already running;
  stop it or kill whatever's bound to that port.
