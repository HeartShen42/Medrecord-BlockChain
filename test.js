const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const abi = [/* Contract ABI goes here */];
const contractAddress = '0xYOUR_CONTRACT_ADDRESS';

const contract = new web3.eth.Contract(abi, contractAddress);

contract.events.MessageStored({}, (error, event) => {
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Event:', event);
    }
})
.on('data', (event) => {
    console.log('Data:', event.returnValues);
})
.on('error', console.error);
