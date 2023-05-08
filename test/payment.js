const Ledger = artifacts.require("./contract/Ledger.sol");
const Relationship = artifacts.require("./contract/Relationship.sol");

contract('Relationship', function (accounts) {
    let relationship;
    let ledger;
    
    node1 = "0x1A4B71b48498237d2817be049B4bc43faD971BcA";
    node2 = "0xf59a61caf69f7216b83f063c2b9b712b82e50e84";
    node4 = "0x8d70e604692151f0c01f075263013f8928c704f4";

    const patient1 = node1;
    const patient2 = accounts[1];

    const provider1 = node4;
    const provider2 = accounts[3];

    const validator1 = accounts[4];
    const validator2 = accounts[5];

    const contract1 = accounts[6];

    const recordOne = 'one';
    const recordTwo = 'two';

    beforeEach(async () => {
        //create relationship with the ledger's address
        ledger = await Ledger.new();
        relationship = await Relationship.new(provider1, recordOne, ledger.address, { from: patient1 });
        //add references to ledger
        await ledger.addReference(relationship.address, { from: patient1 });
    });

    it('should add a payment when addViewGroup', async () => {
        //test addViewGroup
        const paymentId = web3.utils.keccak256(relationship.address);
        await relationship.addViewerGroup(paymentId, { from: patient1 });
        const coinbase = await ledger.getCoinbase()
        console.log('coinbase', coinbase);
    });


});