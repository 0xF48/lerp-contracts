### The Lerp Mission

Lerp stands for linear interpolation, that is our motto. Whatever we build, we improve and iterate at a steady rate. Lerp is a particle simulation engine and platform designed to rapidly build and prototype complex collision particle sim games. We envision a seamless platform to play, build, and test other-life particle sim worlds with your friends and players around the world. We built our high performance engine and platform from the ground up to connect players in the most seamless, organic, and dynamic way possible while also designing the foundation required to enable the most interesting and unique games to be built on top of our platform. We have a very big vision of the amazing and enabling future we want to create for the world and would like you to be an active part of it!

-----

### How The Lerp Found Token Works

When a new realm is announced, it is added to the dash and the stake option will be available. You will be able to lock your acquired LFT Tokens into the realm, your profit is your stake amount divided by the total amount staked for the realm and multiplied by a fixed profit cap ranging from 50 to 100% which is set during the initial game annnouncment, this is the max amount of % of each transaction that token holders control. 10-40% is typically needed for development and maintenance. But this number depends on what type of realm it is, a high percentage means that stakers are highly vested and able to host nodes for that realm, etc. lower percentage means that it is more internally managed

```you dividend = [transaction amount] x [your_stake / total_stake] x [static_profit_cap]```

When a player makes an in-game transaction to purchase erc1155 assets \(abilities, skins, tokens, whatever\), profits of that transaction will be able to be claimed by account. until they decide to withdraw or re-stake. If more people stake into the game, your returns will diminish unless you stake more.


-----

### Refund Policy

When you purchase a new token from the dash you are eligible for a refund within 48 hours.


-----

### Our Future

As the lerp engine evolves, we plan to introduce more creative tools within the game engine that will enable both our team and eventually other players to create their own particle sim minigames on top of the platform using a powerful ai assisted graph editor, which is already in the works and will be officially announced. Using the token distribution mechanism, we can bootstrap more games and further engine development in a streamlined and transparent way.

------







# Turborepo starter **OLD README**

This Turborepo starter is maintained by the Turborepo core team.

## Using this example

Run the following command:

```sh
npx create-turbo@latest
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo
pnpm dev
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turbo.build/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/docs/reference/configuration)
- [CLI Usage](https://turbo.build/docs/reference/command-line-reference)
