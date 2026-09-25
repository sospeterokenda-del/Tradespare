# Security Specification: Role-Based Access Control (RBAC)

## 1. Data Invariants
1. **User Identity & Role Integrity**: A non-admin user can NEVER assign themselves the `admin` role or promote themselves to `active` if registered as `seller`.
2. **Seller Self-Containment**: A seller can ONLY create, edit, or delete products where `sellerId == request.auth.uid`. Sellers cannot touch products belonging to another merchant.
3. **Approval Prerequisite**: A seller with status `pending`, `suspended`, or `rejected` CANNOT create or update products. Only `active` (admin-approved) sellers can publish or modify listings.
4. **Buyer Boundaries**: Buyers CANNOT access administrative endpoints, create/edit products, or mutate users. Buyers can only place orders for themselves (`buyerId == request.auth.uid`).
5. **Admin Omnipresence**: Admins (verified via `admins/{uid}` or bootstrapped `sospeterokenda@gmail.com`) can read, update, approve, suspend, activate, or reject any user, and manage all products and orders.
6. **PII Isolation**: Non-admin users can ONLY read or write their own user profile document (`request.auth.uid == userId`). General directory scraping of user documents is blocked.
7. **Tamper-Proof Timestamps & IDs**: Path document IDs must conform to `^[a-zA-Z0-9_\-]+$` and length constraints (<= 128 chars).

## 2. The "Dirty Dozen" Malicious Payloads
1. **Payload 1 (Self-Promotion to Admin)**:
   A normal user sending `setDoc('/users/alice', { role: 'admin', status: 'active', ... })` -> REJECTED (Users cannot self-assign role `admin`).
2. **Payload 2 (Ghost Field Injection / Shadow Update)**:
   A user trying to append `{ isSuperUser: true, bypassApproval: true }` during update -> REJECTED by strict `hasOnly` / `isValid[Entity]` checks.
3. **Payload 3 (Unapproved Seller Product Publication)**:
   A seller with `status: 'pending'` submitting `setDoc('/products/p1', { sellerId: 'seller_1', ... })` -> REJECTED (Must be active approved seller or admin).
4. **Payload 4 (Cross-Seller Listing Hijack)**:
   Seller B attempting to update or delete Product A owned by Seller A (`updateDoc('/products/p1', { price: 1 })`) -> REJECTED (`resource.data.sellerId != request.auth.uid`).
5. **Payload 5 (Buyer Forging Other User Order)**:
   Buyer Alice placing an order with `buyerId: 'bob'` -> REJECTED (`incoming().buyerId != request.auth.uid`).
6. **Payload 6 (Buyer Creating a Product Listing)**:
   Buyer Charlie attempting `setDoc('/products/fake', { ... })` -> REJECTED (Buyers lack seller privileges).
7. **Payload 7 (Suspended User Mutation)**:
   A suspended seller trying to modify stock or product details -> REJECTED (Status check fails).
8. **Payload 8 (Non-Owner PII Harvesting / Blanket Read)**:
   User Bob trying to `getDoc('/users/alice')` -> REJECTED (Only alice or admin can read private user doc).
9. **Payload 9 (ID Poisoning Attack)**:
   Malicious client attempting to create `/products/../../etc` or oversized 2KB key -> REJECTED by `isValidId()`.
10. **Payload 10 (Direct Role Escalation on Profile Update)**:
    User trying to change their own role from `buyer` to `seller` or `admin` directly through browser `updateDoc` -> REJECTED.
11. **Payload 11 (Oversized Denial-of-Wallet Payload)**:
    Sending 50MB string in `description` or title -> REJECTED by `.size() <= MAX` bounds.
12. **Payload 12 (Direct Status Self-Approval)**:
    Pending seller submitting `updateDoc('/users/{uid}', { status: 'active' })` -> REJECTED (Status changes reserved for Admins).
