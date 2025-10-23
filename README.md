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

- Backend configuration is located in `backend/src/main/resources/application.properties`.
- Frontend configuration is managed via environment variables in the `.env` file located in the `frontend/` directory.

In frontend you need to create a .env file based on the .env.example file.
    - Copy the `.env.example` file to `.env`.
    - Update the `VITE_BACKEND_URL` and `VITE_PORT` variables as needed.

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
