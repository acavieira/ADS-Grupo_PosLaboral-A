

# ADS-Grupo_PosLaboral-A

Academic project for the Software Architecture and Design course.

# 🌐 Full Stack Monorepo Project

This is a full-stack monorepo project consisting of:

- **Frontend**: [Vue.js](https://vuejs.org/) app located in `packages/frontend`
- **Backend**: [.NET Core](https://dotnet.microsoft.com/) API located in `packages/backend`

## 📁 Project Structure

```
/
|-- packages/
|  |-- frontend/
|  |-- backend/
|-- docker-compose.yml
|-- .gitignore
|-- LICENSE
|-- README.md
```

## 🚀 Quick Start (Recommended: Docker Compose)

### 🧰 Prerequisites

- Docker and Docker Compose
- (Optional for manual run) Node.js (18+) and .NET SDK (9.0 or later)

### 🐳 Run Everything with Docker Compose

1. Build and start all containers:
    ```bash
    docker compose up --build
    ```
    This will:
    - Build the frontend (Vue.js) image
    - Build the backend (.NET Core) image
    - Start PostgreSQL and Redis using official images
    - Network all services together for local communication

2. (Optional) Run in detached mode:
    ```bash
    docker compose up --build -d
    ```

3. Stop the containers:
    ```bash
    docker compose down
    ```

4. View logs:
    ```bash
    docker compose logs -f
    ```
    Or for a specific service:
    ```bash
    docker compose logs backend
    ```

5. Access the apps:
    - Frontend (Vue.js): http://localhost:8080
    - Backend (.NET Core API): http://localhost:5000
    - PostgreSQL: available at postgres:5432 inside Docker network
    - Redis: available at redis:6379 inside Docker network

6. Cleanup (remove all containers, networks, and volumes):
    ```bash
    docker compose down -v
    ```

---

## 🧪 How to Run Tests and other useful scripts

### Backend Tests (.NET Core)

1. Open a terminal in the backend test project folder:
    ```bash
    cd packages/backend/GitDashBackend.Tests
    ```
2. Run all tests and generate a test report:
    ```bash
    dotnet test --logger "trx;LogFileName=test-results.trx"
    ```
    - This will execute all unit tests for the backend and generate a test report in TRX format (see the output directory for the file `test-results.trx`).
    - You can also run this from the root of the backend with:
      ```bash
      dotnet test --logger "trx;LogFileName=test-results.trx"
      ```

### Frontend Scripts (GitDash)

1. Open a terminal in the GitDash folder:
    ```bash
    cd packages/frontend/GitDash
    ```

2. Run unit tests:
    ```bash
    npm run test:unit
    ```
    - This will execute the standard unit tests using Vitest.

3. Generate test coverage report:
    ```bash
    npm run test:unit:coverage
    ```
    - This runs the tests and displays a coverage summary in the console. It also generates a detailed HTML report (located in the `coverage` folder) so you can view it in your browser.

4. Run Storybook:
    ```bash
    npm run storybook:ui
    ```
    - This starts the Storybook documentation for the UI workspace.

5. Generate code documentation:
    ```bash
    npm run doc
    ```
    - This generates technical documentation using TypeDoc. You will see the results in the generated documentation folder.

---

## 📦 Manual Run (Optional)

If you prefer to run the apps manually (without Docker):

### Frontend (Vue.js)
```bash
cd packages/frontend/GitDash
npm install
npm run dev
```
By default, it runs at: http://localhost:5173

### Backend (.NET Core)
```bash
cd packages/backend
dotnet restore
dotnet run
```
By default, it runs at: http://localhost:5000 or https://localhost:5001

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.
