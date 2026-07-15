import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { getMySubscription } from "../services/subscription";

interface Subscription {
  plan_id: number;
  name: string;
  price: number;
  downloads_enabled: boolean;
  quiz_limit: number | null;
  subject_limit: number | null;
  video_limit: number | null;
  expires_at: string | null;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  loading: true,
  refreshSubscription: async () => {},
});

export const SubscriptionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [subscription, setSubscription] =
    useState<Subscription | null>(null);

  const [loading, setLoading] = useState(true);

  const refreshSubscription = async () => {
    try {
      setLoading(true);

      const data = await getMySubscription();

      setSubscription(data);
    } catch (error) {
      console.log("Subscription Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSubscription();
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        refreshSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () =>
  useContext(SubscriptionContext);