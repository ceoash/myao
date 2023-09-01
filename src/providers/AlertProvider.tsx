import AlertContext from "@/context/AlertContext";
import UserContext from "@/context/AlertContext";
import { ExtendedActivity, IConversation, INotification} from "@/interfaces/authenticated";
import { FC, ReactNode, useEffect, useState } from "react";

interface AlertProviderProps {
    children: ReactNode;
  }

  interface Alert {
    activity: ExtendedActivity[];
    notifications: INotification[];
    conversations?: IConversation[];
    blockedUsers?: string[];
  }
  
  export const AlertProvider: FC<AlertProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert | null>(null);

   // Load alerts from localStorage once on the client side after mounting
   useEffect(() => {
    const initialAlerts = JSON.parse(localStorage.getItem('alerts') || 'null');
    setAlerts(initialAlerts);
  }, []);

  // Whenever alerts change, save them to localStorage
  useEffect(() => {
    if (alerts) {
      localStorage.setItem('alerts', JSON.stringify(alerts));
    }
  }, [alerts]);

  return (
    <AlertContext.Provider value={{ alerts, setAlerts }}>
      {children}
    </AlertContext.Provider>
  );
  
  };
  