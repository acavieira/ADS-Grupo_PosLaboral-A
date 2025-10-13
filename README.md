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
|  |-- frontend/ # Vue.js project
│  |-- backend/ # .NET Core project
|--.gitignore
|-- LICENSE
|-- README.md
```

## 🚀 Getting Started

### 🧰 Prerequisites

- Node.js (18+)
- .NET SDK (9.0 or later)
- (Optional) Docker

## 📦 Installation

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

## 🧪 Running the Apps

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

## License

This project is licensed under the MIT License. See the LICENSE file for details.
