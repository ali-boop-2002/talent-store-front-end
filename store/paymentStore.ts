import { create } from "zustand";

interface PaymentStore {
  pay: boolean;
  setPay: (value: boolean) => void;
}

export const usePaymentStore = create<PaymentStore>((set) => ({
  pay: false,
  setPay: (value) => set({ pay: value }),
}));
