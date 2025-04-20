import { TransactionBlock } from '@mysten/sui/transactions';
import { STAKING_PACKAGE_ID, STAKING_MODULE_NAME, STAKING_POOL_ID, CLOCK_ID } from './sui-client';

export function prepareStakeTransaction(amount: string) {
  const tx = new TransactionBlock();
  
  // Create coin to stake
  const [coin] = tx.splitCoins(tx.gas, [tx.pure(amount)]);
  
  // Call the stake function
  tx.moveCall({
    target: `${STAKING_PACKAGE_ID}::${STAKING_MODULE_NAME}::stake`,
    arguments: [
      tx.object(STAKING_POOL_ID),
      coin,
      tx.object(CLOCK_ID),
    ],
  });
  
  return tx;
}

export function prepareUnstakeTransaction() {
  const tx = new TransactionBlock();
  
  // Call the unstake function
  tx.moveCall({
    target: `${STAKING_PACKAGE_ID}::${STAKING_MODULE_NAME}::unstake`,
    arguments: [
      tx.object(STAKING_POOL_ID),
      tx.object(CLOCK_ID),
    ],
  });
  
  return tx;
}

export function prepareClaimRewardsTransaction() {
  const tx = new TransactionBlock();
  
  // Call the claim_rewards function
  tx.moveCall({
    target: `${STAKING_PACKAGE_ID}::${STAKING_MODULE_NAME}::claim_rewards`,
    arguments: [
      tx.object(STAKING_POOL_ID),
      tx.object(CLOCK_ID),
    ],
  });
  
  return tx;
}