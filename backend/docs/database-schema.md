# Database Schema

This document describes the database schema for our project. The schema is represented using an Entity-Relationship Diagram (ERD) to illustrate the relationships between different entities in the system.



```mermaid
erDiagram
    USER ||--o{ PROJECT : creates
    USER }o--o{ PROJECT : "collaborates (project_user)"
    USER ||--o{ ISSUE : creates
    USER ||--o{ ISSUE : "assigned to"
    USER ||--o{ TASK : creates
    USER ||--o{ TASK : "assigned to"
    USER ||--o{ RELEASE : creates
    USER ||--o{ TEST : creates
    
    PROJECT ||--o{ ISSUE : contains
    PROJECT ||--o{ SPRINT : has
    PROJECT ||--o{ RELEASE : has
    PROJECT ||--o{ DOCUMENTATION : has
    PROJECT ||--o{ TASK : contains
    
    ISSUE ||--o{ TASK : contains
    ISSUE ||--o{ TEST : has
    ISSUE }o--o| SPRINT : "belongs to"
    ISSUE }o--o{ RELEASE : "included in"
    ISSUE ||--o{ DOCUMENTATION_ISSUE : links
    
    SPRINT ||--o{ ISSUE : contains
    RELEASE ||--o{ ISSUE : includes
    
    DOCUMENTATION ||--o{ DOCUMENTATION_ISSUE : links
    
    USER {
        bigint id PK "IDENTITY"
        string email UK
        string password
        string name
        boolean enabled "default true"
    }
    
    PROJECT {
        uuid id PK "GENERATED"
        string name
        string description
        bigint creator_id FK
        timestamp created_at
    }
    
    ISSUE {
        bigint id PK "IDENTITY"
        string title
        text description
        enum priority "LOW, MEDIUM, HIGH"
        enum status "TODO, IN_PROGRESS, CLOSED"
        int story_points
        uuid project_id FK
        bigint creator_id FK
        bigint assignee_id FK "nullable"
        bigint sprint_id FK "nullable"
        bigint release_id FK "nullable"
        timestamp created_at
    }
    
    TASK {
        bigint id PK "IDENTITY"
        string title
        text description
        text definition_of_done
        enum status "TODO, IN_PROGRESS, DONE"
        uuid project_id FK
        bigint issue_id FK
        bigint creator_id FK
        bigint assignee_id FK "nullable"
        timestamp created_at
    }
    
    SPRINT {
        bigint id PK "IDENTITY"
        string name
        timestamp start_date
        timestamp end_date
        uuid project_id FK
        timestamp created_at
    }
    
    RELEASE {
        bigint id PK "IDENTITY"
        int major "embedded version"
        int minor "embedded version"
        int patch "embedded version"
        text release_notes
        uuid project_id FK
        bigint creator_id FK
        timestamp created_at
    }
    
    DOCUMENTATION {
        bigint id PK "IDENTITY"
        string title
        text content
        uuid project_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    TEST {
        bigint id PK "IDENTITY"
        text program_code
        text test_code
        bigint creator_id FK
        bigint issue_id FK
        timestamp created_at
    }
    
    DOCUMENTATION_ISSUE {
        bigint id PK "IDENTITY"
        bigint documentation_id FK
        bigint issue_id FK
        timestamp created_at
    }
```

## Relationship Legend

- `||--o{` : **One-to-Many** - One entity A can have multiple entities B
- `}o--o{` : **Many-to-Many** - Multiple entities A can have multiple entities B
- `}o--o|` : **Many-to-One** - Multiple entities A can belong to one entity B

### Cardinalities
- `||` : Exactly one (mandatory)
- `}o` : Zero or more (optional)
- `o|` : Zero or one (optional)

### Examples in the schema
- `USER ||--o{ PROJECT : creates` → One USER creates zero or more PROJECTs
- `USER }o--o{ PROJECT : collaborates` → Many-to-many relationship via `project_user` join table
- `ISSUE }o--o| SPRINT : belongs to` → One ISSUE can belong to zero or one SPRINT


