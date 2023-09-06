# solana-mwa-wallet-standard

Register the [Solana mobile wallet adapter](https://github.com/solana-mobile/mobile-wallet-adapter) as a [wallet-standard standard wallet](https://github.com/wallet-standard/wallet-standard) with [solana features](https://github.com/solana-labs/wallet-standard/tree/master/packages/core/features) on `window`

## Usage

Import and call the `registerSolanaMwaWalletStandard` function

```js
import { registerSolanaMwaWalletStandard } from "solana-mwa-wallet-standard";

registerSolanaMwaWalletStandard({
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
