import { ResponsiveLayout } from './ResponsiveLayout';
import { Outlet } from 'react-router-dom';

export function AuthenticatedLayout() {
  return (
    <ResponsiveLayout 
      showNavigation={true}
      showAuthActions={true}
    >
      <Outlet />
    </ResponsiveLayout>
  );
}