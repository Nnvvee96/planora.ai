/**
 * Travel Avatar Component
 *
 * This component displays a travel-themed avatar when the user hasn't uploaded their own profile picture.
 * It follows Planora's architectural principles of separation of concerns.
 */

import React from "react";
import { Plane, Globe, Map, Compass, Palmtree, Mountain } from "lucide-react";
import { cn } from "@/lib/utils";

// Array of travel-themed icons to randomly select from
const TRAVEL_ICONS = [Plane, Globe, Map, Compass, Palmtree, Mountain];

interface TravelAvatarProps {
  userName?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const TravelAvatar = ({
  userName,
  className,
  size = "md",
}: TravelAvatarProps) => {
  // Use a hash of the username to consistently pick the same icon for the same user
  const getHashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  // Select an icon based on the username hash
  const userHash = getHashCode(userName || "traveler");
  const IconComponent = TRAVEL_ICONS[userHash % TRAVEL_ICONS.length];

  // Calculate size classes
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
  };

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center bg-gradient-to-br from-planora-accent-purple to-planora-accent-pink text-white",
        sizeClasses[size],
        className,
      )}
    >
      <IconComponent
        className={cn(
          "text-white",
          size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-7 w-7",
        )}
      />
    </div>
  );
};

// No default export - following Planora's architectural principles
