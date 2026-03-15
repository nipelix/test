---
name: Financial Ledger Expert
description: Double-entry ledger, atomic transactions, idempotency keys, balance operations with FOR UPDATE locking
globs: ["server/utils/finance.ts", "server/api/wallets/**", "server/api/users/[id].balance.post.ts", "server/database/schema/ledger.ts", "server/database/schema/wallets.ts"]
---

# Financial Ledger Expert

You are an expert in financial transaction systems for betting platforms.

## Core Principles

1. **NEVER use JavaScript floating-point for money** — all arithmetic in SQL `numeric` type
2. **Every financial operation MUST be atomic** — single DB transaction
3. **Every transaction MUST have an idempotency key** — prevents duplicate processing
4. **Use FOR UPDATE row locking** — prevents concurrent balance modifications

## Wallet Schema

```sql
wallets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id),
  balance NUMERIC(15,2) NOT NULL DEFAULT '0',
  credit_limit NUMERIC(15,2) NOT NULL DEFAULT '0',
  currency VARCHAR(10) NOT NULL DEFAULT 'TRY'
)
```

## Transaction Schema (Double-Entry)

```sql
transactions (
  id SERIAL PRIMARY KEY,
  type transaction_type NOT NULL,  -- BET, WIN, CANCEL, REFUND, DEPOSIT, WITHDRAWAL, etc.
  idempotency_key VARCHAR(255) UNIQUE,  -- REQUIRED, prevents duplicates
  reference_type VARCHAR(50),  -- COUPON, MANUAL, INITIAL
  reference_id INTEGER,
  description VARCHAR(500),
  metadata JSONB,
  created_by INTEGER
)

ledger_entries (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER REFERENCES transactions(id),
  wallet_id INTEGER REFERENCES wallets(id),
  direction ledger_direction NOT NULL,  -- DEBIT or CREDIT
  amount NUMERIC(15,2) NOT NULL,
  balance_before NUMERIC(15,2) NOT NULL,
  balance_after NUMERIC(15,2) NOT NULL
)
```

## executeTransaction Pattern

```typescript
async function executeTransaction(input: TransactionInput, tx?: DbTransaction): Promise<TransactionResult> {
  const executor = tx ?? useDb()  // Accept external tx for multi-wallet atomicity

  // 1. Lock wallet row
  const [wallet] = await executor.select().from(wallets)
    .where(eq(wallets.id, input.walletId)).for('update')

  // 2. Calculate new balance IN SQL (not JS)
  // DEBIT: balance - amount (check sufficient funds)
  // CREDIT: balance + amount

  // 3. Update wallet atomically
  await executor.update(wallets).set({
    balance: sql`(balance::numeric + ${amount}::numeric)::text`
  })

  // 4. Create transaction record (with idempotency key)
  // 5. Create ledger entry (before/after balance)
}
```

## Multi-Wallet Operations (CRITICAL)

When two wallets must change atomically (e.g., balance transfer):

```typescript
// CORRECT: Single outer transaction, pass tx to inner calls
await db.transaction(async (tx) => {
  await executeTransaction({ ...playerParams }, tx)
  await executeTransaction({ ...dealerParams }, tx)
})

// WRONG: Two separate transactions (partial failure = money lost)
await executeTransaction({ ...playerParams })  // succeeds
await executeTransaction({ ...dealerParams })  // fails → inconsistent!
```

## Balance Flow Rules

| Operation | Target | Source Adjustment |
|-----------|--------|-------------------|
| Agent balance | Admin → Agent | NO inverse (admin unlimited) |
| Dealer balance | Admin/Agent → Dealer | YES — parent wallet debited |
| SubDealer balance | Dealer → SubDealer | NO inverse (credit at coupon time) |
| Player balance | SubDealer → Player | YES — parent wallet debited |
| Bet placed | Player | Player MONEY -= stake, Dealer CREDIT -= creditTier |
| Bet won | Player | Player MONEY += payout |
| Bet cancelled | Player + Dealer | Player refunded, Dealer credit returned (minus penalty) |

## Idempotency Key Patterns

```typescript
// Bet operations
`bet:${couponId}:player`
`bet:${couponId}:dealer`

// Manual balance operations
`manual:${actorId}:${targetId}:${type}:${amount}:${timestamp}`

// Win/cancel/refund
`win:${couponId}`
`cancel:${couponId}:player`
`cancel:${couponId}:dealer`
`refund:${couponId}:player`
`refund:${couponId}:dealer`

// Initial balance on user creation
`initial:${userId}`
```

## Anti-Patterns to AVOID

- ❌ `parseFloat(wallet.balance)` — use SQL arithmetic
- ❌ `executeTransaction()` without `tx` param in multi-wallet ops
- ❌ Missing idempotency key — allows duplicate transactions
- ❌ `version` column without checking it in WHERE — dead optimistic lock
- ❌ Checking balance in JS then updating in SQL — TOCTOU race condition
