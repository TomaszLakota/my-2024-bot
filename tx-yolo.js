const ethers = require('ethers');
const {
    privateKey,
    rpcUrl
} = require('./pk.json');
const {
    routerAbi,
    ytTokenAbi
} = require('./ABI.json');

// Diamond proxy contract address
const diamondProxyAddress = '0x00000000005bbb0ef59571e58418f9a4357b68a0';

// Provider and signer setup
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const signer = new ethers.Wallet(privateKey, provider);

// Create an instance of the Diamond proxy contract
const diamondProxy = new ethers.Contract(diamondProxyAddress, routerAbi, signer);

// Function to send the transaction
async function sendTransaction() {
    try {
        // Prepare the transaction data
        const receiver = '0x3e000d33564dab9793cd8cde6a5957f5e5abafd1';
        const market = '0xe11f9786b06438456b044b3e21712228adcaa0d1';
        const minYtOut = ethers.BigNumber.from('0x00000000000000000000000000000000000000000000000000d426edca9bd19b');
        const guessYtOut = {
            guessMin: ethers.BigNumber.from('0x000000000000000000000000000000000000000000000000006a9bec8efaaecc'),
            guessMax: ethers.BigNumber.from('0x00000000000000000000000000000000000000000000000000da8c63c58016ff'),
        };
        const input = {
            tokenIn: '0x35751007a407ca6feffe80b3cb397736d2cf4dbe',
            amountIn: ethers.BigNumber.from('0x00000000000000000000000000000000000000000000000000038d7ea4c68000'),
        };
        const limit = {
            tokenOut: '0xf28db483773e3616da91fdfa7b5d4090ac40cc59',
            amountOutMinimum: ethers.BigNumber.from('0'),
        };

        // Encode the function parameters
        const encodedParams = ethers.utils.defaultAbiCoder.encode(
            ['address', 'address', 'uint256', 'tuple(uint256,uint256)', 'tuple(address,uint256)', 'tuple(address,uint256)'],
            [receiver, market, minYtOut, [guessYtOut.guessMin, guessYtOut.guessMax],
                [input.tokenIn, input.amountIn],
                [limit.tokenOut, limit.amountOutMinimum]
            ]
        );

        // Encode the function selector
        const functionSelector = ethers.utils.id('0xed48907e');

        // Combine the function selector and encoded parameters
        const calldata = functionSelector + encodedParams.slice(2);

        // Send the transaction to the Diamond proxy contract
        const tx = await diamondProxy.fallback({
            data: calldata,
            gasLimit: 1000000
        });

        console.log('Transaction hash:', tx.hash);
        await tx.wait();
        console.log('Transaction confirmed');
    } catch (error) {
        console.error('Error:', error);
    }
}

sendTransaction();