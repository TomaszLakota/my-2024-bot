import { ethers } from 'ethers';
import { privateKey } from './pk.json';

// Token and market addresses
const ytAddress = '0x9fcdd5b4cd9c7b550b93e85aec8b65033a20c15a';
const syAddress = '0x35751007a407ca6feffe80b3cb397736d2cf4dbe';
const market = '0xe11f9786b06438456b044b3e21712228adcaa0d1';

// Limit order parameters
const makingAmount = ethers.utils.parseUnits('0.001', 18); // 100 YT tokens
const takingAmount = ethers.utils.parseUnits('0.001', 18); // 90 SY tokens
const makerAddress = '0x3e000d33564dab9793cd8cde6a5957f5e5abafd1';
const salt = ethers.utils.randomBytes(32);
const expiry = Math.floor(Date.now() / 1000) + 3600; // Expiry in 1 hour

// EIP-712 typed data for limit order
const domain = {
  name: 'Pendle',
  version: '1',
  chainId: 42161,
  verifyingContract: market,
};

const types = {
  Order: [
    { name: 'salt', type: 'uint256' },
    { name: 'expiry', type: 'uint256' },
    { name: 'maker', type: 'address' },
    { name: 'receiver', type: 'address' },
    { name: 'allowedSender', type: 'address' },
    { name: 'interactions', type: 'bytes' },
  ],
};

const order = {
  salt: salt,
  expiry: expiry,
  maker: makerAddress,
  receiver: makerAddress,
  allowedSender: ethers.constants.AddressZero,
  interactions: ethers.utils.solidityPack(
    ['bytes4', 'address', 'uint256', 'address', 'uint256'],
    [
      ethers.utils.id('swapExactYtForSy(address,uint256,uint256,bytes)').slice(0, 10),
      ytAddress,
      makingAmount,
      syAddress,
      takingAmount,
    ]
  ),
};

async function signLimitOrder() {
  const wallet = new ethers.Wallet(privateKey);
  const signature = await wallet._signTypedData(domain, types, order);

  console.log('Signed Limit Order:');
  console.log('Order:', order);
  console.log('Signature:', signature);
}

signLimitOrder()
  .then(() => {
    console.log('Limit order signed successfully');
  })
  .catch((error) => {
    console.error('Error:', error);
  });