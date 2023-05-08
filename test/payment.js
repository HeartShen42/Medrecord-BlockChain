const Ledger = artifacts.require("./contract/Ledger.sol");
const Relationship = artifacts.require("./contract/Relationship.sol");

contract('Relationship', function (accounts) {
    let relationship;
    let ledger;
    
    node1 = "0x1A4B71b48498237d2817be049B4bc43faD971BcA";
    node2 = "0xf59a61caf69f7216b83f063c2b9b712b82e50e84";
    node3 = "0x6dcccc3ab843cf7973986870fbffe55fca71acbd";
    node4 = "0x8d70e604692151f0c01f075263013f8928c704f4";
    node5 = "0x0B45C5A0B79974eeEDeC2d7094Ab01F36d278725";

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
    
	it('should remove a payment after transform authority', async () => {
		const paymentId = web3.utils.keccak256(relationship.address);
		const validator = await ledger.getCoinbase()
		await ledger.viewRecord(paymentId, validator,{ from: patient1 });
		const authority = ledger.checkTargetRecordValidator(paymentId, validator);
		const anonymous = await relationship.checkAnonymousViewer(validator);
		
		assert.equal(authority, false);
		assert.equal(anonymous, true);
	});
});