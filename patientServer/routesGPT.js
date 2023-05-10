const express = require("express");
const router = express.Router();
const Web3 = require('web3');

const fs = require('fs');
const dotenv = require('dotenv');
const { get } = require("http");
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

const relationshipABI = JSON.parse(fs.readFileSync('../build/contracts/Relationship.json', 'utf8'));
const relationshipContract = new web3.eth.Contract(relationshipABI.abi);

let relationship = [];

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

//add record with payment
router.post('/addRecordPay', async (req, res) => {
    try {
        console.log('addRecord');
        const { record, providerAddress, payment } = req.body;
        //send relationship transaction
        const paymentAddress = getRelationshipAddress(payment);
        const paymentAddressHash = web3.utils.keccak256(paymentAddress);
        const relationshipDeployOptions = {
            data: relationshipABI.bytecode,
            arguments: [providerAddress, record, ledgerAddress, paymentAddressHash]
        };
        console.log('relationshipDeployOptions', relationshipDeployOptions.arguments);
        const newRelationship = await relationshipContract.deploy(relationshipDeployOptions).send({
            from: mainAddress,
            gas: 4000000,
        });

        //agent add relationship
        await agent.methods.addRelationship(newRelationship.options.address).send({
            from: mainAddress,
            gas: 4000000,
        });

        records.push(record);
        relationship.push(newRelationship);
        res.json({ message: 'add record successfully',
            relationshipAddress: newRelationship.options.address, });
    } catch (error) {
        console.error('Error adding record:', error);
        res.status(500).json({ error: 'Error adding record' });
    }
});

async function fetchRelationshipData(contractAddress) {
    const relationshipContract = new web3.eth.Contract(relationshipABI.abi, contractAddress);
    const recordId = await relationshipContract.methods.recordId().call();
    const provider = await relationshipContract.methods.provider().call();
  
    return {
      contractAddress,
      recordId,
      provider,
    };
  }

//get records on the chain
router.get('/getRecords', async (req, res) => {
    try {
        const updateRecords=[];
        // get relationship address
        const relationshipsLength = await agent.methods.getNumRelationships().call();
        // console.log('agent menthds:', agent.methods);
        // use each address to get the content of the relationship contract
        for (let i = 0; i < relationshipsLength; i++) {
          const relationaddress = await agent.methods.relationships(i).call();
          const relationData=await fetchRelationshipData(relationaddress);
          updateRecords.push(relationData);
        }
        records = updateRecords;
        // const jsonResults=JSON.stringify(updateRecords);
        res.json({message:'get records from chain successfully:', results: updateRecords});
    } catch (error) {
        console.error('Error getting records:', error);
        res.status(500).json({ error: 'Error getting records' });
    }
});


//add record to ledger reference
router.post('/authorizeRecord', async (req, res) => {
    try {
        console.log('addRecordToLedger');
        const { recordId } = req.body;
        // get relathipship address from record
        let relationshipAddress;
        // for (let i = 0; i < records.length; i++) {
        //     if (records[i].recordId === recordId) {
        //         relationshipAddress = records[i].contractAddress;
        //         break;
        //     }
        // }
        await getOnchainRecords();
        relationshipAddress = getRelationshipAddress(recordId);
        console.log('relationshipAddress', relationshipAddress);
        // ledger add reference
        await ledgerContract.methods.addReference(relationshipAddress).send({
            from: mainAddress,
            gas: 4000000,
        });
        res.json({ message: 'add record to ledger successfully' });
    } catch (error) {
        console.error('Error adding record to ledger:', error);
        res.status(500).json({ error: 'Error adding record to ledger' });
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

// utils
// util function that get relashion address from record id
function getRelationshipAddress(recordId) {
    for (let i = 0; i < records.length; i++) {
        if (records[i].recordId === recordId) {
            return records[i].contractAddress;
        }
    }
}

// util function(async) that get onchain records
async function getOnchainRecords() {
    const updateRecords=[];
    // get relationship address
    const relationshipsLength = await agent.methods.getNumRelationships().call();
    // console.log('agent menthds:', agent.methods);
    // use each address to get the content of the relationship contract
    for (let i = 0; i < relationshipsLength; i++) {
        const relationaddress = await agent.methods.relationships(i).call();
        const relationData=await fetchRelationshipData(relationaddress);
        updateRecords.push(relationData);
    }
    records = updateRecords;
    // const jsonResults=JSON.stringify(updateRecords);
    return true;
}
    

module.exports = router;