### 初始化流程
``` 
1,initDatas.py初始化脚本，更新研发合约代码
2,npm install(或yarn install)首次使用需要拉取依赖
3,npx hardhat compile （有更新先clean）编译
``` 
### npm 代理包
``` 
npm install -g nrm
nrm ls
nrm use taobao
``` 
``` 
https://github.com/teleport-network/Contracts/tree/upgrade/Teleport_QA
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
### 脚本参考文档
``` 
回归测试：https://c1ey4wdv9g.larksuite.com/wiki/wikuskZLPmDixwhqMhPpIYoPtyb
主页面测试：https://c1ey4wdv9g.larksuite.com/wiki/wikusl69Vtr6pRMEn0FZKbUyD1b
``` 

### teleport 查询packet接受情况
``` 
teleport q xibc packet packet-receipt rinkeby teleport 48 --node http://abd46ec6e28754f0ab2aae29deaa0c11-1510914274.ap-southeast-1.elb.amazonaws.com:26657
```

## hardhat 缩写 补全使用
``` 
# hh安装，hh代替npx hardhat,需要全局安装 
npm i -g hardhat-shorthand 
# hardhat-shorthand 补全提示，全局安装，选择zsh
npm hardhat-completion install 
```
## geReason.js 根据交易hash 查询是否存在错误 r代表环境
``` 
node getrReason.js r 0x2ca3003b230c5addc5e1124a5ef90bf5a852ae16f40658602fdf815d2f80c07a
```