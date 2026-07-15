# Rebuild Messages System

## Step 1: Delete all current messages files

**Delete:**
- `app/messages/` (entire directory)
- `components/messages/` (entire directory)

**Keep (do not delete):**
- `lib/models/Message.ts` — data model is fine
- `lib/models/Conversation.ts` — data model is fine
- `lib/socket-server.ts` — server logic is fine
- `lib/socket-client.ts` — client singleton is fine
- `server.ts` — socket server setup is fine

**Clean up `lib/auth-actions.ts`:**
- Remove these functions (will be rewritten): `getConversations`, `getMessages`, `createConversation`, `getUnreadCount`, `getUnreadCountsByConversation`, `searchUsers`, `getSessionToken`
- Keep all non-message functions intact

**Clean up layouts:**
- `components/layout/ShellLayout.tsx` — remove `sessionToken` prop from Header/MobileNav (will be re-added cleanly)
- `components/layout/Header.tsx` — remove `sessionToken` prop, socket connection code, and `connected` state (will be re-added cleanly)
- `components/layout/MobileNav.tsx` — remove `sessionToken` prop, socket connection code (will be re-added cleanly)

## Step 2: Rewrite `lib/auth-actions.ts` message functions

Rewrite these server actions cleanly:

```ts
// Get session token from cookie (server-side)
export async function getSessionToken(): Promise<string | null>

// Get all conversations for a user, sorted by lastMessageAt desc
export async function getConversations(userId: string): Promise<Conversation[]>

// Get messages for a conversation (last 100, sorted ascending)
export async function getMessages(conversationId: string, userId: string): Promise<Message[]>

// Create or find existing conversation between two users (optional listingId)
export async function createConversation(participantId: string, listingId?: string): Promise<{success, conversationId?, error?}>

// Total count of conversations with unread messages (for badge)
export async function getUnreadCount(userId: string): Promise<number>

// Per-conversation unread counts
export async function getUnreadCountsByConversation(userId: string): Promise<Record<string, number>>

// Search users by name (for new conversation)
export async function searchUsers(query: string, currentUserId: string): Promise<User[]>
```

Key fixes from old code:
- `getUnreadCountsByConversation`: use `new mongoose.Types.ObjectId(userId)` properly (not dynamic import)
- All functions: consistent error handling

## Step 3: Create `components/messages/ChatView.tsx`

Full chat UI client component. Key design:

**Props:** `{ conversationId, currentUserId, sessionToken, initialMessages, otherUser?, listing? }`

**Socket connection:**
- Use `sessionToken` prop (passed from server) — NOT cookie reading
- On connect: join conversation, mark-read
- On disconnect: update connected state
- Cleanup on unmount: leave conversation, remove listeners

**Message handling:**
- Optimistic update on send (temp ID)
- On `new-message` received:
  - If from self: replace temp message with server message
  - If from other: add to list
- Skip duplicates by `_id`
- Only emit `mark-read` for messages from others

**UI:**
- Header: back button (mobile), other user name, listing title, connection indicator
- Message list: scrollable, auto-scroll to bottom
- Sent messages: navy bg, left-aligned (RTL)
- Received messages: surface bg, right-aligned
- Input: text input (always enabled), image upload button, send button
- Send button disabled only when empty (not when disconnected)
- When not connected: clicking send triggers reconnect attempt

## Step 4: Create `components/messages/ConversationList.tsx`

Conversation list client component.

**Props:** `{ conversations, currentUserId, unreadCounts? }`

**Features:**
- Search input for filtering by user name, message content, or book title
- Each conversation shows: avatar initial, other user name, last message preview, time ago
- Unread badge (red circle, "99+" cap)
- Link to `/messages/{id}`

## Step 5: Create `components/messages/NewConversation.tsx`

New conversation modal client component.

**Props:** `{ currentUserId }`

**Features:**
- Button opens modal with search input
- Calls `searchUsers` server action (min 2 chars)
- On select: calls `createConversation`, navigates to chat

## Step 6: Create `app/messages/layout.tsx`

Server layout wrapping all `/messages/*` routes:
- Fetch `getCurrentUser()`, `getUnreadCount()`, `getSessionToken()`
- Render `<Header>` and `<MobileNav>` with session token prop
- No footer (same as current)

## Step 7: Create `app/messages/page.tsx`

Server component — conversation list page:
- Fetch `getCurrentUser()`, `getConversations()`, `getUnreadCountsByConversation()`
- Render `<ConversationList>` and `<NewConversation>`
- Redirect to login if not authenticated

## Step 8: Create `app/messages/[id]/layout.tsx`

Pass-through layout (renders `{children}` only).

## Step 9: Create `app/messages/[id]/page.tsx`

Server component — individual chat page:
- Fetch `getCurrentUser()`, `getMessages()`, `getConversations()`, `getSessionToken()`
- Validate conversation exists
- Render `<ChatView>` with all props

## Step 10: Update `components/layout/Header.tsx`

Add back:
- `sessionToken` prop (optional)
- Socket connection for `connected` state (only when `isMessages` and `sessionToken` present)
- Show "درحال اتصال..." badge when not connected on messages page

## Step 11: Update `components/layout/MobileNav.tsx`

Add back:
- `sessionToken` prop (optional)
- Socket connection for real-time unread badge increment
- Skip own messages in `new-message` handler

## Step 12: Update `components/layout/ShellLayout.tsx`

Pass `sessionToken` to Header and MobileNav (via `getSessionToken()`).

## Step 13: Verify `components/listing/ListingDetailClient.tsx`

Ensure "Message Seller" button still works — it calls `createConversation(seller._id, listing._id)` and navigates to `/messages/{id}`. No changes needed here since the server action signature stays the same.

---

## Files to delete
- `app/messages/` (all files)
- `components/messages/` (all files)

## Files to create
- `app/messages/layout.tsx`
- `app/messages/page.tsx`
- `app/messages/[id]/layout.tsx`
- `app/messages/[id]/page.tsx`
- `components/messages/ChatView.tsx`
- `components/messages/ConversationList.tsx`
- `components/messages/NewConversation.tsx`

## Files to modify
- `lib/auth-actions.ts` (rewrite message functions)
- `components/layout/Header.tsx` (add socket connection + connecting indicator)
- `components/layout/MobileNav.tsx` (add socket connection for badge)
- `components/layout/ShellLayout.tsx` (pass sessionToken)

## Files unchanged
- `lib/models/Message.ts`
- `lib/models/Conversation.ts`
- `lib/socket-server.ts`
- `lib/socket-client.ts`
- `server.ts`
- `components/listing/ListingDetailClient.tsx`

## Verification
1. `npm run dev` — server starts on port 4000
2. Open `/messages` — conversation list loads, search works
3. Click "پیام جدید" — modal opens, user search works
4. Navigate to a chat — messages load, input is enabled
5. Send a message — appears immediately, broadcasts to other user
6. Receive a message — appears in real time
7. Test in Chrome AND Firefox — socket connects in both (via sessionToken prop, not cookies)
8. Unread badge on MobileNav updates in real time, doesn't count sender's own messages
9. "Message Seller" on listing page creates conversation and navigates to chat
