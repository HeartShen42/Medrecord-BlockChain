pragma solidity ^0.4.15;

import "./Ledger.sol";
contract Relationship {
    address public patron;
    address public provider; // this is a unique address for the provider used only for this relationship
    string public providerAddr; //encrypted provider address
    string public providerName; //encrypted provider name
    string public recordId; //mapping to the record in the provider's system
    
    address public ledger; //the ledger contract address
    
    mapping(address => bool) isAnonymousViewer;
    
    //mapping(string => address) public AnonymousViewerByName;

    mapping(address => bool) public isViewer;
    mapping(address => string) viewerInfo;


    uint256 constant UINT256_MAX = ~uint256(0);

    modifier isPatron() {
        if(msg.sender != patron) revert();
        _;
    }

    modifier FromLedger() {
        if(msg.sender != ledger) revert();
        _;
    }

    function Relationship(address _provider, string _id, address _ledger, uint256 _paymentId) public {
        patron = msg.sender;
        provider = _provider;
        recordId = _id;
        ledger = _ledger;

        if (_paymentId == 0 ){
        return;
        }

        //pay the validator
        address validator;
        validator = block.coinbase;

        Ledger ledgerContract = Ledger(ledger);
        bool result = ledgerContract.addPayment(validator, _paymentId);
        require(result);
    }   
    // need tx fee

/****These functions should be left commented out until a use case for them arises
  function setPatron(address addr) isPatron {
    patron = addr;
  }
  function setProvider(address addr) isPatron {
    provider = addr;
  }
******************/

function setProviderAddress(string addr) public {
    providerAddr = addr;
}

function setProviderName(string name) public {
  providerName = name;
}

function payValidator(uint256 _paymentId) public isPatron {
    if (_paymentId == 0 ){
        return;
    }

    //pay the validator
    address validator;
    validator = block.coinbase;

    Ledger ledgerContract = Ledger(ledger);
    bool result = ledgerContract.addPayment(validator, _paymentId);
    require(result);
}

// need tx fee
function addAnonymousViewer(address ViewerAddr) public FromLedger {
    require(!isAnonymousViewer[ViewerAddr]);
    isAnonymousViewer[ViewerAddr] = true;
}

function addViewer(string name, address viewer, uint256 _paymentId) public isPatron {
    require(!isViewer[viewer]);

    isViewer[viewer] = true;
    viewerInfo[viewer] = name;

    payValidator(_paymentId);
}
// need tx fee

function removeViewer(address viewer, uint256 _paymentId) public isPatron {
    require(isViewer[viewer]);
    isViewer[viewer] = false;
    delete(viewerInfo[viewer]);

    payValidator(_paymentId);
}
// need tx fee

// Something is wrong with this part only can get value but cannot add value
// function getViewerByName(string name) public constant returns(address) {
//     return viewerByName[name];
// }

function getViewerName(address addr) public constant returns(string) {
    return viewerInfo[addr];
}

function checkViewer(address addr) public constant returns(bool){
    return isViewer[addr];
}

function checkAnonymousViewer(address addr) public constant returns(bool){
    return isAnonymousViewer[addr];
}

function terminate() public {
    if(msg.sender != patron && msg.sender != provider) revert();
    selfdestruct(patron);
}
}
