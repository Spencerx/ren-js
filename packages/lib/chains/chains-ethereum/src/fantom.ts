import {
    getRenNetworkDetails,
    RenNetwork,
    RenNetworkDetails,
    RenNetworkString,
} from "@renproject/interfaces";
import { Callable, utilsWithChainNetwork } from "@renproject/utils";
import { provider } from "web3-providers";
import { EthAddress, EthTransaction, NetworkInput } from "./base";

import { EthereumClass } from "./ethereum";
import { EthereumConfig } from "./networks";
import { addressIsValid } from "./utils";

export const renFantomTestnet: EthereumConfig = {
    name: "Fantom Testnet",
    chain: "fantomTestnet",
    isTestnet: true,
    chainLabel: "Fantom Testnet",
    networkID: 0xfa2,
    infura: "https://rpc.testnet.fantom.network/",
    etherscan: "https://testnet.ftmscan.com",
    addresses: {
        GatewayRegistry: "0x1207765B53697a046DCF4AE95bd4dE99ef9D3D3C",
        BasicAdapter: "0x07deB3917d234f787AEd86E0c88E829277D4a33b",
    },
};

export const renFantomDevnet: EthereumConfig = {
    ...renFantomTestnet,
    addresses: {
        GatewayRegistry: "0xD881213F5ABF783d93220e6bD3Cc21706A8dc1fC",
        BasicAdapter: "0xD087b0540e172553c12DEEeCDEf3dFD21Ec02066",
    },
};

export const renFantomMainnet: EthereumConfig = {
    name: "Fantom Mainnet",
    chain: "fantomMainnet",
    isTestnet: false,
    chainLabel: "Fantom Mainnet",
    networkID: 250,
    infura: "https://rpcapi.fantom.network/",
    etherscan: "https://ftmscan.com",
    addresses: {
        GatewayRegistry: "0x21C482f153D0317fe85C60bE1F7fa079019fcEbD",
        BasicAdapter: "0xAC23817f7E9Ec7EB6B7889BDd2b50e04a44470c5",
    },
};

export const FantomConfigMap = {
    [RenNetwork.TestnetVDot3]: renFantomTestnet,
    [RenNetwork.MainnetVDot3]: renFantomMainnet,
    [RenNetwork.DevnetVDot3]: renFantomDevnet,
};

const resolveFantomNetwork = (
    renNetwork?:
        | RenNetwork
        | RenNetworkString
        | RenNetworkDetails
        | EthereumConfig,
) => {
    if (!renNetwork) {
        return FantomConfigMap[RenNetwork.MainnetVDot3];
    }
    if ((renNetwork as EthereumConfig).addresses) {
        return renNetwork as EthereumConfig;
    } else {
        const details = getRenNetworkDetails(
            renNetwork as RenNetwork | RenNetworkString | RenNetworkDetails,
        );
        return details.isTestnet
            ? details.name === RenNetwork.DevnetVDot3
                ? renFantomDevnet
                : renFantomTestnet
            : renFantomMainnet;
    }
};

export class FantomClass extends EthereumClass {
    public static chain = "Fantom";
    public chain = FantomClass.chain;
    public name = FantomClass.chain;
    public legacyName = undefined;

    public static utils = {
        resolveChainNetwork: resolveFantomNetwork,
        addressIsValid,
        addressExplorerLink: (
            address: EthAddress,
            network?: NetworkInput,
        ): string =>
            `${
                (
                    FantomClass.utils.resolveChainNetwork(network) ||
                    renFantomMainnet
                ).etherscan
            }/address/${address}`,

        transactionExplorerLink: (
            transaction: EthTransaction,
            network?: NetworkInput,
        ): string =>
            `${
                (Fantom.utils.resolveChainNetwork(network) || renFantomMainnet)
                    .etherscan
            }/tx/${transaction}`,
    };

    public utils = utilsWithChainNetwork(
        FantomClass.utils,
        () => this.renNetworkDetails,
    );

    constructor(
        web3Provider: provider,
        renNetwork:
            | RenNetwork
            | RenNetworkString
            | RenNetworkDetails
            | EthereumConfig,
    ) {
        // To be compatible with the Ethereum chain class, the first parameter
        // is a web3Provider and the second the RenVM network. However,
        super(web3Provider, resolveFantomNetwork(renNetwork));
    }

    initialize = (
        renNetwork: RenNetwork | RenNetworkString | RenNetworkDetails,
    ) => {
        this.renNetworkDetails =
            this.renNetworkDetails ||
            FantomConfigMap[getRenNetworkDetails(renNetwork).name];

        if (!this.renNetworkDetails) {
            throw new Error(
                `Unable to set ${this.name} network for RenVM network ${
                    getRenNetworkDetails(renNetwork).name
                }. Please provide ${this.name} network details to ${
                    this.name
                } constructor.`,
            );
        }
        return this;
    };
}

export type Fantom = FantomClass;
// @dev Removes any static fields, except `utils`.
export const Fantom = Callable(FantomClass);
