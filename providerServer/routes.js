const express = require("express");
const axios = require('axios');
const router = express.Router();
const Web3 = require('web3');

const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const mainAddress = process.env.ADDRESS;
const ledgerAddress = process.env.LEDGER_ADDRESS;
console.log('mainAddress', mainAddress);
console.log('ledgerAddress', ledgerAddress);
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL));

//instance ledger contract from address
const ledgerABI = JSON.parse(fs.readFileSync('../build/contracts/Ledger.json', 'utf8'));
const ledgerContract = new web3.eth.Contract(ledgerABI.abi, ledgerAddress);

const agentABI = JSON.parse(fs.readFileSync('../build/contracts/Agent.json', 'utf8'));
const agentContract = new web3.eth.Contract(agentABI.abi);
let agent;
let records = [];
let anonymousRecords = [];

const relationshipABI = JSON.parse(fs.readFileSync('../build/contracts/Relationship.json', 'utf8'));
const relationshipContract = new web3.eth.Contract(relationshipABI.abi);

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

//add origin record
router.post('/addRecord', async (req, res) => {
    try {
        console.log('addRecord from provider');
        const { record } = req.body;
        //make http request to patron server, and tr
        console.log("providerAddress", mainAddress);
        await axios.post('http://localhost:3001/addRecord', {
            recordId: record,
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

//update relationship
router.post('/addRelationInAgent', async (req, res) => {
    try {
        console.log('addRelationInAgent');
        const { newRelashionship } = req.body;
        await agent.methods.addRelationship(newRelashionship).send({
            from: mainAddress,
            gas: 4000000,
        });
        console.log('add relationship in agent successfully');
        res.json({ message: 'add relationship in agent successfully' });
    } catch (error) {
        console.error('Error adding relationship in agent:', error);
        res.status(500).json({ error: 'Error adding relationship in agent' });
    }
});

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

//get records
router.get('/getRecords', async (req, res) => {
    try {
        const updateRecords=[];
        // get relationship address
        const relationshipsLength = await agent.methods.getNumRelationships().call();
        // use each address to get the content of the relationship contract
        for (let i = 0; i < relationshipsLength; i++) {
          const relationaddress = await agent.methods.relationships(i).call();
          const providerRelationData = await fetchProviderRelationshipData(relationaddress);
          if (providerRelationData) {
            updateRecords.push(providerRelationData);
          }
        }
        res.json({message:'get records from chain successfully:',results: updateRecords});
    } catch (error) {
        console.error('Error getting records:', error);
        res.status(500).json({ error: 'Error getting records' });
    }
});

//get records as viewer
router.get('/getViewRecords', async (req, res) => {
    try {
        const updateRecords=[];
        // get relationship address
        const relationshipsLength = await agent.methods.getNumRelationships().call();
        // use each address to get the content of the relationship contract
        for (let i = 0; i < relationshipsLength; i++) {
          const relationaddress = await agent.methods.relationships(i).call();
          const viewerRelationData = await fetchViewerRelationshipData(relationaddress);
          if (viewerRelationData) {
            updateRecords.push(viewerRelationData);
          }
        }
        res.json({message:'get records from chain successfully:',results: updateRecords});
    } catch (error) {
        console.error('Error getting records:', error);
        res.status(500).json({ error: 'Error getting records' });
    }
});

// get shared records
router.get('/getSharedRecords', async (req, res) => {
    try {
        const sharedRecords = await ledgerContract.methods.getSharedRecordReferences().call({
            from: mainAddress,
        });
        //transfer sharedRecords to big number
        for (let i = 0; i < sharedRecords.length; i++) {
            sharedRecords[i] = web3.utils.toBN(sharedRecords[i]);
        }
        res.json({ message: 'get shared records successfully', sharedRecords: sharedRecords });
    } catch (error) {
        console.error('Error getting shared records:', error);
        res.status(500).json({ error: 'Error getting shared records' });
    }
});

// receive anonymous record
router.post('/receiveAnonymousRecord', async (req, res) => {
    try {
        console.log('receiveAnonymousRecord');
        const { id, record } = req.body;
        //find the record in anonymousRecords using id
        const index = anonymousRecords.findIndex((element) => element.id == id);
        const newRecord = {
            id: id,
            record: record,
        }
        anonymousRecords[index] = newRecord;

        res.json({ message: 'receive anonymous record successfully' });
    } catch (error) {
        console.error('Error receiving anonymous record:', error);
        res.status(500).json({ error: 'Error receiving anonymous record' });
    }
});

// view record
router.post('/viewRecord', async (req, res) => {
    try {
        console.log('viewRecord');
        var { id } = req.body;
        //convert id to big number
        numId = web3.utils.toBN(id);
        console.log('id', numId);
        await ledgerContract.methods.viewRecord(id).send({
            from: mainAddress,
            gas: 4000000,
        });
        const record = { "id": id };
        anonymousRecords.push(record);
        console.log('view record successfully');
        res.json({ message: 'view record successfully'});
    } catch (error) {
        console.error('Error viewing record:', error);
        res.status(500).json({ error: 'Error viewing record' });
    }
});

//utils

async function fetchViewerRelationshipData(contractAddress) {
    const relationshipContract = new web3.eth.Contract(relationshipABI.abi, contractAddress);
    const isViewer = await relationshipContract.methods.checkViewer(mainAddress).call(
        { from: mainAddress }
    );
    console.log('isViewer', isViewer);
    if(isViewer){
        const recordId = await relationshipContract.methods.recordId().call();
        const patron = await relationshipContract.methods.patron().call();
        const provider = await relationshipContract.methods.provider().call();
        return {
            contractAddress,
            recordId,
            patron,
            provider,
          };
    } else {
        return null;
    }
}

async function fetchProviderRelationshipData(contractAddress) {
    const relationshipContract = new web3.eth.Contract(relationshipABI.abi, contractAddress);
    const recordId = await relationshipContract.methods.recordId().call();
    const provider = await relationshipContract.methods.provider().call();
    const patron = await relationshipContract.methods.patron().call();
  
    return {
      contractAddress,
      recordId,
      patron,
      provider,
    };
}

module.exports = router;