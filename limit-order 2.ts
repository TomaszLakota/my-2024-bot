import notifier from "node-notifier";
import { ethers } from "ethers";
import { walletAddress, rpcUrl, privateKey } from "./pk.json";
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

const interval = market === markets.rseth ? 3000 : 15000;
const maxTransactions = 3; // Maximum number of transactions to send

let transactionCount = 0; // Counter for the number of transactions sent

main();

async function main() {
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
        const limitOrder = await createLimitOrder();
        await sendLimitOrder(limitOrder);
        transactionCount++; // Increment the transaction count
        notifier.notify({
            title: "BOT LIMIT ORDER on " + market,
            message: `BOT LIMIT ORDER ${limitOrder.makingAmount} ${market}`,
            sound: true,
            wait: true,
        });
        await new Promise((resolve) => setTimeout(resolve, 10000));
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

async function createLimitOrder() {
    const swap = market === markets.rseth ? rsethSwap : weethSwap;

    const limitOrder = {
        salt: ethers.utils.hexlify(ethers.utils.randomBytes(32)),
        expiry: Math.floor(Date.now() / 1000) + 3600, // Expiry in 1 hour
        nonce: ethers.utils.hexlify(ethers.utils.randomBytes(32)),
        orderType: 3, // Limit order type
        token: swap.tokenIn,
        YT: swap.tokenYt,
        maker: walletAddress,
        receiver: walletAddress,
        makingAmount: ethers.utils.parseUnits("0.01", 18), // Example making amount
        lnImpliedRate: ethers.utils.parseUnits("0.02", 18), // Example implied rate
        failSafeRate: ethers.utils.parseUnits("0.01", 18), // Example fail-safe rate
        permit: "0x",
    };

    return limitOrder;
}

async function sendLimitOrder(limitOrder: any) {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    const domain = {
        name: "Pendle",
        version: "1",
        chainId: 42161,
        verifyingContract: limitOrder.YT,
    };

    const types = {
        Order: [
            { name: "salt", type: "uint256" },
            { name: "expiry", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "orderType", type: "uint8" },
            { name: "token", type: "address" },
            { name: "YT", type: "address" },
            { name: "maker", type: "address" },
            { name: "receiver", type: "address" },
            { name: "makingAmount", type: "uint256" },
            { name: "lnImpliedRate", type: "uint256" },
            { name: "failSafeRate", type: "uint256" },
            { name: "permit", type: "bytes" },
        ],
    };

    const signature = await wallet._signTypedData(domain, types, limitOrder);

    // Send the signed limit order to the Pendle system
    // Use the Pendle SDK or API to submit the order
    // Example:
    // const pendleSDK = new PendleSDK();
    // await pendleSDK.submitLimitOrder(limitOrder, signature);

    console.log("Limit order submitted:", limitOrder);
}
