import { JsonRpcProvider, Connection } from "@mysten/sui.js"

// Initialize Sui provider
const connection = new Connection({
  fullnode: process.env.SUI_RPC_URL || "https://fullnode.mainnet.sui.io:443",
})
export const provider = new JsonRpcProvider(connection)

// Contract constants
export const STAKING_PACKAGE_ID = process.env.STAKING_PACKAGE_ID || ""
export const STAKING_MODULE_NAME = "stakingvalidate"
export const STAKING_POOL_ID = process.env.STAKING_POOL_ID || ""
export const CLOCK_ID = "0x6" // Sui system clock object ID

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
