const ethers = require('ethers');
const fs = require('fs');
const crypto = require('crypto');

async function generatePrivateKey(filePath, password) {
    // Ensure that password is provided
    if (!password) {
        console.error('No password provided. Usage: node script.js <password>');
        process.exit(1);
    }

    // Read data from the file
    const fileData = fs.readFileSync(filePath);

    // Create a salt from file data (e.g., hash it)
    const salt = crypto.createHash('sha256').update(fileData).digest();
    console.log(salt);

    // Derive a key using scrypt
    const derivedKey = crypto.scryptSync(password, salt, 32); // Parameters can be adjusted, synchronous version

    // Use the derived key as a private key (make sure it's valid for Ethereum)
    const wallet = new ethers.Wallet(derivedKey.toString('hex'));

    // Output the wallet address and private key
    console.log(`Address: ${wallet.address}`);
    console.log(`Private Key: ${wallet.privateKey}`);
}

// Check for command line arguments for the password
if (process.argv.length < 3) {
    console.log('Usage: node script.js <password>');
    process.exit(1);
}

const filePath = 'file.txt'; // Fixed file path
const password = process.argv[2]; // Get password from command line argument

// Call the function with the file path and password
generatePrivateKey(filePath, password);
