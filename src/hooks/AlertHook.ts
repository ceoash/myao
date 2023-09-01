import AlertContext, { IAlertContext } from "@/context/AlertContext";
import { useContext } from "react";

export const useAlerts = (): IAlertContext => {
    const context = useContext(AlertContext);
    if (!context) {
      throw new Error('useAlerts must be used within a AlertProvider');
    }
    return context;
  };
  