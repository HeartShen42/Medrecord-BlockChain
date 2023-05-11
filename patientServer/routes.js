const express = require("express");
const router = express.Router();
const Web3 = require('web3');
const axios = require('axios');

// config proxy agent(running on http://localhost:8000)
const { HttpsProxyAgent } = require('https-proxy-agent');
const proxyAgent = new HttpsProxyAgent('http://localhost:8000');

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

//add record
router.post('/addRecord', async (req, res) => {
    try {
        console.log('addRecord');
        const { recordId, providerAddress, info } = req.body;
        //send relationship transaction
        const relationshipDeployOptions = {
            data: relationshipABI.bytecode,
            arguments: [providerAddress, recordId, ledgerAddress, 0]
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
        const record = {
            "contractAddress": newRelationship.options.address,
            "recordId": recordId,
            "patron": mainAddress,
            "provider": providerAddress,
            "info": info,
        };
        records.push(record);
        relationship.push(newRelationship);
        res.json({ message: 'add record successfully',
            relationshipAddress: newRelationship.options.address, });
    } catch (error) {
        console.error('Error adding record:', error);
        res.status(500).json({ error: 'Error adding record' });
    }
});

//receive add record request, add record to unprocessed record list
router.post('/addRecordRequest', async (req, res) => {
    try {
        console.log('addRecordRequest');
        const { record, providerAddress } = req.body;
        //update unprocessed record list
        unprossedRecords.push({record, providerAddress});
        res.json({ message: 'add record request successfully' });
    } catch (error) {
        console.error('Error adding record request:', error);
        res.status(500).json({ error: 'Error adding record request' });
    }
});

//add record with payment
router.post('/addRecordPay', async (req, res) => {
    try {
        console.log('addRecord');
        const { record, providerAddress, payment, providerUrl } = req.body;
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

        //send the new relationship address to provider(providerUrl/addRelationship)
        await axios.post(providerUrl + '/addRelationInAgent', {
            newRelashionship: newRelationship.options.address,
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

router.post('/addViewer',async(req,res)=>{
    try{
        const{name, viewerAddr, viewRecordID, payRecordID, providerUrl} = req.body;
        //ViewerAddress
        const relationshipViewerAddress = getRelationshipAddress(viewRecordID);
        //Pay record Address
        const relationshipPayAddress = getRelationshipAddress(payRecordID);
        const relationshipContract = await new web3.eth.Contract(relationshipABI.abi, relationshipViewerAddress);
        const relationshipHash=web3.utils.keccak256(relationshipPayAddress);
        //add Viewer
        await relationshipContract.methods.addViewer(name, viewerAddr, relationshipHash).send({
            from: mainAddress,
            gas: 4000000,
        });
        console.log('addViewer successfully, sending req to viewer');
        //add new relationship address to Viewer agent.relationships
        await axios.post(providerUrl + '/addRelationInAgent', {
            newRelashionship: relationshipViewerAddress,
        });
        res.json({ message: 'add viewer successfully', relationshipAddress: relationshipViewerAddress });
    }catch(error){
        console.error('Error adding viewer:', error);
        res.status(500).json({ error: 'Error adding viewer' });
    }
        
});

//sent anonymous record to validator
router.post('/sendAnonymousRecord', async (req, res) => {
    try {
        console.log('sendAnonymousRecord');

        const { recordId, validatorUrl } = req.body;
        //get record from recordId
        let record;
        for (let i = 0; i < records.length; i++) {
            if (records[i].recordId === recordId) {
                record = records[i];
                break;
            }
        }

        //send http request to the validator
        const response = await axios.post(validatorUrl + '/addAnonymousRecord', {
            record: record,
        }, {
            httpsAgent: proxyAgent
        });
        console.log('response', response);
        res.json({ message: 'send anonymous record successfully' });
    } catch (error) {
        console.error('Error sending anonymous record:', error);
        res.status(500).json({ error: 'Error sending anonymous record' });
    }
});

//test proxy server
router.get('/testProxy', async (req, res) => {
    try {
        console.log('testProxy');
        const response = await axios.get('http://localhost:3000/register', {
            httpsAgent: proxyAgent
        });
        // const response = await axios.post('http://localhost:3000/register');
        console.log('response', response);
        res.json({ message: 'test proxy successfully' });
    }
    catch (error) {
        console.error('Error testing proxy:', error);
        res.status(500).json({ error: 'Error testing proxy' });
    }
});

//get local records
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