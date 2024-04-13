import notifier from "node-notifier";
import { swapExactSyForYt } from "./sy-swap";
import { ethers, logger } from "ethers";
import { walletAddress, rpcUrl } from "./pk.json";
import { weethSwap, rsethSwap } from "./consts";

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

const size = market === markets.rseth ? 0.055 : 0.2;
const minBuy = market === markets.rseth ? 0.003 : 0.005;
const interval = market === markets.rseth ? 3000 : 15000;
const maxBuyPerTx = market === markets.rseth ? 0.05 : 0.001;
const maxTransactions = 3; // Maximum number of transactions to send

let transactionCount = 0; // Counter for the number of transactions sent
let syBalance = 0;
let ytBalance = 0;
main();

async function main() {
    ({ syBalance, ytBalance } = await fetchTokenHoldings());

    while (transactionCount < maxTransactions) {
        try {
            await loop();
            await new Promise((resolve) => setTimeout(resolve, interval));
        } catch (error) {
            console.log(error);
        }
    }

    console.log("Maximum transaction limit reached. Bot stopped.");
}

async function loop() {
    try {
        const data: any = await fetchPrice(size);
        const marketBuyAmount = data.marketTrade?.netFromTaker || 0;
        const marketBuyAmountInEther = marketBuyAmount / 10 ** 18;
        let roundedMarketBuyAmountInEther = Math.floor(marketBuyAmountInEther * 10000) / 10000;
        if (market === markets.rseth) {
            roundedMarketBuyAmountInEther -= 0.005;
        }
        console.log(roundedMarketBuyAmountInEther, new Date().toLocaleTimeString());
        console.log(syBalance);

        if (roundedMarketBuyAmountInEther > minBuy) {
            console.log("buy", new Date().toLocaleTimeString());
            let amount = roundedMarketBuyAmountInEther > maxBuyPerTx ? maxBuyPerTx : roundedMarketBuyAmountInEther;

            if (amount > syBalance) {
                amount = Math.floor(syBalance * 10000) / 10000;
            }
            console.log(amount, syBalance);

            const price = data.marketTrade.netFromTaker / data.marketTrade.netToTaker;
            await swapExactSyForYt(market, amount, price);
            transactionCount++; // Increment the transaction count
            notifier.notify({
                title: "BOT BUYING on " + market,
                message: `BOT BUYING ${roundedMarketBuyAmountInEther} ${market}`,
                sound: true,
                wait: true,
            });
            await fetchRestToBuy();

            await new Promise((resolve) => setTimeout(resolve, 10000));
            ({ syBalance, ytBalance } = await fetchTokenHoldings());
        }
    } catch (error) {
        console.error("Error:", error);
        transactionCount++; // Increment the transaction count for errors
        notifier.notify({
            title: "BOT ERROR on " + market,
            message: `error on ${market}`,
            sound: true,
            wait: true,
        });
        await new Promise((resolve) => setTimeout(resolve, interval));
    }
}

async function fetchPrice(size) {
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
    const postUrl = "https://api-v2.pendle.finance/limit-order/v2/limit-order/market-order";
    const postHeaders = {
        "Content-Type": "application/json",
    };

    try {
        const fetch = (await import("node-fetch")).default;
        const response = await fetch(postUrl, {
            method: "POST",
            headers: postHeaders,
            body: JSON.stringify(postData),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching price:", error);
        throw error;
    }
}

export async function fetchTokenHoldings() {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const tokenAbi = ["function balanceOf(address account) view returns (uint256)"];

    try {
        const swap = market === markets.rseth ? rsethSwap : weethSwap;
        const syTokenAddress = swap.tokenMintSy;
        const ytTokenAddress = swap.tokenYt;

        const syTokenContract = new ethers.Contract(syTokenAddress, tokenAbi, provider);
        const ytTokenContract = new ethers.Contract(ytTokenAddress, tokenAbi, provider);

        const syBalanceBN = await syTokenContract.balanceOf(walletAddress);
        const ytBalanceBN = await ytTokenContract.balanceOf(walletAddress);

        const syBalance = Number(ethers.utils.formatUnits(syBalanceBN, 18));
        const ytBalance = Number(ethers.utils.formatUnits(ytBalanceBN, 18));
        console.log(`SY Token Balance: ${syBalance}`);
        console.log(`YT Token Balance: ${ytBalance}`);
        return { syBalance, ytBalance };
    } catch (error) {
        console.error("Error fetching token holdings:", error);
    }
}

async function fetchRestToBuy() {
    let size = 0.5;
    const data: any = await fetchPrice(size);
    const marketBuyAmount = data.marketTrade?.netFromTaker || 0;
    const marketBuyAmountInEther = marketBuyAmount / 10 ** 18;
    let roundedMarketBuyAmountInEther = Math.floor(marketBuyAmountInEther * 10000) / 10000;

    console.log(roundedMarketBuyAmountInEther, new Date().toLocaleTimeString());
    notifier.notify({
        title: "BOT remaining size on " + market,
        message: `You can buy ${marketBuyAmountInEther}`,
        sound: true,
        wait: true,
    });
}
