import { ROLES } from '../constants/roles';
import { ROUTES } from '../constants/routes';
import { normalizeRole } from '../constants/roleAccess';

export function getDefaultRouteForRole(role) {
  switch (normalizeRole(role)) {
    case ROLES.AUTHORITY:
    case ROLES.ADMIN:
      return ROUTES.ADMIN_DASHBOARD;
    case ROLES.HELPER:
      return ROUTES.HELPER_DASHBOARD;
    case ROLES.VICTIM:
    default:
      return ROUTES.VICTIM_DASHBOARD;
  }
}
