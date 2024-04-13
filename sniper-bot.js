"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTokenHoldings = void 0;
const node_notifier_1 = __importDefault(require("node-notifier"));
const sy_swap_1 = require("./sy-swap");
const ethers_1 = require("ethers");
const pk_json_1 = require("./pk.json");
const consts_1 = require("./consts");
const markets = {
    rseth: "rseth",
    weeth: "weeth",
};
let market = markets.rseth;
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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield fetchTokenHoldings();
        while (true) {
            try {
                yield loop();
                yield new Promise((resolve) => setTimeout(resolve, interval));
            }
            catch (error) {
                console.log(error);
            }
        }
    });
}
function loop() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const data = yield fetchPrice();
            const marketBuyAmount = ((_a = data.marketTrade) === null || _a === void 0 ? void 0 : _a.netFromTaker) || 0;
            const marketBuyAmountInEther = marketBuyAmount / 10 ** 18;
            const roundedMarketBuyAmountInEther = Math.floor(marketBuyAmountInEther * 10000) / 10000;
            console.log(roundedMarketBuyAmountInEther, new Date().toLocaleTimeString());
            if (roundedMarketBuyAmountInEther > minBuy) {
                console.log("buy", new Date().toLocaleTimeString());
                const amount = roundedMarketBuyAmountInEther > maxBuyPerTx
                    ? maxBuyPerTx
                    : roundedMarketBuyAmountInEther;
                const price = data.marketTrade.netFromTaker / data.marketTrade.netToTaker;
                yield (0, sy_swap_1.swapExactSyForYt)(market, amount, price);
                node_notifier_1.default.notify({
                    title: "BOT BUYING on " + market,
                    message: `BOT BUYING ${roundedMarketBuyAmountInEther} ${market}`,
                    sound: true,
                    wait: true,
                });
                yield new Promise((resolve) => setTimeout(resolve, 10000));
            }
        }
        catch (error) {
            console.error("Error:", error);
            node_notifier_1.default.notify({
                title: "BOT ERROR on " + market,
                message: `error on ${market}`,
                sound: true,
                wait: true,
            });
            yield new Promise((resolve) => setTimeout(resolve, interval));
        }
    });
}
function fetchPrice() {
    return __awaiter(this, void 0, void 0, function* () {
        const netFromTaker = size * Math.pow(10, 18);
        const postData = {
            chainId: 42161,
            market: market === markets.rseth
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
            const fetch = (yield import("node-fetch")).default;
            const response = yield fetch(postUrl, {
                method: "POST",
                headers: postHeaders,
                body: JSON.stringify(postData),
            });
            const data = yield response.json();
            return data;
        }
        catch (error) {
            console.error("Error fetching price:", error);
            throw error;
        }
    });
}
function fetchTokenHoldings() {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = new ethers_1.ethers.providers.JsonRpcProvider(pk_json_1.rpcUrl);
        const tokenAbi = [
            "function balanceOf(address account) view returns (uint256)",
        ];
        try {
            const swap = market === markets.rseth ? consts_1.rsethSwap : consts_1.weethSwap;
            const syTokenAddress = swap.tokenMintSy;
            const ytTokenAddress = swap.tokenYt;
            const syTokenContract = new ethers_1.ethers.Contract(syTokenAddress, tokenAbi, provider);
            const ytTokenContract = new ethers_1.ethers.Contract(ytTokenAddress, tokenAbi, provider);
            const syBalance = yield syTokenContract.balanceOf(pk_json_1.walletAddress);
            const ytBalance = yield ytTokenContract.balanceOf(pk_json_1.walletAddress);
            console.log(`SY Token Balance: ${ethers_1.ethers.utils.formatUnits(syBalance, 18)}`);
            console.log(`YT Token Balance: ${ethers_1.ethers.utils.formatUnits(ytBalance, 18)}`);
        }
        catch (error) {
            console.error("Error fetching token holdings:", error);
        }
    });
}
exports.fetchTokenHoldings = fetchTokenHoldings;
