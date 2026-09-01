import type { UserInfoService } from '@backstage/backend-plugin-api';
import {
  AuthorizeResult,
  Permission,
  PolicyDecision,
  isPermission,
} from '@backstage/plugin-permission-common';
import type { PermissionPolicy, PolicyQuery, PolicyQueryUser } from '@backstage/plugin-permission-node';
import {
  catalogEntityCreatePermission,
  catalogEntityReadPermission,
  catalogLocationAnalyzePermission,
  catalogLocationCreatePermission,
  catalogLocationReadPermission,
} from '@backstage/plugin-catalog-common/alpha';
import {
  actionExecutePermission,
  taskCancelPermission,
  taskCreatePermission,
  taskReadPermission,
  templateParameterReadPermission,
  templateStepReadPermission,
} from '@backstage/plugin-scaffolder-common/alpha';

const ADMIN_GROUP = 'group:default/platform-admins';
const DEVELOPER_GROUP = 'group:default/developers';

const ALLOW: PolicyDecision = { result: AuthorizeResult.ALLOW };
const DENY: PolicyDecision = { result: AuthorizeResult.DENY };

// Read the catalog, register/create entities (including via the "Analyze"
// flow), and read + run the scaffolder. Explicitly excludes
// catalogEntityDeletePermission and catalogLocationDeletePermission.
const DEVELOPER_PERMISSIONS: Permission[] = [
  catalogEntityReadPermission,
  catalogLocationReadPermission,
  catalogEntityCreatePermission,
  catalogLocationCreatePermission,
  catalogLocationAnalyzePermission,
  templateParameterReadPermission,
  templateStepReadPermission,
  actionExecutePermission,
  taskCreatePermission,
  taskReadPermission,
  taskCancelPermission,
];

// Read-only: browse the catalog and read scaffolder templates, but cannot
// create/register entities or run (execute) a template.
const READ_ONLY_PERMISSIONS: Permission[] = [
  catalogEntityReadPermission,
  catalogLocationReadPermission,
  templateParameterReadPermission,
  templateStepReadPermission,
];

function matchesAny(permission: Permission, allowed: Permission[]): boolean {
  return allowed.some(candidate => isPermission(permission, candidate));
}

export class CustomPermissionPolicy implements PermissionPolicy {
  constructor(private readonly userInfo: UserInfoService) {}

  async handle(
    request: PolicyQuery,
    user?: PolicyQueryUser,
  ): Promise<PolicyDecision> {
    // No resolved identity at all: deny by default.
    if (!user) {
      return DENY;
    }

    const { ownershipEntityRefs } = await this.userInfo.getUserInfo(
      user.credentials,
    );

    // Admins (by group membership, never by hardcoded username) get
    // everything.
    if (ownershipEntityRefs.includes(ADMIN_GROUP)) {
      return ALLOW;
    }

    if (ownershipEntityRefs.includes(DEVELOPER_GROUP)) {
      return matchesAny(request.permission, DEVELOPER_PERMISSIONS)
        ? ALLOW
        : DENY;
    }

    // Any other authenticated user: read-only.
    return matchesAny(request.permission, READ_ONLY_PERMISSIONS)
      ? ALLOW
      : DENY;
  }
}
