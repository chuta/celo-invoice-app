# Design Document - Safe Batch Payments

## Overview

This document defines the technical design, architecture, and correctness properties for the Safe Batch Payments feature. It translates the requirements into a concrete implementation plan with clear invariants and design decisions.

## Design Goals

1. **Safety First:** Never submit invalid transactions to Safe
2. **User Trust:** Always show accurate preview before submission
3. **Data Integrity:** Maintain consistency between invoices and batch payments
4. **Performance:** Handle up to 100 invoices in a batch efficiently
5. **Reliability:** Graceful error handling and recovery

## Correctness Properties

### Invariants (Must Always Be True)

#### INV-1: Transaction Integrity
- **Property:** Sum of MetaTransaction amounts MUST equal sum of selected invoice amounts
- **Verification:** Pre-submission validation check
- **Consequence if violated:** Financial loss, incorrect payments

#### INV-2: Address Validity
- **Property:** All recipient addresses MUST be valid Ethereum addresses
- **Verification:** Regex validation + checksum verification
- **Consequence if violated:** Transaction failure, funds lost

#### INV-3: Currency Consistency
- **Property:** All invoices in a batch MUST have the same currency
- **Verification:** Filter and validation before batch creation
- **Consequence if violated:** Mixed token transfers, transaction failure


#### INV-4: Status Consistency
- **Property:** Invoice status MUST match batch payment status
- **Verification:** Database triggers and application-level checks
- **Consequence if violated:** UI shows incorrect payment status

#### INV-5: Safe Environment
- **Property:** Batch payment features MUST only be available inside Safe iframe
- **Verification:** Safe SDK detection on app load
- **Consequence if violated:** Feature unavailable, poor UX

#### INV-6: Balance Sufficiency
- **Property:** Safe wallet MUST have sufficient balance before submission
- **Verification:** Pre-submission balance check via Safe SDK
- **Consequence if violated:** Transaction failure after approval

### Preconditions (Must Be True Before Operations)

#### PRE-1: Batch Creation
```
GIVEN: User wants to create batch payment
REQUIRES:
  - At least 2 invoices selected
  - All invoices have status = 'approved'
  - All invoices have same currency
  - All invoices have valid wallet_address
  - User is authenticated
  - App is running inside Safe
```

#### PRE-2: Safe Submission
```
GIVEN: User wants to submit batch to Safe
REQUIRES:
  - Batch preview validated
  - MetaTransactions array created
  - Safe has sufficient balance
  - Safe SDK initialized
  - User confirmed submission
```

#### PRE-3: Status Update
```
GIVEN: System wants to update batch status
REQUIRES:
  - Batch payment exists in database
  - Safe transaction hash is valid
  - Safe API is accessible
  - User owns the batch payment
```

### Postconditions (Must Be True After Operations)

#### POST-1: After Batch Creation
```
ENSURES:
  - batch_payments record created
  - All invoices linked to batch (batch_payment_id set)
  - All invoices have safe_tx_hash set
  - All invoices status = 'pending_execution'
  - Batch status = 'pending'
```

#### POST-2: After Successful Execution
```
ENSURES:
  - Batch status = 'executed'
  - All linked invoices status = 'paid'
  - executed_at timestamp set
  - Transaction hash recorded
```

#### POST-3: After Failed Execution
```
ENSURES:
  - Batch status = 'failed'
  - All linked invoices status = 'approved' (reverted)
  - failed_at timestamp set
  - error_message recorded
  - User can retry or cancel
```

## System Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     User Interface                       │
├─────────────────────────────────────────────────────────┤
│  Invoices.jsx          BatchPaymentPreview.jsx          │
│  (Selection UI)        (Review Modal)                    │
│                                                           │
│  BatchPayments.jsx     BatchActionBar.jsx               │
│  (Status Page)         (Action Controls)                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   React Context Layer                    │
├─────────────────────────────────────────────────────────┤
│  SafeContext.jsx       AuthContext.jsx                  │
│  (Safe SDK, Info)      (User Auth)                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Business Logic Layer                   │
├─────────────────────────────────────────────────────────┤
│  useBatchPayment.js    useBatchStatus.js                │
│  (Batch Operations)    (Status Tracking)                 │
│                                                           │
│  safeBatchBuilder.js   tokenEncoder.js                  │
│  (Transaction Build)   (ERC20 Encoding)                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Integration Layer                      │
├─────────────────────────────────────────────────────────┤
│  Safe Apps SDK         Supabase Client                  │
│  (Safe Integration)    (Database)                        │
│                                                           │
│  Safe Transaction API  Ethers.js                        │
│  (Status Checks)       (Encoding)                        │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

#### Flow 1: Batch Payment Creation
```
1. User selects invoices in Invoices.jsx
   ↓
2. BatchActionBar shows selection summary
   ↓
3. User clicks "Batch Pay"
   ↓
4. BatchPaymentPreview.jsx opens
   ↓
5. useBatchPayment validates selection
   ↓
6. safeBatchBuilder creates MetaTransactions
   ↓
7. Preview shows transaction details
   ↓
8. User confirms
   ↓
9. Safe SDK submits transaction
   ↓
10. Database records batch_payment
   ↓
11. Invoices updated with batch_payment_id
   ↓
12. Success message shown
```

#### Flow 2: Status Monitoring
```
1. User opens BatchPayments.jsx
   ↓
2. useBatchStatus fetches pending batches
   ↓
3. For each batch, poll Safe API
   ↓
4. If executed, update batch status
   ↓
5. Update linked invoice statuses
   ↓
6. UI refreshes automatically
```

## Database Design

### Schema

```sql
-- Batch payments table
CREATE TABLE batch_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  safe_address VARCHAR(42) NOT NULL,
  safe_tx_hash VARCHAR(66),
  chain_id INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  invoice_ids UUID[] NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  recipient_count INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  executed_at TIMESTAMP,
  failed_at TIMESTAMP,
  error_message TEXT,
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'executed', 'failed', 'cancelled')),
  CONSTRAINT positive_amount CHECK (total_amount > 0),
  CONSTRAINT positive_recipients CHECK (recipient_count > 0),
  CONSTRAINT valid_chain CHECK (chain_id IN (42220, 44787))
);

-- Indexes for performance
CREATE INDEX idx_batch_payments_user_id ON batch_payments(user_id);
CREATE INDEX idx_batch_payments_status ON batch_payments(status);
CREATE INDEX idx_batch_payments_safe_tx_hash ON batch_payments(safe_tx_hash);
CREATE INDEX idx_batch_payments_created_at ON batch_payments(created_at DESC);

-- Update invoices table
ALTER TABLE invoices 
ADD COLUMN batch_payment_id UUID REFERENCES batch_payments(id) ON DELETE SET NULL,
ADD COLUMN safe_tx_hash VARCHAR(66),
ADD COLUMN payment_method VARCHAR(20) DEFAULT 'manual';

CREATE INDEX idx_invoices_batch_payment_id ON invoices(batch_payment_id);

-- RLS Policies
ALTER TABLE batch_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own batch payments"
  ON batch_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own batch payments"
  ON batch_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own batch payments"
  ON batch_payments FOR UPDATE
  USING (auth.uid() = user_id);
```

### State Machine

```
Batch Payment States:

pending ──────────────────────────────────────────┐
   │                                               │
   │ (Safe signers approve & execute)              │
   ↓                                               │
executed                                           │
                                                   │
   │ (Transaction fails)                           │
   ↓                                               │
failed ────────────────────────────────────────────┘
   │
   │ (User cancels)
   ↓
cancelled
```

## Component Design

### 1. SafeContext.jsx

**Purpose:** Provide Safe SDK integration and Safe wallet information

**State:**
```typescript
{
  isSafeApp: boolean,
  safe: {
    safeAddress: string,
    chainId: number,
    owners: string[],
    threshold: number
  } | null,
  sdk: SafeAppsSDK | null,
  isLoading: boolean,
  error: string | null
}
```

**Methods:**
- `initializeSafe()` - Detect and connect to Safe
- `getSafeInfo()` - Fetch Safe wallet details
- `submitTransaction(txs)` - Submit batch to Safe

**Correctness:**
- MUST detect Safe environment on mount
- MUST handle SDK initialization errors
- MUST validate Safe info before exposing


### 2. useBatchPayment Hook

**Purpose:** Manage batch payment creation and submission logic

**Interface:**
```typescript
interface UseBatchPayment {
  selectedInvoices: Invoice[],
  selectInvoice: (id: string) => void,
  deselectInvoice: (id: string) => void,
  selectAll: () => void,
  clearSelection: () => void,
  canBatchPay: boolean,
  totalAmount: number,
  currency: string,
  createBatch: () => Promise<BatchPayment>,
  submitToSafe: (batch: BatchPayment) => Promise<string>,
  isSubmitting: boolean,
  error: string | null
}
```

**Validation Rules:**
```typescript
function canBatchPay(invoices: Invoice[]): boolean {
  return (
    invoices.length >= 2 &&
    invoices.every(inv => inv.status === 'approved') &&
    invoices.every(inv => inv.currency === invoices[0].currency) &&
    invoices.every(inv => isValidAddress(inv.wallet_address))
  )
}
```

**Correctness:**
- MUST validate all invoices before batch creation
- MUST check Safe balance before submission
- MUST handle submission errors gracefully
- MUST update database atomically

### 3. safeBatchBuilder.js

**Purpose:** Build Safe-compatible MetaTransaction arrays

**Core Function:**
```typescript
interface MetaTransaction {
  to: string
  value: string
  data: string
  operation?: number
}

function buildBatchTransaction(
  invoices: Invoice[],
  currency: 'CELO' | 'cUSD'
): MetaTransaction[] {
  if (currency === 'CELO') {
    return buildNativeTransfers(invoices)
  } else {
    return buildTokenTransfers(invoices, currency)
  }
}
```

**Native Token (CELO):**
```typescript
function buildNativeTransfers(invoices: Invoice[]): MetaTransaction[] {
  return invoices.map(invoice => ({
    to: invoice.wallet_address,
    value: parseUnits(invoice.amount.toString(), 18).toString(),
    data: '0x',
    operation: 0
  }))
}
```

**ERC20 Token (cUSD):**
```typescript
function buildTokenTransfers(
  invoices: Invoice[],
  tokenSymbol: string
): MetaTransaction[] {
  const tokenAddress = getTokenAddress(tokenSymbol)
  
  return invoices.map(invoice => ({
    to: tokenAddress,
    value: '0',
    data: encodeTransfer(
      invoice.wallet_address,
      parseUnits(invoice.amount.toString(), 18)
    ),
    operation: 0
  }))
}
```

**Correctness:**
- MUST validate all addresses before encoding
- MUST use correct decimal places (18 for CELO/cUSD)
- MUST encode ERC20 transfers correctly
- MUST verify total amount matches invoice sum

### 4. tokenEncoder.js

**Purpose:** Encode ERC20 token transfer function calls

**Implementation:**
```typescript
import { Interface } from 'ethers/lib/utils'

const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)'
]

function encodeTransfer(recipient: string, amount: BigNumber): string {
  const iface = new Interface(ERC20_ABI)
  return iface.encodeFunctionData('transfer', [recipient, amount])
}

function decodeTransfer(data: string): { recipient: string, amount: BigNumber } {
  const iface = new Interface(ERC20_ABI)
  const decoded = iface.decodeFunctionData('transfer', data)
  return {
    recipient: decoded[0],
    amount: decoded[1]
  }
}
```

**Token Addresses (Celo Mainnet):**
```typescript
const TOKEN_ADDRESSES = {
  cUSD: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
  cEUR: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
  cREAL: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787'
}
```

**Correctness:**
- MUST use correct token contract addresses
- MUST validate recipient address format
- MUST handle encoding errors
- MUST verify decoded data matches input

### 5. BatchPaymentPreview.jsx

**Purpose:** Display batch payment details for user review

**Props:**
```typescript
interface BatchPaymentPreviewProps {
  invoices: Invoice[]
  onConfirm: () => Promise<void>
  onCancel: () => void
  isOpen: boolean
}
```

**Display Logic:**
```typescript
function calculateSummary(invoices: Invoice[]) {
  return {
    count: invoices.length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    currency: invoices[0].currency,
    recipients: [...new Set(invoices.map(inv => inv.wallet_address))],
    estimatedGas: estimateGasCost(invoices.length)
  }
}
```

**Validation Display:**
```typescript
function validateBeforeSubmit(invoices: Invoice[], safeBalance: number) {
  const total = calculateTotal(invoices)
  
  if (total > safeBalance) {
    return {
      valid: false,
      error: `Insufficient balance. Need ${total} but Safe has ${safeBalance}`
    }
  }
  
  return { valid: true }
}
```

**Correctness:**
- MUST show accurate total amount
- MUST display all recipients
- MUST check Safe balance before enabling submit
- MUST show clear error messages

### 6. BatchActionBar.jsx

**Purpose:** Floating action bar for batch operations

**Props:**
```typescript
interface BatchActionBarProps {
  selectedCount: number
  totalAmount: number
  currency: string
  onBatchPay: () => void
  onCancel: () => void
}
```

**Behavior:**
- Sticky positioning at bottom of screen
- Slide up animation when invoices selected
- Slide down animation when cleared
- Responsive design for mobile

**Correctness:**
- MUST update in real-time as selection changes
- MUST show accurate count and total
- MUST be accessible (keyboard navigation)

### 7. useBatchStatus Hook

**Purpose:** Monitor and update batch payment status

**Interface:**
```typescript
interface UseBatchStatus {
  batches: BatchPayment[]
  isLoading: boolean
  error: string | null
  refreshStatus: (batchId: string) => Promise<void>
  checkAllPending: () => Promise<void>
}
```

**Status Checking Logic:**
```typescript
async function checkBatchStatus(
  safeTxHash: string,
  safeAddress: string,
  chainId: number
): Promise<'pending' | 'executed' | 'failed'> {
  try {
    const tx = await fetchSafeTransaction(safeTxHash, safeAddress, chainId)
    
    if (tx.isExecuted) {
      return 'executed'
    }
    
    if (tx.isSuccessful === false) {
      return 'failed'
    }
    
    return 'pending'
  } catch (error) {
    console.error('Status check failed:', error)
    return 'pending' // Assume pending on error
  }
}
```

**Update Strategy:**
```typescript
// Poll pending batches every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    checkAllPending()
  }, 30000)
  
  return () => clearInterval(interval)
}, [])
```

**Correctness:**
- MUST handle API errors gracefully
- MUST update database atomically
- MUST update all linked invoices
- MUST not create duplicate updates

## API Integration

### Safe Transaction Service API

**Base URLs:**
```typescript
const SAFE_API_URLS = {
  42220: 'https://safe-transaction-celo.safe.global',
  44787: 'https://safe-transaction-alfajores.safe.global'
}
```

**Get Transaction Status:**
```typescript
async function fetchSafeTransaction(
  safeTxHash: string,
  safeAddress: string,
  chainId: number
) {
  const baseUrl = SAFE_API_URLS[chainId]
  const url = `${baseUrl}/api/v1/safes/${safeAddress}/multisig-transactions/${safeTxHash}/`
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch transaction: ${response.statusText}`)
  }
  
  return response.json()
}
```

**Response Schema:**
```typescript
interface SafeTransaction {
  safe: string
  to: string
  value: string
  data: string
  operation: number
  safeTxHash: string
  isExecuted: boolean
  isSuccessful: boolean | null
  executionDate: string | null
  confirmations: Array<{
    owner: string
    submissionDate: string
  }>
}
```

## Error Handling

### Error Categories

#### 1. Validation Errors (User-fixable)
```typescript
class ValidationError extends Error {
  constructor(message: string, field?: string) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
  }
}

// Examples:
- "Please select at least 2 invoices"
- "All invoices must have the same currency"
- "Invalid wallet address in invoice INV-123"
```

#### 2. Safe SDK Errors (Technical)
```typescript
class SafeSDKError extends Error {
  constructor(message: string, originalError?: Error) {
    super(message)
    this.name = 'SafeSDKError'
    this.originalError = originalError
  }
}

// Examples:
- "Failed to connect to Safe"
- "Transaction submission failed"
- "Safe SDK not initialized"
```

#### 3. Network Errors (Transient)
```typescript
class NetworkError extends Error {
  constructor(message: string, retryable: boolean = true) {
    super(message)
    this.name = 'NetworkError'
    this.retryable = retryable
  }
}

// Examples:
- "Failed to fetch Safe transaction status"
- "Network request timeout"
- "Safe API unavailable"
```

#### 4. Balance Errors (User-actionable)
```typescript
class InsufficientBalanceError extends Error {
  constructor(required: number, available: number, currency: string) {
    super(`Insufficient balance. Need ${required} ${currency} but Safe has ${available} ${currency}`)
    this.name = 'InsufficientBalanceError'
    this.required = required
    this.available = available
    this.currency = currency
  }
}
```

### Error Handling Strategy

```typescript
async function handleBatchPayment(invoices: Invoice[]) {
  try {
    // Validate
    validateInvoices(invoices)
    
    // Build
    const transactions = buildBatchTransaction(invoices)
    
    // Check balance
    await checkSufficientBalance(transactions)
    
    // Submit
    const safeTxHash = await submitToSafe(transactions)
    
    // Save
    await saveBatchPayment(safeTxHash, invoices)
    
    return { success: true, safeTxHash }
    
  } catch (error) {
    if (error instanceof ValidationError) {
      // Show user-friendly message
      showError(error.message)
    } else if (error instanceof InsufficientBalanceError) {
      // Show balance error with action
      showBalanceError(error)
    } else if (error instanceof NetworkError && error.retryable) {
      // Offer retry
      showRetryableError(error)
    } else {
      // Generic error
      showGenericError('Failed to create batch payment. Please try again.')
      console.error(error)
    }
    
    return { success: false, error }
  }
}
```


## Security Considerations

### 1. Address Validation

**Requirement:** All wallet addresses MUST be validated before transaction creation

**Implementation:**
```typescript
import { isAddress, getAddress } from 'ethers/lib/utils'

function validateAddress(address: string): boolean {
  try {
    // Check format
    if (!isAddress(address)) {
      return false
    }
    
    // Verify checksum
    const checksummed = getAddress(address)
    
    // Ensure not zero address
    if (checksummed === '0x0000000000000000000000000000000000000000') {
      return false
    }
    
    return true
  } catch {
    return false
  }
}
```

### 2. Amount Validation

**Requirement:** Transaction amounts MUST match invoice amounts exactly

**Implementation:**
```typescript
function verifyTransactionAmounts(
  transactions: MetaTransaction[],
  invoices: Invoice[]
): boolean {
  // Check count matches
  if (transactions.length !== invoices.length) {
    return false
  }
  
  // Check each amount
  for (let i = 0; i < transactions.length; i++) {
    const txAmount = BigNumber.from(transactions[i].value)
    const invoiceAmount = parseUnits(invoices[i].amount.toString(), 18)
    
    if (!txAmount.eq(invoiceAmount)) {
      return false
    }
  }
  
  return true
}
```

### 3. Row Level Security (RLS)

**Requirement:** Users MUST only access their own batch payments

**Database Policies:**
```sql
-- Prevent users from viewing other users' batches
CREATE POLICY "Users can only view own batches"
  ON batch_payments FOR SELECT
  USING (auth.uid() = user_id);

-- Prevent users from modifying other users' batches
CREATE POLICY "Users can only update own batches"
  ON batch_payments FOR UPDATE
  USING (auth.uid() = user_id);

-- Ensure user_id matches authenticated user on insert
CREATE POLICY "Users can only create own batches"
  ON batch_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 4. SQL Injection Prevention

**Requirement:** All database queries MUST use parameterized queries

**Implementation:**
```typescript
// ✅ CORRECT - Parameterized query
const { data, error } = await supabase
  .from('batch_payments')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'pending')

// ❌ WRONG - String concatenation
const query = `SELECT * FROM batch_payments WHERE user_id = '${userId}'`
```

### 5. Safe Transaction Verification

**Requirement:** Verify transaction hash before storing

**Implementation:**
```typescript
function isValidSafeTxHash(hash: string): boolean {
  // Must be 66 characters (0x + 64 hex chars)
  if (hash.length !== 66) {
    return false
  }
  
  // Must start with 0x
  if (!hash.startsWith('0x')) {
    return false
  }
  
  // Must be valid hex
  const hexPattern = /^0x[0-9a-fA-F]{64}$/
  return hexPattern.test(hash)
}
```

## Performance Optimization

### 1. Batch Size Limits

**Constraint:** Maximum 100 invoices per batch

**Rationale:**
- Gas limit constraints
- UI performance
- Transaction complexity

**Implementation:**
```typescript
const MAX_BATCH_SIZE = 100

function validateBatchSize(invoices: Invoice[]): void {
  if (invoices.length > MAX_BATCH_SIZE) {
    throw new ValidationError(
      `Batch size exceeds maximum of ${MAX_BATCH_SIZE} invoices. ` +
      `Please split into multiple batches.`
    )
  }
}
```

### 2. Database Indexing

**Indexes for common queries:**
```sql
-- Fast lookup by user
CREATE INDEX idx_batch_payments_user_id ON batch_payments(user_id);

-- Fast filtering by status
CREATE INDEX idx_batch_payments_status ON batch_payments(status);

-- Fast lookup by Safe transaction hash
CREATE INDEX idx_batch_payments_safe_tx_hash ON batch_payments(safe_tx_hash);

-- Fast sorting by date
CREATE INDEX idx_batch_payments_created_at ON batch_payments(created_at DESC);

-- Fast invoice lookup by batch
CREATE INDEX idx_invoices_batch_payment_id ON invoices(batch_payment_id);
```

### 3. Status Polling Optimization

**Strategy:** Exponential backoff for status checks

**Implementation:**
```typescript
class StatusPoller {
  private intervals = [5000, 10000, 30000, 60000] // 5s, 10s, 30s, 1m
  private currentIndex = 0
  
  async pollWithBackoff(batchId: string) {
    const status = await checkBatchStatus(batchId)
    
    if (status === 'pending') {
      // Increase interval
      this.currentIndex = Math.min(
        this.currentIndex + 1,
        this.intervals.length - 1
      )
      
      const nextInterval = this.intervals[this.currentIndex]
      setTimeout(() => this.pollWithBackoff(batchId), nextInterval)
    } else {
      // Reset for next batch
      this.currentIndex = 0
    }
  }
}
```

### 4. Memoization

**Cache expensive calculations:**
```typescript
import { useMemo } from 'react'

function BatchPaymentPreview({ invoices }) {
  const summary = useMemo(() => {
    return {
      total: invoices.reduce((sum, inv) => sum + inv.amount, 0),
      recipients: [...new Set(invoices.map(inv => inv.wallet_address))],
      currency: invoices[0]?.currency
    }
  }, [invoices])
  
  return <div>{/* Use summary */}</div>
}
```

## Testing Strategy

### Unit Tests

**Test Coverage Requirements:**
- All validation functions: 100%
- Transaction builders: 100%
- Token encoders: 100%
- Error handlers: 100%

**Example Tests:**
```typescript
describe('safeBatchBuilder', () => {
  describe('buildNativeTransfers', () => {
    it('should create correct MetaTransactions for CELO', () => {
      const invoices = [
        { wallet_address: '0x123...', amount: 100 },
        { wallet_address: '0x456...', amount: 200 }
      ]
      
      const txs = buildNativeTransfers(invoices)
      
      expect(txs).toHaveLength(2)
      expect(txs[0].to).toBe('0x123...')
      expect(txs[0].value).toBe(parseUnits('100', 18).toString())
      expect(txs[0].data).toBe('0x')
    })
    
    it('should throw on invalid address', () => {
      const invoices = [
        { wallet_address: 'invalid', amount: 100 }
      ]
      
      expect(() => buildNativeTransfers(invoices)).toThrow(ValidationError)
    })
  })
})
```

### Integration Tests

**Test Scenarios:**
1. Full batch payment flow (selection → preview → submit)
2. Status update flow (pending → executed)
3. Error handling (insufficient balance, network errors)
4. Multi-user isolation (RLS policies)

**Example:**
```typescript
describe('Batch Payment Flow', () => {
  it('should create and submit batch payment', async () => {
    // Setup
    const user = await createTestUser()
    const invoices = await createTestInvoices(user, 3)
    
    // Select invoices
    const selected = await selectInvoices(invoices)
    
    // Create batch
    const batch = await createBatch(selected)
    expect(batch.status).toBe('pending')
    
    // Submit to Safe
    const safeTxHash = await submitToSafe(batch)
    expect(safeTxHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
    
    // Verify database
    const savedBatch = await fetchBatch(batch.id)
    expect(savedBatch.safe_tx_hash).toBe(safeTxHash)
    
    // Verify invoices updated
    const updatedInvoices = await fetchInvoices(invoices.map(i => i.id))
    updatedInvoices.forEach(inv => {
      expect(inv.batch_payment_id).toBe(batch.id)
      expect(inv.status).toBe('pending_execution')
    })
  })
})
```

### E2E Tests

**Test Scenarios:**
1. User opens app in Safe iframe
2. User selects multiple invoices
3. User reviews and submits batch
4. User views batch status
5. Batch executes and invoices update

**Tools:**
- Playwright or Cypress for browser automation
- Safe Test Environment for Safe integration
- Celo Alfajores Testnet for blockchain

## Deployment Strategy

### Phase 1: Development (Week 1-2)
- Set up Safe SDK integration
- Create SafeContext
- Build transaction builder
- Unit tests

### Phase 2: Feature Development (Week 3-4)
- Build UI components
- Implement batch creation
- Implement status tracking
- Integration tests

### Phase 3: Testing (Week 5-6)
- E2E tests on testnet
- User acceptance testing
- Performance testing
- Security audit

### Phase 4: Production (Week 7-8)
- Deploy to production
- Monitor errors
- Gather user feedback
- Iterate

### Rollout Plan

**Beta Release:**
- Enable for 5-10 test users
- Monitor closely for errors
- Gather feedback
- Fix critical issues

**Production Release:**
- Enable for all users
- Announce feature
- Provide documentation
- Monitor metrics

### Monitoring

**Key Metrics:**
```typescript
// Track in analytics
{
  event: 'batch_payment_created',
  properties: {
    invoice_count: number,
    total_amount: number,
    currency: string,
    user_id: string
  }
}

{
  event: 'batch_payment_executed',
  properties: {
    batch_id: string,
    time_to_execute: number, // seconds
    success: boolean
  }
}

{
  event: 'batch_payment_failed',
  properties: {
    batch_id: string,
    error_type: string,
    error_message: string
  }
}
```

**Error Tracking:**
- Use Sentry or similar for error monitoring
- Alert on critical errors
- Track error rates
- Monitor API failures

## Migration Plan

### Database Migration

**Step 1: Create new tables**
```sql
-- Run in Supabase SQL Editor
-- File: migrations/001_create_batch_payments.sql

CREATE TABLE batch_payments (
  -- schema as defined above
);

-- Add indexes
-- Add RLS policies
```

**Step 2: Update existing tables**
```sql
-- File: migrations/002_update_invoices.sql

ALTER TABLE invoices 
ADD COLUMN batch_payment_id UUID REFERENCES batch_payments(id) ON DELETE SET NULL,
ADD COLUMN safe_tx_hash VARCHAR(66),
ADD COLUMN payment_method VARCHAR(20) DEFAULT 'manual';

CREATE INDEX idx_invoices_batch_payment_id ON invoices(batch_payment_id);
```

**Step 3: Verify migration**
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('batch_payments');

-- Check columns added
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'invoices' 
AND column_name IN ('batch_payment_id', 'safe_tx_hash', 'payment_method');

-- Check RLS enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'batch_payments';
```

### Code Migration

**Step 1: Install dependencies**
```bash
npm install @safe-global/safe-apps-sdk @safe-global/safe-apps-react-sdk ethers@5
```

**Step 2: Create new files**
- Create all components and hooks
- Add to git
- Run tests

**Step 3: Update existing files**
- Add batch selection to Invoices.jsx
- Add Safe indicator to Layout.jsx
- Update App.jsx with new routes

**Step 4: Deploy**
- Deploy to staging
- Test thoroughly
- Deploy to production

## Documentation

### User Documentation

**Topics to cover:**
1. What is batch payment?
2. How to use batch payment
3. Requirements (Safe wallet, approved invoices)
4. Step-by-step guide with screenshots
5. Troubleshooting common issues
6. FAQ

### Developer Documentation

**Topics to cover:**
1. Architecture overview
2. Component documentation
3. API reference
4. Database schema
5. Testing guide
6. Deployment guide

### Video Tutorial

**Script:**
1. Introduction (30s)
2. Prerequisites (30s)
3. Selecting invoices (1m)
4. Reviewing batch (1m)
5. Submitting to Safe (1m)
6. Tracking status (1m)
7. Conclusion (30s)

**Total:** 5 minutes

---

## Appendix

### A. Token Contract Addresses

**Celo Mainnet (Chain ID: 42220):**
```typescript
const MAINNET_TOKENS = {
  cUSD: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
  cEUR: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
  cREAL: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787'
}
```

**Celo Alfajores Testnet (Chain ID: 44787):**
```typescript
const TESTNET_TOKENS = {
  cUSD: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
  cEUR: '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F',
  cREAL: '0xE4D517785D091D3c54818832dB6094bcc2744545'
}
```

### B. Safe API Endpoints

**Celo Mainnet:**
- Base URL: `https://safe-transaction-celo.safe.global`
- Get transaction: `/api/v1/safes/{address}/multisig-transactions/{safeTxHash}/`
- Get Safe info: `/api/v1/safes/{address}/`

**Celo Alfajores:**
- Base URL: `https://safe-transaction-alfajores.safe.global`
- Same endpoints as mainnet

### C. Gas Estimation

**Approximate gas costs:**
- Single transfer: ~50,000 gas
- Batch of 10: ~200,000 gas (20k per transfer)
- Batch of 50: ~800,000 gas (16k per transfer)
- Batch of 100: ~1,500,000 gas (15k per transfer)

**Savings:**
- 10 invoices: 60% gas savings
- 50 invoices: 68% gas savings
- 100 invoices: 70% gas savings

### D. Browser Compatibility

**Supported:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Not Supported:**
- Internet Explorer (any version)
- Opera Mini
- UC Browser

---

## Conclusion

This design document provides a comprehensive technical blueprint for implementing Safe Batch Payments. It defines:

✅ **Correctness Properties:** Invariants, preconditions, postconditions
✅ **Architecture:** Component structure, data flow, integration points
✅ **Database Design:** Schema, indexes, RLS policies
✅ **Component Design:** Detailed specifications for each component
✅ **Security:** Address validation, amount verification, RLS
✅ **Performance:** Optimization strategies, caching, indexing
✅ **Testing:** Unit, integration, E2E test strategies
✅ **Deployment:** Migration plan, rollout strategy, monitoring

**Next Steps:**
1. Review and approve this design
2. Create implementation tasks document
3. Begin Phase 1 development
4. Iterate based on feedback

**Estimated Timeline:** 8 weeks from start to production

**Success Criteria:**
- 90% time savings for batch payments
- 70% gas fee reduction
- Zero critical bugs in production
- 80%+ user satisfaction score

