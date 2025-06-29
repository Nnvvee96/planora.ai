import React, { useState, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/ui/atoms/Button";
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
import { TravelAvatar } from "@/ui/atoms/TravelAvatar";
import {
  User,
  Settings,
  CreditCard,
  LogOut,
  Bell,
  Shield,
  HelpCircle,
  BookMarked,
} from "lucide-react";

// Properly import from API boundaries
import { getAuthService } from "@/features/auth/authApi";
// Removed: import { useUserProfileIntegration } from '../hooks/useUserProfileIntegration';

// Directly lazy-load components to avoid circular dependencies
import { lazy } from "react";

const ProfileDialog = lazy(() =>
  import("./dialogs/ProfileDialog").then((module) => ({
    default: module.ProfileDialog,
  })),
);
const SettingsDialog = lazy(() =>
  import("./dialogs/SettingsDialog").then((module) => ({
    default: module.SettingsDialog,
  })),
);

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

const UserProfileMenu = ({
  userName,
  userEmail,
  firstName,
  lastName,
  birthdate,
  mini = false,
  onLogout,
}: UserProfileMenuProps) => {
  const _nameInitial = userName.charAt(0);
  const navigate = useNavigate();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  // Removed unused state: const [profileData, setProfileData] = useState(...);

  // SIMPLIFIED: Remove the integration hook dependency to prevent infinite loops
  // The ProfileDialog will handle its own data loading, we don't need to pre-fetch here

  const handleLogout = async () => {
    try {
      // Get auth service via factory function to avoid circular dependencies
      const authService = getAuthService();

      // Use auth service for logout
      await authService.logout();

      // Clean up any local state
      localStorage.removeItem("userSession");
      localStorage.removeItem("userProfile");

      // Use callback if provided
      if (onLogout) {
        onLogout();
      }

      // Navigate to root instead of login page
      // This is important for proper navigation flow
      navigate("/");
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error during logout:", error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/10 hover:bg-white/20 relative z-50"
          >
            <span className="sr-only">Open user menu</span>
            <Avatar className={mini ? "h-8 w-8" : "h-10 w-10"}>
              <AvatarImage src="" alt={userName} />
              <AvatarFallback className="p-0">
                <TravelAvatar userName={userName} size={mini ? "sm" : "md"} />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-2 z-[100] relative isolation-isolate" align="end">
          <DropdownMenuLabel className="p-4 border-b border-white/10 mb-2">
            <div className="flex flex-col space-y-2">
              <p className="text-base font-bold text-white leading-none">{userName}</p>
              <p className="text-sm text-white/60 leading-none">
                {userEmail || `${userName.toLowerCase()}@example.com`}
              </p>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuGroup className="space-y-1">
            <DropdownMenuItem 
              onClick={() => setProfileDialogOpen(true)}
              className="p-3 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >
              <User className="mr-3 h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
              <span className="text-white font-medium group-hover:text-white/90">Profile</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="p-3 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer group relative overflow-hidden">
              <BookMarked className="mr-3 h-5 w-5 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
              <Link to="/saved-trips" className="text-white font-medium group-hover:text-white/90 w-full">
                Saved Trips
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="p-3 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer group relative overflow-hidden">
              <Settings className="mr-3 h-5 w-5 text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300" />
              <Link to="/preferences" className="text-white font-medium group-hover:text-white/90 w-full">
                SmartTravel-Profile
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="p-3 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer group relative overflow-hidden">
              <CreditCard className="mr-3 h-5 w-5 text-orange-400 group-hover:text-orange-300 transition-colors duration-300" />
              <Link to="/billing" className="text-white font-medium group-hover:text-white/90 w-full">
                Billing
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator className="my-3 bg-white/10" />
          
          <DropdownMenuGroup className="space-y-1">
            <DropdownMenuItem 
              onClick={() => setSettingsDialogOpen(true)}
              className="p-3 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >
              <Settings className="mr-3 h-5 w-5 text-slate-400 group-hover:text-slate-300 transition-colors duration-300" />
              <span className="text-white font-medium group-hover:text-white/90">Settings</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="p-3 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer group relative overflow-hidden">
              <Bell className="mr-3 h-5 w-5 text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300" />
              <Link to="/settings/notifications" className="text-white font-medium group-hover:text-white/90 w-full">
                Notifications
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator className="my-3 bg-white/10" />
          
          <DropdownMenuGroup className="space-y-1">
            <DropdownMenuItem className="p-3 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer group relative overflow-hidden">
              <Shield className="mr-3 h-5 w-5 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300" />
              <Link to="/settings/privacy" className="text-white font-medium group-hover:text-white/90 w-full">
                Privacy & Security
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="p-3 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer group relative overflow-hidden">
              <HelpCircle className="mr-3 h-5 w-5 text-green-400 group-hover:text-green-300 transition-colors duration-300" />
              <Link to="/support" className="text-white font-medium group-hover:text-white/90 w-full">
                Help & Support
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator className="my-3 bg-white/10" />
          
          <DropdownMenuItem 
            onClick={handleLogout}
            className="p-3 rounded-xl hover:bg-red-500/20 transition-all duration-300 cursor-pointer group relative overflow-hidden"
          >
            <LogOut className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-300 transition-colors duration-300" />
            <span className="text-white font-medium group-hover:text-red-300">Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Dialog with Suspense fallback */}
      <Suspense
        fallback={
          <div className="fixed inset-0 bg-background/80 flex items-center justify-center">
            Loading profile...
          </div>
        }
      >
        {profileDialogOpen && (
          <ProfileDialog
            open={profileDialogOpen}
            onOpenChange={setProfileDialogOpen}
            userName={userName}
            userEmail={userEmail || ""}
            firstName={firstName || ""}
            lastName={lastName || ""}
            birthdate={birthdate || ""}
          />
        )}
      </Suspense>

      {/* Settings Dialog with Suspense fallback */}
      <Suspense
        fallback={
          <div className="fixed inset-0 bg-background/80 flex items-center justify-center">
            Loading settings...
          </div>
        }
      >
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
