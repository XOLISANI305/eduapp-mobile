import { api } from "./api";

export interface PaymentResponse {
  success: boolean;
  payment_url: string;
  payment: {
    id: number;
    amount: string;
    status: string;
  };
}

export const createPayFastPayment = async (
  planId: number
): Promise<PaymentResponse> => {
  const response = await api.post("/payments/payfast/create", {
    plan_id: planId,
  });
  return response.data;
};