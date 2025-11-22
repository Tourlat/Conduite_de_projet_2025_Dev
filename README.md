# Conduite_de_projet_2O25_Dev

This repository contains the source code for the Conduite de Projet 2025 development project. It includes both the backend and frontend components of the application.

## Project Structure

- `backend/`: Contains the Spring Boot backend application.
- `frontend/`: Contains the Vue.js frontend application.

## Prerequisites

- Java 21 or higher
- Maven
- Node.js and npm

## Configuration

### Backend
1. Copy `backend/.env.example` to `backend/.env`
2. Update the environment variables:
   - **POSTGRES_PASSWORD**: Choose a strong password
   - **JWT_SECRET_KEY**: Generate a new secret key (see below)
   - Other variables as needed

#### Generate a secure JWT secret key:
```bash
openssl rand -base64 32
```

### Frontend
1. Copy `frontend/.env.example` to `frontend/.env`
2. Update `VITE_BACKEND_URL` and `VITE_PORT` as needed


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

## Running the Application

### Backend

1. Navigate to the `backend/` directory.
2. Launch the Spring Boot application using Maven:
   ```bash
   mvn spring-boot:run
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

## Testing

### Frontend Tests

The frontend uses Vitest with Vue Test Utils for unit testing.

### Running Tests

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

### Database

To start the database run the following command.

```
docker compose up --build database
```

### Running using Docker

Execute `docker compose up --build -d` in the root directory of the project. This will start the docker containers for the frontend and backend. These containers use the same default ports as described above.

To stop the docker containers execute `docker compose down -v`.

## Deployment

### Initial Setup of VM

1. Create VM on a cloud provider. We use Azure and all following steps will use Azure. Follow this [tutorial](https://learn.microsoft.com/en-us/azure/virtual-machines/windows/quick-create-portal) to create an Azure VM.

2. Download VM private key from Azure. Move key to `~/.ssh` folder.

3. Connect via SSH

```
ssh -i ~/.ssh/<key name>.pem azureuser@<VM public IP>
```

3. Apt Update and Upgrade

```
sudo apt update
sudo apt upgrade
```

4. Install Docker and Docker Compose

```
sudo apt install docker.io
sudo apt install docker-compose-plugin
```

5. Clone repository

```
git clone https://github.com/Tourlat/Conduite_de_projet_2025_Dev.git
```

### Deployment of new Version

1. Checkout out repository on version that should be released/deployed

2. Start application

```
sudo docker-compose up --build -d
```

## Documentation

###  Frontend Documentation

The frontend documentation is generated using TypeDoc. To generate the documentation, run the following command in the `frontend/` directory:

```bash
npm run doc
```

The generated documentation will be available in the `frontend/docs/gen` directory.

### Backend Documentation
