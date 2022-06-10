import { ethers } from "hardhat";

async function main() {
  const erc20 = await ethers.getContractFactory("ERC20MinterBurnerDecimals");
  const greeter = await erc20.deploy("test","te","100000000","address");

  await greeter.deployed();

  console.log("ERC20MinterBurnerDecimals deployed to:", greeter.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
