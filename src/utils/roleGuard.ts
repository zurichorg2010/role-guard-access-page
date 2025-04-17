// Define the role hierarchy
export const ROLE = {
  DEVELOPER: 'developer', // highest
  OWNER: 'owner',
  ADMIN: 'admin',
  VISITOR: 'visitor' // lowest
};

export const ROLE_HIERARCHY = [ROLE.DEVELOPER, ROLE.OWNER, ROLE.ADMIN, ROLE.VISITOR];

// Hard-coded developer code
export const DEVELOPER_CODE = '112233';

// Default codes (used if not in localStorage)
const DEFAULT_OWNER_CODE = '445566';
const DEFAULT_ADMIN_CODE = '778899';

// Storage keys
export const OWNER_CODE_KEY = 'pageOwnerCode';
export const ADMIN_CODE_KEY = 'pageAdminCode';
export const CUSTOM_ROLES_KEY = 'pageCustomRoles';
export const CURRENT_ROLE_KEY = 'currentRole';

// Get current role
export function getCurrentRole(): string {
  return localStorage.getItem(CURRENT_ROLE_KEY) || ROLE.VISITOR;
}

// Set current role
export function setCurrentRole(role: string): void {
  localStorage.setItem(CURRENT_ROLE_KEY, role);
}

// Check if user has access to a required role
export function hasAccess(requiredRole: string): boolean {
  const userIndex = ROLE_HIERARCHY.indexOf(getCurrentRole());
  const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole);
  
  // For custom roles not in hierarchy, check if user is that exact role
  if (requiredIndex === -1) {
    return getCurrentRole() === requiredRole;
  }
  
  return userIndex <= requiredIndex;
}

// Get stored code with fallback
export function getStoredCode(key: string, defaultVal: string): string {
  return localStorage.getItem(key) || defaultVal;
}

// Save code to localStorage
export function saveCode(key: string, newCode: string): void {
  if (!/^\d{6}$/.test(newCode)) {
    throw new Error('Code must be 6 digits');
  }
  localStorage.setItem(key, newCode);
}

// Get owner code from storage or default
export function getOwnerCode(): string {
  return getStoredCode(OWNER_CODE_KEY, DEFAULT_OWNER_CODE);
}

// Get admin code from storage or default
export function getAdminCode(): string {
  return getStoredCode(ADMIN_CODE_KEY, DEFAULT_ADMIN_CODE);
}

// Get custom roles from storage
export function getCustomRoles(): Record<string, string> {
  const stored = localStorage.getItem(CUSTOM_ROLES_KEY);
  return stored ? JSON.parse(stored) : {
    'betaTester': '123456',
    'partner': '654321'
  };
}

// Save custom roles to storage
export function saveCustomRoles(roles: Record<string, string>): void {
  localStorage.setItem(CUSTOM_ROLES_KEY, JSON.stringify(roles));
}

// Check if a code matches any custom role
export function matchesCustomRole(code: string): string | null {
  const customRoles = getCustomRoles();
  for (const [role, roleCode] of Object.entries(customRoles)) {
    if (roleCode === code) {
      return role;
    }
  }
  return null;
}

// Try to set role based on a code
export function tryBecomeRole(code: string): boolean {
  if (code === DEVELOPER_CODE) {
    setCurrentRole(ROLE.DEVELOPER);
    return true;
  }
  
  if (code === getOwnerCode()) {
    setCurrentRole(ROLE.OWNER);
    return true;
  }
  
  if (code === getAdminCode()) {
    setCurrentRole(ROLE.ADMIN);
    return true;
  }
  
  const customRole = matchesCustomRole(code);
  if (customRole) {
    setCurrentRole(customRole);
    return true;
  }
  
  return false;
}

// Apply role-based access restrictions to DOM elements
export function applyRoleRestrictions(): void {
  document.querySelectorAll('[data-role]').forEach(el => {
    const requiredRole = (el as HTMLElement).dataset.role as string;
    if (!hasAccess(requiredRole)) {
      (el as HTMLElement).style.display = 'none';
    } else {
      (el as HTMLElement).style.display = '';
    }
  });
}

// Check if current role can manage a target role
export function canManageRole(targetRole: string): boolean {
  const currentRole = getCurrentRole();
  
  // Developer can manage all roles except itself
  if (currentRole === ROLE.DEVELOPER) {
    return targetRole !== ROLE.DEVELOPER;
  }
  
  // Owner can manage admin and custom roles
  if (currentRole === ROLE.OWNER) {
    return targetRole === ROLE.ADMIN || !ROLE_HIERARCHY.includes(targetRole);
  }
  
  // Admin can only manage custom roles
  if (currentRole === ROLE.ADMIN) {
    return !ROLE_HIERARCHY.includes(targetRole);
  }
  
  // Visitors can't manage any roles
  return false;
}
