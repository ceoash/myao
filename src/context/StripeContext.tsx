import { createContext, useContext, ReactNode, useState, FC } from 'react';

type StripeContextType = {
  clientSecret: string | undefined;
  setClientSecret: React.Dispatch<React.SetStateAction<string | undefined>>;
};

const StripeContext = createContext<StripeContextType | undefined>(undefined);

export const useStripeContext = () => {
  const context = useContext(StripeContext);
  if (!context) {
    throw new Error("useStripeContext must be used within a StripeProvider");
  }
  return context;
};

export const StripeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [clientSecret, setClientSecret] = useState<string | undefined>(undefined);

  return (
    <StripeContext.Provider value={{ clientSecret, setClientSecret }}>
      {children}
    </StripeContext.Provider>
  );
};
