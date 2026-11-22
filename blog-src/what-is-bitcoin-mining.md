---
title: What Is Bitcoin Mining? The Engine That Runs the Whole Thing | Crypto Idiot
description: What Bitcoin mining actually is, why miners exist, what proof of work does, and why mining uses so much electricity — explained without the jargon.
tag: Basics
readtime: 6 min read
date: 2026-11-22
next_title: What is a smart contract?
next_url: what-is-a-smart-contract.html
---

You've heard the headline version: "computers solving puzzles, burning electricity, earning digital money." It sounds absurd, and parts of it genuinely are strange — but mining isn't a gimmick. It's the engine that keeps Bitcoin running, secures every transaction, and answers the question "who gets to update the ledger?" without any boss. Here's how it actually works.

## The problem mining solves

Bitcoin is a ledger copied across thousands of computers worldwide. That raises an obvious question: **when two computers disagree about what happened, who wins?** In a bank, the answer is easy — the bank's server is the truth. Bitcoin has no server. It needs a way to make cheating astronomically expensive and honest participation profitable.

Mining is that mechanism, and it works like a lottery where the tickets are computing power.

## What miners actually do

Miners gather pending transactions into a "block," then race to solve a math puzzle tied to that block. The puzzle isn't useful math — it's a deliberately hard guessing game (a hash below a target number) that can only be solved by brute-force tries, billions per second. The first miner to solve it:

1. **Broadcasts their block** to the network
2. **Earns the reward** — new bitcoins (the "block subsidy," halved roughly every four years, see [bitcoin halving](what-is-bitcoin-halving.html)) plus the transaction fees in that block

Everyone else verifies the solution (easy to check, brutal to find), adds the block to their copy of the [blockchain](what-is-a-blockchain.html), and starts the next race. Roughly every ten minutes, forever, a new block.

## Why it secures the network

This is the part headlines skip. The puzzle's difficulty isn't arbitrary — it's what makes attacking Bitcoin irrational. To cheat (say, spending the same coins twice), an attacker would need to redo the mining work on their fake version of history **faster than the entire honest network combined** — while the honest chain keeps growing. That's the substance behind [proof of work](what-is-proof-of-work.html) and why [can Bitcoin be hacked](can-bitcoin-be-hacked.html) has its two-part answer: rewriting the ledger costs billions in hardware and electricity with near-zero chance of success.

The energy isn't a bug Bitcoin forgot to fix; it's the price of making the ledger unforgeable. More mining power = more security = harder to attack.

## The economics in plain terms

Miners are businesses. They pay for electricity, hardware (specialized machines called ASICs), and cooling — and earn bitcoin that must cover those costs. That equation explains almost everything about mining:

- Miners hunt the **cheapest electricity on earth** — stranded gas, hydro overflow, wind-rich regions — because a cent per kilowatt-hour is the whole ballgame
- When Bitcoin's price falls, the least efficient miners shut off; the network automatically adjusts difficulty down so blocks keep coming every ~10 minutes
- It's ruthlessly competitive and thin-margin, which is why "should I mine Bitcoin on my laptop?" has a one-word answer: **no**. Consumer hardware lost that race around 2013.

## What mining means for you (a regular user)

- Mining is **not how you get bitcoin** — that's [buying](how-to-buy-your-first-crypto.html), earning, or DCA. Mining is an industrial business, not a hobby.
- Miners' fees are part of why Bitcoin transactions cost what they do at busy times — related to, but distinct from [gas fees](what-is-gas-fee.html) on other networks.
- The "wasted energy" debate deserves the honest nuance from [crypto myths debunked](crypto-myths-debunked.html) — the question is real, and so is the counterargument.

## The one-paragraph version

Bitcoin mining is a global competition where specialized computers race to solve a brute-force math puzzle; the winner adds the next block of transactions to the blockchain and earns new bitcoins plus fees, roughly every ten minutes. Its real purpose isn't creating coins — it's security: the computing work makes rewriting Bitcoin's history require out-spending the entire honest network, which is what keeps the ledger trustworthy without any central authority. The electricity use is the deliberate cost of that security, which is why miners cluster wherever power is cheapest and why the "is it worth it?" question is an industrial economics problem, not a laptop one. For ordinary users, mining matters as background — the reason your transactions are final, not as a way to earn.

**Next guide:** mining secures a ledger that only records transactions. But what if the ledger could run programs? That's the idea that built Ethereum — and it's the most important concept in crypto after the blockchain itself: [what is a smart contract?](what-is-a-smart-contract.html).
