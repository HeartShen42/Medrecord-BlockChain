# README

## Backend Setup

### Nodes' states

After set up the clique network and five nodes, we need to setup the backend server for the test nodes. The states of the five nodes is as following:

| Node  | States  | Port | Backend Port | Role      | Address                                      |
| ----- | ------- | ---- | ------------ | --------- | -------------------------------------------- |
| Node1 | Signer  | 8502 | 3000         | Provider  | "0x1A4B71b48498237d2817be049B4bc43faD971BcA" |
| Node2 | Regular | 8503 | 3001         | Patient   | "0xf59a61caf69f7216b83f063c2b9b712b82e50e84" |
| Node3 | Regular | 8507 | 3003         | Provider2 | "0x6dcccc3ab843cf7973986870fbffe55fca71acbd" |
| Node4 | Signer  | 8505 | ---          | ---       | "0x8d70e604692151f0c01f075263013f8928c704f4" |
| Node5 | Signer  | 8506 | ---          | ---       | "0x0B45C5A0B79974eeEDeC2d7094Ab01F36d278725" |

If you set up your own nodes, remember to update the `patientServer/.env, providerServer/.env, providerServer2/.env`

### Npm Package 

Our backend is build based on Express.js and interact with Web3.js.

`npm install express body-parser cors web3 axios dotenv http https-proxy-agent`

### Initialize Backend

First, we need to run the init.js to deploy the Ledger contract:

`node init.js`

The init.js script will deploy the ledger contract and console.log() the address of the ledger contract.

Please update the address in `LEDGER_ADDRESS` in documents:  `patientServer/.env, providerServer/.env, providerServer2/.env`

### Run the backends

1. To run node1/providerServer:

​		`cd providerServer`

​		`npm run dev`

2. To run node2/patientServer:

​		`cd patientServer`

​		`npm run dev`

3. To run node3/providerServer2:

​		`cd providerServer2`

​		`npm run dev`

### Testcase Examples

We provided some test case examples of http request in JSON format. Please import them in testing tools like Postman.

**Now you are all set to interact with the system!**

## Test

### 1. Register

To 
