export const DASHBOARD_BY_ROLE = {
  user: "/library",
  organisation: "/organisation-dashboard",
  admin: "/admin",
};

export function getDashboardForRole(role) {
  return DASHBOARD_BY_ROLE[role] || "/library";
}