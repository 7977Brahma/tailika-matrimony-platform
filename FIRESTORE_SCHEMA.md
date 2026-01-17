# Firestore Schema Documentation

## Collections

### 1. `users`
**Purpose**: Core user profile data and completion status.

**Structure**:
```javascript
{
  uid: string,                    // Firebase Auth UID (document ID)
  email: string,
  name: string,
  gender: "Male" | "Female",
  age: number,
  location: {
    city: string,
    state: string,
    country: string
  },
  matrimonial: {
    religion: string,
    motherTongue: string,
    maritalStatus: "Single" | "Divorced" | "Widowed" | "Separated",
    height: number                // in cm
  },
  photos: string[],               // Array of photo URLs (min 4)
  isProfileComplete: boolean,     // Profile gate flag
  approvalStatus: "pending" | "approved" | "rejected",
  isSuspended: boolean,
  createdAt: number,              // timestamp
  updatedAt: number
}
```

**Indexes**:
- `gender` ASC, `isProfileComplete` ASC
- `approvalStatus` ASC, `createdAt` DESC

---

### 2. `chats`
**Purpose**: 1-to-1 chat metadata.

**Structure**:
```javascript
{
  chatId: string,                 // Document ID (derived from sorted userIds)
  userIds: string[],              // [userA, userB] (sorted)
  participants: {
    [uid]: {
      name: string,
      lastRead: number,
      unreadCount: number
    }
  },
  lastMessage: string,
  lastMessageAt: number,
  createdAt: number,
  isActive: boolean
}
```

**Security**: Only participants can read/write.

---

### 3. `messages`
**Purpose**: Chat messages (subcollection or top-level).

**Structure**:
```javascript
{
  messageId: string,              // Document ID (auto-generated)
  chatId: string,                 // Reference to chat
  senderId: string,
  receiverId: string,
  text: string,                   // Max 500 chars
  isRead: boolean,
  createdAt: number               // Server timestamp
}
```

**Security**:
- Read: Only sender or receiver
- Write (create): Only sender, with validation
- Update: Only `isRead` field

---

### 4. `admins`
**Purpose**: Admin metadata (Custom Claims are source of truth).

**Structure**:
```javascript
{
  uid: string,                    // Document ID
  role: "primary_admin" | "secondary_admin",
  createdAt: number,
  createdBy: string,              // Creator's UID
  isActive: boolean
}
```

**Security**: Only Primary Admin can read/write.

---

### 5. `adminLogs`
**Purpose**: Audit trail for admin actions.

**Structure**:
```javascript
{
  logId: string,                  // Auto-generated
  adminId: string,
  actionType: string,             // e.g., "APPROVE_USER", "SUSPEND_USER"
  targetId: string,               // Target user/entity ID
  timestamp: number,
  metadata: object                // Action-specific data
}
```

**Security**: Read-only for admins, write-only by backend.

---

## Indexes Required

1. **users**:
   - Composite: `gender` ASC + `isProfileComplete` ASC
   - Single: `approvalStatus` ASC

2. **messages**:
   - Composite: `chatId` ASC + `createdAt` DESC

3. **chats**:
   - Array: `userIds` (for querying user's chats)

---

## Access Patterns

### User Profile Completion Flow
1. User signs up → `isProfileComplete: false`
2. User completes profile → `isProfileComplete: true`, `approvalStatus: "pending"`
3. Admin approves → `approvalStatus: "approved"`

### Matching Flow (Future)
- Query: `gender != currentUser.gender AND isProfileComplete = true AND approvalStatus = "approved"`

### Chat Flow
1. Check if chat exists: Query `chats` where `userIds` array-contains both UIDs
2. If not exists, create with `chatId = [uidA, uidB].sort().join('_')`
3. Send message → Add to `messages` with `chatId`

---

## Notes
- **Gender-based matching**: Enforce `Male ↔ Female` only (no same-gender matches).
- **Photo requirement**: Minimum 4 photos enforced client-side and in profile validation.
- **Rate limiting**: Managed via Firebase Security Rules (500 chars max per message).
