// src/utils/navigationUtils.js
import { useNavigate } from "react-router-dom";

export const useNavigation = () => {
  const navigate = useNavigate();

  const goToPlanTrip = () => {
    navigate("/plan-trip");
  };

  return { goToPlanTrip };
};