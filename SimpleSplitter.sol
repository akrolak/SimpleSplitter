pragma solidity ^0.4.2;

contract SimpleSplitter {
    address owner;
    address adAlice;  //initiated as eth.accounts[1] - this typically isn't coinbase, so if you send ether from website it will not be split
    address adBob;    //in order to split do something like this in geth: 
    address adCarol;  //eth.sendTransaction({from: eth.accounts[1], to: "0x3c45260ef6a547d06949feea65ea38e6eee32f54", value: web3.toWei(1, "ether")})  

    function SimpleSplitter(address ada, address adb, address adc) payable {
        owner = msg.sender;
        adAlice = ada;
        adBob = adb;
        adCarol = adc;
    }

    function getBalance() constant returns (uint) {
      return this.balance;
    }

    function getAddress(int no) constant returns (address) {
      if (no == 1) return adAlice;
      if (no == 2) return adBob;
      if (no == 3) return adCarol;
      return address(0);
    }

    /* splits received amount, sends to Bob and Carol, adjusts balances */
    function  split(uint amt) private  {
     uint half1 = amt/2;
     uint half2 = amt - half1;  // half1 = half2 to the precision of rounding
      if(!adBob.send(half1))
          throw;
      if(!adCarol.send(half2))
          throw;
    }

    function killMe() returns (bool) {
        if (msg.sender == owner) {
            suicide(owner);
            return true;
        }
    }

    function () payable {
      if (msg.sender == adAlice) { split(msg.value); }
    }

}
