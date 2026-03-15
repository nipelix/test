---
name: Betting Domain Expert
description: Sportsbook betting system business logic — coupon creation, odds calculation, settlement, credit tier resolution, cancellation rules
globs: ["server/api/coupons/**", "server/utils/coupon.ts", "server/utils/odds.ts", "app/stores/betslip.ts", "app/composables/useCouponList.ts"]
---

# Betting Domain Expert

You are an expert in sportsbook/betting platform business logic.

## Coupon Lifecycle

```
CREATION → VALIDATION → CALCULATION → SETTLEMENT
```

### Creation Rules
- Only PLAYER and SUB_DEALER roles can create coupons
- User-submitted odds are IGNORED — always fetch real odds from provider
- Apply live delay if any selection is live: `await delay(liveDelaySeconds * 1000)`
- Check all suspensions before accepting (sport, country, league, match, market, selection)

### Odds Calculation (Additive Model)
```
finalOdds = combineOdds(baseRate, matchAdjustment, globalAdjustment)

combineOdds(base, ...adjustments):
  total = base + sum(adjustments)
  rounded = round(total, 2)
  return max(rounded, 1.00)  // Minimum 1.00

Global Adjustment = sum of 4 levels:
  1. market-wide, any-feed
  2. market-wide, specific-feed
  3. specific-selection, any-feed
  4. exact match (market + selection + feed)
```

### Coupon Categories
- **Single**: SPLITS into separate coupons (one per selection, each gets own stake)
- **Combination**: All selections in one coupon, all must win
- **System**: Combination subsets (doubles, trebles, etc.)

### Validation Pipeline (exact order)
1. Live delay (if applicable)
2. Sync selections from provider (real odds)
3. Sanitize stakes (remove fake selection IDs)
4. Run validation chain
5. Calculate coupon totals
6. Post-calculation validation:
   - `minStakeAmount <= totalStake <= maxStakeAmount`
   - `totalOdds <= maxTotalOdds`
   - `potentialPayout <= maxPayoutAmount`
   - `mixLiveAndLine` check

### Credit Tier Resolution
```
stake → find matching credit range (minAmount <= stake <= maxAmount)
→ creditDeducted = range.creditDeduction
→ Player MONEY -= stake
→ Dealer CREDIT -= creditDeducted (enforced: newBalance >= dealerMinBalance)
```

### Cancellation Rules
- Status must be "ONGOING" AND state "OPEN"
- Must be within cancel window: `NOW < cancel_expires_at`
- Refund: Player gets stake back
- Credit return: `credit - cancelPenalty` returned to dealer

### Settlement
- Scheduled via worker jobs
- All selections checked (won/lost/void)
- When all settled: calculate final status
- Winner: Player MONEY += potentialPayout
- All financial operations MUST be atomic (single DB transaction)

### Betting Rules Hierarchy
```
System Rules (base)
  → Admin overrides (merged with system)
    → Dealer overrides (merged, cannot exceed admin limits)
      → SubDealer overrides (merged, cannot exceed dealer limits)

MIN limits: Math.max(dealer, admin) — higher wins
MAX limits: Math.min(dealer, admin) — lower wins
BOOLEAN: false always wins (most restrictive)
```

## Betslip Store Rules
- Same-event check: if `allowSameEventSelections=false`, remove existing selection from same event
- Odds change detection: track original odds at selection time
- Category auto-switch: 2+ selections → combination, <2 → single, <3 → no system
- 15-minute inactivity auto-clear
- Lock during submission (no mutations while placing bet)
- Max selections enforced from betting rules

## Database Precision
- Odds columns: `numeric(10, 4)` — 4 decimal places minimum
- Money columns: `numeric(15, 2)`
- All financial arithmetic in SQL (not JS floating-point)
