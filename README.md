# ADS-Grupo_PosLaboral-A
Projeto académico da unidade curricular de Arquitetura e Desenho de Software.

# 🌐 Full Stack Monorepo Project

This is a full-stack monorepo project consisting of:

- **Frontend**: [Vue.js](https://vuejs.org/) app located in `packages/frontend`
- **Backend**: [.NET Core](https://dotnet.microsoft.com/) API located in `packages/backend`

## 📁 Project Structure
```
/
|-- packages/
|  |-- frontend/
│  |-- backend/
|-- docker-compose.yml
|-- .gitignore
|-- LICENSE
|-- README.md
```

## 🚀 Getting Started

### 🧰 Prerequisites

- Node.js (18+)
- .NET SDK (9.0 or later)
- (Optional) Docker and Docker Compose

## 📦 Installation (Manual)

### Frontend (Vue.js)

```bash
cd packages/frontend
npm install
```
### Backend (.NET Core)

```bash
cd packages/backend
dotnet restore
```

## 🧪 Running the Apps (Manually)

### Start Frontend (Vue.js)

```bash
cd packages/frontend
npm run dev
```
By default, it runs on: http://localhost:5173

### Start Backend (.NET Core)

```bash
cd packages/backend
dotnet run
```
By default, it runs on: http://localhost:5000 or https://localhost:5001

## 🐳 Running the Stack with Docker

This project includes a docker-compose.yml file that spins up the frontend, backend, PostgreSQL, and Redis containers.

### 1. Build and start all containers

```bash
docker compose up --build
```

This command will:

* Build the frontend (Vue.js) image

* Build the backend (.NET Core) image

* Start PostgreSQL and Redis using official images

* Network all services together for local communication

### 2. Run in detached mode (optional)

If you want the containers to run in the background:

```bash
docker compose up --build -d
```

### 3. Stop the containers

```bash
docker compose down
```

### 4. View logs

You can see logs from all services with:

```bash
docker compose logs -f
```


Or for a specific service:

```bash
docker compose logs backend
```

### 5. Access the apps

Once everything is running:

* Frontend (Vue.js) → http://localhost:8080

* Backend (.NET Core API) → http://localhost:5000

* PostgreSQL → available at postgres:5432 inside Docker network

* Redis → available at redis:6379 inside Docker network

### 🧹 Cleanup

To remove all containers, networks, and volumes created by the stack:

```bash
docker compose down -v
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.
