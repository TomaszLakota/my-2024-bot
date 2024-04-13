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
exports.swapExactYtForSy = void 0;
const ethers_1 = require("ethers");
const pk_json_1 = require("./pk.json");
const ABI_json_1 = require("./ABI.json");
const abi2_1 = require("./abi2");
const provider = new ethers_1.ethers.providers.JsonRpcProvider(pk_json_1.rpcUrl);
const wallet = new ethers_1.ethers.Wallet(pk_json_1.privateKey, provider);
const contractAddress = '0x00000000005bbb0ef59571e58418f9a4357b68a0';
const routerContract = new ethers_1.ethers.Contract(contractAddress, ABI_json_1.routerAbi, wallet);
const swapExactYtForSyInterface = new ethers_1.ethers.utils.Interface(abi2_1.swapExactYtForSyAbi);
// Token and market addresses for wETH swap
const weethSwap = {
    tokenIn: '0x35751007a407ca6feffe80b3cb397736d2cf4dbe',
    tokenMintSy: '0x35751007a407ca6feffe80b3cb397736d2cf4dbe',
    market: '0xe11f9786b06438456b044b3e21712228adcaa0d1',
};
// Token and market addresses for rsETH swap
const rsethSwap = {
    tokenIn: '0x04186bfc76e2e237523cbc30fd220fe055156b41f',
    tokenMintSy: '0x04186bfc76e2e237523cbc30fd220fe055156b41f',
    market: '0x6f02c88650837c8dfe89f66723c4743e9cf833cd',
};
function swapExactYtForSy(receiver, swapType, exactYtIn, minSyOut) {
    return __awaiter(this, void 0, void 0, function* () {
        const limit = {
            limitRouter: ethers_1.ethers.constants.AddressZero,
            epsSkipMarket: ethers_1.ethers.BigNumber.from(0),
            normalFills: [],
            flashFills: [],
            optData: '0x',
        };
        const calldata = swapExactYtForSyInterface.encodeFunctionData('swapExactYtForSy', [
            receiver,
            swapType.market,
            exactYtIn,
            minSyOut,
            limit,
        ]);
        const tx = yield routerContract.fallback({ data: calldata, gasLimit: 1000000 });
        yield tx.wait();
        console.log('Swap transaction completed');
    });
}
exports.swapExactYtForSy = swapExactYtForSy;
// Example usage
const receiver = '0x3e000d33564dab9793cd8cde6a5957f5e5abafd1';
const amount = 0.32;
const price = 0.01548;
const exactYtIn = ethers_1.ethers.utils.parseUnits(amount.toString(), 18);
const expectedOut = ethers_1.ethers.utils.parseUnits((amount * price).toFixed(18), 18);
const minSyOut = expectedOut.mul(98).div(100);
// Perform a wETH swap
swapExactYtForSy(receiver, weethSwap, exactYtIn, minSyOut)
    .then(() => {
    console.log('wETH swap completed successfully');
})
    .catch((error) => {
    console.error('Error:', error);
});
