export function getToken(): string | null {
  return localStorage.getItem('ecm_token');
}

export function getRoles(): string[] {
  try {
    return JSON.parse(localStorage.getItem('ecm_roles') || '[]');
  } catch {
    return [];
  }
}

export function hasRole(...roles: string[]): boolean {
  const userRoles = getRoles();
  return roles.some((r) => userRoles.includes(r));
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('ecm_token');
}

export function logout() {
  localStorage.removeItem('ecm_token');
  localStorage.removeItem('ecm_user');
  localStorage.removeItem('ecm_roles');
  localStorage.removeItem('ecm_fullName');
}
