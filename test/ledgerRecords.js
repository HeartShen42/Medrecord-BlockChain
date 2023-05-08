// Import dependencies
const Ledger = artifacts.require("./contract/Ledger.sol");
const Relationship = artifacts.require("./contract/Relationship.sol");

contract("Ledger", (accounts) => {
    
    let relationship1;
    let relationship2;
    let relationship3;
    let ledger;
    
    node1 = "0x1A4B71b48498237d2817be049B4bc43faD971BcA";// signer1
    node2 = "0xf59a61caf69f7216b83f063c2b9b712b82e50e84";
    node3 = "0x6dcccc3ab843cf7973986870fbffe55fca71acbd";
    node4 = "0x8d70e604692151f0c01f075263013f8928c704f4";// signer2
    node5 = "0x0B45C5A0B79974eeEDeC2d7094Ab01F36d278725";// signer3

    const patient1 = node1;

    const provider1 = node2;

    const recordOne = 'one';
    const recordTwo = 'two';

    const zero = 0;

    beforeEach(async () => {
        ledger = await Ledger.new();
        relationship1 = await Relationship.new(provider1, recordOne, ledger.address, 0, { from: patient1 });
        relationship2 = await Relationship.new(provider1, recordTwo, ledger.address, 0, { from: patient1 });    
    });

    it('should add a reference', function () {
        return ledger.addReference(relationship1.address, { from: patient1 }).then(() => {
            const relationshipHash = web3.utils.keccak256(relationship1.address);
            return ledger.getRelationship(relationshipHash).then(reference => {
                assert.equal(reference, relationship1.address, "Reference not added correctly");
            });
        });
    });
    
    // it('should add a payment', function () {
    //     return ledgerInstance.addReference(relationship1.address, { from: patient1 }).then(() => {
    //         const relationshipHash = web3.utils.keccak256(relationship1.address);
    //         return ledgerInstance.addPayment(validator1, relationshipHash, patient1, { from: contract1 }).then(result => {
    //             assert.isTrue(result, "First payment not added correctly");
    //             return ledgerInstance.addPayment(validator2, relationshipHash, validator1, { from: contract1 }).then(result => {
    //                 assert.isTrue(result, "Transfer payment not added correctly");
    //             });
    //         });
            
    //     });
    // });
    
    // it('should view a record', function () {
    //     return ledgerInstance.addReference(relationship1.address, { from: patient1 }).then(() => {
    //         const relationshipHash = web3.utils.keccak256(relationship1.address);
    //         return ledgerInstance.addPayment(validator1, relationshipHash, patient1, { from: contract1 }).then(result => {
    //             assert.isTrue(result, "First payment not added correctly");
    //             return ledgerInstance.viewRecord(relationshipHash, validator1, { from: validator1 }).then(result => {
    //                 assert.isTrue(result, "Record not viewed correctly");
    //             });
    //         });
    //     });
    // });
    
});
