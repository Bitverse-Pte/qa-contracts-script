import sh


# 下载abi文件
def getContracts():
    # 创建文件夹
    # 先删除
    sh.rm("-rf", "contracts/chains")
    sh.rm("-rf", "contracts/interfaces")
    sh.rm("-rf", "contracts/libraries")
    sh.rm("-rf", "contracts/proto")
    sh.rm("-rf", "contracts/token")
    # 再创建
    sh.mkdir("contracts/chains")
    sh.mkdir("contracts/interfaces")
    sh.mkdir("contracts/libraries")
    sh.mkdir("contracts/proto")
    sh.mkdir("contracts/token")

    # 下载合约代码
    sh.git("clone", "https://github.com/teleport-network/xibc-contracts.git", "--branch=refactor")

    # 编译
    print("开始更新contracts")
    sh.cd("xibc-contracts/contracts")
    sh.cp("-fr", "chains", "../../contracts/")
    sh.cp("-fr", "interfaces", "../../contracts/")
    sh.cp("-fr", "libraries", "../../contracts/")
    sh.cp("-fr", "proto", "../../contracts/")
    sh.cp("-fr", "token", "../../contracts/")

    # 删除
    sh.cd("../../")
    sh.rm("-rf", "xibc-contracts")
    sh.git("add", "contracts/")
    print("更新完成")


if __name__ == "__main__":
    getContracts()
