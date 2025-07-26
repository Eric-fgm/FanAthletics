# FanAthletics

## How to use

Run the following command:

```sh
pnpm install
```

```sh
pnpm prepare
```

```sh
docker compose up
```

To start API server:

```sh
pnpm dev:api
```

To start Web App:

```sh
pnpm dev:web
```

To start iOS App:

```sh
pnpm dev:ios
```

To reset Database:

```sh
cd packages/database
pnpm db:reset
```

## What's inside?

This repository includes the following packages/apps:

### Apps and Packages

- `api`: a [node.js](https://nodejs.org/) app built with
  [Hono](https://hono.dev/)
- `platform`: a [react-native](https://reactnative.dev/) app built with
  [expo](https://docs.expo.dev/)

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This repository has some additional tools already setup for you:

- [Expo](https://docs.expo.dev/) for native development
- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [Biome](https://biomejs.dev/) for code formatting
