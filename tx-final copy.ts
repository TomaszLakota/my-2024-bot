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
import { actionSwapYtAbi, swapExactSyForYtAbi } from './abi';

const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);
const contractAddress = '0x00000000005bbb0ef59571e58418f9a4357b68a0';

const routerContract = new ethers.Contract(contractAddress, routerAbi, wallet);

const actionSwapYtInterface = new ethers.utils.Interface(actionSwapYtAbi);

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

async function swapExactTokenForYt(receiver, swapType, swappedAmount, price) {
  const minYtOut = swappedAmount.mul(price).mul(98).div(100); 

  const guessYtOut = {
    guessMin: ethers.BigNumber.from(0),
    guessMax: ethers.constants.MaxUint256,
    guessOffchain: ethers.BigNumber.from(0),
    maxIteration: ethers.BigNumber.from(256),
    eps: ethers.utils.parseUnits('1', 14),
  };

  const input = {
    tokenIn: swapType.tokenIn,
    netTokenIn: swappedAmount,
    tokenMintSy: swapType.tokenMintSy,
    pendleSwap: ethers.constants.AddressZero,
    swapData: {
      swapType: 0,
      extRouter: ethers.constants.AddressZero,
      extCalldata: '0x',
      needScale: false,
    },
  };

  const limit = {
    limitRouter: ethers.constants.AddressZero,
    epsSkipMarket: ethers.BigNumber.from(0),
    normalFills: [],
    flashFills: [],
    optData: '0x',
  };

  const calldata = actionSwapYtInterface.encodeFunctionData('swapExactTokenForYt', [
    receiver,
    swapType.market,
    minYtOut,
    guessYtOut,
    input,
    limit,
  ]);

  const tx = await routerContract.fallback({ data: calldata, gasLimit: 1000000 });
  await tx.wait();

  console.log('Swap transaction completed');
}

// Example usage
const receiver = '0x3e000d33564dab9793cd8cde6a5957f5e5abafd1';
const swappedAmount = ethers.utils.parseUnits('0.005', 18);
const price = ethers.utils.parseUnits('0.02', 18);

// Perform a wETH swap
swapExactTokenForYt(receiver, weethSwap, swappedAmount, price)
  .then(() => {
    console.log('wETH swap completed successfully');
  })
  .catch((error) => {
    console.error('Error:', error);
  });