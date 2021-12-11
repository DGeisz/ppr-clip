import * as anchor from "@project-serum/anchor";
import { AccountClient, Program } from "@project-serum/anchor";
import { PprClip } from "../target/types/ppr_clip";
import assert from "assert";

const { SystemProgram, SystemInstruction } = anchor.web3;

// describe('ppr-clip', () => {
//
//   // Configure the client to use the local cluster.
//   anchor.setProvider(anchor.Provider.env());
//
//   const program = anchor.workspace.PprClip as Program<PprClip>;
//
//   it('Is initialized!', async () => {
//     // Add your test here.
//     const tx = await program.rpc.initialize({});
//     console.log("Your transaction signature", tx);
//   });
// });

describe("ppr-clip", () => {
  const provider = anchor.Provider.local();
  let _clipChainMaster: anchor.web3.Keypair;

  anchor.setProvider(provider);

  it("Create a test clip chain master", async () => {
    const program = anchor.workspace.PprClip;

    const clipChainMaster = anchor.web3.Keypair.generate();

    console.log(
      "This is before",
      await provider.connection.getAccountInfo(provider.wallet.publicKey),
      await provider.connection.getAccountInfo(clipChainMaster.publicKey)
    );

    await program.rpc.createMaster({
      accounts: {
        clipChainMaster: clipChainMaster.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [clipChainMaster],
    });

    console.log(
      "This is after",
      await provider.connection.getAccountInfo(provider.wallet.publicKey),
      await provider.connection.getAccountInfo(clipChainMaster.publicKey)
    );

    const account = await program.account.clipChainMaster.fetch(
      clipChainMaster.publicKey
    );

    // console.log(
    //   "This is account info...",
    //   program.account.clipChainMaster.fetch
    //   //   Object.getOwnPropertyNames(program.account.clipChainMaster)
    // );

    assert.ok(account.chainCount === 0);
    assert.ok(account.owner.equals(provider.wallet.publicKey));

    _clipChainMaster = clipChainMaster;
  });

  it("Mints chain", async () => {
    const program = anchor.workspace.PprClip;

    const clipChain = anchor.web3.Keypair.generate();

    console.log(clipChain, provider.wallet);

    await program.rpc.mintChain({
      accounts: {
        clipChain: clipChain.publicKey,
        user: provider.wallet.publicKey,
        clipChainMaster: _clipChainMaster.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [clipChain],
    });

    const chainAccount = await program.account.clipChain.fetch(
      clipChain.publicKey
    );

    console.log("This is clip chain", chainAccount);
  });
});
