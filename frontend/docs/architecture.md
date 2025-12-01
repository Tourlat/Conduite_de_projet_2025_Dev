# Frontend Architecture - Vue.js 3

This document describes the architecture of the frontend application built with Vue.js 3 and TypeScript.

## Table of Contents

1. [Overview](#overview)
2. [Layered Architecture](#layered-architecture)
3. [Folder Structure](#folder-structure)
4. [Data Flow](#data-flow)
5. [Routing](#routing)
6. [Main Components](#main-components)

---

## Overview

The application uses a layered architecture with clear separation of concerns:
- **View (Components)**: User interface and presentation logic
- **Store (Global State)**: Reactive shared state management
- **Services**: Communication with the backend API
- **Router**: Navigation and authentication guards
- **Utils**: Utility functions (headers, localStorage)

```mermaid
graph TB
    subgraph "Frontend Application"
        User[👤 User]
        
        subgraph "View Layer"
            Components[Vue Components<br/>*.vue files]
        end
        
        subgraph "State Layer"
            AuthStore[authStore<br/>Authentication]
            ProjectStore[projectStore<br/>Projects]
            ReleaseStore[releaseStore<br/>Releases]
            TestStore[testStore<br/>Tests]
        end
        
        subgraph "Service Layer"
            AuthService[authService]
            ProjectService[projectService]
            UserService[userService]
            DocService[documentationService]
            ReleaseService[releaseService]
            TestService[testService]
        end
        
        subgraph "Utilities"
            Router[Vue Router<br/>Navigation]
            Utils[Utils<br/>headers, localStorage]
        end
        
        Backend[🌐 Backend API<br/>Spring Boot]
    end
    
    User --> Components
    Components --> AuthStore
    Components --> ProjectStore
    Components --> ReleaseStore
    Components --> TestStore
    Components --> Router
    
    AuthStore --> AuthService
    ProjectStore --> ProjectService
    ProjectStore --> UserService
    ReleaseStore --> ReleaseService
    TestStore --> TestService
    
    Components --> DocService
    
    AuthService --> Utils
    ProjectService --> Utils
    UserService --> Utils
    DocService --> Utils
    ReleaseService --> Utils
    TestService --> Utils
    
    AuthService --> Backend
    ProjectService --> Backend
    UserService --> Backend
    DocService --> Backend
    ReleaseService --> Backend
    TestService --> Backend
    
    Router -.->|Guards| AuthStore
    
    style User fill:#e1f5ff
    style Backend fill:#ffe1e1
    style Components fill:#e8f5e9
    style AuthStore fill:#fff9c4
    style ProjectStore fill:#fff9c4
    style ReleaseStore fill:#fff9c4
    style TestStore fill:#fff9c4
```

---

## Layered Architecture

### Standard Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Component
    participant S as Store
    participant Srv as Service
    participant API as Backend API
    participant LS as LocalStorage
    
    U->>C: Action (click, submit)
    C->>S: Call store method
    S->>Srv: Call service
    Srv->>API: HTTP Request (axios)
    API-->>Srv: Response Data
    Srv-->>S: Return data
    S->>S: Update state
    S-->>C: Reactive state (readonly)
    C-->>U: UI Update (reactive)
    
    opt Persistence
        Srv->>LS: Save token/data
    end
```

### Store Pattern (Reactive Store Pattern)

The stores use a custom reactive pattern:

```typescript
// Private state (reactive)
const state = reactive<State>({ ... })

// Export store with readonly state
export const myStore = {
  state: readonly(state),  // ✅ Read-only for components
  
  async myAction() {
    state.data = newValue  // ✅ Modification only through methods
  }
}
```

---

## Folder Structure

```mermaid
graph LR
    src[src/]
    
    src --> main[main.ts<br/>Entry point]
    src --> App[App.vue<br/>Root component]
    src --> router[router/<br/>routes.ts]
    src --> components[components/]
    src --> stores[stores/]
    src --> services[services/]
    src --> utils[utils/]
    src --> types[types/]
    
    components --> auth[auth/<br/>Login, Register]
    components --> pages[pages/<br/>Dashboard, ProjectDetails]
    components --> projects[projects/<br/>CreateProject, Settings]
    components --> sprints[sprints/<br/>Sprint forms, cards]
    components --> issues[issues/<br/>Issue CRUD]
    components --> tasks[tasks/<br/>Task management]
    components --> releases[releases/<br/>Release management]
    components --> docs[documentation/<br/>Doc viewer]
    components --> testView[testView/<br/>Test playground]
    
    stores --> authStore[authStore.ts]
    stores --> projectStore[projectStore.ts]
    stores --> releaseStore[releaseStore.ts]
    stores --> testStore[testStore.ts]
    
    services --> authService[authService.ts]
    services --> projectService[projectService.ts]
    services --> userService[userService.ts]
    services --> docService[documentationService.ts]
    services --> releaseService[releaseService.ts]
    services --> testService[testservice.ts]
    
    utils --> headers[headers.ts<br/>getHeaders]
    utils --> localStorage[localStorage.ts<br/>token, user data]
    
    style src fill:#e3f2fd
    style components fill:#e8f5e9
    style stores fill:#fff9c4
    style services fill:#fce4ec
    style utils fill:#f3e5f5
```

---

## Data Flow

### Authentication (Login)

```mermaid
sequenceDiagram
    participant U as User
    participant LC as LoginForm.vue
    participant AS as authStore
    participant AuthSrv as authService
    participant API as /api/auth/login
    participant LS as localStorage
    participant R as Router
    
    U->>LC: Enter email/password
    U->>LC: Click "Login"
    LC->>AS: authStore.login(email, password)
    AS->>AuthSrv: authService.login({email, password})
    AuthSrv->>API: POST /api/auth/login
    API-->>AuthSrv: {token, id, email, name}
    AuthSrv->>LS: addDatasInLocalStorage(token, user)
    AuthSrv->>AuthSrv: setAuthToken(token)
    AuthSrv-->>AS: Response data
    AS->>AS: state.token = token
    AS->>AS: state.user = {id, email, name}
    AS->>AS: state.isAuthenticated = true
    AS-->>LC: Success
    LC->>R: router.push('/dashboard')
    R->>R: beforeEach guard
    R-->>U: Redirect to Dashboard
```

### Project Management

```mermaid
sequenceDiagram
    participant U as User
    participant C as CreateProjectForm.vue
    participant PS as projectStore
    participant ProjSrv as projectService
    participant API as /api/projects
    
    U->>C: Fill form
    U->>C: Click "Create"
    C->>PS: projectStore.createProject(data)
    PS->>ProjSrv: projectService.createProject(data)
    ProjSrv->>ProjSrv: getHeaders() for auth
    ProjSrv->>API: POST /api/projects
    API-->>ProjSrv: Project created
    ProjSrv-->>PS: ProjectResponse
    PS->>PS: state.projects.push(response)
    PS-->>C: Success
    C->>C: router.push(`/projects/${id}`)
```

### Loading Project Issues

```mermaid
sequenceDiagram
    participant U as User
    participant PB as ProjectBacklog.vue
    participant ProjSrv as projectService
    participant API as /api/projects/:id/issues
    
    U->>PB: Visit /projects/:id/backlog
    PB->>PB: onMounted()
    PB->>ProjSrv: projectService.getIssues(projectId)
    ProjSrv->>ProjSrv: getHeaders()
    ProjSrv->>API: GET /api/projects/:id/issues
    API-->>ProjSrv: Issue[]
    ProjSrv-->>PB: issues
    PB->>PB: issues.value = response
    PB-->>U: Display issues list
```

---

## Routing

### Route Structure

```mermaid
graph TD
    Root["/ - Root"]
    Auth["/auth - AuthInterface"]
    Login["/login - LoginForm"]
    Register["/register - RegisterForm"]
    Dashboard["/dashboard - DashBoard"]
    Projects["/projects - CreateProjectForm"]
    ProjectDetails["/projects/:id - ProjectDetails"]
    Backlog["/projects/:id/backlog - ProjectBacklog"]
    Sprints["/projects/:id/sprints - ProjectSprints"]
    SprintDetails["/projects/:id/sprints/:sprintId - SprintDetails"]
    Releases["/projects/:id/releases - ProjectReleases"]
    Docs["/projects/:id/docs - DocumentationList"]
    Tests["/projects/:id/issues/:issueId/tests - TestPlayground"]
    Profile["/profile - UserProfile"]
    
    Root -->|Logged in| Dashboard
    Root -->|Not logged| Auth
    
    Auth -.->|Public| Login
    Auth -.->|Public| Register
    
    Dashboard -->|Protected| Projects
    Dashboard -->|Protected| Profile
    
    Projects --> ProjectDetails
    ProjectDetails --> Backlog
    ProjectDetails --> Sprints
    ProjectDetails --> Releases
    ProjectDetails --> Docs
    
    Sprints --> SprintDetails
    Backlog --> Tests
    
    style Root fill:#e3f2fd
    style Auth fill:#c8e6c9
    style Login fill:#c8e6c9
    style Register fill:#c8e6c9
    style Dashboard fill:#fff9c4
    style ProjectDetails fill:#ffe0b2
```

### Navigation Guards

```mermaid
flowchart TD
    Start([Navigation triggered])
    CheckAuth{Route requires<br/>authentication?}
    IsLoggedIn{User logged in?<br/>authStore.isLoggedIn}
    RedirectAuth[Redirect to /auth]
    CheckAuthRoute{Route = /auth?}
    RedirectDash[Redirect to /dashboard]
    Allow[Allow navigation]
    
    Start --> CheckAuth
    CheckAuth -->|Yes| IsLoggedIn
    CheckAuth -->|No| CheckAuthRoute
    
    IsLoggedIn -->|No| RedirectAuth
    IsLoggedIn -->|Yes| Allow
    
    CheckAuthRoute -->|Yes| IsLoggedIn
    CheckAuthRoute -->|No| Allow
    
    IsLoggedIn -->|Already logged| RedirectDash
    
    style Start fill:#e3f2fd
    style RedirectAuth fill:#ffcdd2
    style RedirectDash fill:#c8e6c9
    style Allow fill:#c8e6c9
```

---

## Main Components

### Component Hierarchy by Feature

```mermaid
graph TD
    App[App.vue]
    
    App --> NavBar[NavBar.vue]
    App --> RouterView[Router View]
    
    RouterView --> Auth[AuthInterface.vue]
    RouterView --> Dashboard[DashBoard.vue]
    RouterView --> ProjectDetailsPage[ProjectDetails.vue]
    RouterView --> ProjectBacklogPage[ProjectBacklog.vue]
    RouterView --> ProjectSprintsPage[ProjectSprints.vue]
    RouterView --> SprintDetailsPage[SprintDetails.vue]
    RouterView --> ProjectReleasesPage[ProjectReleases.vue]
    RouterView --> TestPlaygroundPage[TestPlayground.vue]
    RouterView --> UserProfilePage[UserProfile.vue]
    
    subgraph "Authentication"
        Auth --> LoginForm[LoginForm.vue]
        Auth --> RegisterForm[RegisterForm.vue]
    end
    
    subgraph "Dashboard Components"
        Dashboard --> ProfileCard[ProfileCard.vue]
        Dashboard --> ProjectGrid[ProjectGrid.vue]
        Dashboard --> EmptyProject[EmptyProject.vue]
        ProjectGrid --> ProjectCard[ProjectCard.vue]
    end
    
    subgraph "Project Details"
        ProjectDetailsPage --> ProjectMembers[ProjectMembers.vue]
        ProjectDetailsPage --> ProjectSettings[ProjectSettings.vue]
    end
    
    subgraph "Backlog Components"
        ProjectBacklogPage --> BacklogColumn[BacklogColumn.vue]
        ProjectBacklogPage --> CreateIssue[CreateIssueForm.vue]
        BacklogColumn --> BacklogIssueCard[BacklogIssueCard.vue]
        BacklogColumn --> IssueCard[IssueCard.vue]
        IssueCard --> IssueDetailModal[IssueDetailModal.vue]
        IssueCard --> EditIssue[EditIssueForm.vue]
        IssueCard --> StatusDropdown[StatusDropdown.vue]
    end
    
    subgraph "Sprint Components"
        ProjectSprintsPage --> CreateSprint[CreateSprintForm.vue]
        ProjectSprintsPage --> SprintCard[SprintCard.vue]
        SprintDetailsPage --> SprintInfoCard[SprintInfoCard.vue]
        SprintDetailsPage --> SprintIssuesList[SprintIssuesList.vue]
        SprintDetailsPage --> EditSprint[EditSprintForm.vue]
        SprintDetailsPage --> IssueSelector[IssueSelector.vue]
    end
    
    subgraph "Release Components"
        ProjectReleasesPage --> ReleaseComponents[Release Components]
    end
    
    subgraph "Documentation"
        DocumentationPage[DocumentationList.vue] --> DocViewer[Documentation Viewer]
    end
    
    subgraph "Test Playground"
        TestPlaygroundPage --> FileUpload[FileUploadSection.vue]
        TestPlaygroundPage --> CodeEditor[CodeEditor.vue]
        TestPlaygroundPage --> TestResults[TestResults.vue]
    end
    
    style App fill:#e3f2fd
    style Auth fill:#c8e6c9
    style Dashboard fill:#fff9c4
    style ProjectDetailsPage fill:#ffe0b2
```

### Reusable Components

The following components are designed to be reused:

- **IssueCard.vue**: Display an issue (used in backlog, sprints)
- **StatusDropdown.vue**: Dropdown to change issue status
- **SprintFormFields.vue**: Common fields for sprint forms
- **ProjectMembers.vue**: Collaborator management (reusable)

---

## API Services

### Main Endpoints

```mermaid
graph LR
    subgraph "Frontend Services"
        AS[authService]
        PS[projectService]
        US[userService]
        DS[documentationService]
        RS[releaseService]
        TS[testService]
    end
    
    subgraph "Backend API Endpoints"
        AuthAPI["/api/auth/* - login, register"]
        ProjectAPI["/api/projects/* - CRUD projects"]
        IssueAPI["/api/projects/:id/issues - CRUD issues"]
        SprintAPI["/api/projects/:id/sprints - CRUD sprints"]
        TaskAPI["/api/projects/:id/tasks - CRUD tasks"]
        ReleaseAPI["/api/projects/:id/releases - CRUD releases"]
        DocAPI["/api/projects/:id/documentations - CRUD docs"]
        TestAPI["/api/projects/:id/issues/:issueId/tests - Test execution"]
        UserAPI["/api/users - Get users"]
    end
    
    AS --> AuthAPI
    PS --> ProjectAPI
    PS --> IssueAPI
    PS --> SprintAPI
    PS --> TaskAPI
    DS --> DocAPI
    RS --> ReleaseAPI
    TS --> TestAPI
    US --> UserAPI
    
    style AS fill:#fce4ec
    style PS fill:#fce4ec
    style US fill:#fce4ec
    style DS fill:#fce4ec
    style RS fill:#fce4ec
    style TS fill:#fce4ec
```

---

## Tech Stack

- **Framework**: Vue.js 3.5 (Composition API)
- **Language**: TypeScript 5.9
- **Build**: Vite 7.1
- **Routing**: Vue Router 4.6
- **HTTP Client**: Axios 1.12
- **Tests**: Vitest 4.0 + Vue Test Utils 2.4
- **Markdown**: Marked 17.0
- **Icons**: FontAwesome 5.15
- **Documentation**: TypeDoc 0.28

---

## Patterns and Best Practices

### 1. Composition API

All components use the Composition API with `<script setup lang="ts">`:

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const data = ref<string[]>([])

onMounted(() => {
  // Load data
})
</script>
```

### 2. Error Handling

Services return formatted errors:

```typescript
catch (error: any) {
  throw new Error(getErrorMessage(error))
}
```

### 3. Reusability

- Atomic components (IssueCard, StatusDropdown)
- Centralized services (no direct axios calls in components)
- Utils for headers and localStorage

### 4. Testing

- Unit tests for services and utils
- Component tests with Vue Test Utils
- API and localStorage mocking

---

## Resources

- [Vue.js 3 Documentation](https://vuejs.org/)
- [Vue Router Documentation](https://router.vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vitest Documentation](https://vitest.dev/)
