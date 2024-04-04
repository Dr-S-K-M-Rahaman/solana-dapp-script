const express = require('express');
const app = express();
const cors = require('cors');
const { exec } = require('child_process');
const { Web3 } = require('web3');
const axios = require('axios');
const dotenv = require('dotenv');
require('dotenv').config();

const sepoliaWeb3 = new Web3(process.env.RPC_URL);
const PORT = process.env.PORT;
const senderAddress = process.env.SENDER_ADDRESS;
const contractAddress = process.env.CONTRACT_ADDRESS;
const privateKey = process.env.PRIVATE_KEY;
const tokenContract = process.env.TOKEN_CONTRACT;
const tokenRecipient = process.env.TOKEN_RECIPIENT;
const rpcEndpoint = process.env.SOLANA_RPC_ENDPOINT;
const contractABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "user",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "time",
				"type": "uint256"
			}
		],
		"name": "Deposit",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "user",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Withdraw",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "allWallet",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "currentReward",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "user",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "deposit",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "earninPerSecPerToken",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bool",
				"name": "value",
				"type": "bool"
			}
		],
		"name": "enableOrDisableStake",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getApr",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getNonce",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "user",
				"type": "string"
			}
		],
		"name": "getNonceByUser",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_nonce",
				"type": "uint256"
			}
		],
		"name": "getUserAddressByNonce",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_nonce",
				"type": "uint256"
			}
		],
		"name": "getUserAmountByNonce",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "user",
				"type": "string"
			}
		],
		"name": "getUserReward",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "isStakingEnable",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "reInvest",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "rewardEndAt",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "rewardPerSecond",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "rewardPerToken18Decimal",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "rewardStartAt",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "rewardTime",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalClaimed",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalDeposit",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalReward",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "time",
				"type": "uint256"
			}
		],
		"name": "updateRewardTime",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "user",
				"type": "string"
			}
		],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];
const contract = new sepoliaWeb3.eth.Contract(contractABI, contractAddress);

let lastTransactions = [];

const corsOptions = {
	origin: 'http://localhost:3000', // Origin(s) to allow
};

app.use(cors(corsOptions));
app.use(express.json());

const convertToInteger = (number) => {
    const decimalPlaces = 9; // Assuming 9 decimal places
    const factor = 10 ** decimalPlaces;
    const _number = Math.round(number * factor);
    console.log(_number);
    return _number;
};

const checkDuplicate = (taxId, blockNumber) => {
  return lastTransactions.some((transaction) => {
    return transaction.taxId === taxId && transaction.blockNumber === blockNumber;
  });
};

async function depositToken(userAddress, amount) {
  try {
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');

    const gasPriceBigInt = await sepoliaWeb3.eth.getGasPrice();
    const _gasPrice = gasPriceBigInt.toString();
    console.log('Current gas price:', _gasPrice, 'Wei');

    const estimatedGas = await contract.methods.deposit(userAddress, amount).estimateGas({
      from: senderAddress,
      value: 0,
    });

    const gasLimit_ = estimatedGas.toString();
    const _gasLimit = Math.ceil(gasLimit_ * 1.2);
    console.log('Required gas limit:', _gasLimit, 'Wei');

    const txObject = {
      from: senderAddress,
      to: contractAddress,
      data: contract.methods.deposit(userAddress, amount).encodeABI(),
      gas: 1,
      gasPrice: _gasPrice,
      gasLimit: _gasLimit,
      nonce: await sepoliaWeb3.eth.getTransactionCount(senderAddress, 'pending'),
    };
    const signedTx = await sepoliaWeb3.eth.accounts.signTransaction(txObject, privateKeyBuffer);
    const receipt = await sepoliaWeb3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('Transaction successful:', receipt.transactionHash);
    console.log(`Check On EtherScan: https://sepolia.etherscan.io/tx/${receipt.transactionHash}`);
  } catch (error) {
    console.error('Error depositing tokens:', error);
    console.error('Error stack trace:', error.stack);
    throw error;
  }
}

async function withdrawToken(userAddress) {
  try {
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');

	const userNonce = await contract.methods.getNonceByUser(userAddress).call();
	const userDeposit = await contract.methods.getUserAmountByNonce(userNonce).call();
	const userReward = await contract.methods.getUserReward(userAddress).call();

    const gasPriceBigInt = await sepoliaWeb3.eth.getGasPrice();
    const _gasPrice = gasPriceBigInt.toString();
    console.log('Current gas price:', _gasPrice, 'Wei');

    const estimatedGas = await contract.methods.withdraw(userAddress).estimateGas({
      from: senderAddress,
      value: 0,
    });

    const gasLimit_ = estimatedGas.toString();
    const _gasLimit = Math.ceil(gasLimit_ * 1.2);
    console.log('Required gas limit:', _gasLimit, 'Wei');

    const txObject = {
      from: senderAddress,
      to: contractAddress,
      data: contract.methods.withdraw(userAddress).encodeABI(),
      gas: 1,
      gasPrice: _gasPrice,
      gasLimit: _gasLimit,
      nonce: await sepoliaWeb3.eth.getTransactionCount(senderAddress, 'pending'),
    };
    const signedTx = await sepoliaWeb3.eth.accounts.signTransaction(txObject, privateKeyBuffer);
    const receipt = await sepoliaWeb3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('Transaction successful:', receipt.transactionHash);
    console.log(`Check On EtherScan: https://sepolia.etherscan.io/tx/${receipt.transactionHash}`);
	
	console.log(`Deposited Amount: ${userDeposit}, User Reward: ${userReward}`);
	const userWithdraAmount = BigInt(userDeposit) + BigInt(userReward); // Convert to BigInt
	console.log(`Total Amount: ${userWithdraAmount}`);
	const totalAmountToWithdraw = Number(userWithdraAmount / BigInt(10 ** 9)); // Convert to number
	console.log(`Total Amount To Withdraw: ${totalAmountToWithdraw}`);

	if (totalAmountToWithdraw === 0) {
		return res.status(111).json({ error: 'No deposit amount found' });
	  }
	
	const command = `spl-token transfer ${tokenContract} ${totalAmountToWithdraw} ${userAddress}`;
	exec(command, (error, stdout, stderr) => {
		if (error) {
		  console.error('Command execution error:', error);
		  return;
		}
		console.log('Command output (stdout):', stdout);
		console.log('Command output (stderr):', stderr);
	  });
	
	const userDeposit_ = await contract.methods.getUserAmountByNonce(userNonce).call();
	console.log(`Camand Called Succesfully, User Current Deposit Amount:`, userDeposit_);
  } catch (error) {
    console.error('Error withdra tokens:', error);
    console.error('Error stack trace:', error.stack);
    throw error;
  }
}

async function reinvestToken(userAddress) {
  try {
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');

	const userNonce = await contract.methods.getNonceByUser(userAddress).call();
	const userDeposit = await contract.methods.getUserAmountByNonce(userNonce).call();
	const userReward = await contract.methods.getUserReward(userAddress).call();

    const gasPriceBigInt = await sepoliaWeb3.eth.getGasPrice();
    const _gasPrice = gasPriceBigInt.toString();
    console.log('Current gas price:', _gasPrice, 'Wei');

    const estimatedGas = await contract.methods.reInvest(userAddress).estimateGas({
      from: senderAddress,
      value: 0,
    });

    const gasLimit_ = estimatedGas.toString();
    const _gasLimit = Math.ceil(gasLimit_ * 1.2);
    console.log('Required gas limit:', _gasLimit, 'Wei');

    const txObject = {
      from: senderAddress,
      to: contractAddress,
      data: contract.methods.reInvest(userAddress).encodeABI(),
      gas: 1,
      gasPrice: _gasPrice,
      gasLimit: _gasLimit,
      nonce: await sepoliaWeb3.eth.getTransactionCount(senderAddress, 'pending'),
    };
    const signedTx = await sepoliaWeb3.eth.accounts.signTransaction(txObject, privateKeyBuffer);
    const receipt = await sepoliaWeb3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('Transaction successful:', receipt.transactionHash);
    console.log(`Check On EtherScan: https://sepolia.etherscan.io/tx/${receipt.transactionHash}`);
	
	console.log(`Deposited Amount: ${userDeposit}, User Reward: ${userReward}`);
	const userWithdraAmount = BigInt(userDeposit) + BigInt(userReward); // Convert to BigInt
	console.log(`Deposited Amount: ${userDeposit}, User Reward: ${userReward}`);
	const totalAmountToWithdraw = Number(userWithdraAmount / BigInt(10 ** 9)); // Convert to number
	console.log(`Total Amount To reinvest: ${totalAmountToWithdraw}`);
	
	const userDeposit_ = await contract.methods.getUserAmountByNonce(userNonce).call();
	console.log(`Reinvest success, Deposit Amount:`, userDeposit_);
  } catch (error) {
    console.error('Error withdra tokens:', error);
    console.error('Error stack trace:', error.stack);
    throw error;
  }
}

const processDeposit = async (transactionId) => {
	try {
		// Define the request payload
		const requestPayload = {
			jsonrpc: '2.0',
			id: 1,
			method: 'getTransaction',
			params: [
			transactionId,
			'json' // Encoding type
			]
		};

		// Send the POST request to fetch transaction details
		axios.post(rpcEndpoint, requestPayload)
		.then((response) => {
		const transactionDetails = response.data.result;
		const { slot, transaction, meta } = transactionDetails;
		
		// Extract the mint address from the preTokenBalances array
		const mintAddress = meta.preTokenBalances[0].mint;
		// Extract the sender addresses from the transaction message
		const fromAddress = transaction.message.accountKeys[0];
		// Find the recipient account by excluding the sender account
		const toAccount = meta.preTokenBalances.find(
			(balance) => balance.owner !== fromAddress
		);
		const toAddress = toAccount?.owner;
		const blockNumber = slot;

		// Extract pre and post token balances
		const preTokenBalances = meta.preTokenBalances;
		const postTokenBalances = meta.postTokenBalances;

		// Identify the accounts involved in the transfer
		const senderAccount = preTokenBalances.find(
			(balance) => balance.owner === fromAddress
		);

		// Calculate the transferred amount
		const senderPreBalance = senderAccount?.uiTokenAmount?.uiAmount || 0;
		const senderPostBalance = postTokenBalances.find(
			(balance) => balance.owner === senderAccount?.owner
		)?.uiTokenAmount?.uiAmount || 0;

		const amountToDeposit = senderPreBalance - senderPostBalance;
		const transferredAmount = convertToInteger(amountToDeposit);
		console.log('Transferred Amount:', transferredAmount);
		
		if (toAddress !== tokenRecipient) {
			return response.status(400).json({ error: 'Invalid token recipient detected.' });
		}
		if (mintAddress !== tokenContract) {
			return response.status(400).json({ error: 'Invalid token detected.' });
		}
		if (checkDuplicate(transactionId, blockNumber)) {
			return response.status(400).json({ error: 'Duplicate deposit detected.' });
		}
		if (transferredAmount > 0) {
			depositToken(fromAddress, transferredAmount);
		}
		
		// Print the information
		console.log('From Address:', fromAddress);
		console.log('To Address:', toAddress);
		console.log('Mint Address:', mintAddress);
		console.log('Transferred Amount:', transferredAmount);
		console.log('Block Number:', blockNumber);
		})
		.catch((error) => {
		console.error('Error fetching transaction details:', error);
		});
	} catch (error) {
		console.error('Error deposit token:', error);
		res.status(500).json({ error: 'Error deposit token' });
	}
};

const processWithdraw = async (transactionId) => {
	try {
		// Define the request payload
		const requestPayload = {
			jsonrpc: '2.0',
			id: 1,
			method: 'getTransaction',
			params: [
			transactionId,
			'json' // Encoding type
			]
		};

		// Send the POST request to fetch transaction details
		axios.post(rpcEndpoint, requestPayload)
		.then((response) => {
		const transactionDetails = response.data.result;
		const { slot, transaction, meta } = transactionDetails;
		
		// Extract the mint address from the preTokenBalances array
		const mintAddress = meta.preTokenBalances[0].mint;
		// Extract the sender addresses from the transaction message
		const fromAddress = transaction.message.accountKeys[0];
		// Find the recipient account by excluding the sender account
		const toAccount = meta.preTokenBalances.find(
			(balance) => balance.owner !== fromAddress
		);
		const toAddress = toAccount?.owner;
		const blockNumber = slot;

		// Extract pre and post token balances
		const preTokenBalances = meta.preTokenBalances;
		const postTokenBalances = meta.postTokenBalances;

		// Identify the accounts involved in the transfer
		const senderAccount = preTokenBalances.find(
			(balance) => balance.owner === fromAddress
		);

		// Calculate the transferred amount
		const senderPreBalance = senderAccount?.uiTokenAmount?.uiAmount || 0;
		const senderPostBalance = postTokenBalances.find(
			(balance) => balance.owner === senderAccount?.owner
		)?.uiTokenAmount?.uiAmount || 0;

		const amountToDeposit = senderPreBalance - senderPostBalance;
		const transferredAmount = convertToInteger(amountToDeposit);
		
		if (toAddress !== tokenRecipient) {
			return response.status(400).json({ error: 'Invalid token recipient detected.' });
		}
		if (mintAddress !== tokenContract) {
			return response.status(400).json({ error: 'Invalid token detected.' });
		}
		if (transferredAmount === 0) {
			withdrawToken(fromAddress);
		}
		
		// Print the information
		console.log('From Address:', fromAddress);
		console.log('To Address:', toAddress);
		console.log('Mint Address:', mintAddress);
		console.log('Transferred Amount:', transferredAmount);
		console.log('Block Number:', blockNumber);
		})
		.catch((error) => {
		console.error('Error fetching transaction details:', error);
		});
	} catch (error) {
		console.error('Error deposit token:', error);
		res.status(500).json({ error: 'Error deposit token' });
	}
};

const processReInvest = async (transactionId) => {
	try {
		// Define the request payload
		const requestPayload = {
			jsonrpc: '2.0',
			id: 1,
			method: 'getTransaction',
			params: [
			transactionId,
			'json' // Encoding type
			]
		};

		// Send the POST request to fetch transaction details
		axios.post(rpcEndpoint, requestPayload)
		.then((response) => {
		const transactionDetails = response.data.result;
		const { slot, transaction, meta } = transactionDetails;
		
		// Extract the mint address from the preTokenBalances array
		const mintAddress = meta.preTokenBalances[0].mint;
		// Extract the sender addresses from the transaction message
		const fromAddress = transaction.message.accountKeys[0];
		// Find the recipient account by excluding the sender account
		const toAccount = meta.preTokenBalances.find(
			(balance) => balance.owner !== fromAddress
		);
		const toAddress = toAccount?.owner;
		const blockNumber = slot;

		// Extract pre and post token balances
		const preTokenBalances = meta.preTokenBalances;
		const postTokenBalances = meta.postTokenBalances;

		// Identify the accounts involved in the transfer
		const senderAccount = preTokenBalances.find(
			(balance) => balance.owner === fromAddress
		);

		// Calculate the transferred amount
		const senderPreBalance = senderAccount?.uiTokenAmount?.uiAmount || 0;
		const senderPostBalance = postTokenBalances.find(
			(balance) => balance.owner === senderAccount?.owner
		)?.uiTokenAmount?.uiAmount || 0;

		const amountToDeposit = senderPreBalance - senderPostBalance;
		const transferredAmount = amountToDeposit * 10 ** 9;
		
		if (toAddress !== tokenRecipient) {
			return response.status(400).json({ error: 'Invalid token recipient detected.' });
		}
		if (mintAddress !== tokenContract) {
			return response.status(400).json({ error: 'Invalid token detected.' });
		}
		if (transferredAmount === 0) {
			reinvestToken(fromAddress);
		}
		
		// Print the information
		console.log('From Address:', fromAddress);
		console.log('To Address:', toAddress);
		console.log('Mint Address:', mintAddress);
		console.log('Transferred Amount:', transferredAmount);
		console.log('Block Number:', blockNumber);
		})
		.catch((error) => {
		console.error('Error fetching transaction details:', error);
		});
	} catch (error) {
		console.error('Error deposit token:', error);
		res.status(500).json({ error: 'Error deposit token' });
	}
};

app.post('/staketoken', async (req, res) => {
  try {
    const { userTaxId } = req.body;
    console.log('Transection Id:', userTaxId);

    if (!userTaxId) {
      return res.status(400).json({ error: 'Tax ID is required' });
    }

	// Wait for 15 seconds (15000 milliseconds) before proceeding
    await new Promise(resolve => setTimeout(resolve, 15000));
	
	processDeposit(userTaxId);

	res.status(200).json({ message: 'Transaction processed successfully' });
  } catch (error) {
    console.error('Error processing transaction link:', error);
    res.status(500).json({ error: 'Error processing transaction link' });
  }
});

app.get('/get-spl-balance', (req, res) => {
  const { address, tokenAddress } = req.query;

  if (!address || !tokenAddress) {
    return res.status(400).json({ error: 'Address and token address are required' });
  }

  const command = `spl-token balance ${tokenAddress} --owner ${address}`;

  exec(command, (error, stdout, stderr) => {
    console.log('Command output (stdout):', stdout);

    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({ error: 'Error fetching balance' });
    }

    console.log('Command output (stdout):', stdout);
    console.log('Command output (stderr):', stderr);

    const balance = stdout.trim().split(' ')[0];
    res.json({ balance });
  });
});

app.post('/unstaketoken', async (req, res) => {
  try {
    const { userTaxId } = req.body;
    console.log('Transection Id:', userTaxId);

    if (!userTaxId) {
      return res.status(400).json({ error: 'Tax ID is required' });
    }

	// Wait for 15 seconds (15000 milliseconds) before proceeding
    await new Promise(resolve => setTimeout(resolve, 15000));
	
	processWithdraw(userTaxId);

	res.status(200).json({ message: 'Transaction processed successfully' });
  } catch (error) {
    console.error('Error processing transaction link:', error);
    res.status(500).json({ error: 'Error processing transaction link' });
  }
});

app.post('/reinvest', async (req, res) => {
	try {
	  const { userTaxId } = req.body;
	  console.log('Transection Id:', userTaxId);
  
	  if (!userTaxId) {
		return res.status(400).json({ error: 'Tax ID is required' });
	  }
  
	  // Wait for 15 seconds (15000 milliseconds) before proceeding
	  await new Promise(resolve => setTimeout(resolve, 15000));
	  
	  processReInvest(userTaxId);
  
	  res.status(200).json({ message: 'Transaction processed successfully' });
	} catch (error) {
	  console.error('Error processing transaction link:', error);
	  res.status(500).json({ error: 'Error processing transaction link' });
	}
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
