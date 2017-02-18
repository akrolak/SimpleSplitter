pragma solidity ^0.4.2;

contract SimpleSplitter {
    address owner;

    mapping (address => int) private balances;

    address adAlice = 0x9373979f56b0c14eb048338a2405fd5eaf7792f7; 
    address adBob = 0x240a31caf6b70a4eac83aec566fcea0c2f6b4fcb;
    address adCarol = 0x0523125a2d04bdeb3114729ad7b418f41b2d8f69;    

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Payable_f(address indexed _from, address indexed _to, uint256 _value);
    event Debug(address indexed _from, address indexed _to, int256 _value);

    function SimpleSplitter() payable {
        owner = msg.sender;
    }

    function getBalance() returns (uint) {

      Debug(msg.sender, adAlice, int(this.balance));

      return this.balance;
    }

    function getAccountBalance(address ad) returns (int) {

      //Debug(msg.sender, ad, balances[ad]);

      return balances[ad];
    }

    /* splits received amount, sends to Bob and Carol, adjusts balances */
    function  split(uint amt) private returns(bool sufficient)  {
      if (this.balance < amt) return false;
      uint half1 = msg.value/2;
      uint half2 = msg.value - half1;  // half1 = half2 to the precision of rounding
      balances[adBob] += int(half1);
      balances[adCarol] += int(half2);
      if(!adBob.send(half1))
          throw;
      Transfer(msg.sender, adBob, half1);
      if(!adCarol.send(half2))
          throw;
      Transfer(msg.sender, adCarol, half2);
      return true;
    }

    function killMe() returns (bool) {
        if (msg.sender == owner) {
            suicide(owner);
            return true;
        }
    }

    function () payable {
      
      Payable_f(msg.sender, adAlice, msg.value); // informs amount will be split      

      /*if (msg.sender == adAlice) {
        if (!split(msg.value)) {
          Debug(msg.sender, adAlice, this.balance);
        }
      }*/
      
      balances[msg.sender] -= int(msg.value);

    }

}
