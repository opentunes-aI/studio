import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Web3State {
    isConnected: boolean;
    address: string | null;
    chainId: number | null;
    connect: () => Promise<void>;
    disconnect: () => void;
}

// Mock Web3 Store
export const useWeb3Store = create<Web3State>()(
    persist(
        (set) => ({
            isConnected: false,
            address: null,
            chainId: null,

            connect: async () => {
                // Mock connection delay
                await new Promise(resolve => setTimeout(resolve, 800));
                set({
                    isConnected: true,
                    address: "0x71C7656EC7ab88b098defB751B7401B5f6d89A21", // Mock Address
                    chainId: 1 // Mainnet
                });
            },

            disconnect: () => set({ isConnected: false, address: null, chainId: null }),
        }),
        {
            name: 'web3-storage',
            skipHydration: true
        }
    )
);
