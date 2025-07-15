// This would be used for server-side route protection
// For now, we'll handle admin auth on the client side

export function checkAdminAuth() {
  if (typeof window === 'undefined') return false;
  
  const adminData = localStorage.getItem('admin');
  return adminData ? JSON.parse(adminData) : null;
}

export function requireAdmin(redirectTo = '/admin/signin') {
  const admin = checkAdminAuth();
  if (!admin) {
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
    return null;
  }
  return admin;
}