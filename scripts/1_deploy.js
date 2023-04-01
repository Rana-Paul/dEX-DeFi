
const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
    // Fetch contract to deploy
    const Token = await ethers.getContractFactory("Token");
    const Exchange = await ethers.getContractFactory("Exchange");

    const account = await ethers.getSigners();


    const dapp = await Token.deploy('Dapp', 'DAPP', '1000000');
    await dapp.deployed();
    console.log(" DAPP Token Address : " + dapp.address);

    const mETH = await Token.deploy('mETH', 'mETH', '1000000');
    await mETH.deployed();
    console.log("mETH Token Address : " + mETH.address);

    const mDAI = await Token.deploy('mDAI', 'mDAI', '1000000');
    await mDAI.deployed();
    console.log("mDAI Token Address : " + mDAI.address);

    const exchange = await Exchange.deploy(account[1].address, 10);
    await exchange.deployed();
    console.log("Exchange Address : " + exchange.address);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
