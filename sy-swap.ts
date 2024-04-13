import { ethers } from "ethers";
import { privateKey, rpcUrl } from "./pk.json";
import { routerAbi } from "./ABI.json";
import { swapExactSyForYtAbi } from "./abi";

const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);
const contractAddress = "0x00000000005bbb0ef59571e58418f9a4357b68a0";

const routerContract = new ethers.Contract(contractAddress, routerAbi, wallet);
const swapExactSyForYtInterface = new ethers.utils.Interface(
  swapExactSyForYtAbi
);

// Token and market addresses for wETH swap
const weethSwap = {
  tokenIn: "0x35751007a407ca6feffe80b3cb397736d2cf4dbe",
  tokenMintSy: "0x35751007a407ca6feffe80b3cb397736d2cf4dbe",
  market: "0xe11f9786b06438456b044b3e21712228adcaa0d1",
};

// Token and market addresses for rsETH swap
const rsethSwap = {
  tokenIn: "0x04186bfc76e2e237523cbc30fd220fe055156b41f",
  tokenMintSy: "0x04186bfc76e2e237523cbc30fd220fe055156b41f",
  market: "0x6f02c88650837c8dfe89f66723c4743e9cf833cd",
};

export async function swapExactSyForYt(
  market: "weeth" | "rseth",
  amount,
  price
) {
  console.log(market, amount, price);
  const receiver = "0x3e000d33564dab9793cd8cde6a5957f5e5abafd1";
  const marketAddress =
    market === "rseth"
      ? "0x6f02c88650837c8dfe89f66723c4743e9cf833cd"
      : "0xe11f9786b06438456b044b3e21712228adcaa0d1";
  const exactSyIn = ethers.utils.parseUnits(amount.toString(), 18);
  const expectedOut = ethers.utils.parseUnits((amount / price).toString(), 18);
  const minYtOut = expectedOut.mul(98).div(100);
  const guessMin = expectedOut.mul(50).div(100);
  const guessMax = expectedOut.mul(110).div(100);

  const guessYtOut = {
    guessMin,
    guessMax,
    guessOffchain: minYtOut,
    maxIteration: ethers.BigNumber.from(256),
    eps: ethers.BigNumber.from("0x09184e72a000"),
  };
  const limit = {
    limitRouter: ethers.constants.AddressZero,
    epsSkipMarket: ethers.BigNumber.from(0),
    normalFills: [],
    flashFills: [],
    optData: "0x",
  };

  const calldata = swapExactSyForYtInterface.encodeFunctionData(
    "swapExactSyForYt",
    [receiver, marketAddress, exactSyIn, minYtOut, guessYtOut, limit]
  );

  const tx = await routerContract.fallback({
    data: calldata,
    gasLimit: 1000000,
  });
  await tx.wait();

  console.log("Swap transaction completed");
}

// Example usage
const amount = 0.005;
const price = 0.01706058160487295;

// Perform a wETH swap
// swapExactSyForYt("weeth", amount, price)
//   .then(() => {
//     console.log("wETH swap completed successfully");
//   })
//   .catch((error) => {
//     console.error("Error:", error);
//   });
