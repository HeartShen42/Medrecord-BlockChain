

# README

This tutorial is using Mac OS.(The majority of the command are same for Ubuntu 18.04 and MAC OS, Difference will be mentioned)



## 1. Setup Geth and Truffle.

### 1.1 Install Geth

**Ubuntu 18.04 Version:**

The following command enables the launchpad repository:

```
sudo add-apt-repository -y ppa:ethereum/ethereum
```

Then, to install the stable version of go-ethereum:

```
sudo apt-get update
sudo apt-get install Ethereum
```

After run the above command, can use `geth version` to check whether it is successfully installed.

**MAC OS Version:**

The easiest way to install go-ethereum is to use the Geth Homebrew tap. The first step is to check that Homebrew is installed. The following command should return a version number.

```
brew -v
```

If a version number is returned, then Homebrew is installed. With Homebrew installed, the following commands add the Geth tap and install Geth:

```
brew tap ethereum/ethereum
brew install ethereum
```

Same, can use `geth version` to check whether it is successfully installed.

### 1.2 Install Truffle

#### 1.2.1 Install nvm

At first, we need to install nvm, run command:

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash
chmod +x ~/.nvm/nvm.sh
```

Then, Ubuntu and Mac OS have slightly difference:

**Ubuntu 18.04 Version:**

If you are using ubuntu system, you just need to run the following command `source ~/.bashrc`

**MAC OS Version:**

If you are using MAC OS, you need to add the following to the `~/.bash_profile` file:

```
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

Then run `source ~/.bash_profile`.
After install nvm, can use `nvm -v` to check whether it is successfully installed.

#### 1.2.2 Install npm and node.js

After install nvm, we can run the following command to install node.js and npm:

```
nvm install 16
```

Then, can use `npm -v` and `node -v` to check whether it is successfully installed.

#### 1.2.3 Install Truffle

Then we can use npm to install truffle.( Avoid using the sudo command when installing Truffle, this can cause permission errors.)

```
npm install -g truffle
```

Run `truffle version` to check successfully installed.

## 2. Setup Clique PoA Blockchain

### 2.1 Launching the Bootnode

We've basically configured the blockchain, so just head over to github and download it. The link is <https://github.com/HeartShen42/Medrecord-BlockChain>. 

After download the file, unzip this file. Use your terminal to cd into the  directory folder. We will assume you are in `Medrecord-BlockChain` for the instructions below.

While in the directory `Medrecord-BlockChain`, please type (or copy paste) the following command and press enter:

```
bash ./bootnode/bootnode-start-local.sh
```

This terminal window is now our window into the networking elements of our PoA blockchain. **The `geth` client will attempt to find other nodes via this bootnode** (as described [here](https://github.com/ethereum/go-ethereum/wiki/Connecting-to-the-network)). We have asked it to provide all the information it receives and gives so we can watch the nodes come online and discover each other.

### 2.2 Launching node1-5

Open a new terminal window and open 5 new terminal tab, each tab represent a node, cd to thos node subfolder. Then run the following command:
**Node 1:**

```
geth --datadir ./ --syncmode 'full' --port 30311 --http --http.addr '0.0.0.0' --http.corsdomain "*" --http.port 8502 --http.api 'personal,db,eth,net,web3,txpool,miner' --bootnodes 'enode://ea2cab82d19b0704299ff837c9e10ee90841d24503e2f6d993fafbf351d9b6a1860cb6f20eee0f35412c4c28ca68c0720f623792f24abdf2ad0d386598a5b4e2@127.0.0.1:30310' --networkid 1515 --allow-insecure-unlock -unlock 1a4b71b48498237d2817be049b4bc43fad971bca --password password.txt --mine --miner.etherbase 1a4b71b48498237d2817be049b4bc43fad971bca
```

**Node 2:**

```
geth --datadir ./ --syncmode 'full' --port 30312 --http --http.addr '0.0.0.0' --http.corsdomain "*" --http.port 8503 --http.api 'personal,db,eth,net,web3,txpool,miner' --authrpc.port 8552 --bootnodes 'enode://ea2cab82d19b0704299ff837c9e10ee90841d24503e2f6d993fafbf351d9b6a1860cb6f20eee0f35412c4c28ca68c0720f623792f24abdf2ad0d386598a5b4e2@127.0.0.1:30310' --networkid 1515 --allow-insecure-unlock -unlock f59a61caf69f7216b83f063c2b9b712b82e50e84 --password password.txt
```

**Node 3:**

```
geth --datadir ./ --syncmode 'full' --port 30313 --http --http.addr '0.0.0.0' --http.corsdomain "*" --http.port 8507 --http.api 'personal,db,eth,net,web3,txpool,miner' --authrpc.port 8553 --bootnodes 'enode://ea2cab82d19b0704299ff837c9e10ee90841d24503e2f6d993fafbf351d9b6a1860cb6f20eee0f35412c4c28ca68c0720f623792f24abdf2ad0d386598a5b4e2@127.0.0.1:30310' --networkid 1515 --allow-insecure-unlock -unlock 6dcccc3ab843cf7973986870fbffe55fca71acbd --password password.txt
```

**Node 4:**

```
geth --datadir ./ --syncmode 'full' --port 30314 --http --http.addr '0.0.0.0' --http.corsdomain "*" --http.port 8505 --http.api 'personal,db,eth,net,web3,txpool,miner' --authrpc.port 8554 --bootnodes 'enode://ea2cab82d19b0704299ff837c9e10ee90841d24503e2f6d993fafbf351d9b6a1860cb6f20eee0f35412c4c28ca68c0720f623792f24abdf2ad0d386598a5b4e2@127.0.0.1:30310' --networkid 1515 --allow-insecure-unlock -unlock 8d70E604692151f0C01F075263013f8928c704f4 --password password.txt --mine --miner.etherbase 8d70E604692151f0C01F075263013f8928c704f4
```

**Node 5:**

```
geth --datadir ./ --syncmode 'full' --port 30315 --http --http.addr '0.0.0.0' --http.corsdomain "*" --http.port 8506 --http.api 'personal,db,eth,net,web3,txpool,miner' --authrpc.port 8555 --bootnodes 'enode://ea2cab82d19b0704299ff837c9e10ee90841d24503e2f6d993fafbf351d9b6a1860cb6f20eee0f35412c4c28ca68c0720f623792f24abdf2ad0d386598a5b4e2@127.0.0.1:30310' --networkid 1515 --allow-insecure-unlock -unlock 0B45C5A0B79974eeEDeC2d7094Ab01F36d278725 --password password.txt --mine --miner.etherbase 0B45C5A0B79974eeEDeC2d7094Ab01F36d278725
```

Then the setup of our blockchain is completed, we can know continue to the next step.

## 3. Backend Setup

### 3.1 Nodes' states

After set up the clique network and five nodes, we need to setup the backend server for the test nodes. The states of the five nodes is as following:

| Node  | States  | Port | Backend Port | Role      | Address                                      |
| ----- | ------- | ---- | ------------ | --------- | -------------------------------------------- |
| Node1 | Signer  | 8502 | 3000         | Provider  | "0x1A4B71b48498237d2817be049B4bc43faD971BcA" |
| Node2 | Regular | 8503 | 3001         | Patient   | "0xf59a61caf69f7216b83f063c2b9b712b82e50e84" |
| Node3 | Regular | 8507 | 3003         | Provider2 | "0x6dcccc3ab843cf7973986870fbffe55fca71acbd" |
| Node4 | Signer  | 8505 | ---          | ---       | "0x8d70e604692151f0c01f075263013f8928c704f4" |
| Node5 | Signer  | 8506 | ---          | ---       | "0x0B45C5A0B79974eeEDeC2d7094Ab01F36d278725" |

If you set up your own nodes, remember to update the `patientServer/.env, providerServer/.env, providerServer2/.env`

### 3.2 Npm Package 

Our backend is build based on Express.js and interact with Web3.js.

`npm install express body-parser cors web3 axios dotenv http https-proxy-agent`

### 3.3 Initialize Backend

First, we need to run the init.js to deploy the Ledger contract:

`node init.js`

The init.js script will deploy the ledger contract and console.log() the address of the ledger contract.

Please update the address in `LEDGER_ADDRESS` in documents:  `patientServer/.env, providerServer/.env, providerServer2/.env`

### 3.4 Run the backends

1. To run node1/providerServer:

​		`cd providerServer`

​		`npm run dev`

2. To run node2/patientServer:

​		`cd patientServer`

​		`npm run dev`

3. To run node3/providerServer2:

​		`cd providerServer2`

​		`npm run dev`

### 3.5 Testcase Examples

We provided some test case examples of http request in JSON format. Please import them in testing tools like Postman.

**Now you are all set to interact with the system!**

## 4. Test

### 4.1 Register node

To register node to the Clique blockchain, the node need to deploy its own agent contract. Please send request to each node: `Post URL/register`

### 4.2 Add Initial Records

To test the record sharing incentive mechanism, the patient node need to add some initial records without payment to get started. So we leave an api in provider nodes allow patient node add payment for future payment: 

`POST ProviderURL/addRecord` 

After add those records, remember to authorize the record for anonymous sharing to validator, so we could ues them for future testing: 

`GET PatientURL/authorizeRecord`

### 4.3 Add Records

To add new records, the provider should send the new record to patient. If the patient accept the record, they should confirm by deplying a relationship contract and updating other information on chain (eg: agent). During this process the relationship smart contract will automatically get the signer's address by block.coinbase, and add the signer to payment in ledger.  After the confirmation, the patient will inform the provider by http request. Then, the provider will update their angent contract and local storage.

To add records:

`POST patientURL/addRecordPay`  Please check arguments details in "add record with payment for patient" in postman collection.

Patient can chose whether authorize the record for anonymous research sharing. If so, authorize the record:

`GET PatientURL/authorizeRecord`

### 4.4 Check On-Chain Records

Patient:

`Get PatientURL/getRecords` 

Provider:

`Get ProviderURL/getRecords`  Get all records references. 

`Get ProviderURL/getViewRecords` Get viewership records references.

### 4.5 Add Viewer

Patient can add other providers as viewers of existing records:

`Post patientURL/addViewer` Please check arguments details in postman collection "add view".

### 4.6 Validator Check Earned Records

Validator can check the records it earned by validate blocks:

`Get ProviderURL/getSharedRecords` 

It will respose with hashed relationship address as records ID.

### 4.7 View Earned Records

The validator can claim to redeem the earned records to view. Than their identity for the record in the ledger contract will transfer from payment to anonymous Viewer.

`Post providerURL/viewRecord`  Please check arguments details in postman collection "view record".

