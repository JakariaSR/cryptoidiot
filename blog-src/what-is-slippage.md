---
title: What Is Slippage? The Hidden Cost in Every Crypto Trade | Crypto Idiot
description: What slippage is in crypto trading, why your trade never fills at exactly the price you saw, how to set slippage tolerance, and how to avoid getting sandwiched.
tag: Basics
readtime: 6 min read
date: 2026-11-22
next_title: What is a crypto wallet?
next_url: what-is-a-crypto-wallet.html
---

You click buy at exactly $100.00. The trade confirms. Your average price: $100.70. You just met **slippage** — the small (sometimes not-so-small) gap between the price you expected and the price you actually got. It's the most common hidden cost in crypto, it shows up most on the apps beginners love, and understanding it takes about five minutes.

## Why trades never fill at exactly the displayed price

The price you see on screen is the *last* trade's price — history. The price you'll get is determined by the **order book** — the standing offers from other people, right now. If your order is bigger than what's resting at the top of the book, you eat through it layer by layer, and each layer costs a little more (when buying) or pays a little less (when selling).

That "eating through the book" is slippage, and its size depends on exactly one thing we just covered in depth: [liquidity](what-is-liquidity.html). Deep market (Bitcoin) = the book has oceans of offers = your $500 barely dents it = slippage measured in pennies. Thin market (a new token) = the book is a puddle = your $500 sweeps multiple price levels = slippage of several percent. Same trade, different pool. And if you choose [market orders](market-order-vs-limit-order.html) on a thin book, you're paying the maximum possible toll — that's the mechanical reason limit orders are the better default.

## Slippage tolerance: the setting that confuses everyone

On decentralized exchanges (the [DEX](cex-vs-dex.html) half of crypto trading), you don't see an order book — the app routes your trade through a "liquidity pool" and asks you for one number: **slippage tolerance.** It means "if my final price is worse than expected by more than X%, cancel the trade automatically."

Typical defaults: 0.5–1% for major coins, higher for thin ones. Now here's the part that matters: **a high tolerance isn't just permission for a bad price — it's an invitation for a specific attack.**

### The sandwich attack, in plain terms

Some bots scan the blockchain for pending trades with generous slippage tolerance. When they spot your buy with, say, 5% tolerance, they do this in one automated flash:

1. Buy just before you (pushing the price up)
2. Let your trade execute — you're now forced to accept a price up to 5% worse, per your own setting
3. Sell immediately after you (locking in their profit from *your* bad fill)

Your buy got sandwiched. You lost a few percent to a robot who added nothing but extraction. This happens daily on decentralized exchanges, targets exactly the people least likely to know it exists, and the defense is embarrassingly simple: **set the lowest slippage tolerance your trade allows.** Start at 0.5%. If the trade fails for being too tight, nudge it up gradually — never start generous. Failed trades cost a small network fee; sandwiches cost real money.

## How to keep slippage small

- **Trade liquid pairs.** The majors on major exchanges are where price integrity actually lives (see [choosing an exchange](how-to-choose-a-crypto-exchange.html) and why volume matters).
- **Use limit orders on order-book venues.** A limit order has zero slippage by design — no fill, no trade; fill, your price.
- **Split large orders.** One $5,000 market order slips more than five $1,000 orders over minutes (though mind the fees).
- **Avoid trading during chaos.** In the first minutes of a panic, spreads explode and [liquidity](what-is-liquidity.html) evaporates — slippage is worst exactly when emotion is highest ([FOMO and FUD](what-is-fomo-and-fud.html) again — the same emotions, taxing you twice).
- **On DEXs: lowest workable tolerance, always.** See above — this one setting is the whole defense against sandwiches.
- **Sanity-check before confirming.** Most good apps show you the expected fill ("min received: 995 USDC"). If that number is noticeably below what you typed, slippage is already warning you — believe it.

## Slippage vs fees vs spread — the three tolls

Beginners often conflate the three ways a trade gets taxed; they're distinct:

- **Fee:** the exchange's explicit commission, stated upfront.
- **Spread:** the standing gap between best buy and sell offers — the market's always-on toll.
- **Slippage:** the *extra* cost created by *your* trade moving through the book, or being extracted in a sandwich.

A trade can have low fees, tight spreads, and still bleed slippage on a big order. The receipt that matters is the *effective* price: what you actually paid per unit, all costs in. If that number keeps surprising you, the fix isn't a better exchange — it's smaller orders, limit orders, calmer timing.

## The one-paragraph version

Slippage is the gap between the price you expect and the price you actually get, caused by your order consuming the available offers in an order book or liquidity pool — small on deep markets like Bitcoin and potentially large on thin ones, with the size set almost entirely by liquidity. On decentralized exchanges, your slippage tolerance setting is a security parameter: set it too high and automated sandwich bots can detect your pending trade, push the price against you, and extract the difference in one transaction. Keep slippage small by trading liquid pairs, preferring limit orders, splitting large orders, avoiding panic moments, and setting the lowest tolerance that lets trades complete — and judge every trade by its effective price after fees, spread, and slippage, not the pretty number on the chart.

**Next guide:** that completes this batch — and with buying, holding, securing, and trading all covered, the natural next stop is the foundation everything rests on: [what is a crypto wallet?](what-is-a-crypto-wallet.html).
