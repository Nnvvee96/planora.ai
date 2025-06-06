import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TravelAvatar } from '@/ui/atoms/TravelAvatar';
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

// Properly import from API boundaries
import { userProfileService } from '../services/userProfileService';
import { getAuthService } from '@/features/auth/authApi';
import { useUserProfileIntegration } from '../hooks/useUserProfileIntegration';

// Directly lazy-load components to avoid circular dependencies
import { lazy } from 'react';

const ProfileDialog = lazy(() => import('./dialogs/ProfileDialog').then(module => ({
  default: module.ProfileDialog
})));
const SettingsDialog = lazy(() => import('./dialogs/SettingsDialog').then(module => ({
  default: module.SettingsDialog
})));

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
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: firstName || '',
    lastName: lastName || '',
    email: userEmail || '',
    birthdate: birthdate || ''
  });
  
  // Use integration hook to access user profile data safely
  const userProfileIntegration = useUserProfileIntegration();

  // Define fetchUserProfile as a useCallback to prevent unnecessary re-renders
  const fetchUserProfile = useCallback(async () => {
    if (!profileDialogOpen) return;
    
    try {
      // Get auth service via factory function to avoid circular dependencies
      const authService = getAuthService();
      
      // Get current auth user with proper API boundary
      const authUser = await authService.getCurrentUser();
      
      if (!authUser || !authUser.id) {
        console.warn('No authenticated user available');
        return;
      }
      
      // Get user with profile using integration hook
      const user = await userProfileIntegration.getUserWithProfile(authUser.id);
      
      if (!user) {
        console.warn('Could not load user profile data');
        return;
      }
      
      // Update profile data state with retrieved information
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        birthdate: user.birthdate || ''
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, [profileDialogOpen, userProfileIntegration]);
  
  // Fetch user profile when dialog opens
  useEffect(() => {
    if (profileDialogOpen) {
      fetchUserProfile();
    }
  }, [profileDialogOpen, fetchUserProfile]);

  const handleLogout = async () => {
    try {
      // Get auth service via factory function to avoid circular dependencies
      const authService = getAuthService();
      
      // Use auth service for logout
      await authService.logout();
      
      // Clean up any local state
      localStorage.removeItem('userSession');
      localStorage.removeItem('userProfile');
      
      // Use callback if provided
      if (onLogout) {
        onLogout();
      }
      
      // Navigate to root instead of login page
      // This is important for proper navigation flow
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20">
            <span className="sr-only">Open user menu</span>
            <Avatar className={mini ? "h-8 w-8" : "h-10 w-10"}>
              <AvatarImage src="" alt={userName} />
              <AvatarFallback className="p-0">
                <TravelAvatar 
                  userName={userName} 
                  size={mini ? 'sm' : 'md'} 
                />
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
            <DropdownMenuItem onClick={() => setProfileDialogOpen(true)}>
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
            <DropdownMenuItem onClick={() => setSettingsDialogOpen(true)}>
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

      {/* Profile Dialog with Suspense fallback */}
      <Suspense fallback={<div className="fixed inset-0 bg-background/80 flex items-center justify-center">Loading profile...</div>}>
        {profileDialogOpen && (
          <ProfileDialog 
            open={profileDialogOpen} 
            onOpenChange={setProfileDialogOpen} 
            userName={userName}
            userEmail={profileData.email}
            firstName={profileData.firstName}
            lastName={profileData.lastName}
            birthdate={profileData.birthdate}
          />
        )}
      </Suspense>

      {/* Settings Dialog with Suspense fallback */}
      <Suspense fallback={<div className="fixed inset-0 bg-background/80 flex items-center justify-center">Loading settings...</div>}>
        {settingsDialogOpen && (
          <SettingsDialog 
            open={settingsDialogOpen} 
            onOpenChange={setSettingsDialogOpen}
          />
        )}
      </Suspense>
    </>
  );
};

export { UserProfileMenu };
