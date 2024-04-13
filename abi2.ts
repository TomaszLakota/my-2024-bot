// abi2.ts
export const swapExactYtForSyAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "market",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "exactYtIn",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "minSyOut",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "limitRouter",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "epsSkipMarket",
            "type": "uint256"
          },
          {
            "components": [
              {
                "components": [
                  {
                    "internalType": "uint256",
                    "name": "salt",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "expiry",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "nonce",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint8",
                    "name": "orderType",
                    "type": "uint8"
                  },
                  {
                    "internalType": "address",
                    "name": "token",
                    "type": "address"
                  },
                  {
                    "internalType": "address",
                    "name": "YT",
                    "type": "address"
                  },
                  {
                    "internalType": "address",
                    "name": "maker",
                    "type": "address"
                  },
                  {
                    "internalType": "address",
                    "name": "receiver",
                    "type": "address"
                  },
                  {
                    "internalType": "uint256",
                    "name": "makingAmount",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "lnImpliedRate",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "failSafeRate",
                    "type": "uint256"
                  },
                  {
                    "internalType": "bytes",
                    "name": "permit",
                    "type": "bytes"
                  }
                ],
                "internalType": "struct Order",
                "name": "order",
                "type": "tuple"
              },
              {
                "internalType": "bytes",
                "name": "signature",
                "type": "bytes"
              },
              {
                "internalType": "uint256",
                "name": "makingAmount",
                "type": "uint256"
              }
            ],
            "internalType": "struct FillOrderParams[]",
            "name": "normalFills",
            "type": "tuple[]"
          },
          {
            "components": [
              {
                "components": [
                  {
                    "internalType": "uint256",
                    "name": "salt",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "expiry",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "nonce",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint8",
                    "name": "orderType",
                    "type": "uint8"
                  },
                  {
                    "internalType": "address",
                    "name": "token",
                    "type": "address"
                  },
                  {
                    "internalType": "address",
                    "name": "YT",
                    "type": "address"
                  },
                  {
                    "internalType": "address",
                    "name": "maker",
                    "type": "address"
                  },
                  {
                    "internalType": "address",
                    "name": "receiver",
                    "type": "address"
                  },
                  {
                    "internalType": "uint256",
                    "name": "makingAmount",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "lnImpliedRate",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "failSafeRate",
                    "type": "uint256"
                  },
                  {
                    "internalType": "bytes",
                    "name": "permit",
                    "type": "bytes"
                  }
                ],
                "internalType": "struct Order",
                "name": "order",
                "type": "tuple"
              },
              {
                "internalType": "bytes",
                "name": "signature",
                "type": "bytes"
              },
              {
                "internalType": "uint256",
                "name": "makingAmount",
                "type": "uint256"
              }
            ],
            "internalType": "struct FillOrderParams[]",
            "name": "flashFills",
            "type": "tuple[]"
          },
          {
            "internalType": "bytes",
            "name": "optData",
            "type": "bytes"
          }
        ],
        "internalType": "struct LimitOrderData",
        "name": "limit",
        "type": "tuple"
      }
    ],
    "name": "swapExactYtForSy",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "netSyOut",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "netSyFee",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];