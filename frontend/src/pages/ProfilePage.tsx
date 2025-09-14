import { useEffect, useState } from 'react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfilePhotos } from '@/components/profile/ProfilePhotos';
import { ProfileBasicInfo } from '@/components/profile/ProfileBasicInfo';
import { ProfileBio } from '@/components/profile/ProfileBio';
import { ProfileSections } from '@/components/profile/ProfileSections';
import { ProfileInterests } from '@/components/profile/ProfileInterests';
// import { ProfileStats } from '@/components/profile/ProfileStats';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { PremiumBlur, PremiumUpsellModal } from '@/components/premium';
import { Eye, Users, TrendingUp, Heart, Crown, Zap } from 'lucide-react';

export default function ProfilePage() {
  const { fetchProfile, profile, isLoading } = useUserStore();
  const { isAuthenticated } = useAuthStore();

  // Premium state management
  const [isPremium] = useState(false); // TODO: Get from user context/store
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Mock premium statistics
  const premiumStats = {
    profileViews: 127,
    likesReceived: 34,
    matchRate: 85,
    popularityRank: 'Top 15%',
    bestPhotoIndex: 0,
    peakOnlineTime: '20h - 22h'
  };

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
            <ProfileInterests interests={profile?.interests || []} />

            {/* Premium Profile Analytics */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">Statistiques du profil</h3>
                {!isPremium && (
                  <Crown className="w-4 h-4 text-yellow-500" />
                )}
              </div>

              <PremiumBlur
                feature="profile-visits"
                isBlurred={!isPremium}
                onUpgrade={() => setShowPremiumModal(true)}
                className="rounded-lg"
              >
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                    <Eye className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{premiumStats.profileViews}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Vues cette semaine</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                    <Heart className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{premiumStats.likesReceived}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Likes reçus</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Taux de match</span>
                      <span className="font-bold text-green-600">{premiumStats.matchRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${premiumStats.matchRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Popularité</span>
                      <span className="font-bold text-purple-600">{premiumStats.popularityRank}</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Meilleure heure</span>
                      <span className="font-bold text-blue-600">{premiumStats.peakOnlineTime}</span>
                    </div>
                  </div>
                </div>
              </PremiumBlur>
            </div>

            {/* Premium Photo Insights */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-700">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-orange-900 dark:text-orange-100">Insights Photos</h3>
                {!isPremium && (
                  <Crown className="w-4 h-4 text-yellow-500" />
                )}
              </div>

              <PremiumBlur
                feature="advanced-filters"
                isBlurred={!isPremium}
                onUpgrade={() => setShowPremiumModal(true)}
                className="rounded-lg"
              >
                <div className="space-y-3">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">#{premiumStats.bestPhotoIndex + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">Photo la plus performante</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">85% plus de likes que la moyenne</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Conseils d'optimisation</h4>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li>• Ajoutez une photo en extérieur (+40% de likes)</li>
                      <li>• Montrez votre sourire (+25% d'engagement)</li>
                      <li>• Variez les angles de prise de vue</li>
                    </ul>
                  </div>
                </div>
              </PremiumBlur>
            </div>

            {/* <ProfileStats stats={profile?.stats || {}} /> */}
          </div>
        </div>
      </div>

      {/* Premium Upsell Modal */}
      <PremiumUpsellModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onUpgrade={() => {
          console.log('Upgrade to Premium!');
          setShowPremiumModal(false);
        }}
        trigger="profile-view"
        contextData={{
          profileName: profile?.username
        }}
      />
    </div>
  );
}