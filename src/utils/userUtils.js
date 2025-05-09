// src/utils/userUtils.js
export const getInitials = (user) => {
  const firstInitial = user?.firstName ? user.firstName.charAt(0).toUpperCase() : "";
  const lastInitial = user?.lastName ? user.lastName.charAt(0).toUpperCase() : "";
  return `${firstInitial}${lastInitial}` || "U"; // Default to "U" if no initials
};

export const getBackgroundColor = (user) => {
  if (user?.gender === "male") return "bg-blue-500";
  if (user?.gender === "female") return "bg-pink-500";
  return "bg-gray-500"; // Neutral color
};