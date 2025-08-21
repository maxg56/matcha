import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfilePhotos } from '@/components/profile/ProfilePhotos';
import { ProfileBasicInfo } from '@/components/profile/ProfileBasicInfo';
import { ProfileBio } from '@/components/profile/ProfileBio';
import { ProfileSections } from '@/components/profile/ProfileSections';
import { ProfileInterests } from '@/components/profile/ProfileInterests';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { mockUser } from '@/components/profile/UserProfileData';

export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-full">
      <ProfileHeader />

      <div className="flex-1 space-y-6 bg-white dark:bg-gray-800 mx-4 mb-4 rounded-b-2xl shadow-lg">
        <div className="p-4 space-y-6">
          <ProfilePhotos images={mockUser.images} userName={mockUser.name} />
          
          <div className="space-y-4">
            <ProfileBasicInfo user={mockUser} />
            <ProfileBio bio={mockUser.bio} user={mockUser} photos={mockUser.images} />
            <ProfileSections user={mockUser} />
            <ProfileInterests interests={mockUser.interests} />
            <ProfileStats stats={mockUser.stats} />
          </div>
        </div>
      </div>
    </div>
  );
}