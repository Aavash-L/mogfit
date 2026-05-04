export const ADMIN_EMAILS = ['alamichhane158@gmail.com'];

export function isAdmin(email: string | undefined | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email);
}
