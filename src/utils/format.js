// The API stores money as integer paise.
export function money(paise) {
  const n = (paise ?? 0) / 100;
  return `Rs. ${Number.isInteger(n) ? n : n.toFixed(2)}`;
}
export function moneyTight(paise) {
  return money(paise).replace('Rs. ', 'Rs.');
}
export function shortDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: '2-digit' });
}
export const pad2 = (n) => String(n).padStart(2, '0');
export function initials(name = '') {
  const p = name.trim().split(/\s+/).filter(Boolean);
  return ((p[0]?.[0] || '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase() || '?';
}
export const MOBILE_RE = /^\+?[0-9][0-9\s-]{6,18}$/;
export const PASSWORD_HINT = 'Min 8 characters with an uppercase letter, a lowercase letter and a digit';
export function passwordError(pw) {
  if (pw.length < 8) return PASSWORD_HINT;
  if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw) || !/\d/.test(pw)) return PASSWORD_HINT;
  return '';
}
// Show the first field-level message the API returned, else its general message.
export function errorText(e) {
  if (e?.details?.length) return e.details.map((d) => d.message).join('. ');
  return e?.message || 'Something went wrong';
}
