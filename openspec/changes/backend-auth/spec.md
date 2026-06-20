---
change: backend-auth
phase: spec
status: complete
created: 2026-06-19
depends_on: [proposal]
---

# Backend Auth — Specification

## 1. Authentication

### Requirement: User Registration

The system MUST allow registration with email/password. MUST NOT require email verification.

#### Scenario: Successful registration

- GIVEN a visitor with no account
- WHEN they submit a valid email and password (min 8 chars)
- THEN a user record and session are created

#### Scenario: Duplicate email

- GIVEN an existing user with email "a@b.com"
- WHEN a visitor registers with "a@b.com"
- THEN registration fails with a 409 conflict error

### Requirement: User Login

The system MUST authenticate via email/password, returning a database session.

#### Scenario: Valid credentials

- GIVEN a registered user
- WHEN they submit correct credentials
- THEN a new session is created

#### Scenario: Invalid credentials

- GIVEN any login attempt with wrong email or password
- WHEN submitted
- THEN the system returns 401 with a generic error

### Requirement: User Logout

The system MUST invalidate the session on logout.

#### Scenario: Authenticated logout

- GIVEN an authenticated user
- WHEN they call the logout endpoint
- THEN the session is deleted and subsequent requests return 401

### Requirement: Session Persistence

The system MUST persist sessions across page refreshes via cookies.

#### Scenario: Page refresh

- GIVEN an authenticated user who refreshes the browser
- WHEN the app loads
- THEN the session is validated and auth state restored

## 2. Guest Mode

### Requirement: Offline Operation

The system MUST function fully without authentication using localStorage. Users MUST NOT be forced to authenticate.

#### Scenario: Guest usage

- GIVEN an unauthenticated visitor
- WHEN they use the app
- THEN all operations work via localStorage (unchanged)

## 3. Data Import

### Requirement: localStorage Migration

The system MUST detect existing localStorage data after first login and offer import.

#### Scenario: Import offered

- GIVEN a newly authenticated user with `miplatita-finance-v1` in localStorage
- WHEN the app loads
- THEN an import prompt is displayed

#### Scenario: Successful import

- GIVEN the user accepts the import
- WHEN the bulk import endpoint is called
- THEN all data is created server-side with the user's ID and localStorage is cleared

#### Scenario: Import declined

- GIVEN the user declines the import
- WHEN they dismiss the prompt
- THEN localStorage is preserved and server state starts empty

## 4. API Endpoints

### Requirement: Authenticated CRUD

All `/api/` data endpoints MUST require authentication (401 otherwise). Endpoints: CRUD `/api/accounts`, `/api/transactions`, `/api/categories`; bulk GET `/api/finance`; bulk POST `/api/finance/import`.

#### Scenario: Authorized access

- GIVEN an authenticated user with 2 accounts
- WHEN they GET `/api/accounts`
- THEN only their 2 accounts are returned

#### Scenario: Unauthorized access

- GIVEN an unauthenticated request to any data endpoint
- THEN the system returns 401

### Requirement: Transaction Filtering

GET `/api/transactions` SHOULD support params: `accountId`, `month` (YYYY-MM), `type`.

#### Scenario: Filter by account and month

- GIVEN a user with transactions across multiple accounts
- WHEN they call GET `/api/transactions?accountId=X&month=2026-06`
- THEN only matching transactions are returned

## 5. Data Isolation

### Requirement: User Data Scoping

Every database query MUST filter by `userId` from the session. Users MUST only access their own data.

#### Scenario: Cross-user access attempt

- GIVEN user A owns account "X"
- WHEN user B calls PUT `/api/accounts/X`
- THEN the system returns 404 (not 403, to prevent enumeration)

## 6. Dual-Mode Hooks

### Requirement: Auth-Aware Data Layer

Hooks MUST detect auth state and route to localStorage (guest) or API (authenticated). Optimistic updates MUST work in both modes.

#### Scenario: Authenticated mutation

- GIVEN an authenticated user creating an account
- WHEN the mutation fires
- THEN cache is optimistically updated, API is called, and rollback occurs on failure

#### Scenario: Guest mutation

- GIVEN a guest user creating an account
- WHEN the mutation fires
- THEN cache is optimistically updated and localStorage is written
