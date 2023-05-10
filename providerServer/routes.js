const express = require("express");
const axios = require('axios');
const router = express.Router();
const Web3 = require('web3');

const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const mainAddress = process.env.ADDRESS;
const ledgerAddress = process.env.LEDGER_ADDRESS;
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL));

const agentABI = JSON.parse(fs.readFileSync('../build/contracts/Agent.json', 'utf8'));
const agentContract = new web3.eth.Contract(agentABI.abi);
let agent;
let records = [];


router.post('/register', async (req, res) => {
    try {
        console.log('register');
        // deploy agent contract
        const agentDeployOptions = {
            data: agentABI.bytecode,
        };
        agent = await agentContract.deploy(agentDeployOptions).send({
            from: mainAddress,
            gas: 4000000,
        });

        res.json({ message: 'register successfully', contractAddress: agent.options.address });
    } catch (error) {
        console.error('Error deploying contract:', error);
        res.status(500).json({ error: 'Error deploying contract' });
    }
});

//add record
router.post('/addRecord', async (req, res) => {
    try {
        console.log('addRecord from provider');
        const { record } = req.body;
        //make http request to patron server, and tr
        console.log("providerAddress", mainAddress);
        await axios.post('http://localhost:3001/addRecord', {
            record: record,
            providerAddress: mainAddress,
        }).then((response) => {
            console.log(response.data);
            var newRelashionship = response.data.relationshipAddress;
            // agent add relationship
            agent.methods.addRelationship(newRelashionship).send({
                from: mainAddress,
                gas: 4000000,
            });
            records.push(record);
        });
        res.json({ message: 'add record successfully' });
    } catch (error) {
        console.error('Error adding record:', error);
        res.status(500).json({ error: 'Error adding record' });
    }
});



// //add record
// router.post('/addRecord', async (req, res) => {
//     try {
//         console.log('addRecord');
//         const { record } = req.body;
//         records.push(record);
//         res.json({ message: 'add record successfully' });
//     } catch (error) {
//         console.error('Error adding record:', error);
//         res.status(500).json({ error: 'Error adding record' });
//     }
// });

//get records
router.get('/getLocalRecords', async (req, res) => {
    try {
        console.log('getRecords');
        res.json({ message: 'get records successfully', records: records });
    } catch (error) {
        console.error('Error getting records:', error);
        res.status(500).json({ error: 'Error getting records' });
    }
});

module.exports = router;