use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, Token, TokenAccount, Transfer};

declare_id!("ITSimToken111111111111111111111111111111111");

/// IT Life Simulator ($ITSIM) Tokenomics & Vault Split Contract
/// Compliant with ТЗ v3.0 §12.3, §18
#[program]
pub mod itsim_token {
    use super::*;

    /// Initialize Season Vault Pool & Liquidity Escrow
    pub fn initialize_season(
        ctx: Context<InitializeSeason>,
        season_id: String,
        season_pool_amount: u64,
    ) -> Result<()> {
        let season_state = &mut ctx.accounts.season_state;
        season_state.admin = ctx.accounts.admin.key();
        season_state.season_id = season_id;
        season_state.total_pool = season_pool_amount;
        season_state.claimed_pool = 0;
        season_state.is_locked = true;
        season_state.bump = ctx.bumps.season_state;

        emit!(SeasonInitializedEvent {
            season_id: season_state.season_id.clone(),
            total_pool: season_pool_amount,
        });

        Ok(())
    }

    /// Purchase Vault Lootbox with exact 60% Burn / 40% DEX Liquidity Split (§12.3)
    pub fn purchase_vault_lootbox(
        ctx: Context<PurchaseVaultLootbox>,
        price: u64,
    ) -> Result<()> {
        require!(price > 0, ErrorCode::InvalidPrice);

        // Calculate exact 60% burn / 40% liquidity split
        let burn_amount = (price * 60) / 100;
        let liquidity_amount = price.checked_sub(burn_amount).ok_or(ErrorCode::MathOverflow)?;

        // 1. Burn 60% of payment
        let burn_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.mint.to_account_info(),
                from: ctx.accounts.payer_token_account.to_account_info(),
                authority: ctx.accounts.payer.to_account_info(),
            },
        );
        token::burn(burn_ctx, burn_amount)?;

        // 2. Transfer 40% to DEX Liquidity Reserve Vault
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.payer_token_account.to_account_info(),
                to: ctx.accounts.liquidity_vault.to_account_info(),
                authority: ctx.accounts.payer.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, liquidity_amount)?;

        emit!(VaultLootboxPurchasedEvent {
            payer: ctx.accounts.payer.key(),
            total_price: price,
            burned: burn_amount,
            liquidity_added: liquidity_amount,
        });

        Ok(())
    }

    /// Claim Season Reward for qualifying Top-20% player (§18.4)
    pub fn claim_season_reward(
        ctx: Context<ClaimSeasonReward>,
        reward_amount: u64,
    ) -> Result<()> {
        let season = &mut ctx.accounts.season_state;
        require!(!season.is_locked, ErrorCode::PoolLocked);

        let claim_record = &mut ctx.accounts.claim_record;
        require!(!claim_record.claimed, ErrorCode::AlreadyClaimed);

        season.claimed_pool = season
            .claimed_pool
            .checked_add(reward_amount)
            .ok_or(ErrorCode::MathOverflow)?;
        require!(season.claimed_pool <= season.total_pool, ErrorCode::PoolExhausted);

        claim_record.player = ctx.accounts.player.key();
        claim_record.amount = reward_amount;
        claim_record.claimed = true;
        claim_record.claimed_at = Clock::get()?.unix_timestamp;

        // Transfer seasonal reward from Season Escrow to Player
        let season_id_bytes = season.season_id.as_bytes();
        let seeds = &[
            b"season",
            season_id_bytes,
            &[season.bump],
        ];
        let signer = &[&seeds[..]];

        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.season_escrow.to_account_info(),
                to: ctx.accounts.player_token_account.to_account_info(),
                authority: season.to_account_info(),
            },
            signer,
        );
        token::transfer(transfer_ctx, reward_amount)?;

        emit!(SeasonRewardClaimedEvent {
            player: ctx.accounts.player.key(),
            season_id: season.season_id.clone(),
            amount: reward_amount,
        });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(season_id: String)]
pub struct InitializeSeason<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 32 + 8 + 8 + 1 + 1,
        seeds = [b"season", season_id.as_bytes()],
        bump
    )]
    pub season_state: Account<'info, SeasonState>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PurchaseVaultLootbox<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub payer_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub liquidity_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimSeasonReward<'info> {
    #[account(mut)]
    pub season_state: Account<'info, SeasonState>,
    #[account(
        init,
        payer = player,
        space = 8 + 32 + 8 + 1 + 8,
        seeds = [b"claim", season_state.key().as_ref(), player.key().as_ref()],
        bump
    )]
    pub claim_record: Account<'info, ClaimRecord>,
    #[account(mut)]
    pub season_escrow: Account<'info, TokenAccount>,
    #[account(mut)]
    pub player_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub player: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct SeasonState {
    pub admin: Pubkey,
    pub season_id: String,
    pub total_pool: u64,
    pub claimed_pool: u64,
    pub is_locked: bool,
    pub bump: u8,
}

#[account]
pub struct ClaimRecord {
    pub player: Pubkey,
    pub amount: u64,
    pub claimed: bool,
    pub claimed_at: i64,
}

#[event]
pub struct SeasonInitializedEvent {
    pub season_id: String,
    pub total_pool: u64,
}

#[event]
pub struct VaultLootboxPurchasedEvent {
    pub payer: Pubkey,
    pub total_price: u64,
    pub burned: u64,
    pub liquidity_added: u64,
}

#[event]
pub struct SeasonRewardClaimedEvent {
    pub player: Pubkey,
    pub season_id: String,
    pub amount: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Цена лутбокса должна быть больше 0")]
    InvalidPrice,
    #[msg("Математическое переполнение при расчёте")]
    MathOverflow,
    #[msg("Пул сезона заблокирован до окончания сезона")]
    PoolLocked,
    #[msg("Награда за этот сезон уже была получена")]
    AlreadyClaimed,
    #[msg("Пул наград сезона исчерпан")]
    PoolExhausted,
}
