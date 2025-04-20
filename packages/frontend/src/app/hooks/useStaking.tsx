import { useState, useEffect } from 'react';
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { STAKING_PACKAGE_ID, STAKING_MODULE_NAME, STAKING_POOL_ID, formatStakeInfo, formatPoolInfo } from '~~/helpers/sui-client';
import { prepareStakeTransaction, prepareUnstakeTransaction, prepareClaimRewardsTransaction } from '~~/helpers/suiTransact';
import { SUI_TYPE_ARG } from '@mysten/sui/utils';

export default function useStaking() {
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  
  const [stakeInfo, setStakeInfo] = useState(null);
  const [poolInfo, setPoolInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch stake info for current account
  const fetchStakeInfo = async () => {
    if (!currentAccount?.address) return;
    
    try {
      setIsLoading(true);
      
      // Get dynamic field with stake info
      const response = await suiClient.getDynamicFieldObject({
        parentId: STAKING_POOL_ID,
        name: {
          type: 'address',
          value: currentAccount.address,
        }
      });
      
      if (response.data) {
        const content = response.data.content;
        if (content.dataType === 'moveObject') {
          setStakeInfo(formatStakeInfo(content.fields.value));
        }
      } else {
        // User has no stake yet
        setStakeInfo(null);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching stake info:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch pool info
  const fetchPoolInfo = async () => {
    try {
      setIsLoading(true);
      
      const response = await suiClient.getObject({
        id: STAKING_POOL_ID,
        options: {
          showContent: true,
        }
      });
      
      if (response.data?.content?.dataType === 'moveObject') {
        const fields = response.data.content.fields;
        setPoolInfo(formatPoolInfo([
          fields.staked_balance,
          fields.rewards_balance,
          fields.reward_rate,
          fields.last_update_timestamp,
          fields.min_stake_duration,
        ]));
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching pool info:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Stake SUI tokens
  const stake = async (amount: string) => {
    if (!currentAccount) return;
    
    try {
      setIsLoading(true);
      const tx = prepareStakeTransaction(amount);
      
      signAndExecute({
        transactionBlock: tx,
      }, {
        onSuccess: (result) => {
          console.log('Stake success:', result);
          // Refresh stake info after transaction
          fetchStakeInfo();
          fetchPoolInfo();
        },
        onError: (err) => {
          console.error('Stake error:', err);
          setError(err.message);
        }
      });
    } catch (err) {
      console.error('Error preparing stake transaction:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Unstake tokens
  const unstake = async () => {
    if (!currentAccount) return;
    
    try {
      setIsLoading(true);
      const tx = prepareUnstakeTransaction();
      
      signAndExecute({
        transactionBlock: tx,
      }, {
        onSuccess: (result) => {
          console.log('Unstake success:', result);
          // Refresh stake info after transaction
          fetchStakeInfo();
          fetchPoolInfo();
        },
        onError: (err) => {
          console.error('Unstake error:', err);
          setError(err.message);
        }
      });
    } catch (err) {
      console.error('Error preparing unstake transaction:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Claim rewards
  const claimRewards = async () => {
    if (!currentAccount) return;
    
    try {
      setIsLoading(true);
      const tx = prepareClaimRewardsTransaction();
      
      signAndExecute({
        transactionBlock: tx,
      }, {
        onSuccess: (result) => {
          console.log('Claim rewards success:', result);
          // Refresh stake info after transaction
          fetchStakeInfo();
          fetchPoolInfo();
        },
        onError: (err) => {
          console.error('Claim rewards error:', err);
          setError(err.message);
        }
      });
    } catch (err) {
      console.error('Error preparing claim rewards transaction:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount or when account changes
  useEffect(() => {
    if (currentAccount) {
      fetchStakeInfo();
      fetchPoolInfo();
    }
  }, [currentAccount?.address]);

  return {
    stakeInfo,
    poolInfo,
    isLoading,
    error,
    stake,
    unstake,
    claimRewards,
    refreshData: () => {
      fetchStakeInfo();
      fetchPoolInfo();
    }
  };
}