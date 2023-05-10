const Web3 = require('web3');

const fs = require('fs');

const address = "0x0B45C5A0B79974eeEDeC2d7094Ab01F36d278725";

const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8506"));

//deploy ledger contract
const ledgerABI = JSON.parse(fs.readFileSync('./build/contracts/Ledger.json', 'utf8'));
const ledgerContract = new web3.eth.Contract(ledgerABI.abi);
let ledger;

const ledgerDeployOptions = {
    data: ledgerABI.bytecode,
};

ledgerContract.deploy(ledgerDeployOptions).send({
    from: address,
    gas: 4000000,
}).then((instance) => {
    ledger = instance;
    console.log("ledger contract address: ", ledger.options.address);
}).catch((err) => {
    console.error('Error deploying ledger contract:', err);
}
);
