# Logical ERD — Schedula

This diagram represents the logical database design of the Schedula system.
It includes tables, attributes, primary keys, and foreign keys, independent of any specific DBMS.

```mermaid
erDiagram

    USER {
        string user_id PK
        string email
        string password_hash
        string role
        string created_at
    }

    DOCTOR {
        string doctor_id PK
        string user_id FK
        string specialization
        int experience_years
        float consultation_fee
    }

    PATIENT {
        string patient_id PK
        string user_id FK
    }

    AVAILABILITY {
        string availability_id PK
        string doctor_id FK
        string day_of_week
    }

    TIME_SLOT {
        string time_slot_id PK
        string availability_id FK
        string start_time
        string end_time
        string is_booked
    }

    APPOINTMENT {
        string appointment_id PK
        string doctor_id FK
        string patient_id FK
        string time_slot_id FK
        string status
        string scheduled_date
        string created_at
    }

    PATIENT_DETAILS {
        string patient_details_id PK
        string appointment_id FK
        string name
        int age
        string gender
        string notes
    }

    CHAT {
        string chat_id PK
        string appointment_id FK
        string created_at
    }

    MESSAGE {
        string message_id PK
        string chat_id FK
        string sender_user_id FK
        string content
        string sent_at
    }


    %% Relationships

    USER ||--o| DOCTOR : represents
    USER ||--o| PATIENT : represents

    DOCTOR ||--o{ AVAILABILITY : has
    AVAILABILITY ||--o{ TIME_SLOT : contains

    DOCTOR ||--o{ APPOINTMENT : attends
    PATIENT ||--o{ APPOINTMENT : books
    TIME_SLOT ||--o| APPOINTMENT : scheduled_for

    APPOINTMENT ||--|| PATIENT_DETAILS : has
    APPOINTMENT ||--|| CHAT : has

    CHAT ||--o{ MESSAGE : contains
    USER ||--o{ MESSAGE : sends
```
