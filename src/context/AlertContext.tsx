import { ExtendedActivity, IConversation, INotification } from '@/interfaces/authenticated';
import React, { createContext, useContext, ReactNode } from 'react';

interface Alert {
  activity: ExtendedActivity[];
  notifications: INotification[];
  conversations?: IConversation[];
  blockedUsers?: string[];
}

export interface IAlertContext {
  alerts: Alert | null;
  setAlerts: React.Dispatch<React.SetStateAction<Alert | null>>;
}

const AlertContext = createContext<IAlertContext | undefined>(undefined);

export default AlertContext;