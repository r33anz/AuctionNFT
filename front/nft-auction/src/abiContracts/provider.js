import { ethers } from 'ethers';

const SEPOLIA_RPC_URL = import.meta.env.VITE_SEPOLIA_RPC
let provider;

export const getProvider = () => {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
  }
  return provider;
};
