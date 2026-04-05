import { useReducer } from "react";
import { EducationContext } from "./EducationContext";
import { EducationReducer } from "./EducationReducer";
import { initialEducationStore } from "./EducationStore";

export const EducationProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(EducationReducer, initialEducationStore);

  return (
    <EducationContext.Provider value={[state, dispatch]}>
      {children}
    </EducationContext.Provider>
  );
};