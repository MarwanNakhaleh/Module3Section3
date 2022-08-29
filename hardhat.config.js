require("@nomiclabs/hardhat-waffle");
require('solidity-coverage')
require('hardhat-docgen');

require("@nomiclabs/hardhat-web3");

task("accounts", "Prints the list of accounts")
  .setAction(async (_, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
  });

  task("balance", "Prints an account's balance")
  .addParam("account", "The account's address")
  .setAction(async (taskArgs) => {
    const account = web3.utils.toChecksumAddress(taskArgs.account);
    const balance = await web3.eth.getBalance(account);

    console.log(web3.utils.fromWei(balance, "ether"), "ETH");
  });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.4",
  docgen: {
    path: './docs',
    clear: true,
    runOnCompile: true,
  }
};
