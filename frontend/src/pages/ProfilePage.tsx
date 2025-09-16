import { useEffect } from 'react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfilePhotos } from '@/components/profile/ProfilePhotos';
import { ProfileBasicInfo } from '@/components/profile/ProfileBasicInfo';
import { ProfileBio } from '@/components/profile/ProfileBio';
import { ProfileSections } from '@/components/profile/ProfileSections';
import { ProfileInterests } from '@/components/profile/ProfileInterests';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';

export default function ProfilePage() {
  const { fetchProfile, profile, isLoading } = useUserStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile().catch((error) => {
        console.error('Error fetching profile:', error);
      });
    }
  }, [fetchProfile, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-full items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Please log in to view your profile.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-full items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
      </div>
    );
  }

  return (
 
    <div className="flex flex-col min-h-full">
      <ProfileHeader />

      <div className="flex-1 space-y-6 bg-white dark:bg-gray-800 mx-4 mb-4 rounded-b-2xl shadow-lg">
        <div className="p-4 space-y-6">
          <ProfilePhotos images={profile?.images || []} userName={profile?.username || ''} />

          <div className="space-y-4">
            {profile && <ProfileBasicInfo user={profile} />}
            <ProfileBio bio={profile?.bio || ''} user={profile} photos={profile?.images || []} />
            {profile && <ProfileSections user={profile} />}
            <ProfileInterests interests={profile?.tags || []} />
          </div>
        </div>
      </div>
    </div>
  );
}