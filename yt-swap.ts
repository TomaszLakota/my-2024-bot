import { ethers } from 'ethers';
import { privateKey, rpcUrl } from './pk.json';
import { routerAbi } from './ABI.json';
import { swapExactYtForSyAbi } from './abi2';

const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);
const contractAddress = '0x00000000005bbb0ef59571e58418f9a4357b68a0';

const routerContract = new ethers.Contract(contractAddress, routerAbi, wallet);
const swapExactYtForSyInterface = new ethers.utils.Interface(swapExactYtForSyAbi);

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

export async function swapExactYtForSy(receiver, swapType, exactYtIn, minSyOut) {
  const limit = {
    limitRouter: ethers.constants.AddressZero,
    epsSkipMarket: ethers.BigNumber.from(0),
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

  const tx = await routerContract.fallback({ data: calldata, gasLimit: 1000000 });
  await tx.wait();

  console.log('Swap transaction completed');
}

// Example usage
const receiver = '0x3e000d33564dab9793cd8cde6a5957f5e5abafd1';
const amount = 0.32;
const price = 0.01548;

const exactYtIn = ethers.utils.parseUnits(amount.toString(), 18); 
const expectedOut = ethers.utils.parseUnits((amount * price).toFixed(18), 18);
const minSyOut = expectedOut.mul(98).div(100);




// Perform a wETH swap
swapExactYtForSy(receiver, weethSwap, exactYtIn, minSyOut)
  .then(() => {
    console.log('wETH swap completed successfully');
  })
  .catch((error) => {
    console.error('Error:', error);
  });