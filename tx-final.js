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
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const pk_json_1 = require("./pk.json");
const ABI_json_1 = require("./ABI.json");
const abi_1 = require("./abi"); // Correct ABI for swapExactSyForYt
const provider = new ethers_1.ethers.providers.JsonRpcProvider(pk_json_1.rpcUrl);
const wallet = new ethers_1.ethers.Wallet(pk_json_1.privateKey, provider);
const contractAddress = '0x00000000005bbb0ef59571e58418f9a4357b68a0';
const routerContract = new ethers_1.ethers.Contract(contractAddress, ABI_json_1.routerAbi, wallet);
const actionSwapYtInterface = new ethers_1.ethers.utils.Interface(abi_1.swapExactSyForYtAbi); // Correct interface initialization
function swapExactSyForYt(receiver, market, price, amountIn, tokenIn, tokenMintSy) {
    return __awaiter(this, void 0, void 0, function* () {
        const exactSyIn = ethers_1.ethers.utils.parseUnits(amountIn.toString(), 18); // Convert the amount to a BigNumber with 18 decimals
        const minYtOut = exactSyIn.mul(price).mul(98).div(100); // Calculate minYtOut with a 2% slippage tolerance
        const guessYtOut = {
            guessMin: ethers_1.ethers.BigNumber.from(0),
            guessMax: ethers_1.ethers.constants.MaxUint256,
            guessOffchain: ethers_1.ethers.BigNumber.from(0),
            maxIteration: ethers_1.ethers.BigNumber.from(256),
            eps: ethers_1.ethers.utils.parseUnits('1', 14),
        };
        const limit = {
            limitRouter: ethers_1.ethers.constants.AddressZero,
            epsSkipMarket: ethers_1.ethers.BigNumber.from(0),
            normalFills: [],
            flashFills: [],
            optData: '0x',
        };
        // Construct calldata for transaction
        const calldata = actionSwapYtInterface.encodeFunctionData('swapExactSyForYt', [
            receiver,
            market,
            exactSyIn,
            minYtOut,
            guessYtOut,
            limit
        ]);
        // Sending the transaction via fallback method with calldata
        const tx = yield routerContract.fallback({ data: calldata, gasLimit: 1000000 });
        yield tx.wait();
        console.log('Swap transaction completed');
    });
}
// Example usage
const receiver = '0x3e000d33564dab9793cd8cde6a5957f5e5abafd1';
const market = '0x6f02c88650837c8dfe89f66723c4743e9cf833cd'; // Example market address for rsETH
const price = ethers_1.ethers.utils.parseUnits('0.02', 18); // Example price per SY in ETH
const amountIn = 0.005; // Amount of SY to swap
const tokenIn = '0x04186bfc76e2e237523cbc30fd220fe055156b41f'; // Example token input
const tokenMintSy = '0x04186bfc76e2e237523cbc30fd220fe055156b41f'; // Example token mint SY
// Perform an rsETH swap
swapExactSyForYt(receiver, market, price, amountIn, tokenIn, tokenMintSy)
    .then(() => {
    console.log('rsETH swap completed successfully');
})
    .catch((error) => {
    console.error('Error:', error);
});
