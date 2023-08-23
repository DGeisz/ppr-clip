use anchor_lang::prelude::*;

const NUM_CHAINS_PER_MASTER: u16 = 10_000;

const MINT_COST: u64 = 100_000_000; // In Lamports
const CLIP_COST: u64 = 100_000;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod ppr_clip {
    use super::*;

    pub fn create_master(ctx: Context<CreateMaster>) -> ProgramResult {
        let clip_chain_master = &mut ctx.accounts.clip_chain_master;
        let user = &mut ctx.accounts.user;

        clip_chain_master.owner = user.key();
        clip_chain_master.chain_count = 0;

        Ok(())
    }

    pub fn mint_chain(ctx: Context<MintChain>) -> ProgramResult {
        let clip_chain = &mut ctx.accounts.clip_chain;
        let clip_chain_master = &mut ctx.accounts.clip_chain_master;
        let user = &mut ctx.accounts.user;

        /* First check if the clip_chain_master can mint any more chains */
        if clip_chain_master.chain_count >= NUM_CHAINS_PER_MASTER {
            return Err(ProgramError::InvalidArgument);
        }

        /* Now make sure the user has enough lamports */
        if user.lamports() < (MINT_COST + CHAIN_RENT as u64) {
            return Err(ProgramError::InsufficientFunds);
        }

        /* Now we can mint the chain */
        clip_chain.owner = user.key();
        clip_chain.master = clip_chain_master.key();
        clip_chain.last_hash = 0;
        clip_chain.last_time_salt = 0;
        clip_chain.last_clip_suite = ClipSuite::Air;
        clip_chain.last_clip_rarity = ClipRarity::Basic;
        clip_chain.next_rarity_attempts_remaining = 0;

        /* Used to keep track of stats */
        clip_chain.clip_count = 0;
        clip_chain.total_rarity = 0;
        clip_chain.total_square_rarity = 0;
        clip_chain.max_clip_rarity = ClipRarity::Basic;

        **receiving_account.try_borrow_mut_lamports()? = receiving_account
            .try_lamports()?
            .checked_add(cur_balance)
            .ok_or(ProgramError::InsufficientFunds)?;
        **target_account.try_borrow_mut_lamports()? = target_account
            .try_lamports()?
            .checked_sub(cur_balance)
            .ok_or(ProgramError::InsufficientFunds)?;

        anchor_lang::solana_program::program::invoke_signed(
            &anchor_lang::solana_program::system_instruction::transfer(
                &user.key(),
                &clip_chain_master.key(),
                MINT_COST as u64,
            ),
            &[user.to_account_info(), clip_chain_master.to_account_info()],
            &[],
        )?;

        Ok(())
    }

    // pub fn add_clip(
    //     ctx: Context<AddClip>,
    //     psi: i16,
    //     theta: i16,
    //     suite: ClipSuite,
    // ) -> ProgramResult {
    //     let master = &mut ctx.accounts.master;
    //     let clip_chain = &mut ctx.accounts.clip_chain;
    //     let owner = &mut ctx.accounts.owner;
    //
    //     if owner.lamports() < CLIP_COST {
    //         return Err(ProgramError::InsufficientFunds);
    //     }
    //
    //     /* TODO: Calculate next clip rarity */
    //
    //     Ok(())
    // }

    // /// Adds a clip to a chain for a given psi and theta
    // /// psi and theta are in radians * 1000, for easy of
    // /// Hashing
    // pub fn add_clip(
    //     ctx: Context<AddClip>,
    //     chain_index: u16,
    //     psi: i16,
    //     theta: i16,
    //     suite: ClipSuite,
    // ) -> ProgramResult {
    //     let clip_chain_master = &mut ctx.accounts.clip_chain_master;
    //     let user = &mut ctx.accounts.user;
    //
    //     if user.lamports() < CLIP_COST {
    //         return Err(ProgramError::InsufficientFunds);
    //     }
    //
    //     if let Some(Some(chain)) = clip_chain_master.chains.get(chain_index as usize) {
    //         /* Now make sure this user is the owner of this chain */
    //         if chain.owner != user.key() {
    //             return Err(ProgramError::IllegalOwner);
    //         }
    //
    //         /* TODO: Calculate next clip rarity here */
    //
    //         Ok(())
    //     } else {
    //         Err(ProgramError::InvalidArgument)
    //     }
    // }
    //
    // // pub fn bid_for_chain() -> ProgramResult {
    // //     unimplemented!()
    // // }
    //
    // // pub fn accept_bid() -> ProgramResult {
    // //     unimplemented!()
    // // }
}

#[derive(Accounts)]
pub struct CreateMaster<'info> {
    #[account(init, payer = user, space = 8 + 34)]
    pub clip_chain_master: Account<'info, ClipChainMaster>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintChain<'info> {
    #[account(init, payer = user, space = 8 + 100)]
    pub clip_chain: Account<'info, ClipChain>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub clip_chain_master: Account<'info, ClipChainMaster>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddClip<'info> {
    #[account(mut, has_one = owner, has_one = master)]
    pub clip_chain: Account<'info, ClipChain>,
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub master: Account<'info, ClipChainMaster>,
}

// #[derive(Accounts)]
// pub struct Create<'info> {
//     // TODO: Explore how we can reallocate more space...
//     #[account(init, payer = user, space = 8 + (105 * 97))]
//     pub clip_chain_master: Account<'info, ClipChainMaster>,
//     #[account(mut)]
//     pub user: Signer<'info>,
//     pub system_program: Program<'info, System>,
// }
//

// #[derive(Accounts)]
// pub struct AddClip<'info> {
//     #[account(mut)]
//     pub clip_chain_master: Account<'info, ClipChainMaster>,
//     #[account(mut)]
//     pub user: Signer<'info>,
// }

#[account]
pub struct ClipChainMaster {
    pub owner: Pubkey,
    pub chain_count: u16,
}

#[account]
pub struct ClipChain {
    pub owner: Pubkey,
    pub master: Pubkey,
    pub last_hash: u32,
    pub last_time_salt: u16,
    pub last_clip_suite: ClipSuite,
    pub last_clip_rarity: ClipRarity,
    pub next_rarity_attempts_remaining: u8,

    /* Used to keep track of stats */
    pub clip_count: u64,
    pub total_rarity: u64,
    pub total_square_rarity: u64,
    pub max_clip_rarity: ClipRarity,
}

// #[derive(Clone, AnchorSerialize, AnchorDeserialize)]
// pub struct cClipChain {
//     pub owner: Pubkey,
//     pub last_hash: u32,
//     pub last_time_salt: u16,
//     pub last_clip_suite: ClipSuite,
//     pub next_rarity_attempts_remaining: u8,
//     pub last_clip_rarity: ClipRarity,
//
//     /* Used to keep track of stats */
//     pub clip_count: u64,
//     pub total_rarity: u64,
//     pub total_square_rarity: u64,
//     pub max_clip_rarity: u32,
// }

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub enum ClipSuite {
    Fire,
    Water,
    Air,
    Sunset,
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub enum ClipRarity {
    Basic,
    Uncommon,
    Rare,
    Epic,
    Legendary,
    Artifact,
}
