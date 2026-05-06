# Task Manager API - Underpin Assignment

## Overview
This is a Task Manager API built with Node.js and Express. It features a full suite of unit and integration tests, bug fixes for data integrity, and a new task assignment feature.

## Features
- **Modern Dashboard**: A premium, responsive UI for managing tasks visually.
- **CRUD Operations**: Create, Read, Update, and Delete tasks.
- **Filtering**: Filter tasks by status.
- **Pagination**: Paginated task lists.
- **Statistics**: Real-time stats on task counts and overdue tasks.
- **Task Assignment**: Assign tasks to specific users with validation.
- **Data Integrity**: Protected immutable fields (`id`, `createdAt`) and automated `completedAt` timestamps.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Testing**: Jest & Supertest
- **Utility**: uuid

## Setup & Running

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Server**:
   ```bash
   npm start
   ```
   The API will be available at `http://localhost:3000`.

3. **Run Tests**:
   ```bash
   npm test
   ```

4. **Generate Coverage Report**:
   ```bash
   npm run coverage
   ```

## API Documentation

| Method | Path | Description |
|--------|------|-------------|
| GET | `/tasks` | List all tasks (supports `status`, `page`, `limit` queries) |
| GET | `/tasks/:id` | Get task by ID |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Update a task (sanitizes immutable fields) |
| DELETE | `/tasks/:id` | Delete a task |
| PATCH | `/tasks/:id/complete` | Mark a task as complete |
| PATCH | `/tasks/:id/assign` | Assign task to a user |
| GET | `/tasks/stats` | Get status counts and overdue count |

## Testing & Quality
- **Unit Tests**: Business logic in `taskService.js` is fully covered.
- **Integration Tests**: All API endpoints are tested using Supertest.
- **Coverage**: **92% Statement Coverage**.
- **Bug Fixes**: Addressed ID mutation, inconsistent timestamps, and input validation.

## Submission Notes
- **Bug Report**: See `BUGS.md` for a detailed breakdown of identified and fixed issues.
- **Self-Reflection**: See `NOTES.md` for future improvements and project insights.
