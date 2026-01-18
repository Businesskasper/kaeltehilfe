import React from "react";
import { useOutletContext } from "react-router-dom";

export type OperatorContextType = {
  lastLocationState: [
    string | undefined,
    React.Dispatch<React.SetStateAction<string | undefined>>,
  ];
};

export const useOperatorContext = () => useOutletContext<OperatorContextType>();
