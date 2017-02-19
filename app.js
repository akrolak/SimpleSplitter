var accounts;
var alice_account;
var bob_account;
var carol_account;

var adAlice, adBob, adCarol;

// Your deployed address changes every time you deploy.
var ssAddress = "0xb92f743a4406f47062eae4664b70bada7e5c2f68"; // <-- Put your own

function setStatus(message) {
  var status = document.getElementById("status");
  status.innerHTML = message;
};

function refreshBalance() {
 
  var ss = SimpleSplitter.deployed();

  ss.getBalance.call({from: alice_account}).then(function(value) {
    var balance_element = document.getElementById("balance");
    var eth_value = web3.fromWei(value.valueOf(), 'ether');
    balance_element.innerHTML = eth_value;
  }).catch(function(e) {
    console.log(e);
    setStatus("Error getting splitter balance; see log.");
  });

  ss.getAddress.call(1, {from: alice_account}).then(function(value) {
    var alice_element = document.getElementById("alice");
    var alice_value = web3.fromWei(web3.eth.getBalance(value.valueOf()), 'ether');
    alice_element.innerHTML = alice_value;

  }).catch(function(e) {
    console.log(e);
    setStatus("Error getting Alice value");
  });

  ss.getAddress.call(2, {from: alice_account}).then(function(value) {
  var bob_element = document.getElementById("bob");
  var bob_value = web3.fromWei(web3.eth.getBalance(value.valueOf()), 'ether');
  bob_element.innerHTML = bob_value;

  }).catch(function(e) {
    console.log(e);
    setStatus("Error getting Bob value");
  });

  ss.getAddress.call(3, {from: alice_account}).then(function(value) {
  var carol_element = document.getElementById("carol");
  var carol_value = web3.fromWei(web3.eth.getBalance(value.valueOf()), 'ether');
  carol_element.innerHTML = carol_value;

  }).catch(function(e) {
    console.log(e);
    setStatus("Error getting Carol value");
  });


};

function sendCoin() {
  var amount = parseInt(document.getElementById("amount").value);
  var ss = SimpleSplitter.deployed();

  if(amount == 0) {
    setStatus("Invalid amount, please provide natural number");
    return;
  }

  setStatus("Initiating transaction... (please wait)");

  var txn = web3.eth.sendTransaction({ 
      from: web3.eth.coinbase, 
      to: ssAddress,
      value: web3.toWei(amount, "ether") 
  });
  console.log("send txn: " + txn + " amount: " + web3.toWei(amount, "ether"));

  setStatus("Transaction complete!");
  refreshBalance();
};


window.onload = function() {
  web3.eth.getAccounts(function(err, accs) {
    if (err != null) {
      alert("There was an error fetching your accounts.");
      return;
    }

    if (accs.length == 0) {
      alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
      return;
    }

    accounts = accs;
    alice_account = accounts[0];
    bob_account = accounts[1];
    carol_account = accounts[2];

    refreshBalance();
  });
}
