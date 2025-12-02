# Conduite_de_projet_2O25_Dev

This repository contains the source code for the Conduite de Projet 2025 development project. It includes both the backend and frontend components of the application.

## 📐 Project Structure

- [backend](./backend/): Contains the Spring Boot backend application.
- [frontend](./frontend/): Contains the Vue.js frontend application.

## 📋 Prerequisites

- Java 21 or higher
- Maven
- Node.js and npm

## ⚙️ Project Configuration

### Backend
1. Copy `backend/.env.example` to `backend/.env`
2. Update the environment variables:
   - **POSTGRES_PASSWORD**: Choose a strong password
   - **JWT_SECRET_KEY**: Generate a new secret key (see below)
   - **API_DOCS_ENABLED**: For development set it to `true`
   - Other variables as needed
3. Export

#### Generate a secure JWT secret key

```bash
openssl rand -base64 32
```

### Frontend
1. Copy `frontend/.env.example` to `frontend/.env`
2. Update `VITE_BACKEND_URL` and `VITE_PORT` as needed

### Commit Hooks

Execute `git config core.hooksPath hooks` in this repository to adjust the path of the git hooks directory.

Make hooks in the [hooks](./hooks/) folder executable by running `chmod +x <path to hook>` on all hooks.

### Linting

For the backend install SonarQube in your IDE/Editor to give you linting suggestions.

For the frontend, ESLint is already configured. You can run the linter using:

```bash
npm run lint
```

### Formatting

For the backend, Maven Spotless is configured. 
If you don't want to use the IDE setup, you can format the code using:

```bash
mvn spotless:apply
```

### IDE Setup

#### VSCode

1. Install [Run On Save](https://marketplace.visualstudio.com/items?itemName=emeraldwalk.RunOnSave) plugin
2. Add the following code to [.vscode/settings.json](.vscode/settings.json). This will update all Java code on save.

```
{
  "editor.formatOnSave": true,
  "[java]": {
    "editor.formatOnSave": false,
    "editor.codeActionsOnSave": {
      "source.organizeImports": "never"
    }
  },
  "emeraldwalk.runonsave": {
    "commands": [
      {
        "match": ".*\\.java$",
        "cmd": "cd backend && mvn spotless:apply -DspotlessFiles=\"${file}\"",
        "runIn": "terminal"
      }
    ]
  }
}
```

#### IntelliJ

1. Install [Google Java Format](https://plugins.jetbrains.com/plugin/8527-google-java-format) plugin
2. Setup by following these [steps](https://github.com/google/google-java-format?tab=readme-ov-file#intellij-jre-config)
3. In the IntelliJ settings under [google java format settings](jetbrains://idea/settings?name=google-java-format+Settings) set `Default Google Java Style` and not `AOSP`.

## ▶️ Running the Application

### Running using Docker

Execute `docker compose up --build -d` in the root directory of the project. This will start the docker containers for the frontend and backend. These containers use the same default ports as described above.

To stop the docker containers execute `docker compose down -v`.

### Backend

1. Start the application and database using

```bash
docker compose up --build database backend
```

The backend will start on the port specified in `application.properties` (default is 8080).

### Frontend

1. Navigate to the `frontend/` directory.
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will start on the port specified in the `.env` file (default is 5173).


### Database

To start the database run the following command.

```bash
docker compose up --build database
```

## 🧪 Testing

### Frontend Tests

The frontend uses Vitest with Vue Test Utils for unit testing.

#### Running Tests

```bash

# Mode watch (recommended during development)
npm test

# Run all tests once
npm run test:run

# UI interface for tests
npm run test:ui

# Generate coverage report
npm run test:coverage
```

The frontend will start on the port specified in the `.env` file (default is 5173).

### Backend Tests

To run the backend tests, either run them using IntelliJ or VSCode or run them from the command line using the following command.

```bash
mvn verify
```

### GitHub Workflows

We execute all tests for all pull requests and for every push on main (see [workflows directory](.github/workflows/)).

## 🚀 Deployment

### Initial Setup of VM

1. Create VM on a cloud provider. We use Azure and all following steps will use Hetzner Cloud. Setup ssh key during VM creation.

3. Connect via SSH

3. Apt Update and Upgrade

```bash
sudo apt update
sudo apt upgrade
```

4. [Install Docker and Docker Compose](https://docs.docker.com/engine/install/ubuntu/)

5. Clone repository

```bash
git clone https://github.com/Tourlat/Conduite_de_projet_2025_Dev.git
```

6. Setup backend `.env`

### Deployment of new Version

1. Checkout out repository on version that should be released/deployed

2. Start application

```bash
sudo docker compose up --build -d
```

## 📚 Documentation 

###  Frontend Documentation

The frontend documentation is generated using TypeDoc. To generate the documentation, run the following command in the `frontend/` directory:

```bash
npm run doc
```

The generated documentation will be available in the `frontend/docs/gen` directory.

A view of the project architecture can be found in [frontend/docs/architecture.md](frontend/docs/architecture.md).

In this file, you can find an overview of the main components and their interactions within the frontend application.

### Backend Documentation

The documentation of the backend endpoints can be found as OpenAPI specification under [backend/docs/openapi.json](backend/docs/openapi.json).

To regenerate the OpenAPI specification execute the following command. Make sure that the environment varilable `API_DOCS_ENABLED` is set to `true` in [.env](backend/.env) and the application is running.

```bash
mvn -DskipTests springdoc-openapi:generate
```

To access the swagger documentation start the backend application and go to the following URL in the browser.

```
http://localhost:8080/swagger-ui/index.html
```

Furthermore, the database schema can be found in [backend/docs/database-schema.md](backend/docs/database-schema.md). 
You can also find a .sql file descirbing our database in [backend/docs/schema.sql](backend/docs/schema.sql). To regenerate this file file, follow the following commands.

Launch the database container:
```bash
docker compose up -d database backend
```

Then run the following command to generate the schema:
```
docker exec -i $(docker compose ps -q database) pg_dump -U admin -d conduitedeprojet_db --schema-only > backend/docs/schema.sql
```
