// Import dependencies
const Ledger = artifacts.require("./contract/Ledger.sol");
const Relationship = artifacts.require("./contract/Relationship.sol");

contract("Ledger", (accounts) => {
    
    let ledgerInstance;
    let relationship1;
    let relationship2;
    let relationship3;

    const patient1 = accounts[0];
    const patient2 = accounts[1];

    const provider1 = accounts[2];
    const provider2 = accounts[3];

    const validator1 = accounts[4];
    const validator2 = accounts[5];

    const contract1 = accounts[6];

    const record1 = '1';
    const record2 = '2';
    const record3 = '3';

    beforeEach(async () => {
        console.log('accounts', accounts);
        relationship1 = await Relationship.new(provider1, record1, { from: patient1 });
        relationship2 = await Relationship.new(provider1, record2, { from: patient1 });
        relationship3 = await Relationship.new(provider2, record3, { from: patient2 });
        ledgerInstance = await Ledger.new();
    });

    it('should add a reference', function () {
        return ledgerInstance.addReference(relationship1.address, { from: patient1 }).then(() => {
            const relationshipHash = web3.utils.keccak256(relationship1.address);
            return ledgerInstance.getRelationship(relationshipHash).then(reference => {
                assert.equal(reference, relationship1.address, "Reference not added correctly");
            });
        });
    });
    
    it('should add a payment', function () {
        return ledgerInstance.addReference(relationship1.address, { from: patient1 }).then(() => {
            const relationshipHash = web3.utils.keccak256(relationship1.address);
            return ledgerInstance.addPayment(validator1, relationshipHash, patient1, { from: contract1 }).then(result => {
                assert.isTrue(result, "First payment not added correctly");
                return ledgerInstance.addPayment(validator2, relationshipHash, validator1, { from: contract1 }).then(result => {
                    assert.isTrue(result, "Transfer payment not added correctly");
                });
            });
            
        });
    });
    
    it('should view a record', function () {
        return ledgerInstance.addReference(relationship1.address, { from: patient1 }).then(() => {
            const relationshipHash = web3.utils.keccak256(relationship1.address);
            return ledgerInstance.addPayment(validator1, relationshipHash, patient1, { from: contract1 }).then(result => {
                assert.isTrue(result, "First payment not added correctly");
                return ledgerInstance.viewRecord(relationshipHash, validator1, { from: validator1 }).then(result => {
                    assert.isTrue(result, "Record not viewed correctly");
                });
            });
        });
    });
    
});
