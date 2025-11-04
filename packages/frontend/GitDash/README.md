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


### Run End-to-End Tests with [Playwright](https://playwright.dev)


```sh
# Install browsers for the first run
npx playwright install


# When testing on CI, must build the project first
npm run build


# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```


### Lint with [ESLint](https://eslint.org/)


```sh
npm run lint
```


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
    composables/
      useToggle/
        useToggle.ts
        useToggle.spec.ts
        index.ts
    utils/
      createApiClient/
        createApiClient.ts
        createApiClient.spec.ts
        index.ts
    index.ts                        # export * from './composables'; export * from './utils'
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


## Using NVM on Windows


This guide explains how to install and use **Node Version Manager (NVM)** on Windows.
Currently project uses Node 24.x.


### 1. Remove Existing Versions of Node.js


Before installing NVM, uninstall any existing Node.js installations:


- Open **Control Panel** → **Programs** → **Programs and Features**.
- Find **Node.js** in the list, right-click it, and choose **Uninstall**.


### 2. Download and Install NVM


Download the Windows NVM installer (nvm-setup.exe) from [this link](https://github.com/coreybutler/nvm-windows/releases) and run the setup. Follow the on-screen instructions to complete the installation.


### 3. Verify the Installation


Open **Command Prompt** or **PowerShell** and run:


```bash
nvm version
```


If NVM is installed correctly, it will display the installed NVM version.


### 4. Basic Commands


Here are some commonly used NVM commands on Windows:


```bash
# Install a specific version of Node.js
nvm install <version>

# Use a specific version of Node.js
nvm use <version>

# List installed Node.js versions
nvm list

# List all available Node.js versions to install
nvm list available

# Uninstall a specific Node.js version
nvm uninstall <version>
```


### 5. More Information


For a full guide on using Node.js and NVM on Windows, see [Microsoft’s documentation](https://learn.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-windows).



