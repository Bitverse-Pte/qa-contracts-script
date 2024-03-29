// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.12;

import "../libraries/utils/Bytes.sol";
import "../libraries/utils/Strings.sol";
import "../interfaces/IEndpoint.sol";
import "../interfaces/IPacket.sol";
import "../interfaces/ICallback.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract Agent is ICallback, ReentrancyGuardUpgradeable {
    receive() external payable {}

    using Strings for *;
    using Bytes for *;

    struct AgentData {
        bool sent;
        address tokenAddress;
        uint256 amount;
        address refundAddress; // refund address on relay chain
    }

    mapping(string => AgentData) public agentData; // map[dstChain/sequence]AgentData

    address public constant packetContractAddress = address(0x0000000000000000000000000000000020000001);
    address public constant endpointContractAddress = address(0x0000000000000000000000000000000020000002);
    address public constant executeContract = address(0x0000000000000000000000000000000020000003);

    // only xibc crosschain contract can perform related transactions
    modifier onlyCrossChain() {
        require(msg.sender == endpointContractAddress, "caller must be Endpoint contract");
        _;
    }

    // only xibc execute contract can perform related transactions
    modifier onlyExecute() {
        require(msg.sender == executeContract, "caller must be Execute contract");
        _;
    }

    /**
     * @notice send second hop transfer
     * @param refundAddress refund address on relay chain
     * @param receiver receiver on dst chain
     * @param dstChain destination chain name
     * @param feeAmount fee amount
     */
    function send(
        address refundAddress, // refund address on relay chain
        string memory receiver,
        string memory dstChain,
        uint256 feeAmount // precision should be same as srcChain
    ) public nonReentrant onlyExecute returns (bool) {
        /** Fake code
        if (token_bound) {
            scale_src = transfer.get_scale(token_src);
            scale_dst = transfer.get_scale(token_dst);

            real_amount_recv = amount * 10**uint256(scale_src);
            real_fee_amount = feeAmount * 10**uint256(scale_src);

            real_amount_available = real_amount_recv - real_fee_amount;              // store in AgentData
            real_amount_send = real_amount_available / 10**uint256(scale_dst);      // maybe loss of precision
        }
        */

        require(!dstChain.equals(IPacket(packetContractAddress).chainName()), "invalid dstChain");

        (
            address tokenAddress,
            uint256 msgValue,
            uint256 realFeeAmount,
            uint256 realAmountAvailable,
            uint256 realAmountSend
        ) = checkPacketSyncAndGetAmountSrcChain(dstChain, feeAmount);

        IEndpoint(endpointContractAddress).crossChainCall{value: msgValue}(
            CrossChainDataTypes.CrossChainData({
                dstChain: dstChain,
                tokenAddress: tokenAddress,
                receiver: receiver,
                amount: realAmountSend,
                contractAddress: "",
                callData: "",
                callbackAddress: address(this),
                feeOption: 0 // TDB
            }),
            PacketTypes.Fee({tokenAddress: tokenAddress, amount: realFeeAmount})
        );

        uint64 sequence = IPacket(packetContractAddress).getNextSequenceSend(dstChain);
        string memory sequencesKey = string.concat(dstChain, "/", Strings.uint642str(sequence));

        agentData[sequencesKey] = AgentData({
            sent: true,
            tokenAddress: tokenAddress,
            amount: realAmountAvailable,
            refundAddress: refundAddress
        });

        return true;
    }

    /**
     * @notice check packet sync and calcute real amount
     * @param dstChain destination chain name
     * @param feeAmount fee amount
     */
    function checkPacketSyncAndGetAmountSrcChain(string memory dstChain, uint256 feeAmount)
        private
        returns (
            address, // tokenAddress
            uint256, // msgValue
            uint256, // realFeeAmount
            uint256, // realAmountAvailable
            uint256 // realAmountSend
        )
    {
        PacketTypes.Packet memory packet = LatestPacket(packetContractAddress).getLatestPacket();
        PacketTypes.TransferData memory transferData = abi.decode(packet.transferData, (PacketTypes.TransferData));
        require(transferData.receiver.equals(address(this).addressToString()), "token receiver must be agent contract");

        address tokenAddress;
        // true: back to origin. false: token come in
        if (bytes(transferData.oriToken).length != 0) {
            tokenAddress = transferData.oriToken.parseAddr();
            uint256 amount = transferData.amount.toUint256();
            // true: base token. false: erc20 token
            if (tokenAddress == address(0)) {
                return (address(0), amount, feeAmount, amount - feeAmount, amount - feeAmount);
            }
            IERC20(tokenAddress).approve(endpointContractAddress, amount);
            return (tokenAddress, 0, feeAmount, amount - feeAmount, amount - feeAmount);
        }
        tokenAddress = IEndpoint(endpointContractAddress).bindingTraces(
            string.concat(packet.srcChain, "/", transferData.token)
        );

        uint256 scaleSrc = IEndpoint(endpointContractAddress)
            .getBindings(string.concat(tokenAddress.addressToString(), "/", packet.srcChain))
            .scale;
        uint256 scaleDst = IEndpoint(endpointContractAddress)
            .getBindings(string.concat(tokenAddress.addressToString(), "/", dstChain))
            .scale; // will be 0 if not bound

        uint256 realAmountRecv = transferData.amount.toUint256() * 10**uint256(scaleSrc);
        uint256 realFeeAmount = feeAmount * 10**uint256(scaleSrc);
        uint256 realAmountAvailable = realAmountRecv - realFeeAmount;
        uint256 realAmountSend = realAmountAvailable / 10**uint256(scaleDst);

        IERC20(tokenAddress).approve(endpointContractAddress, realAmountRecv);

        return (tokenAddress, 0, realFeeAmount, realAmountAvailable, realAmountSend);
    }

    /**
     * @notice execute callback of cross chain packet
     */
    function callback(
        string calldata,
        string calldata dstChain,
        uint64 sequence,
        uint64 code,
        bytes calldata,
        string calldata
    ) external override onlyCrossChain {
        if (code != 0) {
            require(IPacket(packetContractAddress).getAckStatus(dstChain, sequence) == 2, "not err ack");
            string memory sequencesKey = string.concat(dstChain, "/", Strings.uint642str(sequence));
            require(agentData[sequencesKey].sent, "not exist");

            AgentData memory data = agentData[sequencesKey];
            delete agentData[sequencesKey];

            if (data.tokenAddress == address(0)) {
                payable(data.refundAddress).transfer(data.amount);
                return;
            }

            require(
                IERC20(data.tokenAddress).transfer(data.refundAddress, data.amount),
                "refund failed, ERC20 transfer err"
            );
        }
    }
}
