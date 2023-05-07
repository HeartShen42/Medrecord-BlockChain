pragma solidity ^0.4.15;

import "./Relationship.sol";

contract Ledger {
    struct reference {
        address relationship;
        mapping(address => bool) payment;// the address of the validaters
    }

    // mapping( => bool) public isReference;
    mapping(uint256 => reference) references; // the references of the payments

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

    function addPayment(address _validator, uint256 _id, address _payer) public constant returns (bool) {
        // check whether the validator in the references
        require(references[_id].relationship != address(0));
        require(references[_id].payment[_validator] == false);
        if(references[_id].payment[_payer] == true){
            references[_id].payment[_payer] = false;
            references[_id].payment[_validator] = true;
            return true;
        }
        Relationship relationship = Relationship(references[_id].relationship);
        if(relationship.patron() == _payer){
            references[_id].payment[_validator] = true;
            return true;
        }
        return false;
    }

    function viewRecord(uint256 _id, address _viewer) public constant returns (bool) {
        // check whether the validator in the references
        require(references[_id].relationship != address(0));
        require(references[_id].payment[_viewer] == true);
        //to-do: send transaction to relationship

        references[_id].payment[_viewer] = false;
        return true;
    }

    function getRelationship(uint256 _id) public constant returns (address) {
        return references[_id].relationship;
    }
}