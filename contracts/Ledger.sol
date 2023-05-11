pragma solidity ^0.4.22;

import "./Relationship.sol";

contract Ledger {
    struct reference {
        address relationship;
        mapping(address => bool) payment;// the address of the validaters
    }

    // mapping( => bool) public isReference;
    mapping(uint256 => reference) references; // the references of the payments

    // mapping(address => uint256[]) ownedRecordReferences; // the references of the owned records
    mapping(address => uint256[]) sharedRecordReferences; // records rewarded from others

    address public coinbase;

    function addReference(address _relationship) public {
        // check the reference legality(exist in the sender's relationship)
        // check whether the sender is the patron of the relationship
        require(_relationship != address(0));
        Relationship relationship = Relationship(_relationship);
        require(relationship.patron() == tx.origin);

        //check whether the hash of the relastionship is already in the references
        uint256 _relationshipHash = uint256(keccak256(_relationship));
        require(references[_relationshipHash].relationship == address(0));
        
        // add the reference
        references[_relationshipHash].relationship = _relationship;
    }

    function addPayment(address _validator, uint256 _id) public constant returns (bool) {
        
        // check whether the validator in the references
        require(references[_id].relationship != address(0));
        require(references[_id].payment[_validator] == false);
        
        address payer = tx.origin;

        if(references[_id].payment[payer] == true){
            //pay from shared records
            //remove _id from sharedRecordReferences, and add it to validator's sharedRecordReferences
            removeSharedRecordReference(_id, payer);
            sharedRecordReferences[_validator].push(_id);

            references[_id].payment[payer] = false;
            references[_id].payment[_validator] = true;
            coinbase = _validator;
            return true;
        }
        Relationship relationship = Relationship(references[_id].relationship);
        if(relationship.patron() == payer){
            //pay from owned records
            sharedRecordReferences[_validator].push(_id);

            references[_id].payment[_validator] = true;
            coinbase = _validator;
            return true;
        }
        return false;
    }

    function viewRecord(uint256 _id) public {
        // check whether the validator in the references
        address _viewer = msg.sender;
        require(references[_id].relationship != address(0));
        require(references[_id].payment[_viewer] == true);

        // remove _id from getSharedRecordReferences
        removeSharedRecordReference(_id, _viewer);
        // send transaction to relationship
        address targetAddr = references[_id].relationship;
        Relationship TargetR = Relationship(targetAddr);
        TargetR.addAnonymousViewer(msg.sender);

        references[_id].payment[_viewer] = false;
    }

    function getRelationship(uint256 _id) public constant returns (address) {
        return references[_id].relationship;
    }

    function getCoinbase() public constant returns (address) {
        return coinbase;
    }

    function checkTargetRecordValidator(uint256 _id, address target) returns (bool){
        return references[_id].payment[target];
    }
    
    function getSharedRecordReferences() public constant returns (uint256[]) {
        return sharedRecordReferences[msg.sender];
    }

    function removeSharedRecordReference(uint256 _id, address _owner) public {
        uint256[] sharedRecords = sharedRecordReferences[_owner];
        bool exist = false;
        for(uint256 i = 0; i < sharedRecords.length; i++){
            if(sharedRecords[i] == _id){
                exist = true;
                // remove the reference from ownedRecordReferences
                sharedRecordReferences[_owner][i] = sharedRecordReferences[_owner][sharedRecords.length - 1];
                delete sharedRecordReferences[_owner][sharedRecords.length - 1];
                break;
            }
        }
        require(exist == true);
    }
}