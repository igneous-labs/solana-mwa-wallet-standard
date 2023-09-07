import { binary_to_base58 as binaryToBase58 } from "base58-js";
import {
  defineCustomElement,
  WALLET_CONNECTED_EVENT_TYPE,
  WALLET_DISCONNECTED_EVENT_TYPE,
} from "wallet-standard-list";
import { registerSolanaMwaWalletStandard } from "solana-mwa-wallet-standard";

/** @type {import("wallet-standard-list").WalletStandardList} */ // @ts-ignore
const WALLET_STANDARD_LIST = document.querySelector("wallet-standard-list");

/** @type {HTMLSpanElement} */ // @ts-ignore
const CONNECTED_WALLET_SPAN = document.getElementById("connected-wallet");

/** @type {HTMLSpanElement} */ // @ts-ignore
const FIRST_ACCOUNT_SPAN = document.getElementById("first-account");

/** @type {HTMLButtonElement} */ // @ts-ignore
const STAKE_BUTTON = document.getElementById("stake-button");

/** @type {HTMLButtonElement} */ // @ts-ignore
const SIGN_STAKE_BUTTON = document.getElementById("sign-stake-button");

/** @type {HTMLButtonElement} */ // @ts-ignore
const SIGN_MSG_BUTTON = document.getElementById("sign-msg-button");

/** @type {HTMLButtonElement} */ // @ts-ignore
const DISCONNECT_BUTTON = document.getElementById("disconnect-button");

/** @type {HTMLSpanElement} */ // @ts-ignore
const EVENTS_HEARD_SPAN = document.getElementById("events-heard");

let offWalletChange = null;

function base64ToUint8Ascii(asciiStr) {
  return Uint8Array.from(atob(asciiStr), (c) => c.charCodeAt(0));
}

function uint8ToBase64Ascii(asciiUint8Array) {
  return btoa(String.fromCharCode(...asciiUint8Array));
}

async function stake() {
  const wallet = WALLET_STANDARD_LIST.connectedWallet;
  const account = wallet.accounts[0];
  const user = account.address;
  const url = `https://stakedex-api.fly.dev/v1/swap?inputMint=So11111111111111111111111111111111111111112&outputMint=LAinEtNLgpmCP9Rvsf5Hn8W6EhNiKLZQti1xfWMLy6X&inAmount=1000000000&user=${user}`;
  const resp = await fetch(url);
  const { tx } = await resp.json();
  const buf = base64ToUint8Ascii(tx);
  const [{ signature }] = await wallet.features[
    "solana:signAndSendTransaction"
  ].signAndSendTransaction({
    chain: "solana:mainnet",
    account,
    transaction: buf,
  });
  alert(`Signature: ${binaryToBase58(signature)}`);
}

async function signStakeTx() {
  const wallet = WALLET_STANDARD_LIST.connectedWallet;
  const account = wallet.accounts[0];
  const user = account.address;
  const url = `https://stakedex-api.fly.dev/v1/swap?inputMint=So11111111111111111111111111111111111111112&outputMint=LAinEtNLgpmCP9Rvsf5Hn8W6EhNiKLZQti1xfWMLy6X&inAmount=1000000000&user=${user}`;
  const resp = await fetch(url);
  const { tx } = await resp.json();
  const buf = base64ToUint8Ascii(tx);
  const [{ signedTransaction }] = await wallet.features[
    "solana:signTransaction"
  ].signTransaction({
    account,
    transaction: buf,
  });
  const signedTxb64 = uint8ToBase64Ascii(signedTransaction);
  alert(`Signed Tx: ${signedTxb64}`);
  // EVENTS_HEARD_SPAN.innerText = signedTxb64;
}

async function signMsg() {
  const wallet = WALLET_STANDARD_LIST.connectedWallet;
  const account = wallet.accounts[0];
  const [{ signedMessage, signature }] = await wallet.features[
    "solana:signMessage"
  ].signMessage({
    account,
    message: new TextEncoder().encode("test message"),
  });
  alert(
    `signed msg: ${new TextDecoder().decode(
      signedMessage
    )}. Signature: ${signature}`
  );
}

// TODO: this will not fire right now since:
// - on() is called after change is emitted during connect()
// - off() is called before change is emitted during disconnect()
function onWalletChange(properties) {
  EVENTS_HEARD_SPAN.innerText = JSON.stringify(properties);
}

registerSolanaMwaWalletStandard({
  name: "solana-mwa-wallet-standard test dapp",
});
defineCustomElement();

window.addEventListener(
  WALLET_CONNECTED_EVENT_TYPE,
  // @ts-ignore
  ({ detail: wallet }) => {
    CONNECTED_WALLET_SPAN.innerText = wallet.name;
    FIRST_ACCOUNT_SPAN.innerText = wallet.accounts[0].address;
    for (const btnToEnable of [
      STAKE_BUTTON,
      DISCONNECT_BUTTON,
      SIGN_STAKE_BUTTON,
      SIGN_MSG_BUTTON,
    ]) {
      btnToEnable.removeAttribute("disabled");
    }
    offWalletChange = null;
    offWalletChange = wallet.features["standard:events"].on(
      "change",
      onWalletChange
    );
  }
);

window.addEventListener(WALLET_DISCONNECTED_EVENT_TYPE, () => {
  CONNECTED_WALLET_SPAN.innerText = "None";
  FIRST_ACCOUNT_SPAN.innerText = "None";
  for (const btnToDisable of [
    STAKE_BUTTON,
    DISCONNECT_BUTTON,
    SIGN_STAKE_BUTTON,
    SIGN_MSG_BUTTON,
  ]) {
    btnToDisable.setAttribute("disabled", "1");
  }
  offWalletChange();
  offWalletChange = null;
  EVENTS_HEARD_SPAN.innerText = "";
});

DISCONNECT_BUTTON.onclick = () => {
  WALLET_STANDARD_LIST.disconnect();
};

STAKE_BUTTON.onclick = stake;
SIGN_STAKE_BUTTON.onclick = signStakeTx;
SIGN_MSG_BUTTON.onclick = signMsg;
