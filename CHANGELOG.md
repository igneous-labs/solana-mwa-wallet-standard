# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2023-09-18

### Changed

- Removed `browser` from `package.json` to only use `exports` as suggested by publint

## [0.2.0] - 2023-09-18

### Breaking

- Changed package.json exports to be browser only

### Changed

- Bound `wallet-standard:app-ready` listener so that repeated calls to `registerSolanaMwaWalletStandard()` wont register multiple listeners

## [0.1.1] - 2023-09-05

### Added

- types

## [0.1.0] - 2023-09-05

Initial release
