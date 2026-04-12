import React from "react";
import { useBusses } from "../data";
import { useBrowserStorage } from "./useBrowserStorage";
import { useProfile } from "./useProfile";

const STORAGE_KEY = "OPERATOR_SELECTED_BUS";

/**
 * Returns the currently active bus registration number for the operator view.
 * - Operators: always returns their own registrationNumber from the token profile.
 * - Admins: returns the selection stored in session storage (defaults to the first bus).
 */
export const useSelectedBus = () => {
  const profile = useProfile();
  const isOperator = !!profile?.registrationNumber;

  const {
    objs: { data: busses, isSuccess: bussesLoaded },
  } = useBusses();

  const [storedBus, setStoredBus] = useBrowserStorage<string>(
    "SESSION",
    STORAGE_KEY,
    "",
  );

  // For admins: once busses are loaded, ensure a default is set and the stored bus still exists
  React.useEffect(() => {
    if (isOperator || !bussesLoaded || !busses?.length) return;
    const storedStillExists = busses.some((b) => b.registrationNumber === storedBus);
    if (!storedBus || !storedStillExists) {
      setStoredBus(busses[0].registrationNumber);
    }
  }, [isOperator, bussesLoaded, busses, storedBus, setStoredBus]);

  const selectedRegistrationNumber = isOperator
    ? profile.registrationNumber!
    : storedBus || busses?.[0]?.registrationNumber || "";

  return {
    selectedRegistrationNumber,
    setSelectedRegistrationNumber: isOperator ? undefined : setStoredBus,
    busses: isOperator ? undefined : busses,
    isOperator,
  };
};
