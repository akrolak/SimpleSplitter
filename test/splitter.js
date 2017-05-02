web3.eth.getTransactionReceiptMined = function (txnHash, interval) {
    var transactionReceiptAsync;
    interval = interval ? interval : 500;
    transactionReceiptAsync = function(txnHash, resolve, reject) {
        try {
            var receipt = web3.eth.getTransactionReceipt(txnHash);
            if (receipt == null) {
                setTimeout(function () {
                    transactionReceiptAsync(txnHash, resolve, reject);
                }, interval);
            } else {
                resolve(receipt);
            }
        } catch(e) {
            reject(e);
        }
    };

    if (Array.isArray(txnHash)) {
        var promises = [];
        txnHash.forEach(function (oneTxHash) {
            promises.push(web3.eth.getTransactionReceiptMined(oneTxHash, interval));
        });
        return Promise.all(promises);
    } else {
        return new Promise(function (resolve, reject) {
                transactionReceiptAsync(txnHash, resolve, reject);
            });
    }
};

contract('SimpleSplitter', function(accounts) {
  it("should put 0 ether in the splitter account", function() {
    var ss = SimpleSplitter.deployed();
    return ss.getBalance.call().then(function(balance) {
      assert.equal(balance.valueOf(), 0, "0 wasn't in the first account");
    });
  });

  it("should send ether to contract correctly", function() {
    var ss = SimpleSplitter.deployed();

    // Get initial balances of first and second account.
    var account_one = accounts[2]; // let's not use coinbase, neither Alice account
    var account_one_starting_balance = web3.eth.getBalance(account_one); // should be big number
    var ss_starting_balance;
    var account_one_ending_balance;
    var ss_ending_balance;
    var ssAddress;
    var gas;
    var calc, calc2; // big numbers
    var amount = 1;
    var weiAmount = web3.toWei(amount);

    return ss.getBalance.call().then(function(balance) {
      ss_starting_balance = balance; // should be big number
      ssAddress = ss.address;
      return web3.eth.sendTransaction({ 
        from: account_one, 
        to: ssAddress,
        value: web3.toWei(amount, "ether") 
      });
    }).then(function(tx) {
      return web3.eth.getTransactionReceiptMined(tx);
    }).then(function(receipt) {
      gas = receipt.gasUsed; 
      account_one_ending_balance = web3.eth.getBalance(account_one); // should be big number, synchronous call
      return ss.getBalance.call();
    }).then(function(balance) {
      ss_ending_balance = balance; // should be big number
      calc = account_one_starting_balance.sub(weiAmount).sub(gas);
      calc2 = ss_starting_balance.add(weiAmount);

      assert.equal(account_one_ending_balance.toNumber(), calc.toNumber(), "Amount wasn't correctly taken from the sender");
      assert.equal(ss_ending_balance.toNumber(), calc2.toNumber(), "Amount wasn't correctly sent to the receiver");
    });
  });

  it("should split the amount sent from Alice account", function() {
    var ss = SimpleSplitter.deployed();
    var alice_account, bob_account, carol_account; // we need variables to put results of asynchronous calls
    var ss_starting_balance, ss_ending_balance; // splitter balance shouldn't change
    var alice_account_starting_balance, bob_account_starting_balance, carol_account_starting_balance;
    var alice_account_ending_balance, bob_account_ending_balance, carol_account_ending_balance;
    var ssAddress;
    var gas;
    var calc, calc2, calc3; // big numbers

    var amount = 1; // ether
    var weiAmount = web3.toWei(web3.toBigNumber(1), "ether")
    var halfAmount = weiAmount.div(2);

    // Get addresses of alice, bob and carol, asynchronously
    return ss.getAddress(1).then(function(aliceAddress){ // Alice account, this returns a pending promise
      alice_account = aliceAddress;
      return ss.getAddress(2);
    }).then(function(bobAddress){
      bob_account = bobAddress;
      return ss.getAddress(3);
    }).then(function(carolAddress){
      carol_account = carolAddress;
      /* then we collect the initial balances synchronously */
      alice_account_starting_balance = web3.eth.getBalance(alice_account); // should be big number
      bob_account_starting_balance = web3.eth.getBalance(bob_account); // should be big number
      carol_account_starting_balance = web3.eth.getBalance(carol_account); // should be big number
      return ss.getBalance.call();
    }).then(function(balance) {
      ss_starting_balance = balance; // should be big number
      ssAddress = ss.address;
      return web3.eth.sendTransaction({ 
        from: alice_account, 
        to: ssAddress,
        value: web3.toWei(amount, "ether") 
      });
    }).then(function(tx) {
      return web3.eth.getTransactionReceiptMined(tx);
    }).then(function(receipt) {
      gas = receipt.gasUsed; // in wei
      alice_account_ending_balance = web3.eth.getBalance(alice_account); // should be big number
      bob_account_ending_balance = web3.eth.getBalance(bob_account); // should be big number
      carol_account_ending_balance = web3.eth.getBalance(carol_account); // should be big number
      return ss.getBalance.call();
    }).then(function(balance) {
      ss_ending_balance = balance; // should be big number
      calc = alice_account_starting_balance.sub(weiAmount).sub(gas);
      calc2 = bob_account_starting_balance.add(halfAmount);
      calc3 = carol_account_starting_balance.add(weiAmount).sub(halfAmount);

      assert.equal(alice_account_ending_balance.toNumber(), calc.toNumber(), "Amount wasn't correctly taken from Alice");
      assert.equal(bob_account_ending_balance.toNumber(), calc2.toNumber(), "Amount wasn't correctly given to Bob");
      assert.equal(carol_account_ending_balance.toNumber(), calc3.toNumber(), "Amount wasn't correctly given to Carol");
      assert.equal(ss_ending_balance.toNumber(), ss_starting_balance.toNumber(), "Amount wasn't correctly maintained by Splitter");
    });

  });

});
