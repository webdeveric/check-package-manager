# check-package-manager

[![Node.js CI](https://github.com/webdeveric/check-package-manager/actions/workflows/node.js.yml/badge.svg)](https://github.com/webdeveric/check-package-manager/actions/workflows/node.js.yml)

Check that the correct package manager is being used with your project.

To configure the correct package manager, you can use the [`packageManager` property](https://nodejs.org/api/packages.html#packagemanager) in your `package.json` file or you can specify it in the cli arguments.

:information_source: This package requires **Node >= `16.17`**. If you use an older Node version, the cli will exit and print a warning.

## Install

```shell
npm i check-package-manager -D
```

:information_source: You can use `npx check-package-manager [options]` in your `preinstall` script if you don't want to add it as a dependency.

## Usage

```sh
check-package-manager [options] [packageManager]
```

:information_source: Depending on the package manager being used, the `preinstall` script may get invoked after dependencies are installed.

### Arguments

`packageManager` (optional) - `<package manager name>[@<version>]`

### Options

`--info` - Print info messages

`--debug` - Print debug messages

## Examples

When using [corepack](https://nodejs.org/api/corepack.html):

```json
{
  "name": "YOUR-PACKAGE-NAME",
  "version": "1.0.0",
  "packageManager": "pnpm@7.19.0",
  "scripts": {
    "preinstall": "npx check-package-manager"
  }
}
```

Specify the package manager name and version yourself:

```json
{
  "name": "YOUR-PACKAGE-NAME",
  "version": "1.0.0",
  "scripts": {
    "preinstall": "npx check-package-manager npm@9.2.0"
  }
}
```

Specify only the package manager name:

```json
{
  "name": "YOUR-PACKAGE-NAME",
  "version": "1.0.0",
  "scripts": {
    "preinstall": "npx check-package-manager yarn"
  }
}
```

## Local development

```
nvm use
corepack enable
npm ci
npm run build
```
