export const MORROW_ROLES = ["OWNER", "ADMIN", "MEMBER", "VIEWER"] as const;

export type MorrowRole = (typeof MORROW_ROLES)[number];

export function isMorrowRole(value: string): value is MorrowRole {
  return MORROW_ROLES.includes(value as MorrowRole);
}

export function canManageAccess(role: string) {
  return role === "OWNER" || role === "ADMIN";
}

export function canManageWorkspace(role: string) {
  return role === "OWNER" || role === "ADMIN";
}

export function canCreateWorkspaceContent(role: string) {
  return role === "OWNER" || role === "ADMIN" || role === "MEMBER";
}

export function roleLabel(role: string) {
  if (role === "OWNER") return "Owner";
  if (role === "ADMIN") return "Admin";
  if (role === "VIEWER") return "Viewer";
  return "Contributor";
}

export function roleDescription(role: string) {
  if (role === "OWNER") return "Full control, including member roles and security.";
  if (role === "ADMIN") return "Runs the workspace and approves access requests.";
  if (role === "VIEWER") return "Can read workspace information but cannot change it.";
  return "Creates and updates day-to-day workspace content.";
}
