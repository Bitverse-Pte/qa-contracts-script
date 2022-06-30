// This is universal, works with Infura -- set provider accordingly

const ethers = require('ethers')

// const getRevertReason = require('eth-revert-reason')

const web3 = new Map([
    ["r", "https://rinkeby.infura.io/v3/023f2af0f670457d9c4ea9cb524f0810"],
    ["a", "https://rinkeby.arbitrum.io/rpc"],
    ["b", "https://data-seed-prebsc-2-s2.binance.org:8545"],
    ["t", "https://evm-rpc.testnet.teleport.network"],
    ["q", "https://teleport-localvalidator.qa.davionlabs.com/"],
  ]);

async function reason() {
    var args = process.argv.slice(2)

    // console.log(await getRevertReason(args[1], network, blockNumber, provider))

    let url = args[0]
    console.log('WEB3_URL:', web3.get(url))
    let provider = new ethers.providers.JsonRpcProvider(web3.get(url))

    let hash = args[1]
    console.log('tx hash:', hash)

    let tx = await provider.getTransaction(hash)
    if (!tx) {
        console.log('tx not found')
    } else {
        try {
            let code = await provider.call(tx, tx.blockNumber)
            let codeStr = ethers.utils.toUtf8String('0x' + code.substr(138));
            console.log('codeStr:', codeStr);
          } catch (err) {
            const code = err.data.replace('Reverted ','');
            let reason = ethers.utils.toUtf8String('0x' + code.substr(138));
            console.log('revert reason:', reason);
          }
    }
}

reason()