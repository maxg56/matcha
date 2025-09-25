import { ResponsiveLayout } from './ResponsiveLayout';
import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';

export function AuthenticatedLayout() {
  const { fetchProfile } = useUserStore();

  useEffect(() => {
    // Charge le profil de l'utilisateur au montage du layout
    fetchProfile();
  }, [fetchProfile]);

  return (
    <ResponsiveLayout 
      showNavigation={true}
      showAuthActions={true}
    >
      <Outlet />
    </ResponsiveLayout>
  );
}