import React, { useState, useEffect } from 'react';
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
import { ProfileModal } from './modals/ProfileModal';
import { SettingsModal } from './modals/SettingsModal';
import { authService } from '../../auth/api';
import { userProfileService } from '@/features/user-profile/api';
import { ProfileFormData, ProfileModalProps, SettingsModalProps } from '@/features/user-profile/types/profileTypes';

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
          // Get current user through the auth service API
          const currentUser = await authService.getCurrentUser();
          
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
      // Use authService through the proper API boundary for logout
      await authService.logout();
      console.log("User logged out");
      
      // Call the onLogout callback if provided
      if (onLogout) {
        onLogout();
      }
      
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
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

      {/* Profile Modal */}
      <ProfileModal 
        open={profileModalOpen} 
        onOpenChange={setProfileModalOpen} 
        userName={userName}
        userEmail={profileData.email}
        firstName={profileData.firstName}
        lastName={profileData.lastName}
        birthdate={profileData.birthdate}
      />

      {/* Settings Modal */}
      <SettingsModal 
        open={settingsModalOpen} 
        onOpenChange={setSettingsModalOpen}
      />
    </>
  );
};

export { UserProfileMenu };
