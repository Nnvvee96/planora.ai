import { useAuth } from "@/features/auth/authApi";
import { AppUser } from "@/features/auth/types/authTypes";
import { useEffect, useState } from "react";

export const useAuthUser = (): AppUser | null => {
  const { user } = useAuth();
  const [authUser, setAuthUser] = useState<AppUser | null>(null);

  useEffect(() => {
    if (user) {
      setAuthUser(user);
    }
  }, [user]);

  return authUser;
};
