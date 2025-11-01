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


### 0Auth
### **Instruções para configurar localmente**

1. **Cria uma aplicação OAuth no GitHub:**
    - Vai a https://github.com/settings/developers
    - Clica em **"New OAuth App"**
    - Preenche:
        - **Homepage URL:** `http://localhost:5053`
        - **Authorization callback URL:** `http://localhost:5053/signin-github`
    
    ![image.png](attachment:ba560ab9-f3d7-4524-a871-708cc7b0c714:image.png)
    
2. **Depois de criares a app, copia:**
    - `Client ID`
    - `Client Secret`
3. **No terminal, dentro da pasta do backend (`GitDashBackend`), corre:**
    
    ```bash
    dotnet user-secrets init
    dotnet user-secrets set "GitHub:ClientId" "O_TEU_CLIENT_ID"
    dotnet user-secrets set "GitHub:ClientSecret" "O_TEU_CLIENT_SECRET"
    
    ```
    
4. **Executa o backend:**
    
    ```bash
    dotnet run
    ```
    
    O servidor deverá iniciar em `http://localhost:5053`.
    
5. **Acede à rota:**
    
    ```
    http://localhost:5053/login
    ```
    
    Isto redireciona-te para o GitHub para fazer login.
    

---

### **Notas importantes**

- **Não incluir `ClientId` nem `ClientSecret` no código ou no `appsettings.json`!**
- As credenciais devem ser sempre configuradas via `dotnet user-secrets`.
- Cada developer deve criar as suas próprias credenciais no GitHub Developer Settings.

---

### **Checklist**

- [x]  OAuth configurado com GitHub
- [x]  Autenticação funcional em ambiente local
- [x]  Segredos armazenados de forma segura
- [x]  Instruções adicionadas

## License

This project is licensed under the MIT License. See the LICENSE file for details.
