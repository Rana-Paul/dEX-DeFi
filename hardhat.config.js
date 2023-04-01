require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config()
const privateKeys = process.env.PRIVATE_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    goeril: {
      url: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
      accounts: privateKeys.split(","),

    }
  },
};
