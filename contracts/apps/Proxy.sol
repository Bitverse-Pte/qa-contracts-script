// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.12;

import "../libraries/utils/Bytes.sol";
import "../libraries/utils/Strings.sol";
import "../libraries/endpoint/Endpoint.sol";
import "../libraries/packet/Packet.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Proxy is Initializable {
    using Strings for *;
    using Bytes for *;

    address public constant agentContractAddress = address(0x0000000000000000000000000000000040000001);
    string public relayChainName;

    struct AgentData {
        address refundAddress; // refund address on relay chain
        string dstChain; // dst chain, not relay chain
        address tokenAddress; // token on src chain
        uint256 amount; // amount to send, decimal precision should be same as srcChain
        uint256 feeAmount; // second hop fee amount, take from amount, decimal precision should be same as srcChain
        string receiver; // token receiver on dst chain, not relay chain
        address callbackAddress; // first hop ack callback address
        uint64 feeOption;
    }

    /**
     * @notice initialize contract
     * @param _relayChainName relay chain name
     */
    function initialize(string memory _relayChainName) public initializer {
        require(!_relayChainName.equals(""), "invalid relay chain name");
        relayChainName = _relayChainName;
    }

    /**
     * @notice generate cross chain data
     * @param agentData agent data
     */
    function genCrossChainData(AgentData memory agentData)
        public
        view
        returns (CrossChainDataTypes.CrossChainData memory)
    {
        return
            CrossChainDataTypes.CrossChainData({
                dstChain: relayChainName,
                tokenAddress: agentData.tokenAddress,
                receiver: agentContractAddress.addressToString(),
                amount: agentData.amount,
                contractAddress: agentContractAddress.addressToString(),
                callData: _generateCalldata(agentData),
                callbackAddress: agentData.callbackAddress,
                feeOption: agentData.feeOption
            });
    }

    /**
     * @notice generate call data
     * @param agentData agent data
     */
    function _generateCalldata(AgentData memory agentData) private pure returns (bytes memory) {
        return
            abi.encodeWithSignature(
                "send(address,string,string,uint256)",
                agentData.refundAddress,
                agentData.receiver,
                agentData.dstChain,
                agentData.feeAmount
            );
    }
}
