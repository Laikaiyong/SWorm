#[allow(unused_use, duplicate_alias)]
module stakingvalidate::stakingvalidate {
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::object::UID;
    use sui::balance::{Self, Balance};
    use sui::tx_context::TxContext;
    use sui::table::{Self, Table};
    use sui::clock::{Self, Clock};
    use sui::event;
    
    /// The staking pool that holds staked tokens and manages rewards
    public struct StakingPool<phantom T> has key {
        id: UID,
        // Total staked tokens
        staked_balance: Balance<T>,
        // Reward token balance
        rewards_balance: Balance<T>,
        // Maps staker addresses to their stake info
        stakes: Table<address, StakeInfo>,
        // Reward rate (rewards per second per token)
        reward_rate: u64,
        // Timestamp of last reward distribution
        last_update_timestamp: u64,
        // Accumulated rewards per token, scaled by 1e9
        rewards_per_token_stored: u64,
        // Minimum staking period in seconds
        min_stake_duration: u64,
    }
    
    /// Information about a user's stake
    public struct StakeInfo has store {
        // Amount of tokens staked
        amount: u64,
        // Timestamp when tokens were staked
        stake_timestamp: u64,
        // User's reward debt
        reward_debt: u64,
        // Rewards per token paid to this user
        rewards_per_token_paid: u64,
    }
    
    /// Capability for the admin to manage the staking pool
    public struct AdminCap has key, store {
        id: UID,
        pool_id: address,
    }
    
    /// Receipt for staked tokens, given to the user
    public struct StakeReceipt<phantom T> has key, store {
        id: UID,
        owner: address,
        amount: u64,
        stake_timestamp: u64,
    }
    
    // Events
    public struct StakeEvent has copy, drop {
        staker: address,
        amount: u64,
    }
    
    public struct UnstakeEvent has copy, drop {
        staker: address,
        amount: u64,
    }
    
    public struct RewardClaimEvent has copy, drop {
        staker: address,
        amount: u64,
    }
    
    // Error codes
    const EInsufficientBalance: u64 = 0;
    const EInvalidAmount: u64 = 1;
    const EStakingLocked: u64 = 2;
    const ENotAdmin: u64 = 3;
    const EStakeNotFound: u64 = 4;
    
    // Constants
    const REWARDS_PRECISION: u64 = 1_000_000_000; // 1e9 precision for rewards calculation
    
    /// Create a new staking pool
    public fun new<T>(
        reward_rate: u64,
        min_stake_duration: u64,
        initial_rewards: Coin<T>,
        ctx: &mut TxContext
    ): (StakingPool<T>, AdminCap) {
        let pool_id = object::new(ctx);
        let id_address = object::uid_to_address(&pool_id);
        
        let pool = StakingPool<T> {
            id: pool_id,
            staked_balance: balance::zero(),
            rewards_balance: coin::into_balance(initial_rewards),
            stakes: table::new(ctx),
            reward_rate,
            last_update_timestamp: tx_context::epoch(ctx),
            rewards_per_token_stored: 0,
            min_stake_duration,
        };
        
        let admin_cap = AdminCap {
            id: object::new(ctx),
            pool_id: id_address,
        };
        
        (pool, admin_cap)
    }
    
    /// Stake tokens into the pool
    public entry fun stake<T>(
        pool: &mut StakingPool<T>,
        amount: Coin<T>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let amount_value = coin::value(&amount);
        assert!(amount_value > 0, EInvalidAmount);
        
        // Update rewards first
        update_rewards(pool, tx_context::sender(ctx), clock);
        
        // Get timestamp
        let current_time = clock::timestamp_ms(clock) / 1000; // Convert to seconds
        
        // Add stake to balance
        balance::join(&mut pool.staked_balance, coin::into_balance(amount));
        
        // Create or update stake info
        if (table::contains(&pool.stakes, tx_context::sender(ctx))) {
            let stake_info = table::borrow_mut(&mut pool.stakes, tx_context::sender(ctx));
            stake_info.amount = stake_info.amount + amount_value;
            stake_info.stake_timestamp = current_time;
            stake_info.reward_debt = calculate_reward_debt(stake_info.amount, pool.rewards_per_token_stored);
        } else {
            let stake_info = StakeInfo {
                amount: amount_value,
                stake_timestamp: current_time,
                reward_debt: calculate_reward_debt(amount_value, pool.rewards_per_token_stored),
                rewards_per_token_paid: pool.rewards_per_token_stored,
            };
            table::add(&mut pool.stakes, tx_context::sender(ctx), stake_info);
        };
        
        // Create receipt
        let receipt = StakeReceipt<T> {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            amount: amount_value,
            stake_timestamp: current_time,
        };
        transfer::public_transfer(receipt, tx_context::sender(ctx));
        
        // Emit event
        event::emit(StakeEvent {
            staker: tx_context::sender(ctx),
            amount: amount_value,
        });
    }
    
    /// Unstake tokens from the pool
    public entry fun unstake<T>(
        pool: &mut StakingPool<T>,
        receipt: StakeReceipt<T>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let StakeReceipt { id, owner, amount, stake_timestamp } = receipt;
        object::delete(id);
        
        assert!(owner == tx_context::sender(ctx), EInvalidAmount);
        
        // Check minimum staking period
        let current_time = clock::timestamp_ms(clock) / 1000; // Convert to seconds
        assert!(current_time >= stake_timestamp + pool.min_stake_duration, EStakingLocked);
        
        // Update rewards first
        update_rewards(pool, tx_context::sender(ctx), clock);
        
        // Get stake info
        assert!(table::contains(&pool.stakes, tx_context::sender(ctx)), EStakeNotFound);
        let stake_info = table::borrow_mut(&mut pool.stakes, tx_context::sender(ctx));
        
        // Check if there's enough staked balance
        assert!(stake_info.amount >= amount, EInsufficientBalance);
        
        // Update stake amount
        stake_info.amount = stake_info.amount - amount;
        
        // Transfer tokens back to user
        let coins = coin::take(&mut pool.staked_balance, amount, ctx);
        transfer::public_transfer(coins, tx_context::sender(ctx));
        
        // Emit event
        event::emit(UnstakeEvent {
            staker: tx_context::sender(ctx),
            amount,
        });
    }
    
    /// Claim rewards
    public entry fun claim_rewards<T>(
        pool: &mut StakingPool<T>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Update rewards
        update_rewards(pool, sender, clock);
        
        // Check if sender has a stake
        assert!(table::contains(&pool.stakes, sender), EStakeNotFound);
        
        // Calculate pending rewards
        let stake_info = table::borrow_mut(&mut pool.stakes, sender);
        let pending_reward = calculate_rewards(
            stake_info.amount,
            pool.rewards_per_token_stored,
            stake_info.rewards_per_token_paid
        );
        
        if (pending_reward > 0) {
            // Update stake info
            stake_info.rewards_per_token_paid = pool.rewards_per_token_stored;
            
            // Transfer rewards
            let reward_coin = coin::take(&mut pool.rewards_balance, pending_reward, ctx);
            transfer::public_transfer(reward_coin, sender);
            
            // Emit event
            event::emit(RewardClaimEvent {
                staker: sender,
                amount: pending_reward,
            });
        }
    }
    
    /// Add more rewards to the pool (admin only)
    public entry fun add_rewards<T>(
        pool: &mut StakingPool<T>,
        admin_cap: &AdminCap,
        rewards: Coin<T>,
        _ctx: &mut TxContext
    ) {
        assert!(object::uid_to_address(&pool.id) == admin_cap.pool_id, ENotAdmin);
        balance::join(&mut pool.rewards_balance, coin::into_balance(rewards));
    }
    
    /// Update the reward rate (admin only)
    public entry fun update_reward_rate<T>(
        pool: &mut StakingPool<T>,
        admin_cap: &AdminCap,
        new_rate: u64,
        clock: &Clock,
        _ctx: &mut TxContext
    ) {
        assert!(object::uid_to_address(&pool.id) == admin_cap.pool_id, ENotAdmin);
        
        // Update rewards with old rate first
        let current_time = clock::timestamp_ms(clock) / 1000; // Convert to seconds
        if (balance::value(&pool.staked_balance) > 0) {
            pool.rewards_per_token_stored = pool.rewards_per_token_stored + 
                ((current_time - pool.last_update_timestamp) * pool.reward_rate * REWARDS_PRECISION) / 
                balance::value(&pool.staked_balance);
        };
        pool.last_update_timestamp = current_time;
        
        // Update rate
        pool.reward_rate = new_rate;
    }
    
    /// Update the minimum staking duration (admin only)
    public entry fun update_min_stake_duration<T>(
        pool: &mut StakingPool<T>,
        admin_cap: &AdminCap,
        new_duration: u64,
    ) {
        assert!(object::uid_to_address(&pool.id) == admin_cap.pool_id, ENotAdmin);
        pool.min_stake_duration = new_duration;
    }
    
    /// Get staking info for a user
    public fun get_stake_info<T>(pool: &StakingPool<T>, staker: address): (u64, u64, u64) {
        if (!table::contains(&pool.stakes, staker)) {
            return (0, 0, 0)
        };
        
        let stake_info = table::borrow(&pool.stakes, staker);
        (stake_info.amount, stake_info.stake_timestamp, stake_info.reward_debt)
    }
    
    /// Get pool info
    public fun get_pool_info<T>(pool: &StakingPool<T>): (u64, u64, u64, u64, u64) {
        (
            balance::value(&pool.staked_balance),
            balance::value(&pool.rewards_balance),
            pool.reward_rate,
            pool.last_update_timestamp,
            pool.min_stake_duration
        )
    }
    
    // === Internal Helper Functions ===
    
    fun update_rewards<T>(pool: &mut StakingPool<T>, user: address, clock: &Clock) {
        let current_time = clock::timestamp_ms(clock) / 1000; // Convert to seconds
        
        // Update rewards per token
        if (balance::value(&pool.staked_balance) > 0) {
            pool.rewards_per_token_stored = pool.rewards_per_token_stored + 
                ((current_time - pool.last_update_timestamp) * pool.reward_rate * REWARDS_PRECISION) / 
                balance::value(&pool.staked_balance);
        };
        pool.last_update_timestamp = current_time;
        
        // Update user rewards if they have a stake
        if (table::contains(&pool.stakes, user)) {
            let stake_info = table::borrow_mut(&mut pool.stakes, user);
            stake_info.rewards_per_token_paid = pool.rewards_per_token_stored;
        }
    }
    
    fun calculate_rewards(amount: u64, rewards_per_token: u64, rewards_per_token_paid: u64): u64 {
        amount * (rewards_per_token - rewards_per_token_paid) / REWARDS_PRECISION
    }
    
    fun calculate_reward_debt(amount: u64, rewards_per_token: u64): u64 {
        amount * rewards_per_token / REWARDS_PRECISION
    }
}