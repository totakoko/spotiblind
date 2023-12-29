# Development

## Installation

Prerequisites:

- [Node](https://nodejs.org/) >= 14
- [pnPm](https://pnpm.io/installation) 6.x

First, install all the dependencies.

```sh
pnpm install
```

Finally start the development server.

```sh
npm start
```

## Lint

[ESLint](https://eslint.org/) is used to check the code.

Run the linter (ESLint):

```sh
npm run lint
```

## Tests

No tests yet!

## Build

```sh
npm run build
```

## GitHub Actions

- Branch _main_ is protected against force-push.
- Secrets were defined in [Actions secrets](https://github.com/totakoko/spotiblind/settings/secrets/actions):
  - DOCKERHUB_USERNAME
  - DOCKERHUB_TOKEN
  - SSH_HOST
  - SSH_PORT
  - SSH_USER
  - SSH_FINGERPRINT
  - SSH_PRIVATE_KEY
