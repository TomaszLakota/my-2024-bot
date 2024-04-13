const fs = require('fs');
const crypto = require('crypto');

function generateRandomFile(filePath, sizeInBytes) {
    // Generate random bytes of specified size
    crypto.randomBytes(sizeInBytes, (err, buffer) => {
        if (err) throw err;

        // Convert buffer to a hexadecimal string
        const hexString = buffer.toString('hex');

        // Write the hexadecimal string to a file
        fs.writeFile(filePath, hexString, (err) => {
            if (err) throw err;
            console.log(`Random data file created at ${filePath}`);
        });
    });
}

// Specify the path and size of the file
const filePath = 'file.txt'; // The path where the file will be saved
const sizeInBytes = 1024; // Size of the file in bytes

generateRandomFile(filePath, sizeInBytes);
