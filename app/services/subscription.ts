import { api } from "./api";

export const getPlans = async () => {
    const response = await api.get("/subscriptions/plans");
    return response.data.data;
};

export interface Plan {
  id: number;
  name: string;
  price: string; // numeric comes back as string from pg
  subject_limit: number | null;
  quiz_limit: number | null;
  video_limit: number | null;
  downloads_enabled: boolean;
  ai_tutor_enabled: boolean;
}

export const getMySubscription = async () => {
    const response = await api.get("/subscriptions/me");
    return response.data.data;
};

export const subscribeMock = async (planId: number) => {

    const response = await api.post("/subscriptions/mock", {
        planId
    });

    return response.data.data;
};