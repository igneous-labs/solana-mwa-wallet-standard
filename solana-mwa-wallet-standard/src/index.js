/* eslint-disable */ // TODO: remove

import { SOLANA_CHAINS } from "@solana/wallet-standard-chains";

// need to redefine type because @implements doesnt allow import for some reason
/** @typedef {import("@solana/wallet-standard-features").WalletWithSolanaFeatures} WalletWithSolanaFeatures */

/**
 * @implements {WalletWithSolanaFeatures}
 */
export class SolanaMwaWalletStandard {
  /** @returns {"1.0.0"} */
  get version() {
    return "1.0.0";
  }

  /** @returns {WalletWithSolanaFeatures["icon"]} */
  get icon() {
    return "data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjI4IiB3aWR0aD0iMjgiIHZpZXdCb3g9Ii0zIDAgMjggMjgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iI0RDQjhGRiI+PHBhdGggZD0iTTE3LjQgMTcuNEgxNXYyLjRoMi40di0yLjRabTEuMi05LjZoLTIuNHYyLjRoMi40VjcuOFoiLz48cGF0aCBkPSJNMjEuNiAzVjBoLTIuNHYzaC0zLjZWMGgtMi40djNoLTIuNHY2LjZINC41YTIuMSAyLjEgMCAxIDEgMC00LjJoMi43VjNINC41QTQuNSA0LjUgMCAwIDAgMCA3LjVWMjRoMjEuNnYtNi42aC0yLjR2NC4ySDIuNFYxMS41Yy41LjMgMS4yLjQgMS44LjVoNy41QTYuNiA2LjYgMCAwIDAgMjQgOVYzaC0yLjRabTAgNS43YTQuMiA0LjIgMCAxIDEtOC40IDBWNS40aDguNHYzLjNaIi8+PC9nPjwvc3ZnPg==";
  }

  /** @returns {WalletWithSolanaFeatures["name"]} */
  get name() {
    return "Solana Mobile Wallet Adapter";
  }

  /** @returns {WalletWithSolanaFeatures["chains"]} */
  get chains() {
    return SOLANA_CHAINS;
  }

  /** @returns {WalletWithSolanaFeatures["accounts"]} */
  get accounts() {
    // TODO
    return [];
  }

  /** @returns {WalletWithSolanaFeatures["features"]} */
  get features() {
    return {
      "solana:signAndSendTransaction": {
        version: "1.0.0",
        supportedTransactionVersions: this.supportedTransactionVersions,
        signAndSendTransaction: this.#signAndSendTransaction.bind(this),
      },
      "solana:signMessage": {
        version: "1.0.0",
        signMessage: this.#signMessage.bind(this),
      },
      "solana:signTransaction": {
        version: "1.0.0",
        supportedTransactionVersions: this.supportedTransactionVersions,
        signTransaction: this.#signTransaction.bind(this),
      },
    };
  }

  // TODO: implement querying the mobile wallet for its supported tx versions
  /** @returns {import("@solana/wallet-standard-features").SolanaSignAndSendTransactionFeature["solana:signAndSendTransaction"]["supportedTransactionVersions"]} */
  get supportedTransactionVersions() {
    return ["legacy", 0];
  }

  /** @returns {import("@solana-mobile/mobile-wallet-adapter-protocol").AppIdentity} */
  get appIdentity() {
    return this.#appIdentity;
  }

  /** @type {import("@solana-mobile/mobile-wallet-adapter-protocol").AppIdentity} */
  #appIdentity;

  /** @type {?import("@solana-mobile/mobile-wallet-adapter-protocol").AuthToken} */
  #authToken;

  /**
   * @param {import("@solana-mobile/mobile-wallet-adapter-protocol").AppIdentity} appIdentity
   */
  constructor(appIdentity) {
    this.#appIdentity = appIdentity;
    this.#authToken = null;
    // TODO
  }

  /** @type {import("@solana/wallet-standard-features").SolanaSignAndSendTransactionMethod} */
  async #signAndSendTransaction(...inputs) {
    // TODO:
    return [];
  }

  /** @type {import("@solana/wallet-standard-features").SolanaSignMessageMethod} */
  async #signMessage(...inputs) {
    // TODO:
    return [];
  }

  /** @type {import("@solana/wallet-standard-features").SolanaSignTransactionMethod} */
  async #signTransaction(...inputs) {
    // TODO
    return [];
  }
}

/**
 * register the solana mobile wallet adapter as a standard wallet
 */
export function registerSolanaMwaWalletStandard() {
  /** @type {import("@wallet-standard/base").WalletEventsWindow} */
  const walletEventsWindow = window;
  // TODO
  walletEventsWindow.addEventListener(
    "wallet-standard:app-ready",
    ({ detail: { register } }) => {}
  );
}
