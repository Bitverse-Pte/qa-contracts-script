import "@nomiclabs/hardhat-waffle"
import "@openzeppelin/hardhat-upgrades"
import "@openzeppelin/hardhat-defender"
import "@nomiclabs/hardhat-ethers"
import "@typechain/hardhat"
import "hardhat-gas-reporter"
import "hardhat-contract-sizer"
import "hardhat-abi-exporter"
import "./tasks/dev/Libraries"
import "./tasks/dev/TssClient"
import "./tasks/dev/TendermintClient"
import "./tasks/dev/Packet"
import "./tasks/dev/Endpoint"
import "./tasks/dev/AccessManager"
import "./tasks/dev/TestPayable"
import "./tasks/dev/Endpoint"
import "./tasks/dev/DeployAll"
import "./tasks/dev/TestContracts"
import "./tasks/dev/ERC20"
import "./tasks/dev/Execute"
import "./tasks/qa/test"

module.exports = {
  defaultNetwork: 'hardhat',
  defender: {
    apiKey: "[apiKey]",
    apiSecret: "[apiSecret]",
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    localhost: {
      url: 'http://localhost:8545',
      gasPrice: 200000000000000,
      chainId: 1337,
      gas: 4100000000000,
      accounts:['0xcc9378057437044391bdca1e658a6b0e27beee26b6913bd50f828c5f42bce96e']
    },
    qaNew: {
      url: 'http://10.41.20.51:8545',
      gasPrice: 5000000000,
      chainId: 7001,
      gas: 4100000,
      accounts:['7eefd641410560e690736ee331bd32512c9b58419a877eff2189facbef33cd1e']
    },
    arbitrum: {
      url: 'https://rinkeby.arbitrum.io/rpc',
      gasPrice: 200000000,
      chainId: 421611,
      gas: 5000000,
      // accounts:['96e8e32341ce890aff8b46066f7b77a6d2ab2115a24c365e9de1fbed49e04837']
      accounts:['24ad33fb88a6c2347ec90178c881969e59571c6ad8cc0f597e7c7d87354df3f8']
    },
    // teleport: {
    //   url: 'https://dataseed.testnet.teleport.network',
    //   gasPrice: 5000000000,
    //   chainId: 8001,
    //   gas: 5000000,
    //   //accounts:['7eefd641410560e690736ee331bd32512c9b58419a877eff2189facbef33cd1e']
    //   accounts:['8f14df1da1a318bec99800b72c5031e4fdc4ec017f00ab9659339ecb0193120e']
    // },
    teleport: {
        url: 'https://teleport-localvalidator.qa.davionlabs.com/',
        gasPrice: 5000000000,
        chainId: 7001,
        gas: 4100000,
        accounts:['24ad33fb88a6c2347ec90178c881969e59571c6ad8cc0f597e7c7d87354df3f8']
        //usdt
        //accounts:['96e8e32341ce890aff8b46066f7b77a6d2ab2115a24c365e9de1fbed49e04837']
        //qa 发钱test net admin私钥
        //accounts:['2307796387358a2a99fbbb88312dc6516ed7ab02bd8f04cc44019e4818560157']
    },
    rinkeby: {
      url: 'https://rinkeby.infura.io/v3/023f2af0f670457d9c4ea9cb524f0810',
      gasPrice: 1500000000,
      chainId: 4,
      gas: 5000000,
      // accounts:['24ad33fb88a6c2347ec90178c881969e59571c6ad8cc0f597e7c7d87354df3f8']
      accounts:['8f14df1da1a318bec99800b72c5031e4fdc4ec017f00ab9659339ecb0193120e']
    },
    bsctest: {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      gasPrice: 10000000000,
      chainId: 97,
      gas: 5000000,
      // accounts:['96e8e32341ce890aff8b46066f7b77a6d2ab2115a24c365e9de1fbed49e04837']
      accounts:['24ad33fb88a6c2347ec90178c881969e59571c6ad8cc0f597e7c7d87354df3f8']
    },
  },
  solidity: {
    version: '0.8.9',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    }
  },
  gasReporter: {
    enabled: true,
    showMethodSig: true,
    maxMethodDiff: 10,
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  abiExporter: {
    path: './abi',
    clear: true,
    spacing: 4,
  }
}