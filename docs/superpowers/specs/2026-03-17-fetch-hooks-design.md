# Design: Move Fetch Logic into Custom Hooks

**Date:** 2026-03-17
**Scope:** All components using `authorizedFetch` across the dashboard

---

## Goal

Extract all `authorizedFetch` calls and associated loading/error state out of components into dedicated custom hooks in `src/hooks/`. Components become presentational; data fetching and side effects live in hooks.

---

## File Structure

```
src/hooks/
  apiError.ts           # Centralized error handling utility
  useUsers.ts           # GET /api/dashboard/users
  useDeleteUser.ts      # DELETE /api/dashboard/users
  useCreateUser.ts      # POST /api/auth/register
  usePrizes.ts          # GET /api/codes/count
  useParticipations.ts  # GET participations (paginated + filtered) + document mutations
  useMessages.ts        # GET /api/messages/history (lazy, triggered by isOpen)
  useTicket.ts          # POST accept/reject ticket
```

---

## Centralized Error Handling (`apiError.ts`)

Replaces scattered `toast` + `console.error` calls across all components.

```ts
import { toast } from '../components/ui/use-toast';

// For non-ok HTTP responses — shows a toast using the standalone `toast` function
// description is optional; when provided it is passed as response.status
function handleApiError(response: Response, fallbackTitle: string, description?: string | number): void

// For caught exceptions — logs to console
function handleCaughtError(error: unknown, context: string): void
```

`apiError.ts` imports the standalone `toast` directly (it is exported as a plain function from `use-toast`, no hook context needed). Hooks do **not** need to accept `toast` as a parameter.

**Invalid token path:** `authorizedFetch` itself calls `authProvider.signout()` and throws `Error('Invalid token')` when the token is invalid. This is caught by `handleCaughtError` in each hook. No additional redirect logic is needed in hooks — auth state management is the responsibility of `authProvider`.

---

## Hook Signatures

### `useUsers()`

```ts
useUsers(): {
  users: DashboardUser[]
  isLoading: boolean
  fetchUsers: () => Promise<void>
}
```

- Fetches on mount via `useEffect([], fetchUsers)`
- Used in: `Users.tsx`

---

### `useDeleteUser(onSuccess: () => Promise<void>)`

```ts
useDeleteUser(onSuccess: () => Promise<void>): {
  deleteUser: (userId: string) => Promise<void>
  isLoading: boolean
}
```

- The hook serializes the request body as `{ user_id: userId }` internally
- `onSuccess` is called after a successful delete (triggers `fetchUsers` in parent)
- Used in: `UserCard.tsx`

---

### `useCreateUser(onSuccess: () => Promise<void>)`

```ts
useCreateUser(onSuccess: () => Promise<void>): {
  createUser: (values: { username: string; password: string; role: string }) => Promise<void>
  isLoading: boolean
}
```

- `isLoading` is used to disable the submit button during submission
- `onSuccess` is called after successful creation (triggers `fetchUsers` in parent)
- Used in: `UserCreationDialog.tsx`
- Note: The parent `Users.tsx` currently passes its own `isLoading` (from `fetchUsers`) to `UserCreationDialog`. After this refactor, `UserCreationDialog` uses its own `isLoading` from `useCreateUser` instead. The `isLoading` prop on `UserCreationDialog` is removed.

---

### `usePrizes()`

```ts
usePrizes(): {
  prizes: PrizeInfo[]
  isLoading: boolean
}
```

- Fetches on mount
- Used in: `Prizes.tsx`
- Note: `Prizes.tsx` has a naming inconsistency — the component is exported as `function Participations()`. This should be corrected to `function Prizes()` during migration.

---

### `useParticipations(searchParams: URLSearchParams)`

```ts
useParticipations(searchParams: URLSearchParams): {
  participations: Participation[]
  isLoading: boolean
  pageCount: number
  fetchParticipations: () => Promise<void>
  acceptDocuments: (participation: Participation) => Promise<void>
  rejectDocuments: (participation: Participation) => Promise<void>
}
```

- Refetches when `searchParams` changes via `useEffect([searchParams])`
- Absorbs the URL param normalization logic (splitting comma-separated `status`/`prize_type` values into repeated params)
- `pageSize` is an internal constant (`10`) — not configurable from outside
- `pageCount` is calculated as `Math.ceil(data.count / pageSize)` inside the hook
- `acceptDocuments` and `rejectDocuments` are co-located here because they are only used in `Participations.tsx` alongside the list fetch, and both call `fetchParticipations` internally on success
- Used in: `Participations.tsx`

---

### `useMessages(userId: string, isOpen: boolean)`

```ts
useMessages(userId: string, isOpen: boolean): {
  messages: ChatMessage[]
  isLoading: boolean
  fetchMessages: () => Promise<void>
}
```

- `userId` is passed in as `participation.user.id` from the parent component
- `isOpen` is owned by the component (via `Sheet`'s `onOpenChange`) and passed to the hook so the hook can trigger the fetch lazily. The hook does not manage open state itself.
- Triggers fetch when `isOpen` becomes true via `useEffect([isOpen])`
- Internally skips the fetch if `messages.length !== 0` (cache is intentional — messages are not re-fetched on sheet reopen)
- Used in: `MessageHistory.tsx`

---

### `useTicket(participation: Participation, onRefresh: () => Promise<void>)`

```ts
useTicket(participation: Participation, onRefresh: () => Promise<void>): {
  submitTicket: (ticketNumber: string) => Promise<void>
  rejectTicket: (reason: string) => Promise<void>
  disabled: boolean
}
```

- Owns `disabled` state, initialized from `participation.serial_number !== null`
- **409 conflict flow:** when `submitTicket` receives a 409 response, it awaits `rejectTicket("Folio Repetido")` then returns immediately. The generic error toast branch is not reached (no fall-through). `rejectTicket` manages its own `disabled` state; `submitTicket` does **not** call `setDisabled(false)` when it delegates to `rejectTicket`.
- `onRefresh` is called after a successful accept or reject
- Used in: `TicketDialog.tsx`
- Note: `reason` state remains in `TicketDialog.tsx` (UI state for the select input). The hook receives `reason` as a parameter to `rejectTicket`.

---

## What Stays in Components

- `documentationChecks` state in `Participations.tsx` — UI state, not fetch logic
- Form state (`useForm`, `zodResolver`) in `UserCreationDialog.tsx` and `TicketDialog.tsx`
- Dialog/sheet open state (`isOpen`) in all dialog components
- `reason` state in `TicketDialog.tsx` — UI state for the rejection reason select
- All JSX and rendering logic

---

## Component Interface Changes

| Component | Change |
|---|---|
| `UserCreationDialog` | Remove `isLoading: boolean` prop (hook owns it now) |
| `UserCard` | Replace inline `handleDelete` with `deleteUser` from `useDeleteUser`; `onUserDeletion` prop signature unchanged |
| All others | No changes |

---

## Error Handling Strategy

| Scenario | After |
|---|---|
| Non-ok HTTP response | `handleApiError(response, title, description?)` from `apiError.ts` |
| Caught exception | `handleCaughtError(error, context)` from `apiError.ts` |
| Invalid token | Caught by `handleCaughtError`; `authProvider` handles signout |

---

## Migration Order

1. `apiError.ts` — shared utility first
2. `useUsers` + `useDeleteUser` + `useCreateUser` — Users section
3. `usePrizes` — simple, standalone
4. `useParticipations` — largest hook, contains mutations
5. `useMessages` — lazy fetch pattern
6. `useTicket` — most complex mutation logic
