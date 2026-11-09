/* Crypto Idiot — main.js
   Live data: CoinGecko (prices) + Alternative.me (Fear & Greed).
   Everything degrades gracefully with offline fallbacks. */

(function () {
  "use strict";

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      mainNav.classList.toggle("open");
    });
    mainNav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") mainNav.classList.remove("open");
    });
  }

  /* ---------- Price data ---------- */
  var COINS = ["bitcoin", "ethereum", "solana", "binancecoin", "ripple", "dogecoin"];
  var FIATS = ["usd", "eur", "gbp", "bdt", "inr"];
  var SYMBOLS = {
    bitcoin: "BTC", ethereum: "ETH", solana: "SOL",
    binancecoin: "BNB", ripple: "XRP", dogecoin: "DOGE"
  };
  // Fallback rates (only used if the API is unreachable)
  var FALLBACK = {
    bitcoin: { usd: 97400, eur: 89000, gbp: 76500, bdt: 10700000, inr: 8200000 },
    ethereum: { usd: 3450, eur: 3150, gbp: 2700, bdt: 379000, inr: 290000 },
    solana: { usd: 208, eur: 190, gbp: 163, bdt: 22800, inr: 17500 },
    binancecoin: { usd: 645, eur: 590, gbp: 507, bdt: 70900, inr: 54400 },
    ripple: { usd: 2.35, eur: 2.15, gbp: 1.85, bdt: 259, inr: 198 },
    dogecoin: { usd: 0.32, eur: 0.29, gbp: 0.25, bdt: 35, inr: 27 }
  };
  var FALLBACK_CHANGE = { bitcoin: 1.8, ethereum: -0.7, solana: 3.2, binancecoin: 0.4, ripple: -1.5, dogecoin: 5.1 };

  var prices = null;      // { coin: { usd: n, ... } }
  var changes = null;     // { coin: pct }
  var live = false;

  function fmt(n, decimals) {
    if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
    if (n >= 10) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
    return n.toLocaleString("en-US", { maximumFractionDigits: decimals === undefined ? 4 : decimals });
  }

  function fetchJSON(url, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); reject(new Error("timeout")); }, timeoutMs || 8000);
      fetch(url, ctrl ? { signal: ctrl.signal } : {})
        .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
        .then(function (d) { clearTimeout(timer); resolve(d); })
        .catch(function (e) { clearTimeout(timer); reject(e); });
    });
  }

  /* ---------- Ticker ---------- */
  function renderTicker() {
    var track = document.getElementById("tickerTrack");
    if (!track) return;
    var source = prices || FALLBACK;
    var chg = changes || FALLBACK_CHANGE;
    track.innerHTML = COINS.map(function (id) {
      var p = source[id], c = chg[id];
      var cls = c >= 0 ? "up" : "down";
      var arrow = c >= 0 ? "▲" : "▼";
      return '<span class="ticker-item"><b>' + SYMBOLS[id] + '</b> $' + fmt(p.usd) +
        ' <span class="' + cls + '">' + arrow + " " + Math.abs(c).toFixed(1) + "%</span></span>";
    }).join("");
  }

  /* ---------- Converter ---------- */
  function runConversion() {
    var amountEl = document.getElementById("convAmount");
    var coinEl = document.getElementById("convCoin");
    var fiatEl = document.getElementById("convFiat");
    var outEl = document.getElementById("convResult");
    var noteEl = document.getElementById("convNote");
    if (!amountEl || !outEl) return;
    var amount = parseFloat(amountEl.value) || 0;
    var coin = coinEl.value;
    var fiat = fiatEl.value;
    var source = prices || FALLBACK;
    var rate = source[coin] && source[coin][fiat];
    if (!rate) { outEl.value = "—"; return; }
    outEl.value = fmt(amount * rate);
    if (noteEl) {
      noteEl.textContent = (live ? "Live rates via CoinGecko." : "Rates unavailable offline — showing cached estimates.") +
        " 1 " + SYMBOLS[coin] + " ≈ " + fmt(rate) + " " + fiat.toUpperCase();
    }
  }

  /* ---------- DCA calculator ---------- */
  function runDCA() {
    var amount = Math.max(0, parseFloat(document.getElementById("dcaAmount").value) || 0);
    var freqDays = parseInt(document.getElementById("dcaFreq").value, 10);
    var months = Math.min(120, Math.max(1, parseInt(document.getElementById("dcaMonths").value, 10) || 1));
    var annualGrowth = (parseFloat(document.getElementById("dcaGrowth").value) || 0) / 100;

    var periods = Math.round((months * 30.44) / freqDays);
    var invested = amount * periods;

    // Each contribution grows for the time remaining until the end.
    var periodRate = Math.pow(1 + annualGrowth, freqDays / 365.25) - 1;
    var value = 0;
    for (var i = 0; i < periods; i++) {
      value += amount * Math.pow(1 + periodRate, i);
    }

    var growth = value - invested;
    var pct = invested > 0 ? (growth / invested) * 100 : 0;

    document.getElementById("dcaInvested").textContent = "$" + invested.toLocaleString("en-US", { maximumFractionDigits: 0 });
    document.getElementById("dcaValue").textContent = "$" + value.toLocaleString("en-US", { maximumFractionDigits: 0 });
    var gEl = document.getElementById("dcaGrowthOut");
    gEl.textContent = (growth >= 0 ? "+" : "−") + "$" + Math.abs(growth).toLocaleString("en-US", { maximumFractionDigits: 0 }) +
      " (" + (pct >= 0 ? "+" : "") + pct.toFixed(1) + "%)";
    gEl.className = growth >= 0 ? "pos" : "neg";
    document.getElementById("dcaResult").hidden = false;
  }

  /* ---------- Halving countdown ---------- */
  // Next halving (block 1,050,000) is estimated around April 2028.
  var HALVING_DATE = Date.UTC(2028, 3, 14, 12, 0, 0);

  function tickCountdown() {
    var diff = HALVING_DATE - Date.now();
    if (diff < 0) diff = 0;
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    set("cdDays", d); set("cdHours", h); set("cdMins", m); set("cdSecs", s);
  }
  function set(id, v) {
    var el = document.getElementById(id);
    if (el) el.textContent = String(v).padStart(2, "0");
  }
  if (document.getElementById("halvingCountdown")) {
    tickCountdown();
    setInterval(tickCountdown, 1000);
  }

  /* ---------- Fear & Greed ---------- */
  var FNG_LABELS = [
    "Extreme Fear", "Fear", "Neutral", "Greed", "Extreme Greed"
  ];
  function fngLabel(v) {
    if (v <= 24) return FNG_LABELS[0];
    if (v <= 44) return FNG_LABELS[1];
    if (v <= 55) return FNG_LABELS[2];
    if (v <= 74) return FNG_LABELS[3];
    return FNG_LABELS[4];
  }
  function renderFng(value, source) {
    var arc = document.getElementById("fngArc");
    var val = document.getElementById("fngValue");
    var lbl = document.getElementById("fngLabel");
    if (!arc || !val || !lbl) return;
    var CIRC = 283; // arc length of r=90 semicircle
    arc.style.strokeDashoffset = String(CIRC * (1 - value / 100));
    val.textContent = String(Math.round(value));
    lbl.textContent = fngLabel(value);
    lbl.style.color = value <= 24 ? "#ef4444" : value <= 44 ? "#f97316" : value <= 55 ? "#f59e0b" : value <= 74 ? "#84cc16" : "#22c55e";
    if (source) {
      var note = document.querySelector("#tool-fng .tool-note");
      if (note) note.textContent = "Updated daily — data: " + source + ". Extreme fear often means people are panic-selling; extreme greed often means a correction is brewing. Boring consistency beats emotional timing.";
    }
  }

  /* ---------- Data loading ---------- */
  function loadPrices() {
    var vs = FIATS.join(",");
    var url = "https://api.coingecko.com/api/v3/simple/price?ids=" + COINS.join(",") +
      "&vs_currencies=" + vs + "&include_24hr_change=true";
    return fetchJSON(url).then(function (data) {
      prices = {}; changes = {};
      COINS.forEach(function (id) {
        if (data[id]) {
          prices[id] = {};
          FIATS.forEach(function (f) { prices[id][f] = data[id][f]; });
          changes[id] = data[id].usd_24h_change || 0;
        }
      });
      live = true;
    }).catch(function () {
      prices = null; changes = null; live = false;
    });
  }

  function loadFng() {
    return fetchJSON("https://api.alternative.me/fng/?limit=1").then(function (d) {
      var v = parseInt(d.data && d.data[0] && d.data[0].value, 10);
      if (!isNaN(v)) renderFng(v, "alternative.me");
    }).catch(function () {
      // Offline: show neutral placeholder instead of a fake number
      var lbl = document.getElementById("fngLabel");
      if (lbl) { lbl.textContent = "Live index unavailable offline"; lbl.style.color = "var(--muted)"; }
    });
  }

  /* ---------- Wire everything ---------- */
  function init() {
    ["convAmount", "convCoin", "convFiat"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener("input", runConversion);
    });

    var dcaBtn = document.getElementById("dcaCalc");
    if (dcaBtn) dcaBtn.addEventListener("click", runDCA);

    /* ---------- Sats converter ---------- */
    function runSats() {
      var amtEl = document.getElementById("satsAmount");
      var fromEl = document.getElementById("satsFrom");
      var outEl = document.getElementById("satsResult");
      var unitEl = document.getElementById("satsUnit");
      var noteEl = document.getElementById("satsNote");
      if (!amtEl || !outEl) return;
      var amount = parseFloat(amtEl.value) || 0;
      var SATS_PER_BTC = 100000000;
      var isBtc = fromEl.value === "btc";
      var result = isBtc ? amount * SATS_PER_BTC : amount / SATS_PER_BTC;
      outEl.value = result.toLocaleString("en-US", { maximumFractionDigits: 8 });
      unitEl.value = isBtc ? "SATS" : "BTC";
      var note = isBtc
        ? amount + " BTC = " + result.toLocaleString("en-US") + " sats."
        : amount.toLocaleString("en-US") + " sats = " + result + " BTC.";
      var btcUsd = prices && prices.bitcoin && prices.bitcoin.usd;
      if (noteEl) {
        noteEl.textContent = btcUsd
          ? note + " ≈ $" + fmt((isBtc ? amount : result) * btcUsd) + " (at live BTC price)."
          : note;
      }
    }
    ["satsAmount", "satsFrom"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener("input", runSats);
    });

    /* ---------- ETH unit converter ---------- */
    var ETH_UNITS = { wei: 1, gwei: 1e9, eth: 1e18 };
    var ETH_NAMES = { wei: "Wei", gwei: "Gwei", eth: "Ether" };
    function runEthUnits() {
      var amtEl = document.getElementById("ethAmount");
      var fromEl = document.getElementById("ethFrom");
      var toEl = document.getElementById("ethTo");
      var outEl = document.getElementById("ethResult");
      if (!amtEl || !outEl) return;
      var amount = parseFloat(amtEl.value) || 0;
      var wei = amount * ETH_UNITS[fromEl.value];
      var result = wei / ETH_UNITS[toEl.value];
      outEl.value = result.toLocaleString("en-US", { maximumFractionDigits: result < 0.000001 ? 12 : 6 }) + " " + ETH_NAMES[toEl.value];
    }
    ["ethAmount", "ethFrom", "ethTo"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener("input", runEthUnits);
    });
    runEthUnits();

    /* ---------- Profit / Loss calculator ---------- */
    function runPL() {
      var invested = Math.max(0, parseFloat(document.getElementById("plInvested").value) || 0);
      var buy = Math.max(0, parseFloat(document.getElementById("plBuy").value) || 0);
      var sell = Math.max(0, parseFloat(document.getElementById("plSell").value) || 0);
      if (buy <= 0) return;
      var coins = invested / buy;
      var value = coins * sell;
      var pnl = value - invested;
      var pct = invested > 0 ? (pnl / invested) * 100 : 0;
      document.getElementById("plCoins").textContent = coins.toLocaleString("en-US", { maximumFractionDigits: 8 });
      document.getElementById("plValue").textContent = "$" + value.toLocaleString("en-US", { maximumFractionDigits: 2 });
      var pnlEl = document.getElementById("plPnl");
      pnlEl.textContent = (pnl >= 0 ? "+" : "−") + "$" + Math.abs(pnl).toLocaleString("en-US", { maximumFractionDigits: 2 }) +
        " (" + (pct >= 0 ? "+" : "") + pct.toFixed(2) + "%)";
      pnlEl.className = pnl >= 0 ? "pos" : "neg";
      document.getElementById("plResult").hidden = false;
    }
    var plBtn = document.getElementById("plCalc");
    if (plBtn) plBtn.addEventListener("click", runPL);

    /* ---------- Staking APY calculator ---------- */
    function runStaking() {
      var amount = Math.max(0, parseFloat(document.getElementById("stakeAmount").value) || 0);
      var apy = parseFloat(document.getElementById("stakeApy").value) || 0;
      var months = Math.max(0, parseFloat(document.getElementById("stakeMonths").value) || 0);
      var change = parseFloat(document.getElementById("stakePriceChange").value) || 0;
      if (months <= 0) return;
      // Monthly compounding at the given annual APY
      var rewards = amount * (Math.pow(1 + apy / 100, months / 12) - 1);
      // Rewards are paid in the coin, so price change applies to principal + rewards
      var total = (amount + rewards) * (1 + change / 100);
      var retPct = amount > 0 ? ((total - amount) / amount) * 100 : 0;
      document.getElementById("stakeRewards").textContent = "+$" + rewards.toLocaleString("en-US", { maximumFractionDigits: 2 });
      var totalEl = document.getElementById("stakeTotal");
      totalEl.textContent = "$" + total.toLocaleString("en-US", { maximumFractionDigits: 2 });
      var retEl = document.getElementById("stakeReturn");
      retEl.textContent = (retPct >= 0 ? "+" : "−") + Math.abs(retPct).toFixed(2) + "%";
      retEl.className = retPct >= 0 ? "pos" : "neg";
      document.getElementById("stakeResult").hidden = false;
    }
    var stakeBtn = document.getElementById("stakeCalc");
    if (stakeBtn) stakeBtn.addEventListener("click", runStaking);

    loadPrices().then(function () {
      renderTicker();
      runConversion();
      runSats();
    });
    renderTicker(); // show fallback immediately, replace when live
    runConversion();
    loadFng();

    /* ---------- Newsletter form ---------- */
    var nlForm = document.getElementById("newsletterForm");
    if (nlForm) {
      nlForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var msgEl = document.getElementById("nlMsg");
        var btn = document.getElementById("nlBtn");
        var email = document.getElementById("nlEmail").value.trim();
        if (!email) return;

        btn.disabled = true;
        btn.textContent = "Subscribing…";
        msgEl.style.color = "";
        msgEl.textContent = "";

        fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email }),
        })
          .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
          .then(function (data) {
            if (data.ok) {
              msgEl.style.color = "#22c55e";
              msgEl.textContent = data.message || "You're on the list! Welcome aboard. 🚀";
              nlForm.reset();
              // GA4 key event — track newsletter signups in Analytics
              if (typeof gtag === "function") {
                gtag("event", "newsletter_signup", { event_category: "engagement" });
              }
            } else {
              msgEl.style.color = "#ef4444";
              msgEl.textContent = data.error || "Something went wrong. Please try again.";
            }
          })
          .catch(function () {
            // Not deployed to Cloudflare yet (or offline) — say so honestly.
            msgEl.style.color = "#f59e0b";
            msgEl.textContent = "Subscriptions go live once the site is deployed on Cloudflare Pages.";
          })
          .finally(function () {
            btn.disabled = false;
            btn.textContent = "Subscribe";
          });
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
