# Dominion Extension

Replace the "inbox" page with a game history. You have to leave the lobby to see this page.

## Installation

https://chromewebstore.google.com/detail/dominion-extension/hncfgcengilnhbmpoknamdfebmgjkmcf

## Developer Installation

```bash
git clone git@github.com:sliftist/dominion-ext.git
cd dominion-ext
yarn install
yarn build
```
Then load in Chrome:
- Go to `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked" 
- Select the `extension` folder

## Development

Run `yarn watch` to automatically rebuild when source files change.