import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CheckoutState {
  step: number;
  selectedAddressId: string | null;
  couponCode: string | null;
  
  setStep: (step: number) => void;
  setSelectedAddressId: (id: string | null) => void;
  setCouponCode: (code: string | null) => void;
  resetCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      step: 1,
      selectedAddressId: null,
      couponCode: null,
      
      setStep: (step) => set({ step }),
      setSelectedAddressId: (selectedAddressId) => set({ selectedAddressId }),
      setCouponCode: (couponCode) => set({ couponCode }),
      resetCheckout: () => set({ step: 1, selectedAddressId: null, couponCode: null }),
    }),
    {
      name: 'checkout-storage',
    }
  )
);
