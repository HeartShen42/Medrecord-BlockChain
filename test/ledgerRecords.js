const truffleConfig = require("../truffle-config");
const web3 = require("web3");
// Import dependencies
const Ledger = artifacts.require("./contract/Ledger.sol");
const Relationship = artifacts.require("./contract/Relationship.sol");

contract("Ledger", (accounts) => {
    
    let relationship1;
    let relationship2;
    let relationship3;
    let ledger;
    let ledgerInstance1;
    let ledgerInstance2;
    
    node1 = "0x1A4B71b48498237d2817be049B4bc43faD971BcA";// signer1
    node2 = "0xf59a61caf69f7216b83f063c2b9b712b82e50e84";
    node3 = "0x6dcccc3ab843cf7973986870fbffe55fca71acbd";
    node4 = "0x8d70e604692151f0c01f075263013f8928c704f4";// signer2
    node5 = "0x0B45C5A0B79974eeEDeC2d7094Ab01F36d278725";// signer3

    const patient1 = node1;

    const provider1 = node3;

    const recordOne = 'one';
    const recordTwo = 'two';

    let web3Network1;
    let web3Network2;


    beforeEach(async () => {
        // Create a new Web3 instance for geth1
        web3Network1 = new web3(
            new web3.providers.HttpProvider(
            `http://${truffleConfig.networks.geth1.host}:${truffleConfig.networks.geth1.port}`
            )
        );
        
        // Create a new Web3 instance for geth2
        web3Network2 = new web3(
            new web3.providers.HttpProvider(
            `http://${truffleConfig.networks.geth2.host}:${truffleConfig.networks.geth2.port}`
            )
        );

        // Deploy Ledger contract from web3Network1
        const ledgerABI = Ledger.abi;
        const ledgerBytecode = Ledger.bytecode;
        
        const ledgerDeployOptions = {
            data: ledgerBytecode,
        };

        const ledgerContract1 = new web3Network1.eth.Contract(ledgerABI);
        ledger = await ledgerContract1.deploy(ledgerDeployOptions).send({
            from: node1,
            gas: 4000000,
        });
        
        // create contract instance for node2 from ledger address
        ledgerInstance1 = new web3Network1.eth.Contract(ledgerABI, ledger.options.address);
        ledgerInstance2 = new web3Network2.eth.Contract(ledgerABI, ledger.options.address);


        const relationshipABI = Relationship.abi;
        const relationshipBytecode = Relationship.bytecode;
        
        const deployOptions = {
            data: relationshipBytecode,
            arguments: [provider1, recordOne, ledger.options.address, 0],
        };
        
        // Deploy Relationship contract from web3Network1
        const relationship1Contract = new web3Network1.eth.Contract(relationshipABI);
        relationship1 = await relationship1Contract.deploy(deployOptions).send({
            from: node1,
            gas: 4000000,
        });
        // Deploy Relationship contract from web3Network2
        const relationship2Contract = new web3Network2.eth.Contract(relationshipABI);
        relationship2 = await relationship2Contract.deploy(deployOptions).send({
            from: node2,
            gas: 4000000,
        });  
    });

    // it('should add references from different nodes', async function () {
    //     // Call addReference from node2
    //     await ledgerInstance2.methods.addReference(relationship2.options.address).send({ from: node2 });

    //     // Call addReference from node1
    //     await ledgerInstance1.methods.addReference(relationship1.options.address).send({ from: node1 });

    //     // Check if the reference was added correctly from node1
    //     const relationshipHash1 = web3.utils.keccak256(relationship1.options.address);
    //     const reference1 = await ledgerInstance1.methods.getRelationship(relationshipHash1).call();

    //     // Check if the reference was added correctly from node2
    //     const relationshipHash2 = web3.utils.keccak256(relationship2.options.address);
    //     const reference2 = await ledgerInstance2.methods.getRelationship(relationshipHash2).call();
        
    //     assert.equal(reference1, relationship1.options.address, "Reference not added correctly for node1");
    //     assert.equal(reference2, relationship2.options.address, "Reference not added correctly for node2");
    //     console.log("relatioinship2: ", relationship2.options.address);
    //     const reference2from1 = await ledgerInstance1.methods.getRelationship(relationshipHash2).call();
    //     console.log("reference2from1: ", reference2from1);
    // });

    it('should pay records to validator', async function () {
        console.log("ledger address: ", ledger.options.address);       
        console.log("relationship1 address: ", relationship1.options.address);
        // add references from node1
        await ledgerInstance1.methods.addReference(relationship1.options.address).send({ from: node1 });
        console.log("addReference success");

        // call addViewerGroup from node1 relationship
        const relationshipHash1 = web3.utils.keccak256(relationship1.options.address);
        //await relationship1.methods.addViewerGroup(relationshipHash1).send({ from: node1 });
        //const base = await relationship1.methods.getBase().call({ from: node1 });
        await relationship1.methods.getCoinbase(relationshipHash1).call({ from: node1 });
        // await relationship1.methods.addViewerGroup(relationshipHash1).send({ from: node1 });
        // ledger.getCoinbase from node1
        const coinbase1 = await ledgerInstance1.methods.getCoinbase().call({ from: node1 });
        console.log("coinbase1: ", coinbase1);
        const targetRecordValidator = await ledgerInstance1.methods.checkTargetRecordValidator(relationshipHash1, coinbase1).call({ from: node1 });
        console.log("targetRecordValidator: ", targetRecordValidator);
        console.log("type of tartgetRecordValidator: ", typeof(targetRecordValidator));
        assert(targetRecordValidator);

        
    });
    
    
});
