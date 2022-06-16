### 初始化流程
``` 
1,initDatas.py初始化脚本，更新研发合约代码
2,npm install(或yarn install)首次使用需要拉取依赖
3,npx hardhat compile （最好先clean）编译
``` 
### 注释npm 代理
``` 
npm install -g nrm
nrm ls
nrm use taobao
``` 
``` 
https://github.com/teleport-network/Contracts/tree/upgrade/Teleport_QA
``` 

### teleport-bridge：
```
你说的 
``` 

### 目录：
``` 
├── contracts 合约
│   ├── 非qa   研发原始合约代码
│   └── qa    测试自写合约
├── scripts   脚本
├── tasks     任务
│   ├── dev   研发原始任务用于参考
│   └── qa    测试自写任务目录文件可以自行新增
└── test  test 
``` 

### deployall task 部署合约获取合约地址（合约地址本地调试）
``` 
export CLIENT_STATE_CODEC_ADDRESS=0xd33941b4163d82460bd9aa885541d721f04c087e
export CONSENSUS_STATE_CODEC_ADDRESS=0x1f0b27094410d0c49aa2153c5b1e06390c526849
export PROOF_CODEC_ADDRESS=0xd3ecda23917f060da4e7da835fd0d362a9195731
export VERIFIER_ADDRESS=0x6c857b6975fed9ddee785bd8579f086be7a7ae80
export ACCESS_MANAGER_ADDRESS=0x73b63c48fadf25739325cac0f631ec30b2960041
export CLIENT_MANAGER_ADDRESS=0xfb760ecfb98be9ff87dd5c8dbc050800dcb3b382
export PACKET_ADDRESS=0xf77f90a902a5cb5b0e1ade83b2e8c5298a26be0a
export ENDPOINT_ADDRESS=0xc6504d78a1da561adbb8d34e2d9f7b2e8b255bc7
export EXECUTE_ADDRESS=0xee3ff0ca55e699a2722545a6b05146d135b4b33b
```
### 示例脚本
``` 
流通性查询 
原evm
npx hardhat queryBindingsEvm --endpoint 0xe4916fd50499601dfe4fd2b40ee6d93a8035fcab  --token 0x2b2454ad0c2142bd02ff38d8728c022a4a90feb7 --network rinkeby
原teleport
npx hardhat queryBindingsTp --endpoint 0x0000000000000000000000000000000020000002 --token 0x0000000000000000000000000000000000000000 --network teleport
获取交易凭证
npx hardhat getHash --hash 0x7cce144661213a07405cf2afed2857804a02e79013452a9a062b44dc01d3d5b9 --network teleport
执行交易 原transfer替换endpoint合约
npx hardhat rTransfer --tokenaddress 0x0000000000000000000000000000000000000000 --receiver 0x68949B0eF5dE6087c64947bcA6c749e89B6a8bD9 --amount 1 --dstchain rinkeby --fees 0 --endpoint 0x0000000000000000000000000000000020000002 --network teleport

非teleport设置风控
/**设置风控*/
npx hardhat enLimits --endpoint 0xfe30de51bdb9b9784f1a05d5531d221bf66eaf70 --token 0x44de7218b9f7a205084466d9ad7f438ec30dc192 --tp 60 --tb 200000 --max 500 --min 100 --network bsctest
/**查询风控信息*/
npx hardhat qLimits --endpoint 0xfe30de51bdb9b9784f1a05d5531d221bf66eaf70 --token 0x44de7218b9f7a205084466d9ad7f438ec30dc192 --network bsctest
/**取消风控*/
npx hardhat unLimits --endpoint 0xfe30de51bdb9b9784f1a05d5531d221bf66eaf70 --token 0x44de7218b9f7a205084466d9ad7f438ec30dc192 --network bsctest
``` 