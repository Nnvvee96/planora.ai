import { createContext } from "react";
import { UserProfile } from "../types/profileTypes";

export interface UserProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export const UserProfileContext = createContext<UserProfileContextType>({
  profile: null,
  loading: true,
  error: null,
});
