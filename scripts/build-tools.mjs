// Generates SEO-optimized dedicated pages for each tool in tools/.
// Run automatically as part of "npm run build".
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = ROOT + "tools/";
const SITE = "https://cryptoidiot.com";
const GA_ID = "G-G6GJPEWWKK";

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const FIAT_OPTIONS = `<option value="usd">USD</option>
                <option value="eur">EUR</option>
                <option value="gbp">GBP</option>
                <option value="bdt">BDT</option>
                <option value="inr">INR</option>`;

const WIDGETS = {
  converter: `<div class="converter">
            <div class="conv-row">
              <input type="number" id="convAmount" value="1" min="0" step="any" aria-label="Amount" />
              <select id="convCoin" aria-label="Cryptocurrency">
                <option value="bitcoin">BTC</option>
                <option value="ethereum">ETH</option>
                <option value="solana">SOL</option>
                <option value="binancecoin">BNB</option>
                <option value="ripple">XRP</option>
                <option value="dogecoin">DOGE</option>
                <option value="cardano">ADA</option>
                <option value="litecoin">LTC</option>
              </select>
            </div>
            <div class="conv-swap">=</div>
            <div class="conv-row">
              <input type="text" id="convResult" readonly aria-label="Result" />
              <select id="convFiat" aria-label="Fiat currency">
                ${FIAT_OPTIONS}
              </select>
            </div>
            <p class="tool-note" id="convNote">Live rates via CoinGecko.</p>
          </div>`,

  dca: `<div class="dca">
            <label>Amount per purchase ($)
              <input type="number" id="dcaAmount" value="50" min="1" step="any" />
            </label>
            <label>How often?
              <select id="dcaFreq">
                <option value="7">Weekly</option>
                <option value="30">Monthly</option>
                <option value="1">Daily</option>
              </select>
            </label>
            <label>Time period (months)
              <input type="number" id="dcaMonths" value="12" min="1" max="120" />
            </label>
            <label>Expected annual growth (%)
              <input type="number" id="dcaGrowth" value="10" min="-50" max="100" step="any" />
            </label>
            <button class="btn btn-primary btn-block" id="dcaCalc">Calculate</button>
            <div class="dca-result" id="dcaResult" hidden>
              <div class="dca-stat"><span>Total invested</span><strong id="dcaInvested"></strong></div>
              <div class="dca-stat"><span>Estimated value</span><strong id="dcaValue"></strong></div>
              <div class="dca-stat"><span>Growth</span><strong id="dcaGrowthOut"></strong></div>
              <p class="tool-note">Estimation only — not financial advice.</p>
            </div>
          </div>`,

  halving: `<div class="countdown" id="halvingCountdown">
            <div class="cd-unit"><span class="cd-num" id="cdDays">—</span><span class="cd-label">days</span></div>
            <div class="cd-unit"><span class="cd-num" id="cdHours">—</span><span class="cd-label">hours</span></div>
            <div class="cd-unit"><span class="cd-num" id="cdMins">—</span><span class="cd-label">min</span></div>
            <div class="cd-unit"><span class="cd-num" id="cdSecs">—</span><span class="cd-label">sec</span></div>
          </div>
          <p class="tool-note" id="halvingNote">Estimated: April 2028 (block 1,050,000).</p>`,

  fng: `<div class="fng" id="fngBox">
            <div class="fng-gauge">
              <svg viewBox="0 0 200 110" class="fng-svg">
                <path d="M10 100 A90 90 0 0 1 190 100" fill="none" stroke="#2a2f3a" stroke-width="16" stroke-linecap="round"/>
                <path id="fngArc" d="M10 100 A90 90 0 0 1 190 100" fill="none" stroke="url(#fngGrad)" stroke-width="16" stroke-linecap="round" stroke-dasharray="283" stroke-dashoffset="283"/>
                <defs>
                  <linearGradient id="fngGrad">
                    <stop offset="0%" stop-color="#ef4444"/>
                    <stop offset="50%" stop-color="#f59e0b"/>
                    <stop offset="100%" stop-color="#22c55e"/>
                  </linearGradient>
                </defs>
              </svg>
              <div class="fng-value" id="fngValue">—</div>
            </div>
            <p class="fng-label" id="fngLabel">Loading…</p>
          </div>`,

  sats: `<div class="converter">
            <div class="conv-row">
              <input type="number" id="satsAmount" value="1" min="0" step="any" aria-label="Amount" />
              <select id="satsFrom" aria-label="Convert from">
                <option value="btc">BTC</option>
                <option value="sats">Sats</option>
              </select>
            </div>
            <div class="conv-swap">=</div>
            <div class="conv-row">
              <input type="text" id="satsResult" readonly aria-label="Result" />
              <input type="text" value="SATS" readonly class="conv-fixed" aria-label="Unit" id="satsUnit" />
            </div>
            <p class="tool-note" id="satsNote">1 BTC = 100,000,000 sats.</p>
          </div>`,

  ethunits: `<div class="converter">
            <div class="conv-row">
              <input type="number" id="ethAmount" value="1" min="0" step="any" aria-label="Amount" />
              <select id="ethFrom" aria-label="Convert from">
                <option value="eth">Ether</option>
                <option value="gwei">Gwei</option>
                <option value="wei">Wei</option>
              </select>
            </div>
            <div class="conv-swap">=</div>
            <div class="conv-row">
              <input type="text" id="ethResult" readonly aria-label="Result" />
              <select id="ethTo" aria-label="Convert to">
                <option value="gwei">Gwei</option>
                <option value="wei">Wei</option>
                <option value="eth">Ether</option>
              </select>
            </div>
            <p class="tool-note">1 Ether = 10⁹ Gwei = 10¹⁸ Wei.</p>
          </div>`,

  pl: `<div class="dca">
            <label>Amount invested ($)
              <input type="number" id="plInvested" value="100" min="0" step="any" />
            </label>
            <label>Buy price ($)
              <input type="number" id="plBuy" value="50000" min="0" step="any" />
            </label>
            <label>Sell / current price ($)
              <input type="number" id="plSell" value="60000" min="0" step="any" />
            </label>
            <button class="btn btn-primary btn-block" id="plCalc">Calculate</button>
            <div class="dca-result" id="plResult" hidden>
              <div class="dca-stat"><span>Coins bought</span><strong id="plCoins"></strong></div>
              <div class="dca-stat"><span>Current value</span><strong id="plValue"></strong></div>
              <div class="dca-stat"><span>Profit / loss</span><strong id="plPnl"></strong></div>
            </div>
          </div>`,
};

const TOOLS = [
  {
    slug: "crypto-converter",
    widget: "converter",
    title: "Crypto Converter — Live BTC, ETH & Crypto to USD/EUR | Crypto Idiot",
    description: "Free crypto converter with live CoinGecko rates. Convert Bitcoin, Ethereum, Solana and more to USD, EUR, GBP, BDT and INR instantly. No signup.",
    h1: "Crypto Converter",
    tagline: "Live rates · 8 coins · 5 fiat currencies · no signup",
    intro: [
      "How much is 0.05 BTC in real money? Half a Solana in euros? This free crypto converter gives you the answer in one second, using live market rates from CoinGecko.",
      "Unlike most converters, there's no page reload, no account, and no upsell — just type an amount, pick a coin, and read the result. Rates refresh automatically while you use it.",
    ],
    steps: ["Type the amount of crypto you want to convert.", "Choose the coin (BTC, ETH, SOL, BNB, XRP, DOGE, ADA, LTC).", "Pick your fiat currency — USD, EUR, GBP, BDT or INR.", "Read the converted value instantly, calculated at the live rate."],
    guide: { url: "/blog/what-is-a-crypto-wallet.html", label: "New to crypto? Read: What Is a Crypto Wallet?" },
    faqs: [
      { q: "Is this crypto converter free?", a: "Yes, completely free with no signup, no limits and no ads on the tool itself. It runs in your browser." },
      { q: "Where do the prices come from?", a: "Rates come from CoinGecko, one of the most widely used crypto data aggregators, aggregated from hundreds of exchanges." },
      { q: "How often are rates updated?", a: "The converter fetches fresh rates every time the page loads. Between loads, values may drift slightly from the exact market price." },
      { q: "Which cryptocurrencies are supported?", a: "Bitcoin (BTC), Ethereum (ETH), Solana (SOL), BNB, XRP, Dogecoin (DOGE), Cardano (ADA) and Litecoin (LTC) — the coins most beginners actually hold." },
      { q: "Does the converter include exchange fees?", a: "No — it shows the raw market rate. Real exchanges add a small spread or fee, so the price you pay will usually be slightly different." },
    ],
  },
  {
    slug: "dca-calculator",
    widget: "dca",
    title: "DCA Calculator — Dollar-Cost Averaging Crypto Tool | Crypto Idiot",
    description: "Free DCA calculator: simulate buying a fixed amount of crypto weekly or monthly. See total invested, estimated value and growth over any period.",
    h1: "DCA (Dollar-Cost Averaging) Calculator",
    tagline: "Simulate weekly or monthly crypto investing",
    intro: [
      "Dollar-cost averaging means investing a fixed amount on a fixed schedule, no matter what the price does. It's the strategy most recommended for beginners because it removes emotion and guesswork from buying crypto.",
      "This calculator shows what that could look like: enter how much you'd invest, how often, and for how long, then see your total invested, estimated final value and growth.",
    ],
    steps: ["Enter the amount you'd invest per purchase (e.g. $50).", "Choose weekly, monthly or daily purchases.", "Set the time period in months.", "Enter an expected annual growth rate — 0% shows pure accumulation, positive values simulate growth.", "Click Calculate to see total invested, estimated value and growth."],
    guide: { url: "/blog/what-is-dca.html", label: "Learn the strategy: What Is DCA?" },
    faqs: [
      { q: "What is DCA in crypto?", a: "DCA (dollar-cost averaging) means investing a fixed amount of money at regular intervals regardless of price. You buy more when prices are low and less when they're high, averaging out your cost over time." },
      { q: "Is DCA a good strategy for Bitcoin?", a: "Historically, DCA into Bitcoin has smoothed out volatility for long-term holders. It won't beat buying at the perfect bottom, but almost nobody can time the bottom consistently." },
      { q: "What growth rate should I use?", a: "For a conservative simulation, many people use 5–10% annually. Crypto is volatile, so treat any projection as an illustration, not a prediction." },
      { q: "Does the calculator include fees?", a: "No — exchange fees and recurring-buy fees are not included. On a real exchange, small per-purchase fees will slightly reduce returns." },
      { q: "Is this financial advice?", a: "No. The calculator is an educational tool that illustrates how dollar-cost averaging works mathematically. Always do your own research." },
    ],
  },
  {
    slug: "bitcoin-halving-countdown",
    widget: "halving",
    title: "Bitcoin Halving Countdown 2028 — Live Timer | Crypto Idiot",
    description: "Live Bitcoin halving countdown to the 2028 halving (block 1,050,000). Learn what the halving is, why it matters, and how it affects supply.",
    h1: "Bitcoin Halving Countdown",
    tagline: "Time remaining until the next halving, updated every second",
    intro: [
      "Roughly every four years, the reward Bitcoin miners receive for adding a new block is cut in half. This event — the halving — is written into Bitcoin's code and will continue until around 2140, when the last of 21 million bitcoins is mined.",
      "The next halving, expected around April 2028 at block 1,050,000, will reduce the new supply of Bitcoin from 900 to 450 BTC per day. Scarcity goes up; new supply goes down — that's the whole point.",
    ],
    steps: ["The countdown above shows the estimated time until block 1,050,000.", "The date is an estimate — halvings happen every 210,000 blocks, and block times vary slightly.", "Historically, halvings have drawn enormous attention and speculation to Bitcoin."],
    guide: { url: "/blog/what-is-dca.html", label: "Wondering how to buy before the halving? Read: What Is DCA?" },
    faqs: [
      { q: "When is the next Bitcoin halving?", a: "The next halving is expected around April 2028, at block 1,050,000. The exact date depends on how fast blocks are mined, which averages 10 minutes but varies." },
      { q: "What happens during a halving?", a: "The reward miners earn for each new block is cut in half — from 3.125 BTC to 1.5625 BTC. This halves the rate at which new Bitcoin enters circulation." },
      { q: "Why does the halving matter?", a: "It reduces new supply. Combined with steady or growing demand, that scarcity is why many people watch halvings closely as potential long-term price catalysts." },
      { q: "How many halvings have there been?", a: "There have been four halvings: 2012, 2016, 2020 and 2024. The 2028 halving will be the fifth." },
      { q: "Does the price always go up after a halving?", a: "Historically, significant price appreciation followed the first four halvings over the following 12–18 months. Past performance does not guarantee future results." },
    ],
  },
  {
    slug: "fear-greed-index",
    widget: "fng",
    title: "Crypto Fear & Greed Index — Live Gauge | Crypto Idiot",
    description: "Live Crypto Fear & Greed Index gauge (0–100). See whether the market is in extreme fear, neutral or extreme greed — updated daily.",
    h1: "Crypto Fear & Greed Index",
    tagline: "One number that captures the market's mood",
    intro: [
      "Markets are driven by emotion as much as logic. The Fear & Greed Index distills the crypto market's emotional state into a single number from 0 (extreme fear) to 100 (extreme greed).",
      "It combines volatility, market momentum, social media chatter, surveys and Bitcoin dominance into one daily reading — a useful gut-check before you make any move.",
    ],
    steps: ["The gauge shows today's index value and classification.", "0–24 = extreme fear, 25–44 = fear, 45–55 = neutral, 56–74 = greed, 75–100 = extreme greed.", "Values update daily from alternative.me."],
    guide: { url: "/blog/common-crypto-scams.html", label: "Emotions make you a target — read: 5 Crypto Scams That Target Beginners" },
    faqs: [
      { q: "What is the Fear & Greed Index?", a: "A 0–100 scale that measures crypto market sentiment, created by alternative.me. Low values mean fear, high values mean greed." },
      { q: "How is the index calculated?", a: "It combines six factors: volatility, market momentum/volume, social media sentiment, surveys, Bitcoin dominance, and Google Trends data for crypto queries." },
      { q: "What should I do when the index shows extreme fear?", a: "Many contrarian investors see extreme fear as a potential buying opportunity, since panic selling often pushes prices below fair value. It's a signal to think, not an automatic buy order." },
      { q: "What does extreme greed mean?", a: "Extreme greed often coincides with market tops and corrections. Historically, when everyone is euphoric, risk is usually highest." },
      { q: "How often is the index updated?", a: "The Crypto Fear & Greed Index is updated once per day, based on data from the previous 24 hours." },
    ],
  },
  {
    slug: "sats-converter",
    widget: "sats",
    title: "Sats Converter — BTC to Satoshis Calculator | Crypto Idiot",
    description: "Convert BTC to satoshis (sats) and back instantly. 1 BTC = 100,000,000 sats. Free Bitcoin unit converter with live USD value.",
    h1: "Sats Converter (BTC ↔ Satoshis)",
    tagline: "Bitcoin is divisible — 1 BTC = 100,000,000 sats",
    intro: [
      "One Bitcoin costs thousands of dollars, but you don't need to buy a whole one. Each Bitcoin is divisible into 100 million units called satoshis (or sats), after Bitcoin's creator Satoshi Nakamoto.",
      "Thinking in sats makes small purchases feel concrete: instead of owning 0.001 BTC, you own 100,000 sats. This converter flips between both units instantly and shows the live dollar value.",
    ],
    steps: ["Enter an amount in BTC or in sats.", "Pick the direction — BTC to sats, or sats to BTC.", "Read the converted value instantly, plus the live USD estimate at current Bitcoin prices."],
    guide: { url: "/blog/how-to-buy-your-first-crypto.html", label: "Ready to stack your first sats? Read: How to Buy Your First Crypto" },
    faqs: [
      { q: "What is a satoshi?", a: "A satoshi is the smallest unit of Bitcoin, named after its creator Satoshi Nakamoto. 1 satoshi = 0.00000001 BTC." },
      { q: "How many satoshis are in 1 Bitcoin?", a: "100,000,000 satoshis. That's 100 million, which is why whole Bitcoin prices of tens of thousands still allow very small purchases." },
      { q: "Why do people count in sats?", a: "Because owning '50,000 sats' feels more tangible than owning '0.0005 BTC'. Sats also make it easier to compare small purchases and track stacking progress." },
      { q: "Can I buy just a few satoshis?", a: "Practically, exchanges have minimum order sizes well above a few sats — usually a few dollars' worth. But technically, yes: Bitcoin is divisible to 1 sat." },
      { q: "What's the live USD value based on?", a: "The USD estimate uses the current Bitcoin price from CoinGecko, refreshed on each page load." },
    ],
  },
  {
    slug: "eth-unit-converter",
    widget: "ethunits",
    title: "ETH Unit Converter — Ether, Gwei & Wei | Crypto Idiot",
    description: "Convert between Ether, Gwei and Wei instantly. Understand Ethereum gas fees with this free ETH unit converter. 1 ETH = 10⁹ Gwei = 10¹⁸ Wei.",
    h1: "ETH Unit Converter (Ether ↔ Gwei ↔ Wei)",
    tagline: "Make sense of gas fees once and for all",
    intro: [
      "Every Ethereum gas fee is quoted in gwei — but what is a gwei? It's just a smaller unit of Ether: 1 ETH equals 1 billion gwei, and 1 gwei equals 1 billion wei (the smallest unit).",
      "Once the units click, gas fees stop being mysterious. This converter translates between Ether, Gwei and Wei instantly — the same math your wallet does before every transaction.",
    ],
    steps: ["Enter any amount in Ether, Gwei or Wei.", "Choose the unit you're converting from.", "Pick the unit you want — the result updates instantly.", "Compare with the gas price shown in your wallet to sanity-check fees."],
    guide: { url: "/blog/what-is-gas-fee.html", label: "Why do these units exist? Read: What Is Gas Fee?" },
    faqs: [
      { q: "What is Gwei?", a: "Gwei (gigawei) is a unit of Ether equal to 0.000000001 ETH. Gas fees are priced in gwei because typical fees are tiny fractions of an Ether." },
      { q: "What is Wei?", a: "Wei is the smallest unit of Ether, named after Wei Dai. 1 ETH = 1,000,000,000,000,000,000 Wei (10¹⁸). Almost no one quotes fees in wei directly." },
      { q: "How many Gwei in 1 Ether?", a: "1,000,000,000 (1 billion) gwei. So a gas price of 20 gwei equals 0.00000002 ETH." },
      { q: "Why are gas fees in Gwei and not ETH?", a: "Because gas fees are small amounts. Saying a fee is '0.000021 ETH' is awkward; '21,000 gas at 1 gwei' — or just quoting gwei — is far more readable." },
      { q: "Is this converter accurate?", a: "Yes — the conversion is pure mathematics (powers of 10), so it's exact every time, no rates or rounding involved." },
    ],
  },
  {
    slug: "profit-loss-calculator",
    widget: "pl",
    title: "Crypto Profit/Loss Calculator — Free P&L Tool | Crypto Idiot",
    description: "Free crypto profit and loss calculator. Enter your investment, buy price and sell price to instantly see your P&L in dollars and percentage.",
    h1: "Crypto Profit / Loss Calculator",
    tagline: "Know exactly where your trade stands",
    intro: [
      "\"Am I actually up or down?\" It's the most common question in crypto, and the answer isn't obvious when you buy at different prices over time. For a simple buy-and-sell (or buy-and-hold), this calculator gives you the exact numbers in seconds.",
      "Enter what you invested, the price you bought at, and the price you sold at (or today's price), and see your coins, current value and profit or loss — in dollars and percentage.",
    ],
    steps: ["Enter the total amount you invested in dollars.", "Enter the price per coin when you bought.", "Enter the price per coin when you sold — or the current price if you're still holding.", "Click Calculate to see coins bought, current value and profit/loss."],
    guide: { url: "/blog/what-is-dca.html", label: "Bought in multiple chunks? Read: What Is DCA?" },
    faqs: [
      { q: "How is crypto profit calculated?", a: "Profit = (sell price − buy price) × number of coins. Our calculator derives the coin count from your investment and buy price, then applies the same formula." },
      { q: "Does the calculator include fees and taxes?", a: "No — it shows the raw profit. Real-world returns are reduced by exchange fees, withdrawal fees and (depending on your country) capital gains tax." },
      { q: "What if I bought at different prices?", a: "For multiple purchases at different prices, you'd calculate the average buy price first (a DCA calculator handles that scenario better), then plug the average into this tool." },
      { q: "Why does percentage matter more than dollars?", a: "Percentage normalizes for position size — a $100 gain means very different things on a $200 investment versus a $20,000 one." },
      { q: "Is this tool free?", a: "Yes — it runs entirely in your browser, with no signup and no data stored anywhere." },
    ],
  },
];

function toolPage(t) {
  const faqHtml = t.faqs.map((f) => `        <details>
          <summary>${esc(f.q)}</summary>
          <p>${esc(f.a)}</p>
        </details>`).join("\n");
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(t.title)}</title>
  <meta name="description" content="${esc(t.description)}" />
  <link rel="canonical" href="${SITE}/tools/${t.slug}.html" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🤓</text></svg>" />
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_ID}');
  </script>
  <script type="application/ld+json">
${JSON.stringify(faqSchema, null, 2)}
  </script>
  <link rel="stylesheet" href="../css/style.css" />
</head>
<body>
  <header class="site-header">
    <div class="container header-inner">
      <a href="/" class="logo">crypto<span class="accent">idiot</span><span class="dot">.com</span></a>
      <nav class="main-nav" id="mainNav">
        <a href="/#tools">Tools</a>
        <a href="/#learn">Learn</a>
        <a href="/blog/">Blog</a>
        <a href="/#newsletter" class="nav-cta">Start Here</a>
      </nav>
      <button class="nav-toggle" id="navToggle" aria-label="Toggle menu">☰</button>
    </div>
  </header>

  <div class="ticker">
    <div class="ticker-track" id="tickerTrack"><span class="ticker-loading">Loading live prices…</span></div>
  </div>

  <section class="article-hero">
    <div class="container">
      <h1>${esc(t.h1)}</h1>
      <p class="article-meta">${esc(t.tagline)}</p>
    </div>
  </section>

  <article class="article-body">
${t.intro.map((p) => `    <p>${p}</p>`).join("\n")}

    <div class="tool-card tool-page-widget">
      ${WIDGETS[t.widget]}
    </div>

    <h2>How to use this tool</h2>
    <ol>
${t.steps.map((s) => `      <li>${esc(s)}</li>`).join("\n")}
    </ol>

    <div class="callout">📖 <a href="${esc(t.guide.url)}" style="color:var(--accent)">${esc(t.guide.label)}</a></div>

    <h2>Frequently asked questions</h2>
    <div class="faq">
${faqHtml}
    </div>
  </article>

  <footer class="site-footer">
    <div class="container footer-inner">
      <p class="footer-note">© 2026 CryptoIdiot.com — Not financial advice, obviously.</p>
    </div>
  </footer>
  <script src="../js/main.js"></script>
</body>
</html>
`;
}

await mkdir(OUT, { recursive: true });
for (const t of TOOLS) {
  await writeFile(OUT + t.slug + ".html", toolPage(t));
  console.log("built tools/" + t.slug + ".html");
}
