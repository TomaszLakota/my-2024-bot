import {
  ethers
} from 'ethers';
import {
  privateKey,
  rpcUrl
} from './pk.json';
import {
  routerAbi
} from './ABI.json';
import { swapExactSyForYtAbi } from './abi';  // Correct ABI for swapExactSyForYt

const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);
const contractAddress = '0x00000000005bbb0ef59571e58418f9a4357b68a0';

const routerContract = new ethers.Contract(contractAddress, routerAbi, wallet);

const actionSwapYtInterface = new ethers.utils.Interface(swapExactSyForYtAbi);  // Correct interface initialization

async function swapExactSyForYt(receiver, market, price, amountIn, tokenIn, tokenMintSy) {
  const exactSyIn = ethers.utils.parseUnits(amountIn.toString(), 18); // Convert the amount to a BigNumber with 18 decimals
  const minYtOut = exactSyIn.mul(price).mul(98).div(100); // Calculate minYtOut with a 2% slippage tolerance

  const guessYtOut = {
    guessMin: ethers.BigNumber.from(0),
    guessMax: ethers.constants.MaxUint256,
    guessOffchain: ethers.BigNumber.from(0),
    maxIteration: ethers.BigNumber.from(256),
    eps: ethers.utils.parseUnits('1', 14),
  };

  const limit = {
    limitRouter: ethers.constants.AddressZero,
    epsSkipMarket: ethers.BigNumber.from(0),
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
  const tx = await routerContract.fallback({ data: calldata, gasLimit: 1000000 });
  await tx.wait();

  console.log('Swap transaction completed');
}

// Example usage
const receiver = '0x3e000d33564dab9793cd8cde6a5957f5e5abafd1';
const market = '0x6f02c88650837c8dfe89f66723c4743e9cf833cd'; // Example market address for rsETH
const price = ethers.utils.parseUnits('0.02', 18); // Example price per SY in ETH
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
