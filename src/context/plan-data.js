import { createContext, useContext } from "react";

export const PlanDataContext = createContext([]);
export function usePlanData() { return useContext(PlanDataContext); }
