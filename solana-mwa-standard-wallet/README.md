# solana-mwa-standard-wallet

Register the [Solana mobile wallet adapter](https://github.com/solana-mobile/mobile-wallet-adapter) as a [standard wallet](https://github.com/wallet-standard/wallet-standard) with [solana features](https://github.com/solana-labs/wallet-standard/tree/master/packages/core/features) on `window`

## Usage

Import and call the `registerSolanaMwaStandardWallet` function

```js
import { registerSolanaMwaStandardWallet } from "solana-mwa-standard-wallet";

registerSolanaMwaStandardWallet({
  name: "my dapp",
  uri: "your-dapp.com",
  icon: "favicon.ico",
});
```

The mobile wallet adapter will be registered as a standard wallet:

```js
import { getWallets } from "@wallet-standard/app";
const { get } = getWallets();
const allWallets = get(); // the mobile wallet adapter should be a part of `allWallets`
```
