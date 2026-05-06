# Bug Report - Task Manager API

## Bug 1: Immutable Field Mutation
- **Expected Behavior**: Fields like `id` and `createdAt` should be immutable and not changeable via the update endpoint.
- **Actual Behavior**: The `PUT /tasks/:id` endpoint accepts any fields in the request body and merges them into the task object, allowing the `id` and `createdAt` to be changed.
- **Discovery**: Code review of `store.js` update logic and `taskService.js` updateTask implementation.
- **Fix**: Sanitize the `updates` object in `taskService.js` to remove protected fields before passing it to the store.

## Bug 2: Inconsistent "Done" Status
- **Expected Behavior**: Any task marked as `done` should have a `completedAt` timestamp.
- **Actual Behavior**: Marking a task as `done` via `PUT /tasks/:id` updates the status but leaves `completedAt` as `null`. Only the `/complete` endpoint sets the timestamp.
- **Discovery**: Comparing the behavior of `PUT` vs `PATCH /complete`.
- **Fix**: In `updateTask`, check if the status is being changed to `done` and set `completedAt` automatically if not already set.

## Bug 3: Missing Priority/Status Validation
- **Expected Behavior**: The API should only accept valid status (`todo`, `in_progress`, `done`) and priority (`low`, `medium`, `high`).
- **Actual Behavior**: The API accepts any string for these fields.
- **Discovery**: Attempting to create a task with `priority: "ultra"`.
- **Fix**: Add a validation step in `createTask` and `updateTask`.

## Bug 4: Pagination Zero Values
- **Expected Behavior**: `?page=1&limit=0` or `?page=0` should be handled gracefully (e.g., default to page 1 or return empty set for limit 0).
- **Actual Behavior**: Since `0` is falsy in JavaScript, the condition `if (pagination.page && pagination.limit)` fails, causing the API to return *all* tasks, ignoring the limit.
- **Discovery**: Testing pagination with `limit=0`.
- **Fix**: Check for `undefined` or use `Number.isInteger()` instead of truthy checks.
