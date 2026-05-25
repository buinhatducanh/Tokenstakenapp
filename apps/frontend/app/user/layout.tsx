import UserSidebar
from '@/components/user-sidebar';

export default function UserLayout({
  children,
}: any) {
  return (
    <div
      style={{
        display: 'flex',
      }}
    >
      <UserSidebar />

      <div
        style={{
          flex: 1,
          padding: '20px',
        }}
      >
        {children}
      </div>
    </div>
  );
}