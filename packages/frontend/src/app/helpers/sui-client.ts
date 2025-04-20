import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

// Initialize Sui client for testnet
export const suiClient = new SuiClient({
  url: getFullnodeUrl("testnet"),
});

// Contract constants
export const STAKING_PACKAGE_ID = "0x053cb94ecf6b1ef428ece53b82a3de900330b7fe11a96c6518b5f938a6c772e6";
export const STAKING_MODULE_NAME = "stakingvalidate";
export const STAKING_POOL_ID = process.env.NEXT_PUBLIC_STAKING_POOL_ID || ""; // Update with your pool ID
export const CLOCK_ID = "0x6"; // Sui system clock object ID

// Helper function to format stake info
export function formatStakeInfo(data: any) {
  return {
    amount: Number(data[0]),
    stakeTimestamp: Number(data[1]),
    rewardDebt: Number(data[2]),
  }
}

// Helper function to format pool info
export function formatPoolInfo(data: any) {
  return {
    stakedBalance: Number(data[0]),
    rewardsBalance: Number(data[1]),
    rewardRate: Number(data[2]),
    lastUpdateTimestamp: Number(data[3]),
    minStakeDuration: Number(data[4]),
  }
}