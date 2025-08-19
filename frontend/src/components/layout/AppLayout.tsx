import { Outlet } from 'react-router-dom';
import { NotificationButton } from '../Notifications';

export const AppLayout: React.FC = () => {
  return (
    <>
      <NotificationButton />
      <div className="min-h-screen bg-background text-foreground">
        <Outlet />
      </div>
    </>
  );
};