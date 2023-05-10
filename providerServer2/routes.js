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

const agentABI = JSON.parse(fs.readFileSync('../build/contracts/Agent.json', 'utf8'));
const agentContract = new web3.eth.Contract(agentABI.abi);
let agent;
let records = [];

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

module.exports = router;