const express = require("express");
const path = require("path");
const app = express();

const Web3 = require('web3');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

address = process.env.ADDRESS;
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL));

const agentABI = JSON.parse(fs.readFileSync('./build/contracts/Agent.json', 'utf8'));
const agentContract = new web3.eth.Contract(agentABI.abi);
let agent;

app.post('/register', async (req, res) => {
    try {
        // deploy agent contract
        const agentDeployOptions = {
            data: agentABI.bytecode,
        };
        agent = await agentContract.deploy(agentDeployOptions).send({
            from: address,
            gas: 4000000,
        });

        res.json({ message: 'register successfully', contractAddress: agent.options.address });
    } catch (error) {
        console.error('Error deploying contract:', error);
        res.status(500).json({ error: 'Error deploying contract' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});