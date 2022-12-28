# check-package-manager

## Install

```shell
npm i check-package-manager -D
```

## Usage

```sh
check-package-manager [options] [packageManager]
```

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
    "preinstall": "check-package-manager"
  }
}
```

Specify the package manager name and version yourself:

```json
{
  "name": "YOUR-PACKAGE-NAME",
  "version": "1.0.0",
  "scripts": {
    "preinstall": "check-package-manager npm@9.2.0"
  }
}
```

Specify only the package manager name:

```json
{
  "name": "YOUR-PACKAGE-NAME",
  "version": "1.0.0",
  "scripts": {
    "preinstall": "check-package-manager yarn"
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
