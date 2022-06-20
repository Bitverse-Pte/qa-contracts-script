import sh


def alter(file, old_str, new_str):
    """
    替换文件中的字符串
    :param file:文件名
    :param old_str:就字符串
    :param new_str:新字符串
    :return:

    """
    file_data = ""
    with open(file, "r", encoding="utf-8") as f:
        for line in f:
            if old_str in line:
                line = line.replace(old_str, new_str)
            file_data += line
    with open(file, "w", encoding="utf-8") as f:
        f.write(file_data)


# 下载Contracts文件
def getContracts():
    # 创建文件夹
    # 先删除
    sh.rm("-rf", "contracts/chains")
    sh.rm("-rf", "contracts/interfaces")
    sh.rm("-rf", "contracts/libraries")
    sh.rm("-rf", "contracts/proto")
    sh.rm("-rf", "contracts/token")
    sh.rm("-rf", "contracts/apps")
    # 再创建
    sh.mkdir("contracts/chains")
    sh.mkdir("contracts/interfaces")
    sh.mkdir("contracts/libraries")
    sh.mkdir("contracts/proto")
    sh.mkdir("contracts/token")
    sh.mkdir("contracts/apps")

    # 下载contracts合约代码
    sh.git("clone", "https://github.com/teleport-network/xibc-contracts.git", "--branch=refactor")

    # cp 移动
    print("开始更新xibc-contracts")
    sh.cd("xibc-contracts/contracts")
    sh.cp("-fr", "chains", "../../contracts/")
    sh.cp("-fr", "interfaces", "../../contracts/")
    sh.cp("-fr", "libraries", "../../contracts/")
    sh.cp("-fr", "proto", "../../contracts/")
    sh.cp("-fr", "token", "../../contracts/")

    # 删除
    sh.cd("../../")
    sh.rm("-rf", "xibc-contracts")

    # 处理xibc-apps
    sh.git("clone", "git@github.com:teleport-network/xibc-apps.git", "--branch=main")

    # xibc-apps
    print("开始更新xibc-apps")
    sh.cd("xibc-apps/bridge/contracts")
    alter("Agent.sol", "xibc-contracts/contracts/", "../")
    alter("Proxy.sol", "xibc-contracts/contracts/", "../")
    sh.cp("-fr", "Agent.sol", "../../../contracts/apps")
    sh.cp("-fr", "Proxy.sol", "../../../contracts/apps")
    # 删除
    sh.cd("../../../")
    sh.rm("-rf", "xibc-apps")

    sh.git("add", "contracts/")
    print("更新完成")


if __name__ == "__main__":
    getContracts()
