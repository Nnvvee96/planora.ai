import React, { useState, useEffect, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Direct imports to avoid circular dependencies 
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Settings, 
  CreditCard, 
  LogOut, 
  Bell, 
  Shield,
  HelpCircle,
  BookMarked
} from 'lucide-react';

// Lazy load modals to avoid bundle issues
const ProfileModal = React.lazy(() => import('./modals/ProfileModal').then(module => ({
  default: module.ProfileModal
})));

const SettingsModal = React.lazy(() => import('./modals/SettingsModal').then(module => ({
  default: module.SettingsModal
})));

// Import user profile service only
import { userProfileService } from '@/features/user-profile/api';
import { ProfileFormData } from '@/features/user-profile/types/profileTypes';

/**
 * UserProfileMenu - A component that displays the user profile menu with dropdown options
 * for profile management, settings, and logout functionality.
 */
export interface UserProfileMenuProps {
  userName: string;
  userEmail?: string;
  firstName?: string;
  lastName?: string;
  birthdate?: string;
  mini?: boolean;
  onLogout?: () => void;
}

const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ 
  userName, 
  userEmail, 
  firstName, 
  lastName, 
  birthdate, 
  mini = false,
  onLogout
}) => {
  const nameInitial = userName.charAt(0);
  const navigate = useNavigate();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: firstName || '',
    lastName: lastName || '',
    email: userEmail || '',
    birthdate: birthdate || ''
  });
  
  // Fetch the latest user profile data when opening the profile modal
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (profileModalOpen) {
        try {
          // Use supabase directly to avoid circular dependencies with proper null checking
          const { data } = await supabase.auth.getUser();
          const user = data?.user ?? null;
          
          // Get current user data with comprehensive null checking
          const currentUser = user ? {
            id: user.id,
            email: user.email || '',
            firstName: (user.user_metadata && typeof user.user_metadata === 'object') ? 
              (user.user_metadata.first_name as string || user.user_metadata.given_name as string || '') : '',
            lastName: (user.user_metadata && typeof user.user_metadata === 'object') ? 
              (user.user_metadata.last_name as string || user.user_metadata.family_name as string || '') : ''
          } : null;
          
          if (currentUser) {
            // Get detailed profile through the user profile service
            const profileData = await userProfileService.getUserProfile(currentUser.id);
            
            // Use data from the profile or fall back to props
            const combinedFirstName = profileData?.firstName || currentUser.firstName || firstName || '';
            const combinedLastName = profileData?.lastName || currentUser.lastName || lastName || '';
            const combinedEmail = currentUser.email || profileData?.email || userEmail || '';
            const combinedBirthdate = birthdate || '';
            
            setProfileData({
              firstName: combinedFirstName,
              lastName: combinedLastName,
              email: combinedEmail,
              birthdate: combinedBirthdate
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };
    
    fetchUserProfile();
  }, [profileModalOpen, firstName, lastName, userEmail, birthdate]);
  
  const handleLogout = async () => {
    try {
      // If onLogout prop is provided, use it
      if (onLogout) {
        onLogout();
        return;
      }
      
      // Use supabase directly to avoid circular dependencies
      await supabase.auth.signOut();
      // Clear local storage
      localStorage.removeItem('hasCompletedInitialFlow');
      localStorage.removeItem('userTravelPreferences');
    } catch (error) {
      console.error('Error during logout:', error);
    }
    
    // Navigate to login page
    navigate('/login');
  };
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20">
            <span className="sr-only">Open user menu</span>
            <Avatar className={mini ? "h-8 w-8" : "h-10 w-10"}>
              <AvatarFallback className="bg-planora-accent-purple text-white">
                {nameInitial}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userName}</p>
              <p className="text-xs leading-none text-muted-foreground">{userEmail || `${userName.toLowerCase()}@example.com`}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setProfileModalOpen(true)}>
              <User className="mr-2 h-4 w-4" />
              <span className="w-full">Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <BookMarked className="mr-2 h-4 w-4" />
              <Link to="/saved-trips" className="w-full">Saved Trips</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <Link to="/preferences" className="w-full">Travel Preferences</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <Link to="/billing" className="w-full">Billing</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSettingsModalOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              <span className="w-full">Settings</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Bell className="mr-2 h-4 w-4" />
              <Link to="/settings/notifications" className="w-full">Notifications</Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Shield className="mr-2 h-4 w-4" />
              <Link to="/settings/privacy" className="w-full">Privacy & Security</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              <Link to="/support" className="w-full">Help & Support</Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span className="w-full">Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Modal with Suspense fallback */}
      <Suspense fallback={<div className="fixed inset-0 bg-background/80 flex items-center justify-center">Loading profile...</div>}>
        {profileModalOpen && (
          <ProfileModal 
            open={profileModalOpen} 
            onOpenChange={setProfileModalOpen} 
            userName={userName}
            userEmail={profileData.email}
            firstName={profileData.firstName}
            lastName={profileData.lastName}
            birthdate={profileData.birthdate}
          />
        )}
      </Suspense>

      {/* Settings Modal with Suspense fallback */}
      <Suspense fallback={<div className="fixed inset-0 bg-background/80 flex items-center justify-center">Loading settings...</div>}>
        {settingsModalOpen && (
          <SettingsModal 
            open={settingsModalOpen} 
            onOpenChange={setSettingsModalOpen}
          />
        )}
      </Suspense>
    </>
  );
};

export { UserProfileMenu };
