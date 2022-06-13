import { expect } from "chai";
import { ethers } from "hardhat";
// @ts-ignore
import { Greeter__factory } from "../typechain";

describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, world!");
    await greeter.deployed();

    expect(await greeter.greet()).to.equal("Hello, world!");

    const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });

  it("demo1 test1", async function () {
       const signers=await ethers.getSigners();
       const greeter=await new Greeter__factory(signers[0]).deploy("Hello, world!"    );
       expect(await greeter.greet()).to.equal("Hello, world!");
       const setGreetingTx=await greeter.setGreeting("Hola, mundo!");
       // wait until the transaction is mined
       await setGreetingTx.wait();
       expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});
