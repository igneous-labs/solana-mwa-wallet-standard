/**
 * register the solana mobile wallet adapter as a standard wallet
 * @param {SolanaMwaWalletStandardCtorArgs} args
 */
export function registerSolanaMwaWalletStandard(args: SolanaMwaWalletStandardCtorArgs): void;
/** @typedef {import("@solana/wallet-standard-features").WalletWithSolanaFeatures} WalletWithSolanaFeatures */
/** @typedef {Exclude<import("@solana/wallet-standard-chains").SolanaChain, "solana:localnet">} NonLocalnetChain */
/**
 * @typedef MaybeNonLocalnetChainsProp
 * @property {NonLocalnetChain[] | null | undefined} [chains]
 */
/** @typedef {import("@solana-mobile/mobile-wallet-adapter-protocol").AppIdentity & MaybeNonLocalnetChainsProp} SolanaMwaWalletStandardCtorArgs */
/**
 * @typedef MaybeChainProp
 * @property {import("@wallet-standard/base").IdentifierString | null | undefined} [chain]
 */
/**
 * @template TReturn
 * @typedef {(wallet: import("@solana-mobile/mobile-wallet-adapter-protocol").MobileWallet) => TReturn} TransactCallback<TReturn>
 */
export class ChainNotSupportedError extends Error {
    constructor();
}
export class NoChainsSetError extends Error {
    constructor();
}
/**
 * @implements {WalletWithSolanaFeatures}
 */
export class SolanaMwaWalletStandard implements WalletWithSolanaFeatures {
    /**
     * @param {SolanaMwaWalletStandardCtorArgs} args
     */
    constructor({ chains, ...appIdentity }: SolanaMwaWalletStandardCtorArgs);
    /** @returns {"1.0.0"} */
    get version(): "1.0.0";
    /** @returns {WalletWithSolanaFeatures["icon"]} */
    get icon(): `data:image/svg+xml;base64,${string}` | `data:image/webp;base64,${string}` | `data:image/png;base64,${string}` | `data:image/gif;base64,${string}`;
    /** @returns {WalletWithSolanaFeatures["name"]} */
    get name(): string;
    /** @returns {WalletWithSolanaFeatures["chains"]} */
    get chains(): import(".pnpm/@wallet-standard+base@1.0.1/node_modules/@wallet-standard/base").IdentifierArray;
    /** @returns {WalletWithSolanaFeatures["accounts"]} */
    get accounts(): readonly import(".pnpm/@wallet-standard+base@1.0.1/node_modules/@wallet-standard/base").WalletAccount[];
    /** @returns {WalletWithSolanaFeatures["features"] & import("@wallet-standard/features").StandardConnectFeature & import("@wallet-standard/features").StandardDisconnectFeature & import("@wallet-standard/features").StandardEventsFeature} */
    get features(): import("@solana/wallet-standard-features").SolanaFeatures & import("@wallet-standard/features").StandardConnectFeature & import("@wallet-standard/features").StandardDisconnectFeature & import("@wallet-standard/features").StandardEventsFeature;
    /** @returns {import("@solana/wallet-standard-features").SolanaSignAndSendTransactionFeature["solana:signAndSendTransaction"]["supportedTransactionVersions"]} */
    get supportedTransactionVersions(): readonly import("@solana/wallet-standard-features").SolanaTransactionVersion[];
    /** @returns {import("@solana-mobile/mobile-wallet-adapter-protocol").AppIdentity} */
    get appIdentity(): Readonly<{
        uri?: string;
        icon?: string;
        name?: string;
    }>;
    /** @returns {NonLocalnetChain} */
    get defaultChain(): NonLocalnetChain;
    #private;
}
export type WalletWithSolanaFeatures = import("@solana/wallet-standard-features").WalletWithSolanaFeatures;
export type NonLocalnetChain = Exclude<import("@solana/wallet-standard-chains").SolanaChain, "solana:localnet">;
export type MaybeNonLocalnetChainsProp = {
    chains?: NonLocalnetChain[] | null | undefined;
};
export type SolanaMwaWalletStandardCtorArgs = import("@solana-mobile/mobile-wallet-adapter-protocol").AppIdentity & MaybeNonLocalnetChainsProp;
export type MaybeChainProp = {
    chain?: import("@wallet-standard/base").IdentifierString | null | undefined;
};
/**
 * <TReturn>
 */
export type TransactCallback<TReturn> = (wallet: import("@solana-mobile/mobile-wallet-adapter-protocol").MobileWallet) => TReturn;
