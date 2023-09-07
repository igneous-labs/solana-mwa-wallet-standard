import { transact } from "@solana-mobile/mobile-wallet-adapter-protocol";
import {
  SOLANA_DEVNET_CHAIN,
  SOLANA_MAINNET_CHAIN,
  SOLANA_TESTNET_CHAIN,
} from "@solana/wallet-standard-chains";
// eslint-disable-next-line camelcase
import { binary_to_base58 as binaryToBase58 } from "base58-js";

// need to redefine type because @implements doesnt allow import for some reason
/** @typedef {import("@solana/wallet-standard-features").WalletWithSolanaFeatures} WalletWithSolanaFeatures */

/** @typedef {Exclude<import("@solana/wallet-standard-chains").SolanaChain, "solana:localnet">} NonLocalnetChain */

// typedef here just to use [optionalProp] syntax
/**
 * @typedef MaybeNonLocalnetChainsProp
 * @property {NonLocalnetChain[] | null | undefined} [chains]
 */

/** @typedef {import("@solana-mobile/mobile-wallet-adapter-protocol").AppIdentity & MaybeNonLocalnetChainsProp} SolanaMwaWalletStandardCtorArgs */

// typedef here just to use [optionalProp] syntax for #areAllChainsSupported
/**
 * @typedef MaybeChainProp
 * @property {import("@wallet-standard/base").IdentifierString | null | undefined} [chain]
 */

/**
 * @template TReturn
 * @typedef {(wallet: import("@solana-mobile/mobile-wallet-adapter-protocol").MobileWallet) => TReturn} TransactCallback<TReturn>
 */

export class ChainNotSupportedError extends Error {
  /**
   * @param {string} [chain]
   */
  constructor(chain) {
    super(`chain ${chain ?? "<unknown>"} not supported`);
    // Set the prototype explicitly. https://stackoverflow.com/a/41429145/2247097
    Object.setPrototypeOf(this, ChainNotSupportedError.prototype);
  }
}

export class NoChainsSetError extends Error {
  constructor() {
    super("no chains set");
    // Set the prototype explicitly. https://stackoverflow.com/a/41429145/2247097
    Object.setPrototypeOf(this, NoChainsSetError.prototype);
  }
}

/**
 * @implements {WalletWithSolanaFeatures}
 */
export class SolanaMwaWalletStandard {
  /* eslint-disable class-methods-use-this */

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
    return this.#chains;
  }

  /** @returns {WalletWithSolanaFeatures["accounts"]} */
  get accounts() {
    const all = Object.values(this.#accounts).reduce((arr, clusterSubArr) => [
      ...arr,
      ...clusterSubArr,
    ]);
    return all.map(this.#mwaAccountToStandardAccount.bind(this));
  }

  /** @returns {WalletWithSolanaFeatures["features"] & import("@wallet-standard/features").StandardConnectFeature & import("@wallet-standard/features").StandardDisconnectFeature & import("@wallet-standard/features").StandardEventsFeature} */
  get features() {
    return {
      "solana:signAndSendTransaction": {
        version: "1.0.0",
        supportedTransactionVersions: this.supportedTransactionVersions,
        signAndSendTransaction: this.#signAndSendTransaction.bind(this),
      },
      // TODO: signMessage currently only supports ascii messages
      "solana:signMessage": {
        version: "1.0.0",
        signMessage: this.#signMessage.bind(this),
      },
      "solana:signTransaction": {
        version: "1.0.0",
        supportedTransactionVersions: this.supportedTransactionVersions,
        signTransaction: this.#signTransaction.bind(this),
      },
      "standard:connect": {
        version: "1.0.0",
        connect: this.#connect.bind(this),
      },
      "standard:disconnect": {
        version: "1.0.0",
        disconnect: this.#disconnect.bind(this),
      },
      "standard:events": {
        version: "1.0.0",
        on: this.#on.bind(this),
      },
    };
  }

  // TODO: implement querying the mobile wallet for its supported tx versions
  /** @returns {import("@solana/wallet-standard-features").SolanaSignAndSendTransactionFeature["solana:signAndSendTransaction"]["supportedTransactionVersions"]} */
  get supportedTransactionVersions() {
    return ["legacy", 0];
  }

  /* eslint-enable class-methods-use-this */

  /** @returns {import("@solana-mobile/mobile-wallet-adapter-protocol").AppIdentity} */
  get appIdentity() {
    return this.#appIdentity;
  }

  /** @returns {NonLocalnetChain} */
  get defaultChain() {
    const res = this.#chains[0];
    if (!res) {
      throw new NoChainsSetError();
    }
    return res;
  }

  /** @type {NonLocalnetChain[]} */
  #chains;

  /** @type {import("@solana-mobile/mobile-wallet-adapter-protocol").AppIdentity} */
  #appIdentity;

  /** @type {Record<import("@solana-mobile/mobile-wallet-adapter-protocol").Cluster, ?import("@solana-mobile/mobile-wallet-adapter-protocol").AuthToken>} */
  #authTokens;

  /** @type {Record<import("@solana-mobile/mobile-wallet-adapter-protocol").Cluster, import("@solana-mobile/mobile-wallet-adapter-protocol").Account[]>} */
  #accounts;

  /** @type {{ [E in import("@wallet-standard/features").StandardEventsNames]: Set<import("@wallet-standard/features").StandardEventsListeners[E]> }} */
  #listeners;

  /**
   * @param {SolanaMwaWalletStandardCtorArgs} args
   * @throws {NoChainsSetError} if args.chains === empty array
   */
  constructor({ chains, ...appIdentity }) {
    this.#chains = chains ?? ["solana:mainnet"];
    if (this.#chains.length === 0) {
      throw new NoChainsSetError();
    }
    this.#appIdentity = appIdentity;
    this.#authTokens = {
      "mainnet-beta": null,
      devnet: null,
      testnet: null,
    };
    this.#accounts = {
      "mainnet-beta": [],
      devnet: [],
      testnet: [],
    };
    this.#listeners = {
      change: new Set(),
    };
  }

  /** @type {import("@solana/wallet-standard-features").SolanaSignAndSendTransactionMethod} */
  async #signAndSendTransaction(...inputs) {
    if (!areAllChainsSupported(inputs)) {
      throw new ChainNotSupportedError();
    }
    const inputIndices = this.#inputsIndicesByChain(inputs);
    const res = [];
    for (const [chainUncasted, indices] of Object.entries(inputIndices)) {
      if (indices.length === 0) {
        continue;
      }
      /** @type {NonLocalnetChain} */ // @ts-ignore
      const chain = chainUncasted;
      const cluster = chainToCluster(chain);
      const rawTxs = indices.map((i) => inputs[i].transaction);
      const payloads = rawTxs.map(uint8ToBase64Ascii);
      /* eslint-disable no-await-in-loop */
      const b64Signatures = await this.#transact(cluster, async (wallet) => {
        const { signatures } = await wallet.signAndSendTransactions({
          payloads,
        });
        return signatures;
      });
      /* eslint-enable no-await-in-loop */
      const rawSignatures = b64Signatures.map(base64ToUint8Ascii);
      for (let i = 0; i < rawSignatures.length; i++) {
        const rawSignature = rawSignatures[i];
        const index = indices[i];
        res[index] = { signature: rawSignature };
      }
    }
    return res;
  }

  /** @type {import("@solana/wallet-standard-features").SolanaSignMessageMethod} */
  async #signMessage(...inputs) {
    if (inputs.length === 0) {
      return [];
    }
    // TODO: check if cluster matters
    const cluster = chainToCluster(this.defaultChain);
    const formatted = signMessagesToMwaFormat(inputs);
    const signatures = await this.#transact(cluster, async (wallet) => {
      const { signed_payloads: signedPayloads } = await wallet.signMessages(
        formatted
      );
      return signedPayloads;
    });
    const res = [];
    for (let i = 0; i < inputs.length; i++) {
      res.push({
        signedMessage: inputs[i].message,
        signature: base64ToUint8Ascii(signatures[i]),
      });
    }
    return res;
  }

  /** @type {import("@solana/wallet-standard-features").SolanaSignTransactionMethod} */
  async #signTransaction(...inputs) {
    if (!areAllChainsSupported(inputs)) {
      throw new ChainNotSupportedError();
    }
    const inputIndices = this.#inputsIndicesByChain(inputs);
    const res = [];
    for (const [chainUncasted, indices] of Object.entries(inputIndices)) {
      if (indices.length === 0) {
        continue;
      }
      /** @type {NonLocalnetChain} */ // @ts-ignore
      const chain = chainUncasted;
      const cluster = chainToCluster(chain);
      const rawTxs = indices.map((i) => inputs[i].transaction);
      const payloads = rawTxs.map(uint8ToBase64Ascii);
      /* eslint-disable no-await-in-loop */
      const b64SignedPayloads = await this.#transact(
        cluster,
        async (wallet) => {
          const { signed_payloads: signedPayloads } =
            await wallet.signTransactions({
              payloads,
            });
          return signedPayloads;
        }
      );
      /* eslint-enable no-await-in-loop */
      const rawPayloads = b64SignedPayloads.map(base64ToUint8Ascii);
      for (let i = 0; i < rawPayloads.length; i++) {
        const rawPayload = rawPayloads[i];
        const index = indices[i];
        res[index] = { signedTransaction: rawPayload };
      }
    }
    return res;
  }

  /** @type {import("@wallet-standard/features").StandardConnectMethod} */
  async #connect(input) {
    // TODO: use silent param by saving authToken to localStorage
    const silent = input?.silent ?? false;
    if (silent) {
      console.warn(
        "SolanaMwaWalletStandard silent connect not yet implemented"
      );
    }
    let hasChanged = false;
    // not sure if mobile wallets can handle concurrent auth attempts,
    // so do it sequentially
    for (const chain of this.#chains) {
      const cluster = chainToCluster(chain);
      if (this.#authTokens[cluster] !== null) {
        continue;
      }
      // eslint-disable-next-line camelcase, no-await-in-loop
      const { accounts, auth_token } = await transact((wallet) =>
        wallet.authorize({
          cluster,
          identity: this.appIdentity,
        })
      );
      this.#accounts[cluster] = accounts;
      // eslint-disable-next-line camelcase
      this.#authTokens[cluster] = auth_token;
      hasChanged = true;
    }
    const res = {
      accounts: this.accounts,
    };
    if (hasChanged) {
      this.#emit("change", res);
    }
    return res;
  }

  /** @type {import("@wallet-standard/features").StandardDisconnectMethod} */
  async #disconnect() {
    const authTokens = Object.values(this.#authTokens);
    const noChange = authTokens.every((opt) => opt === null);
    this.#authTokens = {
      "mainnet-beta": null,
      devnet: null,
      testnet: null,
    };
    this.#accounts = {
      "mainnet-beta": [],
      devnet: [],
      testnet: [],
    };
    if (!noChange) {
      this.#emit("change", { accounts: this.accounts });
      await transact(async (wallet) => {
        // not sure if mobile wallets can handle concurrent deauth attempts,
        // so do it sequentially
        for (const authToken of authTokens) {
          if (authToken === null) {
            continue;
          }
          // eslint-disable-next-line no-await-in-loop
          await wallet.deauthorize({ auth_token: authToken });
        }
      });
    }
  }

  /** @type {import("@wallet-standard/features").StandardEventsOnMethod} */
  #on(event, listener) {
    this.#listeners[event].add(listener);
    const off = () => {
      this.#listeners[event].delete(listener);
    };
    return off.bind(this);
  }

  /**
   * transact(), but with reauthorize handled
   * @template TReturn
   * @param {import("@solana-mobile/mobile-wallet-adapter-protocol").Cluster} cluster
   * @param {TransactCallback<TReturn>} callback
   * @returns {Promise<TReturn>}
   */
  async #transact(cluster, callback) {
    const authToken = this.#authTokens[cluster];
    if (authToken === null) {
      throw new Error("not yet authorized");
    }
    return transact(async (wallet) => {
      const authResult = await wallet.reauthorize({
        auth_token: authToken,
        identity: this.appIdentity,
      });
      this.#authTokens[cluster] = authResult.auth_token;
      return callback(wallet);
    });
  }

  /**
   *
   * @param {import("@solana-mobile/mobile-wallet-adapter-protocol").Account} account
   * @returns {import("@wallet-standard/base").WalletAccount}
   */
  #mwaAccountToStandardAccount({ address }) {
    const uint8Addr = base64ToUint8Ascii(address);

    /** @type {string} */
    const b58Addr = binaryToBase58(uint8Addr);

    /** @type {import("@wallet-standard/base").IdentifierArray} */
    // @ts-ignore
    const features = Object.keys(this.features);
    return {
      address: b58Addr,
      publicKey: uint8Addr,
      chains: this.chains,
      features,
    };
  }

  /**
   * @template {import("@wallet-standard/features").StandardEventsNames} E
   * @param {E} event
   * @param  {Parameters<import("@wallet-standard/features").StandardEventsListeners[E]>} args
   */
  #emit(event, ...args) {
    for (const listener of this.#listeners[event]) {
      // eslint-disable-next-line prefer-spread
      listener.apply(null, args);
    }
  }

  /**
   * Defaults to first chain of this.chains if chain not provided
   * @template {{ chain: NonLocalnetChain | null | undefined }} I
   * @param {I[]} inputs
   * @returns {Record<NonLocalnetChain, number[]>}
   */
  #inputsIndicesByChain(inputs) {
    const { defaultChain } = this;
    /** @type {Record<NonLocalnetChain, number[]>} */
    const res = {
      "solana:devnet": [],
      "solana:mainnet": [],
      "solana:testnet": [],
    };
    for (let i = 0; i < inputs.length; i++) {
      const { chain } = inputs[i];
      if (chain) {
        res[chain].push(i);
      } else {
        res[defaultChain].push(i);
      }
    }
    return res;
  }
}

/**
 * @param {string} asciiStr base64 encoded ascii string
 * @returns {Uint8Array}
 */
function base64ToUint8Ascii(asciiStr) {
  return Uint8Array.from(atob(asciiStr), (c) => c.charCodeAt(0));
}

/**
 *
 * @param {Uint8Array} asciiUint8Array
 * @returns {string}
 */
function uint8ToBase64Ascii(asciiUint8Array) {
  return btoa(String.fromCharCode(...asciiUint8Array));
}

/**
 *
 * @param {NonLocalnetChain} chain
 * @returns {import("@solana-mobile/mobile-wallet-adapter-protocol").Cluster}
 */
function chainToCluster(chain) {
  switch (chain) {
    case "solana:devnet":
      return "devnet";
    case "solana:mainnet":
      return "mainnet-beta";
    case "solana:testnet":
      return "testnet";
    default:
      throw new ChainNotSupportedError(chain);
  }
}

/**
 * @template {MaybeChainProp} I
 * @param {I[]} inputs
 * @returns {inputs is Array<I & { chain: NonLocalnetChain | null | undefined }>}
 */
function areAllChainsSupported(inputs) {
  for (const { chain } of inputs) {
    if (
      chain !== null &&
      chain !== undefined &&
      chain !== SOLANA_DEVNET_CHAIN &&
      chain !== SOLANA_MAINNET_CHAIN &&
      chain !== SOLANA_TESTNET_CHAIN
    ) {
      return false;
    }
  }
  return true;
}

/**
 *
 * @param {Parameters<import("@solana/wallet-standard-features").SolanaSignMessageMethod>} msgs
 * @returns {Parameters<import("@solana-mobile/mobile-wallet-adapter-protocol").SignMessagesAPI["signMessages"]>[0]}
 */
function signMessagesToMwaFormat(msgs) {
  /** @type {ReturnType<typeof signMessagesToMwaFormat>} */
  const res = {
    addresses: [],
    payloads: [],
  };
  for (const { account, message } of msgs) {
    res.addresses.push(uint8ToBase64Ascii(account.publicKey));
    res.payloads.push(uint8ToBase64Ascii(message));
  }
  return res;
}

/**
 * register the solana mobile wallet adapter as a standard wallet
 * @param {SolanaMwaWalletStandardCtorArgs} args
 */
export function registerSolanaMwaWalletStandard(args) {
  /** @type {import("@wallet-standard/base").WalletEventsWindow} */
  const walletEventsWindow = window;
  walletEventsWindow.addEventListener(
    "wallet-standard:app-ready",
    ({ detail: { register } }) => register(new SolanaMwaWalletStandard(args))
  );
}
