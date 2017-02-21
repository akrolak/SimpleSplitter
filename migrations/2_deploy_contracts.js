module.exports = function(deployer) {
  deployer.deploy(SimpleSplitter, web3.eth.accounts[1], web3.eth.accounts[2], web3.eth.accounts[3]);
};
