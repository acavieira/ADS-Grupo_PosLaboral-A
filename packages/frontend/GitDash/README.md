# GitDash Client


## Project Setup


```sh
npm install
```


### Compile and Hot-Reload for Development


```sh
npm run dev
```


### Type-Check, Compile and Minify for Production


```sh
npm run build
```


### Run Unit Tests with [Vitest](https://vitest.dev/)


```sh
npm run test:unit
```



### Lint with [ESLint](https://eslint.org/)


```sh
npm run lint
```

### Documentation

We use TypeDoc for this project. To generate and view the docs locally:

1. Run: `npm run doc`
2. Open `docs/index.html` in your browser.

## Packages Overview


### `@git-dash/ui` — UI Components


Reusable Vue 3 + Vuetify components.  
Each component should keep its **code, test, and Storybook story in one folder**.


**Example structure**


```
packages/ui/
  src/
    components/
      BaseButton/
        BaseButton.vue
        BaseButton.stories.ts
        BaseButton.spec.ts
        index.ts              # export * from './BaseButton.vue'
    index.ts                  # export { BaseButton } from './components/BaseButton'
```


**Run Storybook**


```bash
npm run storybook:ui          # Dev mode @ http://localhost:6006
npm run build-storybook:ui    # Builds static Storybook site
```


**Run tests (UI)**


```bash
npm run test:ui       # watch mode
npm run test:run:ui   # single run (CI)
```


---


### `@git-dash/core` — Reusable Logic & Code


Contains reusable composables, API clients, and other non-visual logic.  
Each feature should live in its own folder with both code and test files.


**Example structure**


```
packages/core/
  src/
    utils/
      createApiClient/
        createApiClient.ts
        createApiClient.spec.ts
        index.ts
    index.ts                   
```


**Run tests (Core)**


```bash
npm run test -w packages/core      # watch mode
npm run test:run -w packages/core  # single run
```


### Build Process


The build command compiles both reusable packages (`@git-dash/core` and `@git-dash/ui`) and the main application.  
Each package is built first into its own `dist/` folder using Vite’s library mode.  
The main app then consumes those prebuilt outputs as dependencies for a consistent production bundle.


```bash
npm run build
```


---


### Development Mode


In development (`npm run dev`), the main app directly aliases the local source code of the packages (`packages/core/src` and `packages/ui/src`).  
This means any changes in those packages are immediately reflected in the app without rebuilding — ideal for rapid iteration across all workspaces.


```bash
npm run dev
```


---


## Example Imports


Use the packages in the main app as follows:


```ts
import { useToggle, createApiClient } from '@git-dash/core'
import { BaseButton } from '@git-dash/ui'
```


---
