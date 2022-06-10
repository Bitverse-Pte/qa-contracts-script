# XIBC Breaking Change

## 1. Packet

**type**

```solidity
library PacketTypes {
    struct Packet {
        // packet base data
        string srcChain;
        string dstChain;
        uint64 sequence;
        string sender;
        // transfer data. keep empty if not used
        bytes transferData;
        // call data. keep empty if not used
        bytes callData;
        // callback data
        string callbackAddress;
        // fee option
        uint64 feeOption;
    }

    struct TransferData {
        string token;
        string oriToken;
        bytes amount;
        string receiver;
    }

    struct CallData {
        string contractAddress;
        bytes callData;
    }

    struct Fee {
        address tokenAddress; // zero address if base token
        uint256 amount;
    }

    struct Acknowledgement {
        uint64 code; // 0: success; 1: system failed; 2: transfer failed; 3: call failed; 4: undefined
        bytes result;
        string message;
        string relayer;
        uint64 feeOption;
    }
}
```

**function**

```solidity

// common functions

/**
 * @notice get the name of this chain
 * @return returns the name of this chain
 */
function chainName() external view returns (string memory);

/**
 * @notice get the next sequence of dstChain
 * @param dstChain destination chain name
 */
function getNextSequenceSend(string calldata dstChain) external view returns (uint64);

/**
 * @notice get packet ack
 * @param key bytes(dstChain/sequence)
 */
function acks(bytes calldata key) returns (PacketTypes.Acknowledgement);

/**
 * @notice get the next sequence of dstChain
 * @param dstChain destination chain name
 * @param sequence sequence
 */
function getAckStatus(string calldata dstChain, uint64 sequence) external view returns (uint8);

/**
 * @notice get latest packet
 */
function getLatestPacket() external view returns (PacketTypes.Packet memory packet);

/**
 * @notice get packet fee
 * @param key bytes(dstChain/sequence)
 */
function packetFees(bytes calldata key) returns (PacketTypes.Fee);

/**
 * @notice set packet fee
 * @param dstChain destination chain name
 * @param sequence sequence
 * @param amount add fee amount
 */
function addPacketFee(
    string memory dstChain,
    uint64 sequence,
    uint256 amount
) public payable;

// ================================================================
// evm functions

/**
 * @notice recvPacket is called by any relayer in order to receive & process an XIBC packet
 * @param packetBytes xibc packet bytes
 * @param proof proof commit
 * @param height proof height
 */
function recvPacket(
    bytes calldata packetBytes,
    bytes calldata proof,
    Height.Data calldata height
) external nonReentrant whenNotPaused onlyAuthorizee(RELAYER_ROLE);

/**
 * @notice acknowledgePacket is called by relayer in order to receive an XIBC acknowledgement
 * @param packetBytes xibc packet bytes
 * @param acknowledgement acknowledgement from dst chain
 * @param proofAcked ack proof commit
 * @param height ack proof height
 */
function acknowledgePacket(
    bytes calldata packetBytes,
    bytes calldata acknowledgement,
    bytes calldata proofAcked,
    Height.Data calldata height
) external nonReentrant whenNotPaused;

/**
 * @notice claim 2hops packet relay fee
 * @param tokens fee tokenAddresses
 * @param receiver fee receiver
 */
function claim2HopsFee(address[] calldata tokens, address receiver) external onlyAuthorizee(FEE_MANAGER);
```

## 2. Endpoint

**type**

```solidity
library TokenBindingTypes {
    struct Binding {
        string oriChain;
        string oriToken; // token ID, address if ERC20
        uint256 amount;
        uint8 scale; // real_amount = packet_amount * (10 ** scale)
        bool bound;
    }

    struct TimeBasedSupplyLimit {
        bool enable;
        uint256 timePeriod; // seconds
        uint256 timeBasedLimit;
        uint256 maxAmount;
        uint256 minAmount;
        uint256 previousTime; // timestamp (seconds)
        uint256 currentSupply;
    }
}

library CrossChainDataTypes {
    struct CrossChainData {
        // path data
        string dstChain;
        // transfer token data
        address tokenAddress; // zero address if base token
        uint256 amount;
        string receiver;
        // contract call data
        string contractAddress;
        bytes callData;
        // callback data
        address callbackAddress;
        // fee option
        uint64 feeOption;
    }
}
```

**function**

```solidity
function crossChainCall(CrossChainDataTypes.CrossChainData calldata crossChainData, PacketTypes.Fee calldata fee) external payable;

// key on teleport = token_address/origin_chain
// key on evm = token_address
function getBindings(string calldata key) external view returns (TokenBindingTypes.Binding memory binding);
```

## 3. Callback

**function**

```solidity
interface ICallback {
    /**
     * @notice callback function. This function is called when the packet is received. This method may be called by others, please ensure a single consumption in implemention.
     * @param srcChain source chain
     * @param dstChain destination chain
     * @param sequence packet sequence
     * @param code error code
     * @param result packet result
     * @param message error message
     */
    function callback(
        string calldata srcChain,
        string calldata dstChain,
        uint64 sequence,
        uint64 code,
        bytes calldata result,
        string calldata message
    ) external;
}
```

## 4. AccessManager (Only EVM)

**type**

```solidity
bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");
```

## 5. ClientManager (Only EVM)

**type**

```solidity
// relay chain client
IClient public override client;
```

**function**

```solidity
/**
 *  @notice this function is intended to be called by owner to create a client and initialize client data.
 *  @param clientAddress    client contract address
 *  @param clientState      client status
 *  @param consensusState   client consensus status
 */
function createClient(
    address clientAddress,
    bytes calldata clientState,
    bytes calldata consensusState
) external onlyAuthorizee(CREATE_CLIENT_ROLE);

/**
 *  @notice this function is called by the relayer, the purpose is to update the state of the client
 *  @param header     block header of the counterparty chain
 */
function updateClient(bytes calldata header) external onlyAuthorizee(RELAYER_ROLE);

/**
 *  @notice this function is called by the owner, the purpose is to update the state of the client
 *  @param clientState      client status
 *  @param consensusState   client consensus status
 */
function upgradeClient(bytes calldata clientState, bytes calldata consensusState)
    external
    onlyAuthorizee(UPGRADE_CLIENT_ROLE);

/**
 *  @notice this function is called by the owner, the purpose is to toggle client type between Light and TSS
 *  @param clientAddress    client contract address
 *  @param clientState      client status
 *  @param consensusState   client consensus status
 */
function toggleClient(
    address clientAddress,
    bytes calldata clientState,
    bytes calldata consensusState
) external onlyAuthorizee(UPGRADE_CLIENT_ROLE);
```

## 6. Agent APP

**type**

```solidity
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
```

**function**

```solidity
function genCrossChainData(AgentData memory agentData)
    public
    view
    returns (CrossChainDataTypes.CrossChainData memory);
```
