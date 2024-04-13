const ethers = require('ethers');
const {
    privateKey
} = require('./pk.json');


const routerContractAddress = '0x00000000005bbb0ef59571e58418f9a4357b68a0';

const myAddress = '0x3e000D33564dAB9793cD8cdE6a5957F5e5abaFd1';
const rpcProvider = 'https://arbitrum-mainnet.infura.io/v3/20c586137da348f1b22888b2f6fdcae7';


// Configure the provider and signer
const provider = new ethers.providers.JsonRpcProvider(rpcProvider);
const signer = new ethers.Wallet(privateKey, provider);

// Define the contract address
const contractAddress = routerContractAddress;

// Create a contract instance with an empty ABI
const contract = new ethers.Contract(contractAddress, [], signer);

// Define the transaction parameters
const receiver = myAddress;
const market = '0xe11f9786b06438456b044b3e21712228adcaa0d1';


const amountSelling = ethers.utils.parseEther('0.001'); // Replace with the amount you're selling (in ether)
const price = ethers.utils.parseEther('0.018'); // Replace with the desired price (in ether)
const minYtOut = amountSelling.mul(price).mul(95).div(100); // Calculate 95% of the selling amount times the price

const guessYtOut = [

];


const input = [
    '0x140',
    '0x280',
    receiver,
    amountSelling,
    receiver,
    '0x0',
    '0xa0',
    '0x0',
    '0x0'
];
const limit = [
    '0x80',
    '0x0',
    '0x0',
    '0x0',
    '0x0'
];

// Send the transaction using the selector
const data = ethers.utils.hexConcat([
    '0xed48907e',
    ethers.utils.defaultAbiCoder.encode(
        ['address', 'address', 'uint256', 'tuple(uint256,uint256,uint256,uint256,uint256)', 'tuple(uint256,uint256,address,uint256,address,uint256,uint256,uint256,uint256)', 'tuple(uint256,uint256,uint256,uint256,uint256)'],
        [receiver, market, minYtOut, guessYtOut, input, limit]
    )
]);


const simulate = true;
if (simulate) {
    contract.provider.call({
            to: contractAddress,
            data: data
        })
        .then((result) => {
            console.log('Simulation result:', result);
        })
        .catch((error) => {
            console.error('Simulation error:', error);
        });
} else {
    contract.signer.sendTransaction({
            to: contractAddress,
            data,
            gasLimit: ethers.utils.hexlify(1000000)
        })
        .then((tx) => {
            console.log('Transaction sent:', tx.hash);
            return tx.wait();
        })
        .then((receipt) => {
            console.log('Transaction confirmed:', receipt.transactionHash);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}