// export function requireAuth() {
//   const token = localStorage.getItem('token');

//   if (!token) {
//     window.location.href = '/login';
//   }
// }
import { getRoleFromToken }
from './role';

export const isAdmin = () => {
  const role = getRoleFromToken();

  return (
    role === 'OWNER' ||
    role === 'ADMIN'
  );
};

export const isUser = () => {
  const role = getRoleFromToken();

  return (
    role === 'ACCOUNTANT' ||
    role === 'MEMBER' ||
    role === 'VIEWER'
  );
};