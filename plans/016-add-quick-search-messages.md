# Add Quick Search to Messages Page

**Created**: 2026-07-13 | **Commit**: d7c6fad | **Status**: DONE

## Problem

The messages page shows all conversations in a flat list with no way to search or filter. As conversation count grows, finding a specific chat becomes tedious.

## Solution

Add a search input above the conversation list that filters conversations client-side by:
- Other user's name
- Last message content
- Listing/book title

No backend changes needed — all data is already loaded.

## Scope

**Files to modify:**
- `components/messages/ConversationList.tsx` — add search state, input, and filter logic

**Files NOT to touch:**
- `app/messages/page.tsx` — no changes needed
- Backend/API — client-side filter only

## Implementation

### Step 1: Add search state and filter logic

In `components/messages/ConversationList.tsx`:

1. Add `useState` for search query
2. Add `useMemo` to filter conversations based on query matching:
   - `convo.otherUser?.name`
   - `convo.lastMessage?.content`
   - `convo.listing?.book?.title`
3. Match should be case-insensitive, Persian-aware (simple `includes` is fine)

### Step 2: Add search input UI

Above the conversation list, add a search input matching the existing pattern from `NewConversation.tsx`:
- Persian placeholder: "جستجو در پیام‌ها..."
- Style: `rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm`
- Include search icon (magnifying glass) on the right side

### Step 3: Show empty state when no results

When search has results but filtered list is empty, show:
- "پیامی یافت نشد" (no messages found)
- Keep the existing "هنوز پیامی ندارید" for when there are genuinely no conversations

## Done Criteria

- [ ] Search input visible above conversation list
- [ ] Typing in search filters conversations in real-time
- [ ] Filters by user name, message content, and book title
- [ ] Empty state shown when search has no matches
- [ ] Empty state hidden when search is empty (shows all)
- [ ] UI matches existing patterns from NewConversation component

## Verification

1. `npm run dev`
2. Navigate to `/messages`
3. Verify search input appears
4. Type a user name → list filters to matching conversations
5. Type a message keyword → list filters accordingly
6. Clear search → all conversations reappear
7. Type gibberish → "پیامی یافت نشد" shown

## Notes

- Client-side filter is appropriate here (conversations are already loaded server-side)
- No debounce needed — synchronous filter on small dataset
- Persian text search works with simple `includes()` since no stemming required
