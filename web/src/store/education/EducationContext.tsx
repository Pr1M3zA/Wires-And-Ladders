import { createContext } from "react";
import { initialEducationStore } from "./EducationStore";
import type { EduDataStore } from "./EducationStore";
import type { EducationalDataAction } from "./EducationActions";

type EduDataContextType = [
  EduDataStore,
  React.Dispatch<EducationalDataAction>
];

export const EducationContext = createContext<EduDataContextType>([
  initialEducationStore,
  (() => {}) as React.Dispatch<EducationalDataAction>,
]);



