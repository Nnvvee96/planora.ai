// src/utils/navigationUtils.js
import { useNavigate } from "react-router-dom";

export const useNavigation = () => {
  const navigate = useNavigate();

  const goToPlanTrip = () => {
    navigate("/plan-trip");
  };

  // Platzhalter: Weitere Navigationsfunktionen (z. B. goToProfile) können hier hinzugefügt werden,
  // wenn mehr Logik benötigt wird. Derzeit nur minimal implementiert.
  return { goToPlanTrip };
};