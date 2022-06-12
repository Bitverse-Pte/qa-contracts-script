import "@nomiclabs/hardhat-web3"
import {task, types} from "hardhat/config"

//取环境变量值，如：export ENDPOINT_ADDRESS=0xc6504d78a1da561adbb8d34e2d9f7b2e8b255bc7
const ENDPOINT_ADDRESS = process.env.ENDPOINT_ADDRESS

task("qBlock", "根据blockNumber 查询block")
    .addParam("no", "block number")
    .setAction(async (taskArgs, hre) => {
        let block = await hre.web3.eth.getBlock(taskArgs.no)
        console.log("block timestamp: ", block.timestamp)
    });

task("transferBase", "账号转账配合私钥")
    .setAction(async (taskArgs, hre) => {
        let tx = await hre.web3.eth.sendTransaction({
            // 原qa from:"0x02663206C9FA18eD2D2400A31359E2305961Ca49",
            from: "0xcd0b4e309fb855d644ba64e5fb3dc3dd08f13917",//容器压测用
            to: "0xD6f15EAC1Cb3B4131Ab4899a52E711e19DEeA73f",
            value: "100000000000000000000000",
        })
        console.log(tx)
    });

task("qBalances", "查询余额或者代币余额")
    .addParam("token", "代币地址", "", types.string, true)
    .addParam("wallet", "待查询的钱包地址")
    .setAction(async (taskArgs, hre) => {
        let balances: string

        // 若果是address(0)，则直接查询余额
        if (taskArgs.token === "" ||
            taskArgs.token === "0x0000000000000000000000000000000000000000") {
            balances = await hre.web3.eth.getBalance(taskArgs.wallet)
        } else {
            // 查询代币余额
            const tokenFactory = await hre.ethers.getContractFactory('TestERC20MinterBurnerDecimals')
            const token = await tokenFactory.attach(taskArgs.token)

            balances = (await token.balanceOf(taskArgs.wallet)).toString()
        }

        console.log("balance: ", balances)
        console.log("time: ", (new Date()).valueOf())
    });

task("qAllowance", "查询允许调用的额度")
    .addParam("token", "代币地址")
    .addParam("transfer", "被授权的transfer合约地址,取新的ENDPOINT_ADDRESS合约地址")
    .addParam("wallet", "授权的钱包地址")
    .setAction(async (taskArgs, hre) => {
        const tokenFactory = await hre.ethers.getContractFactory('TestERC20MinterBurnerDecimals')
        const token = await tokenFactory.attach(taskArgs.token)

        let allowances = (await token.allowance(taskArgs.wallet, taskArgs.transfer))
        console.log("allowances: ", allowances)
        console.log("time: ", (new Date()).valueOf())
    });

task("rApprove", "授权调用额度")
    .addParam("token", "代币地址")
    .addParam("transfer", "被授权的transfer合约地址，取新的ENDPOINT_ADDRESS合约地址")
    .addParam("amount", "金额")
    .setAction(async (taskArgs, hre) => {
        const tokenFactory = await hre.ethers.getContractFactory('TestERC20MinterBurnerDecimals')
        const token = await tokenFactory.attach(taskArgs.token)

        let transaction = await token.approve(taskArgs.transfer, taskArgs.amount)

        console.log("approve txHash: ", transaction.hash)
        console.log("time: ", (new Date()).valueOf())
    });


task("rTransfer", "Transfer token")
    .addParam("tokenaddress", "ERC20 contract address")
    .addParam("receiver", "receiver address")
    .addParam("amount", "transfer amount")
    .addParam("dstchain", "dst chain name")
    .addParam("fees", "relay fee")
    .addParam("endpoint", "endpoint 合约地址")
    .setAction(async (taskArgs, hre) => {
        const endpointFactory = await hre.ethers.getContractFactory('contracts/chains/02-evm/core/endpoint/Endpoint.sol:Endpoint')
        const endpoint = await endpointFactory.attach(taskArgs.endpoint)

        let crossChainData = {
            dstChain: taskArgs.dstchain,
            tokenAddress: taskArgs.tokenaddress,
            receiver: taskArgs.receiver,
            amount: taskArgs.amount,
            contractAddress: "0x0000000000000000000000000000000000000000",
            callData: Buffer.from("", "utf-8"),
            callbackAddress: "0x0000000000000000000000000000000000000000",
            feeOption: 0,
        }

        let fee = {
            tokenAddress: taskArgs.tokenaddress,
            amount: taskArgs.fees,
        }

        let baseToken = hre.ethers.utils.parseEther("0")
        if (crossChainData.tokenAddress == "0x0000000000000000000000000000000000000000") {
            baseToken = baseToken.add(hre.ethers.utils.parseEther(crossChainData.amount))
        }

        if (fee.tokenAddress == "0x0000000000000000000000000000000000000000") {
            baseToken = baseToken.add(hre.ethers.utils.parseEther(fee.amount))
        }

        crossChainData.amount = hre.ethers.utils.parseEther(crossChainData.amount)
        console.log(crossChainData.amount)
        if (baseToken.gt(hre.ethers.utils.parseEther("0"))) {
            let res = await endpoint.crossChainCall(
                crossChainData,
                fee,
                {value: baseToken}
            )
            console.log(await res.wait())
        } else {
            let res = await endpoint.crossChainCall(
                crossChainData,
                fee
            )
            console.log(await res.wait())
        }
    })

task("qGasFee", "查询交易使用的gas fee")
    .addParam("hash", "交易hash")
    .setAction(async (taskArgs, hre) => {
        let transaction = await hre.web3.eth.getTransaction(taskArgs.hash)
        // console.log("transaction: ", transaction)

        console.log("txHash: ", transaction.hash)

        if (transaction.blockNumber!) {
            let block = await hre.web3.eth.getBlock(transaction.blockNumber!)
            console.log("block timestamp: ", block.timestamp)
            console.log("blockHash: ", transaction.blockHash)
            console.log("blockNumber: ", transaction.blockNumber)

            let transactionReceipt = await hre.web3.eth.getTransactionReceipt(taskArgs.hash)

            if (transactionReceipt) {
                let fee = transactionReceipt.gasUsed * Number(transaction.gasPrice)

                console.log("transactionReceipt.gasUsed * Number(transaction.gasPrice): \n", fee, fee / 1e18)
                console.log("transactionReceipt.cumulativeGasUsed: \n", transactionReceipt.cumulativeGasUsed)

                console.log(`%transactionReceipt:`, transactionReceipt)
                if (transactionReceipt.status === true) {
                    console.log(`%c源链交易成功！`, "color:green")
                } else {
                    console.log(`%c源链交易异常！`, "color:red")
                }
            }

        } else {
            console.log("不能查询到block Number！")
        }

        console.log("time: ", (new Date()).valueOf())
    });

// 查询relayer fee
task("qPacketFee", "query packet fee")
    .addParam("packet", "packet address")
    .addParam("src", "sourceChain")
    .addParam("dest", "sourceChain")
    .addParam("sequence", "sourceChain")
    .setAction(async (taskArgs, hre) => {
        const packetFactory = await hre.ethers.getContractFactory('contracts/chains/02-evm/core/packet/Packet.sol:Packet')
        const packet = await packetFactory.attach(taskArgs.packet)

        let key = taskArgs.src + "/" + taskArgs.dest + "/" + taskArgs.sequence
        let Fees = await packet.packetFees(Buffer.from(key, "utf-8"))
        console.log(Fees)
    })

// 查询sequences
task("qSequences", "query packet fees")
    .addParam("packet", "packet address")
    .addParam("src", "sourceChain")
    .addParam("dest", "sourceChain")
    .setAction(async (taskArgs, hre) => {
        const packetFactory = await hre.ethers.getContractFactory('contracts/chains/02-evm/core/packet/Packet.sol:Packet')
        const packet = await packetFactory.attach(taskArgs.packet)

        let key = taskArgs.src + "/" + taskArgs.dest
        let sequences = await packet.sequences(Buffer.from(key, "utf-8"))
        console.log(sequences)
    })

// 给packet添加fee
task("rAddPacketFee", "set packet fee")
    .addParam("packet", "packet address")
    .addParam("src", "source chain name")
    .addParam("dest", "destination chain name")
    .addParam("sequence", "sequence")
    .addParam("amount", "amount")
    .setAction(async (taskArgs, hre) => {

        const packetFactory = await hre.ethers.getContractFactory('contracts/chains/02-evm/core/packet/Packet.sol:Packet')
        const packet = await packetFactory.attach(taskArgs.packet)

        let tx = await packet.addPacketFee(
            taskArgs.src,
            taskArgs.dest,
            taskArgs.sequence,
            taskArgs.amount)
        console.log("txHash: ", tx.hash)
        console.log("blockHash: ", tx.blockHash)
    })

task("rSend", "Send Proxy")
    .addParam("proxy", "proxy 合约地址")

    .addParam("token", "源链转账的ERC20 token合约地址")
    .addParam("agent", "teleport的agent合约地址", "0x0000000000000000000000000000000040000001", types.string, true)
    .addParam("amount", "源链需要花费的总金额")

    .addParam("rcctoken", "二跳的token, teleport上对应的token合约地址")
    .addParam("receiver", "收款及refunder的wallet地址")
    .addParam("rccamount", "二跳的转账金额，即实际到账金额")
    .addParam("dest", "目标链名称")
    .addParam("rccrelayerchain", "relay chain name", "", types.string, true)

    // .addParam("refunder", "refunder address")
    // .addParam("destchain", "destChain name")
    .addParam("fee", "需要消耗的fee")

    .addParam("multicall", "multi_call 合约地址")

    // .addParam("relayer_fee_address", "relay fee token address")
    .setAction(async (taskArgs, hre) => {
        const ProxyFactory = await hre.ethers.getContractFactory('Proxy')
        const proxy = await ProxyFactory.attach(taskArgs.proxy)

        let ERC20TransferData = {
            tokenAddress: taskArgs.token,
            receiver: taskArgs.agent,
            amount: taskArgs.amount,
        }

        let rccTransfer = {
            tokenAddress: taskArgs.rcctoken,
            receiver: taskArgs.receiver,
            amount: taskArgs.rccamount,
            destChain: taskArgs.dest,
            relayChain: taskArgs.rccrelayerchain,
        }

        let refunder = taskArgs.receiver
        let destchain = "teleport"
        let multiCallData = await proxy.send(refunder, destchain,
            ERC20TransferData, rccTransfer, taskArgs.fee)
        // console.log("multiCallData: ",multiCallData)

        const multiCallFactory = await hre.ethers.getContractFactory('contracts/chains/02-evm/core/endpoint/Endpoint.sol:Endpoint')
        const multiCall = await multiCallFactory.attach(taskArgs.multicall)

        let res: any
        let relayer_fee_amount = 0
        let relayer_fee_address = taskArgs.token
        if (ERC20TransferData.tokenAddress == "0x0000000000000000000000000000000000000000") {
            console.log("transfer base")

            let fee = {
                tokenAddress: "0x0000000000000000000000000000000000000000",
                amount: relayer_fee_amount,
            }
            res = await multiCall.crossChainCall(multiCallData, fee, {value: taskArgs.amount})
        } else {
            console.log("transfer erc20")

            let fee = {
                tokenAddress: relayer_fee_address,
                amount: relayer_fee_amount,
            }
            res = await multiCall.crossChainCall(multiCallData, fee)

        }
        // console.log(res)
        console.log("tx hash: ", res.hash)
        console.log("time: ", (new Date()).valueOf())
    })

task("qLimits", "查询风险控制")
    .addParam("transfer", "transfer合约地址")
    .addParam("token", "待查询的token合约地址")
    .setAction(async (taskArgs, hre) => {
        const transferFactory = await hre.ethers.getContractFactory('contracts/chains/02-evm/core/endpoint/Endpoint.sol:Endpoint')
        const transfer = await transferFactory.attach(taskArgs.transfer)

        const res = await transfer.limits(taskArgs.token)

        console.log(res)
    })

task("enLimits", "设置风险控制")
    .addParam("transfer", "transfer合约地址")
    .addParam("token", "待设置的token合约地址")
    .addParam("tp", "timePeriod 表示时间窗口的长度 seconds")
    .addParam("tb", "timeBasedLimit 时间窗内总限额")
    .addParam("max", "maxAmount 单比最大金额")
    .addParam("min", "minAmount 单比最小金额")
    .setAction(async (taskArgs, hre) => {
        const transferFactory = await hre.ethers.getContractFactory('contracts/chains/02-evm/core/endpoint/Endpoint.sol:Endpoint')
        const transfer = await transferFactory.attach(taskArgs.transfer)

        const res = await transfer.enableTimeBasedSupplyLimit(
            taskArgs.token,
            taskArgs.tp,
            taskArgs.tb,
            taskArgs.max,
            taskArgs.min,
        )
        console.log(res)
    })

task("unLimits", "取消风险控制")
    .addParam("transfer", "transfer合约地址")
    .addParam("token", "待取消的token合约地址")
    .setAction(async (taskArgs, hre) => {
        const transferFactory = await hre.ethers.getContractFactory('contracts/chains/02-evm/core/endpoint/Endpoint.sol:Endpoint')
        const transfer = await transferFactory.attach(taskArgs.transfer)

        const res = await transfer.disableTimeBasedSupplyLimit(taskArgs.token)

        console.log(res)
    })


task("mToken", "Mint Token")
    .addParam("address", "token address")
    .addParam("to", "reciver")
    .addParam("amount", "token mint amount")
    .setAction(async (taskArgs, hre) => {
        const tokenFactory = await hre.ethers.getContractFactory('TestERC20MinterBurnerDecimals')
        const token = await tokenFactory.attach(taskArgs.address)

        let tx = await token.mint(taskArgs.to, taskArgs.amount)
        console.log(tx)
    });

task("queryBindingsEvm", "query ERC20 token trace")
    .addParam("token", "ERC20 contract address")
    .addParam("endpoint", "endpoint合约地址 ")
    .setAction(async (taskArgs, hre) => {
        const endpointFactory = await hre.ethers.getContractFactory("contracts/chains/02-evm/core/endpoint/Endpoint.sol:Endpoint")
        const endpoint = await endpointFactory.attach(taskArgs.endpoint)

        let res = await endpoint.bindings(taskArgs.token)
        console.log(await res)
    })

task("queryBindingsTp", "query ERC20 token trace")
    .addParam("token", "ERC20 contract address")
    .addParam("endpoint", "endpoint合约地址 ")
    .setAction(async (taskArgs, hre) => {
        const endpointFactory = await hre.ethers.getContractFactory('contracts/chains/01-teleport/core/endpoint/Endpoint.sol:Endpoint')
        const endpoint = await endpointFactory.attach(taskArgs.endpoint)

        let res = await endpoint.bindings(taskArgs.token)
        console.log(await res)
    })

task("getHash","获取交易凭证信息")
    .addParam("hash", "交易hash")
    .setAction(async(taskArgs,hre)=>{
        let transaction = await hre.web3.eth.getTransaction(taskArgs.hash)

        if (transaction.blockNumber!) {
            let transactionReceipt = await hre.web3.eth.getTransactionReceipt(taskArgs.hash)
            let block = await hre.web3.eth.getBlock(transaction.blockNumber!)
            console.log("block timestamp: ", block.timestamp)
            console.log("blockHash: ", transaction.blockHash)
            console.log("blockNumber: ", transaction.blockNumber)
            console.log("status: ", transactionReceipt.status)
            console.log("cumulativeGasUsed: ", transactionReceipt.cumulativeGasUsed)
            console.log("contractAddress: ", transactionReceipt.contractAddress)
            console.log("transactionReceipt: ",transactionReceipt)
        }
    });

module.exports = {}