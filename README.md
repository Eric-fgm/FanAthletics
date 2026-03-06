<!--![Logo](images/FanAthletics_logo.png)-->
<p align="center">
  <img src="images/FanAthletics_logo.png" width="70%"/>
</p>

## About the project
***FanAthletics*** is a mobile and web application for following athletics competitions and competing in fantasy sports games related to them. Fans can build up their own teams of real athletes, gain points based on their performance and compete in rankings with other players and AI rival. Moreover, they can keep track of all the action happening during the competition.

## What can you do?

We distinguish between two types of users: *fans/players* and *administrators*. Here is what they can do:

👑 **Administrators:**
* create athletics events that gather the data from external APIs,
* manage events, athletes and disciplines,
* create fantasy games.

👥 **Fans/players:** *a fan becomes a player when they join the game by creating a team*
* 🍿 **Fans:**
  * check the schedule of the event,
  * keep track of the results of competitions,
  * browse disciplines and athletes info (including personal records and season bests).  
* 🏆 **Players:**
  * create teams composed of real athletes,
  * modify the teams between sessions of the event,
  * compete in leaderboards with other players and AI rival.

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

To start scraper server:

```sh
pnpm dev:scrap
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
- `scraper`: a [python](https://www.python.org/) scraper build with [Express](https://expressjs.com/)

`api` and `platform` packages/apps are 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This repository has some additional tools already setup for you:

- [Expo](https://docs.expo.dev/) for native development
- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [Biome](https://biomejs.dev/) for code formatting
