import notifier from "node-notifier";
import { swapExactSyForYt } from "./sy-swap";

const markets = {
  rseth: "rseth",
  weeth: "weeth",
} as const;
let market: "rseth" | "weeth" = markets.rseth;
const args = process.argv.slice(2);
if (args.includes("weeth")) {
  market = markets.weeth;
}
console.log(market);

const size = market === markets.rseth ? 0.01 : 0.2;
const minBuy = market === markets.rseth ? 0.003 : 0.005;
const interval = market === markets.rseth ? 3000 : 15000;
const maxBuyPerTx = market === markets.rseth ? 0.01 : 0.001;
main();

async function main() {
  while (true) {
    try {
      await loop();
      await new Promise((resolve) => setTimeout(resolve, interval));
    } catch (error) {
      console.log(error);
    }
  }
}

async function loop() {
  try {
    const data: any = await fetchPrice();

    const marketBuyAmount = data.marketTrade?.netFromTaker || 0;
    const marketBuyAmountInEther = marketBuyAmount / 10 ** 18;
    const roundedMarketBuyAmountInEther =
      Math.floor(marketBuyAmountInEther * 10000) / 10000;
    console.log(roundedMarketBuyAmountInEther, new Date().toLocaleTimeString());

    if (roundedMarketBuyAmountInEther > minBuy) {
      console.log("buy", new Date().toLocaleTimeString());

      const amount =
        roundedMarketBuyAmountInEther > maxBuyPerTx
          ? maxBuyPerTx
          : roundedMarketBuyAmountInEther;
      const price = data.marketTrade.netFromTaker / data.marketTrade.netToTaker;
      await swapExactSyForYt(market, amount, price);
      notifier.notify({
        title: "BOT BYING on " + market,
        message: `BOT BUYING ${roundedMarketBuyAmountInEther} ${market}`,
        sound: true,
        wait: true,
      });
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  } catch (error) {
    console.error("Error:", error);
    notifier.notify({
      title: "BOT ERROR on " + market,
      message: `error on ${market}`,
      sound: true,
      wait: true,
    });
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

async function fetchPrice() {
  const netFromTaker = size * Math.pow(10, 18);
  const postData = {
    chainId: 42161,
    market:
      market === markets.rseth
        ? "0x6f02c88650837c8dfe89f66723c4743e9cf833cd"
        : "0xe11f9786b06438456b044b3e21712228adcaa0d1",
    netFromTaker: netFromTaker,
    type: 2,
  };
  const postUrl =
    "https://api-v2.pendle.finance/limit-order/v2/limit-order/market-order";
  const postHeaders = {
    "Content-Type": "application/json",
  };
  const fetch = (await import("node-fetch")).default;
  const response = await fetch(postUrl, {
    method: "POST",
    headers: postHeaders,
    body: JSON.stringify(postData),
  });
  const data = await response.json();
  return data;
}
