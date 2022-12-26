# check-package-manager

## Install

```shell
npm i check-package-manager -D
```

## Usage

```json
{
  "name": "YOUR-PACKAGE-NAME",
  "version": "1.0.0",
  "packageManager": "pnpm@7.19.0",
  "scripts": {
    "preinstall": "check-package-manager"
  }
}
```

## Local development

```
npx corepack enable
pnpm install
pnpm build
```
