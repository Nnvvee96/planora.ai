import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@ui/atoms/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
import ProfileModal from '@/components/modals/ProfileModal';
import SettingsModal from '@/components/modals/SettingsModal';

export interface UserProfileMenuProps {
  userName: string;
  mini?: boolean;
}

const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ userName, mini = false }) => {
  const nameInitial = userName.charAt(0);
  const navigate = useNavigate();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  
  const handleLogout = () => {
    // Handle logout logic here
    console.log("User logged out");
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
              <p className="text-xs leading-none text-muted-foreground">{userName.toLowerCase()}@example.com</p>
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
        userEmail={`${userName.toLowerCase()}@example.com`}
      />

      {/* Settings Modal */}
      <SettingsModal 
        open={settingsModalOpen} 
        onOpenChange={setSettingsModalOpen}
      />
    </>
  );
};

export default UserProfileMenu;
