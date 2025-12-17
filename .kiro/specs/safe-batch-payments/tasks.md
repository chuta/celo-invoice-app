# Implementation Tasks - Safe Batch Payments

## Overview

This document breaks down the Safe Batch Payments feature into actionable implementation tasks. Each task includes acceptance criteria, dependencies, and estimated effort.

## Task Estimation Legend

- **XS:** 1-2 hours
- **S:** 2-4 hours
- **M:** 4-8 hours (half day to full day)
- **L:** 1-2 days
- **XL:** 2-5 days

---

## Phase 1: Foundation (Week 1-2)

### Task 1.1: Install Dependencies
**Effort:** XS (1 hour)  
**Priority:** Critical  
**Dependencies:** None

**Description:**
Install required npm packages for Safe integration.

**Steps:**
```bash
cd celo-invoice-app
npm install @safe-global/safe-apps-sdk @safe-global/safe-apps-react-sdk ethers@5
```

**Acceptance Criteria:**
- [ ] All packages installed successfully
- [ ] No dependency conflicts
- [ ] Package.json updated
- [ ] Package-lock.json updated

---

### Task 1.2: Create SafeContext
**Effort:** M (6 hours)  
**Priority:** Critical  
**Dependencies:** Task 1.1

**Description:**
Create React context for Safe SDK integration and wallet information.

**Files to Create:**
- `src/contexts/SafeContext.jsx`

**Implementation:**
```typescript
// SafeContext.jsx structure:
- State: isSafeApp, safe, sdk, isLoading, error
- Methods: initializeSafe, getSafeInfo, submitTransaction
- Provider component
- useSafe hook
```

**Acceptance Criteria:**
- [ ] Context detects Safe environment on mount
- [ ] Retrieves Safe address, chain ID, owners, threshold
- [ ] Provides Safe SDK instance
- [ ] Handles initialization errors gracefully
- [ ] Exports useSafe hook for components
- [ ] Works both inside and outside Safe iframe

**Testing:**
- [ ] Unit test: Safe detection
- [ ] Unit test: Error handling
- [ ] Manual test: Open in Safe iframe
- [ ] Manual test: Open in regular browser

---


### Task 1.3: Add Safe Indicator to Layout
**Effort:** S (3 hours)  
**Priority:** High  
**Dependencies:** Task 1.2

**Description:**
Add visual indicator in header when connected to Safe.

**Files to Modify:**
- `src/components/Layout.jsx`

**Files to Create:**
- `src/components/SafeIndicator.jsx`

**Implementation:**
```jsx
// SafeIndicator.jsx
- Display Safe badge with wallet address (truncated)
- Show chain name (Celo Mainnet / Alfajores)
- Show number of owners and threshold
- Click to show full Safe info modal
```

**Acceptance Criteria:**
- [ ] Badge appears when inside Safe
- [ ] Badge hidden when not in Safe
- [ ] Shows truncated address (0x1234...5678)
- [ ] Shows chain name
- [ ] Shows owners/threshold (e.g., "2/3")
- [ ] Clicking opens info modal
- [ ] Responsive design for mobile

**Testing:**
- [ ] Visual test in Safe iframe
- [ ] Visual test in regular browser
- [ ] Test on mobile viewport

---

### Task 1.4: Create Database Migration
**Effort:** M (4 hours)  
**Priority:** Critical  
**Dependencies:** None

**Description:**
Create batch_payments table and update invoices table.

**Files to Create:**
- `celo-invoice-app/supabase-batch-payments-schema.sql`

**Implementation:**
```sql
-- Create batch_payments table
-- Add columns to invoices table
-- Create indexes
-- Add RLS policies
-- Add constraints
```

**Acceptance Criteria:**
- [ ] batch_payments table created with all columns
- [ ] invoices table updated with batch_payment_id, safe_tx_hash, payment_method
- [ ] All indexes created
- [ ] RLS policies applied
- [ ] Constraints added (status check, positive amounts, etc.)
- [ ] Migration tested on local Supabase

**Testing:**
- [ ] Run migration on local database
- [ ] Verify tables exist
- [ ] Verify RLS policies work
- [ ] Test insert/update/select operations

---

### Task 1.5: Create Token Configuration
**Effort:** XS (1 hour)  
**Priority:** High  
**Dependencies:** None

**Description:**
Create configuration file for token addresses and constants.

**Files to Create:**
- `src/config/tokens.js`

**Implementation:**
```javascript
// Token addresses for mainnet and testnet
// Chain IDs
// Safe API URLs
// Constants (MAX_BATCH_SIZE, etc.)
```

**Acceptance Criteria:**
- [ ] Token addresses for cUSD, cEUR, cREAL
- [ ] Separate configs for mainnet (42220) and testnet (44787)
- [ ] Safe API URLs configured
- [ ] Constants defined (MAX_BATCH_SIZE = 100)
- [ ] Exported as named exports

---

### Task 1.6: Create Safe App Manifest File
**Effort:** S (2 hours)  
**Priority:** Critical  
**Dependencies:** None

**Description:**
Create manifest.json file required for Safe App listing. This is mandatory for all Safe Apps.

**Files to Create:**
- `public/manifest.json`
- `public/safe-app-icon.svg` (app icon)

**Implementation:**
```json
{
  "name": "CeloAfricaDAO Invoice - Batch Payments",
  "description": "Pay multiple invoices in a single batch transaction through Safe multisig wallet",
  "iconPath": "safe-app-icon.svg"
}
```

**Acceptance Criteria:**
- [ ] manifest.json created in public directory
- [ ] App name clearly describes functionality
- [ ] Description is concise and accurate
- [ ] Icon file created (SVG format, square, 256x256px recommended)
- [ ] iconPath points to correct file location
- [ ] File is accessible at root URL (https://yourapp.com/manifest.json)

**Reference:** [Safe App Listing Requirements](https://help.safe.global/en/articles/145503-how-to-build-a-safe-app-and-get-it-listed-in-safe-wallet)

---

### Task 1.7: Configure CORS Headers for Manifest
**Effort:** S (2 hours)  
**Priority:** Critical  
**Dependencies:** Task 1.6

**Description:**
Configure CORS headers to allow Safe to access manifest.json file.

**Files to Modify:**
- `netlify.toml`

**Implementation:**
```toml
[[headers]]
  for = "/manifest.json"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET"
    Access-Control-Allow-Headers = "X-Requested-With, content-type, Authorization"
```

**Acceptance Criteria:**
- [ ] CORS headers configured in netlify.toml
- [ ] Headers allow GET requests from any origin
- [ ] Headers include required Access-Control-Allow-* values
- [ ] Manifest accessible from Safe iframe
- [ ] Tested with curl or browser dev tools

**Testing:**
```bash
curl -I https://yourapp.com/manifest.json
# Should show Access-Control-Allow-Origin: *
```

**Reference:** [Safe App Listing Requirements](https://help.safe.global/en/articles/145503-how-to-build-a-safe-app-and-get-it-listed-in-safe-wallet)

---

## Phase 2: Batch Selection (Week 3)

### Task 2.1: Add Checkbox Column to Invoice List
**Effort:** M (5 hours)  
**Priority:** Critical  
**Dependencies:** Task 1.2

**Description:**
Add multi-select functionality to invoice list.

**Files to Modify:**
- `src/pages/Invoices.jsx`

**Implementation:**
```jsx
// Add checkbox column
// Add selection state management
// Filter for approved invoices only
// Validate same currency
// Show/hide checkboxes based on Safe connection
```

**Acceptance Criteria:**
- [ ] Checkbox column appears when in Safe
- [ ] Only approved invoices have enabled checkboxes
- [ ] Pending/draft invoices have disabled checkboxes
- [ ] Selection state managed correctly
- [ ] Can select/deselect individual invoices
- [ ] Visual feedback for selected rows
- [ ] Accessible (keyboard navigation, ARIA labels)

**Testing:**
- [ ] Test selecting multiple invoices
- [ ] Test selecting invoices with different currencies
- [ ] Test with no approved invoices
- [ ] Test keyboard navigation

---

### Task 2.2: Create BatchActionBar Component
**Effort:** M (6 hours)  
**Priority:** Critical  
**Dependencies:** Task 2.1

**Description:**
Create floating action bar that appears when invoices are selected.

**Files to Create:**
- `src/components/BatchActionBar.jsx`

**Implementation:**
```jsx
// Sticky bottom bar
// Show selection count
// Show total amount and currency
// "Cancel" button to clear selection
// "Batch Pay" button to proceed
// Slide up/down animation
// Responsive design
```

**Acceptance Criteria:**
- [ ] Bar appears when invoices selected
- [ ] Bar hidden when no selection
- [ ] Shows accurate count and total
- [ ] Cancel button clears selection
- [ ] Batch Pay button opens preview
- [ ] Sticky positioning at bottom
- [ ] Smooth slide animations
- [ ] Responsive on mobile
- [ ] Accessible

**Testing:**
- [ ] Test appearance/disappearance
- [ ] Test with 1, 5, 50 invoices
- [ ] Test on mobile viewport
- [ ] Test keyboard navigation

---

### Task 2.3: Add "Select All" Functionality
**Effort:** S (3 hours)  
**Priority:** Medium  
**Dependencies:** Task 2.1

**Description:**
Add button to select all approved invoices with same currency.

**Files to Modify:**
- `src/pages/Invoices.jsx`

**Implementation:**
```jsx
// "Select All Approved" button
// Filter logic (approved + same currency)
// "Deselect All" button
// Keyboard shortcut (Ctrl/Cmd + A)
```

**Acceptance Criteria:**
- [ ] Button appears above invoice list
- [ ] Selects all approved invoices with same currency
- [ ] Shows count of selectable invoices
- [ ] Deselect all button appears when all selected
- [ ] Keyboard shortcut works
- [ ] Disabled when no approved invoices

**Testing:**
- [ ] Test with all same currency
- [ ] Test with mixed currencies
- [ ] Test with no approved invoices
- [ ] Test keyboard shortcut

---

### Task 2.4: Add Currency Filter Validation
**Effort:** S (2 hours)  
**Priority:** High  
**Dependencies:** Task 2.1

**Description:**
Prevent selection of invoices with different currencies.

**Files to Modify:**
- `src/pages/Invoices.jsx`

**Implementation:**
```jsx
// Detect first selected currency
// Disable checkboxes for other currencies
// Show tooltip explaining why disabled
// Clear selection if currency filter changes
```

**Acceptance Criteria:**
- [ ] First selected invoice sets currency filter
- [ ] Other currencies become disabled
- [ ] Tooltip shows "Can only batch same currency"
- [ ] Clearing selection resets filter
- [ ] Visual indication of disabled state

**Testing:**
- [ ] Select cUSD invoice, verify cEUR disabled
- [ ] Clear selection, verify all enabled
- [ ] Test with 3+ different currencies

---

## Phase 3: Transaction Building (Week 4)

### Task 3.1: Create safeBatchBuilder Service
**Effort:** L (8 hours)  
**Priority:** Critical  
**Dependencies:** Task 1.5

**Description:**
Create service to build Safe-compatible MetaTransaction arrays.

**Files to Create:**
- `src/services/safeBatchBuilder.js`

**Implementation:**
```javascript
// buildBatchTransaction(invoices, currency)
// buildNativeTransfers(invoices) - for CELO
// buildTokenTransfers(invoices, tokenSymbol) - for cUSD
// validateInvoices(invoices)
// calculateTotalAmount(invoices)
```

**Acceptance Criteria:**
- [ ] Builds correct MetaTransactions for CELO
- [ ] Builds correct MetaTransactions for cUSD
- [ ] Validates all addresses
- [ ] Validates all amounts
- [ ] Handles decimal conversion (18 decimals)
- [ ] Throws descriptive errors
- [ ] Verifies total amount matches
- [ ] Supports up to 100 invoices

**Testing:**
- [ ] Unit test: CELO transfers
- [ ] Unit test: cUSD transfers
- [ ] Unit test: Invalid addresses
- [ ] Unit test: Amount validation
- [ ] Unit test: 100 invoice batch

---

### Task 3.2: Create tokenEncoder Service
**Effort:** M (4 hours)  
**Priority:** Critical  
**Dependencies:** Task 1.1

**Description:**
Create service to encode ERC20 token transfer function calls.

**Files to Create:**
- `src/services/tokenEncoder.js`

**Implementation:**
```javascript
// encodeTransfer(recipient, amount)
// decodeTransfer(data)
// getTokenAddress(symbol, chainId)
// ERC20 ABI definition
```

**Acceptance Criteria:**
- [ ] Encodes transfer function correctly
- [ ] Decodes transfer data correctly
- [ ] Returns correct token addresses
- [ ] Handles mainnet and testnet
- [ ] Validates recipient address
- [ ] Handles BigNumber amounts

**Testing:**
- [ ] Unit test: Encode transfer
- [ ] Unit test: Decode transfer
- [ ] Unit test: Round-trip encode/decode
- [ ] Unit test: Token address lookup

---

### Task 3.3: Create BatchPaymentPreview Component
**Effort:** L (10 hours)  
**Priority:** Critical  
**Dependencies:** Task 3.1, Task 3.2

**Description:**
Create modal to preview batch payment before submission.

**Files to Create:**
- `src/components/BatchPaymentPreview.jsx`

**Implementation:**
```jsx
// Modal component
// Summary section (count, total, currency)
// Recipients list with amounts
// Estimated gas cost
// Balance check
// Confirm/Cancel buttons
// Loading state during submission
```

**Acceptance Criteria:**
- [ ] Shows accurate summary
- [ ] Lists all recipients with amounts
- [ ] Shows estimated gas cost
- [ ] Checks Safe balance
- [ ] Disables submit if insufficient balance
- [ ] Shows loading state during submission
- [ ] Shows success message after submission
- [ ] Shows error message on failure
- [ ] Responsive design
- [ ] Accessible (focus trap, ESC to close)

**Testing:**
- [ ] Test with 2 invoices
- [ ] Test with 50 invoices
- [ ] Test with insufficient balance
- [ ] Test submission success
- [ ] Test submission failure
- [ ] Test on mobile

---

### Task 3.4: Create useBatchPayment Hook
**Effort:** L (8 hours)  
**Priority:** Critical  
**Dependencies:** Task 3.1, Task 3.2, Task 3.3

**Description:**
Create custom hook to manage batch payment logic.

**Files to Create:**
- `src/hooks/useBatchPayment.js`

**Implementation:**
```javascript
// State management for selection
// selectInvoice, deselectInvoice, selectAll, clearSelection
// canBatchPay validation
// createBatch function
// submitToSafe function
// Error handling
```

**Acceptance Criteria:**
- [ ] Manages selection state
- [ ] Validates batch eligibility
- [ ] Creates batch payment record
- [ ] Submits to Safe SDK
- [ ] Updates invoice statuses
- [ ] Handles all error types
- [ ] Returns loading states
- [ ] Cleans up on unmount

**Testing:**
- [ ] Unit test: Selection logic
- [ ] Unit test: Validation
- [ ] Integration test: Full flow
- [ ] Test error scenarios

---

## Phase 4: Safe Submission (Week 5)

### Task 4.1: Implement Safe Transaction Submission
**Effort:** M (6 hours)  
**Priority:** Critical  
**Dependencies:** Task 1.2, Task 3.4

**Description:**
Implement actual submission to Safe using SDK.

**Files to Modify:**
- `src/contexts/SafeContext.jsx`
- `src/hooks/useBatchPayment.js`

**Implementation:**
```javascript
// submitTransaction method in SafeContext
// Call sdk.txs.send({ txs: metaTransactions })
// Handle response (safeTxHash)
// Error handling
// Timeout handling
```

**Acceptance Criteria:**
- [ ] Successfully submits to Safe
- [ ] Returns Safe transaction hash
- [ ] Handles SDK errors
- [ ] Handles network errors
- [ ] Handles timeout (30s)
- [ ] Shows user-friendly error messages
- [ ] Logs errors for debugging

**Testing:**
- [ ] Test successful submission
- [ ] Test with network error
- [ ] Test with Safe rejection
- [ ] Test timeout scenario

---

### Task 4.2: Create Batch Payment Database Record
**Effort:** M (5 hours)  
**Priority:** Critical  
**Dependencies:** Task 1.4, Task 4.1

**Description:**
Save batch payment record to database after Safe submission.

**Files to Modify:**
- `src/hooks/useBatchPayment.js`

**Implementation:**
```javascript
// Insert into batch_payments table
// Update invoices with batch_payment_id
// Update invoices with safe_tx_hash
// Update invoice status to 'pending_execution'
// Atomic transaction (all or nothing)
```

**Acceptance Criteria:**
- [ ] Creates batch_payments record
- [ ] Links all invoices to batch
- [ ] Updates invoice statuses
- [ ] Transaction is atomic
- [ ] Handles database errors
- [ ] Rolls back on failure
- [ ] Returns batch ID

**Testing:**
- [ ] Test successful creation
- [ ] Test database error handling
- [ ] Test rollback on failure
- [ ] Verify data integrity

---

### Task 4.3: Add Success/Error Notifications
**Effort:** S (3 hours)  
**Priority:** High  
**Dependencies:** Task 4.1, Task 4.2

**Description:**
Show toast notifications for batch payment results.

**Files to Modify:**
- `src/hooks/useBatchPayment.js`
- `src/components/BatchPaymentPreview.jsx`

**Implementation:**
```jsx
// Success toast with Safe transaction link
// Error toast with retry option
// Loading toast during submission
// Auto-dismiss after 5 seconds
```

**Acceptance Criteria:**
- [ ] Success toast shows Safe tx link
- [ ] Error toast shows error message
- [ ] Loading toast during submission
- [ ] Toasts auto-dismiss
- [ ] Can manually dismiss
- [ ] Accessible (screen reader announcements)

**Testing:**
- [ ] Test success notification
- [ ] Test error notification
- [ ] Test loading state
- [ ] Test screen reader

---

## Phase 5: Status Tracking (Week 6)

### Task 5.1: Create BatchPayments Page
**Effort:** L (10 hours)  
**Priority:** Critical  
**Dependencies:** Task 4.2

**Description:**
Create page to view all batch payments and their status.

**Files to Create:**
- `src/pages/BatchPayments.jsx`

**Files to Modify:**
- `src/App.jsx` (add route)
- `src/components/Layout.jsx` (add nav link)

**Implementation:**
```jsx
// List all batch payments
// Filter by status (pending, executed, failed)
// Sort by date
// Show summary cards
// Click to view details
// Link to Safe transaction
// Refresh button
```

**Acceptance Criteria:**
- [ ] Lists all user's batch payments
- [ ] Shows status badges (pending, executed, failed)
- [ ] Shows creation date
- [ ] Shows total amount and currency
- [ ] Shows invoice count
- [ ] Filter by status works
- [ ] Sort by date works
- [ ] Click opens detail view
- [ ] Link to Safe transaction works
- [ ] Responsive design

**Testing:**
- [ ] Test with no batches
- [ ] Test with pending batches
- [ ] Test with executed batches
- [ ] Test with failed batches
- [ ] Test filtering
- [ ] Test sorting

---

### Task 5.2: Create useBatchStatus Hook
**Effort:** M (6 hours)  
**Priority:** Critical  
**Dependencies:** Task 5.1

**Description:**
Create hook to fetch and monitor batch payment status.

**Files to Create:**
- `src/hooks/useBatchStatus.js`

**Implementation:**
```javascript
// fetchBatches(userId)
// checkBatchStatus(safeTxHash, safeAddress, chainId)
// updateBatchStatus(batchId, status)
// updateInvoiceStatuses(invoiceIds, status)
// Polling logic with exponential backoff
```

**Acceptance Criteria:**
- [ ] Fetches user's batch payments
- [ ] Checks status via Safe API
- [ ] Updates database when status changes
- [ ] Updates linked invoices
- [ ] Polls pending batches automatically
- [ ] Uses exponential backoff
- [ ] Handles API errors
- [ ] Cleans up on unmount

**Testing:**
- [ ] Test status fetching
- [ ] Test status update
- [ ] Test polling logic
- [ ] Test error handling

---

### Task 5.3: Integrate Safe Transaction Service API
**Effort:** M (5 hours)  
**Priority:** Critical  
**Dependencies:** Task 5.2

**Description:**
Create service to interact with Safe Transaction Service API.

**Files to Create:**
- `src/services/safeTransactionService.js`

**Implementation:**
```javascript
// fetchTransaction(safeTxHash, safeAddress, chainId)
// getSafeInfo(safeAddress, chainId)
// API URL configuration
// Error handling
// Retry logic
```

**Acceptance Criteria:**
- [ ] Fetches transaction by hash
- [ ] Returns execution status
- [ ] Handles mainnet and testnet
- [ ] Handles API errors
- [ ] Retries on network failure
- [ ] Timeout after 10 seconds

**Testing:**
- [ ] Test with valid transaction
- [ ] Test with invalid hash
- [ ] Test network error
- [ ] Test timeout

---

### Task 5.4: Add Batch Detail View
**Effort:** M (6 hours)  
**Priority:** High  
**Dependencies:** Task 5.1

**Description:**
Create detailed view for individual batch payment.

**Files to Create:**
- `src/components/BatchPaymentDetail.jsx`

**Implementation:**
```jsx
// Show all batch information
// List all included invoices
// Show Safe transaction details
// Show execution timeline
// Link to Safe UI
// Link to block explorer
// Refresh status button
```

**Acceptance Criteria:**
- [ ] Shows complete batch information
- [ ] Lists all invoices with links
- [ ] Shows Safe transaction hash
- [ ] Shows execution date (if executed)
- [ ] Shows error message (if failed)
- [ ] Links to Safe UI
- [ ] Links to block explorer
- [ ] Refresh button updates status
- [ ] Responsive design

**Testing:**
- [ ] Test with pending batch
- [ ] Test with executed batch
- [ ] Test with failed batch
- [ ] Test links work

---

## Phase 6: Polish & Testing (Week 7-8)

### Task 6.1: Add Comprehensive Error Handling
**Effort:** M (6 hours)  
**Priority:** High  
**Dependencies:** All previous tasks

**Description:**
Improve error handling across all components.

**Files to Modify:**
- All component and hook files

**Implementation:**
```javascript
// Validation errors
// Safe SDK errors
// Network errors
// Balance errors
// User-friendly messages
// Error boundaries
```

**Acceptance Criteria:**
- [ ] All errors caught and handled
- [ ] User-friendly error messages
- [ ] Error boundaries prevent crashes
- [ ] Errors logged for debugging
- [ ] Retry options where appropriate
- [ ] Fallback UI for errors

**Testing:**
- [ ] Test all error scenarios
- [ ] Test error boundaries
- [ ] Test error messages

---

### Task 6.2: Add Loading States
**Effort:** S (4 hours)  
**Priority:** Medium  
**Dependencies:** All previous tasks

**Description:**
Add loading indicators for all async operations.

**Files to Modify:**
- All component files

**Implementation:**
```jsx
// Skeleton loaders
// Spinner for buttons
// Progress indicators
// Disable interactions during loading
```

**Acceptance Criteria:**
- [ ] Loading states for all async operations
- [ ] Skeleton loaders for lists
- [ ] Button spinners during submission
- [ ] Interactions disabled during loading
- [ ] Accessible loading announcements

**Testing:**
- [ ] Test all loading states
- [ ] Test on slow network
- [ ] Test screen reader announcements

---

### Task 6.3: Write Unit Tests
**Effort:** L (12 hours)  
**Priority:** High  
**Dependencies:** All previous tasks

**Description:**
Write comprehensive unit tests for all services and hooks.

**Files to Create:**
- `src/services/__tests__/safeBatchBuilder.test.js`
- `src/services/__tests__/tokenEncoder.test.js`
- `src/hooks/__tests__/useBatchPayment.test.js`
- `src/hooks/__tests__/useBatchStatus.test.js`

**Implementation:**
```javascript
// Test all functions
// Test edge cases
// Test error scenarios
// Mock external dependencies
// Aim for 90%+ coverage
```

**Acceptance Criteria:**
- [ ] All services have tests
- [ ] All hooks have tests
- [ ] Edge cases covered
- [ ] Error scenarios covered
- [ ] 90%+ code coverage
- [ ] All tests pass

**Testing:**
```bash
npm test
npm run test:coverage
```

---


### Task 6.4: Write Integration Tests
**Effort:** L (10 hours)  
**Priority:** High  
**Dependencies:** Task 6.3

**Description:**
Write integration tests for complete user flows.

**Files to Create:**
- `src/__tests__/integration/batchPayment.test.js`
- `src/__tests__/integration/batchStatus.test.js`

**Implementation:**
```javascript
// Test full batch payment flow
// Test status monitoring flow
// Test error recovery
// Mock Supabase and Safe SDK
```

**Acceptance Criteria:**
- [ ] Full batch payment flow tested
- [ ] Status monitoring flow tested
- [ ] Error scenarios tested
- [ ] Database operations tested
- [ ] All tests pass

**Testing:**
```bash
npm run test:integration
```

---

### Task 6.5: E2E Testing on Testnet
**Effort:** L (12 hours)  
**Priority:** Critical  
**Dependencies:** All previous tasks

**Description:**
Test complete feature on Celo Alfajores testnet with real Safe.

**Setup:**
1. Create Safe on Alfajores
2. Fund with test CELO and cUSD
3. Create test invoices
4. Test full flow

**Test Scenarios:**
- [ ] Create batch with 2 invoices
- [ ] Create batch with 10 invoices
- [ ] Create batch with 50 invoices
- [ ] Submit to Safe
- [ ] Approve with signers
- [ ] Execute transaction
- [ ] Verify status updates
- [ ] Test insufficient balance error
- [ ] Test network error recovery
- [ ] Test on mobile device

**Acceptance Criteria:**
- [ ] All scenarios pass
- [ ] No critical bugs found
- [ ] Performance acceptable
- [ ] Mobile experience good

---

### Task 6.6: Create User Documentation
**Effort:** M (6 hours)  
**Priority:** High  
**Dependencies:** Task 6.5

**Description:**
Create comprehensive user documentation.

**Files to Create:**
- `celo-invoice-app/docs/BATCH_PAYMENTS_GUIDE.md`

**Content:**
1. Introduction
2. Prerequisites
3. Step-by-step guide with screenshots
4. Troubleshooting
5. FAQ
6. Video tutorial script

**Acceptance Criteria:**
- [ ] Clear introduction
- [ ] Prerequisites listed
- [ ] Step-by-step guide complete
- [ ] Screenshots included
- [ ] Troubleshooting section
- [ ] FAQ section
- [ ] Video script ready

---

### Task 6.7: Create Developer Documentation
**Effort:** M (5 hours)  
**Priority:** Medium  
**Dependencies:** All previous tasks

**Description:**
Document architecture and implementation for developers.

**Files to Create:**
- `celo-invoice-app/docs/BATCH_PAYMENTS_ARCHITECTURE.md`

**Content:**
1. Architecture overview
2. Component documentation
3. API reference
4. Database schema
5. Testing guide
6. Deployment guide

**Acceptance Criteria:**
- [ ] Architecture documented
- [ ] All components documented
- [ ] API reference complete
- [ ] Database schema documented
- [ ] Testing guide complete
- [ ] Deployment guide complete

---

### Task 6.8: Performance Optimization
**Effort:** M (6 hours)  
**Priority:** Medium  
**Dependencies:** Task 6.5

**Description:**
Optimize performance for large batches.

**Areas to Optimize:**
- Component re-renders
- Database queries
- API calls
- Memory usage

**Implementation:**
```javascript
// Add React.memo where appropriate
// Optimize database indexes
// Implement request caching
// Add pagination for large lists
```

**Acceptance Criteria:**
- [ ] Batch of 100 invoices loads in < 2s
- [ ] Preview modal opens in < 500ms
- [ ] Status updates in < 1s
- [ ] No memory leaks
- [ ] Smooth animations

**Testing:**
- [ ] Test with 100 invoices
- [ ] Profile with React DevTools
- [ ] Check memory usage
- [ ] Test on low-end device

---

### Task 6.9: Accessibility Audit
**Effort:** S (4 hours)  
**Priority:** High  
**Dependencies:** All previous tasks

**Description:**
Ensure feature is fully accessible.

**Areas to Check:**
- Keyboard navigation
- Screen reader support
- Color contrast
- Focus management
- ARIA labels

**Tools:**
- axe DevTools
- NVDA/JAWS screen reader
- Keyboard only navigation

**Acceptance Criteria:**
- [ ] All interactive elements keyboard accessible
- [ ] Screen reader announces all actions
- [ ] Color contrast meets WCAG AA
- [ ] Focus visible and logical
- [ ] ARIA labels correct
- [ ] No accessibility errors in axe

**Testing:**
- [ ] Test with keyboard only
- [ ] Test with screen reader
- [ ] Run axe audit
- [ ] Fix all issues

---

### Task 6.10: Security Audit
**Effort:** M (5 hours)  
**Priority:** Critical  
**Dependencies:** All previous tasks

**Description:**
Audit security of implementation.

**Areas to Check:**
- Address validation
- Amount validation
- SQL injection prevention
- XSS prevention
- RLS policies
- Authentication checks

**Checklist:**
- [ ] All addresses validated
- [ ] All amounts validated
- [ ] Parameterized queries used
- [ ] User input sanitized
- [ ] RLS policies tested
- [ ] Authentication enforced
- [ ] No sensitive data in logs
- [ ] Error messages don't leak info

**Acceptance Criteria:**
- [ ] No security vulnerabilities found
- [ ] All checks pass
- [ ] Security best practices followed

---

### Task 6.11: Prepare ABI Documentation
**Effort:** S (3 hours)  
**Priority:** High  
**Dependencies:** Task 3.1, Task 3.2

**Description:**
Prepare ABI documentation for Safe transaction decoding. Required for Safe App listing.

**Files to Create:**
- `docs/ABIS.md`
- `public/abis/cUSD.json` (optional)

**Implementation:**
Document ABIs for:
1. cUSD token contract (ERC20)
2. Native CELO transfers (no ABI needed, document format)
3. Any custom contracts (if applicable)

**Acceptance Criteria:**
- [ ] cUSD token ABI documented
- [ ] Contract addresses for mainnet and testnet
- [ ] Links to verified contracts on block explorer
- [ ] Transfer function signature documented
- [ ] Native CELO transfer format documented
- [ ] ABI files provided (JSON format)

**Example Documentation:**
```markdown
# ABIs for Transaction Decoding

## cUSD Token (ERC20)

**Mainnet:** 0x765DE816845861e75A25fCA122bb6898B8B1282a
**Testnet:** 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1

**Verified Contract:**
- Mainnet: https://celoscan.io/address/0x765DE816845861e75A25fCA122bb6898B8B1282a#code
- Testnet: https://alfajores.celoscan.io/address/0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1#code

**Transfer Function:**
```solidity
function transfer(address to, uint256 amount) returns (bool)
```

**ABI:** See `public/abis/cUSD.json`
```

**Reference:** [Safe App Listing Requirements](https://help.safe.global/en/articles/145503-how-to-build-a-safe-app-and-get-it-listed-in-safe-wallet)

---

### Task 6.12: Test as Custom Safe App
**Effort:** M (4 hours)  
**Priority:** High  
**Dependencies:** Task 6.5, Task 1.6, Task 1.7

**Description:**
Test app by adding it as a Custom App in Safe{Wallet} before official listing.

**Testing Steps:**
1. Deploy app to staging URL
2. Open Safe{Wallet} on Celo Alfajores
3. Go to Apps → Add Custom App
4. Enter staging URL
5. Test full batch payment flow
6. Verify manifest loads correctly
7. Verify auto-connect works
8. Test on mobile Safe app

**Acceptance Criteria:**
- [ ] App loads in Safe iframe
- [ ] Manifest.json accessible
- [ ] Auto-connect to Safe works
- [ ] Can create batch payment
- [ ] Can submit to Safe
- [ ] Transaction appears in Safe queue
- [ ] Can approve and execute
- [ ] Status updates correctly
- [ ] Works on mobile Safe app
- [ ] No console errors

**Documentation:**
Create testing checklist document with screenshots

**Reference:** [How to Add Custom Safe App](https://help.safe.global/en/articles/40859-add-a-custom-safe-app)

---

## Deployment Tasks

### Task D.1: Deploy Database Migration
**Effort:** S (2 hours)  
**Priority:** Critical  
**Dependencies:** Task 1.4

**Description:**
Run database migration on production Supabase.

**Steps:**
1. Backup production database
2. Test migration on staging
3. Run migration on production
4. Verify tables and policies
5. Test with production data

**Acceptance Criteria:**
- [ ] Backup created
- [ ] Migration tested on staging
- [ ] Migration successful on production
- [ ] Tables exist and correct
- [ ] RLS policies working
- [ ] No data loss

---

### Task D.2: Deploy to Staging
**Effort:** S (3 hours)  
**Priority:** High  
**Dependencies:** All Phase 6 tasks

**Description:**
Deploy feature to staging environment.

**Steps:**
1. Merge feature branch to staging
2. Deploy to staging
3. Smoke test all functionality
4. Fix any issues
5. Get stakeholder approval

**Acceptance Criteria:**
- [ ] Deployed to staging
- [ ] All features working
- [ ] No critical bugs
- [ ] Stakeholder approval

---

### Task D.3: Deploy to Production
**Effort:** S (3 hours)  
**Priority:** Critical  
**Dependencies:** Task D.2

**Description:**
Deploy feature to production.

**Steps:**
1. Merge to main branch
2. Deploy to production
3. Monitor for errors
4. Verify functionality
5. Announce feature

**Acceptance Criteria:**
- [ ] Deployed to production
- [ ] All features working
- [ ] No errors in logs
- [ ] Monitoring active
- [ ] Feature announced

---

### Task D.4: Create Video Tutorial
**Effort:** M (6 hours)  
**Priority:** Medium  
**Dependencies:** Task D.3

**Description:**
Create video tutorial for users.

**Content:**
1. Introduction (30s)
2. Prerequisites (30s)
3. Selecting invoices (1m)
4. Reviewing batch (1m)
5. Submitting to Safe (1m)
6. Tracking status (1m)
7. Conclusion (30s)

**Deliverables:**
- [ ] Script written
- [ ] Video recorded
- [ ] Video edited
- [ ] Video published
- [ ] Link added to docs

---

### Task D.5: Prepare Safe App Listing Application
**Effort:** M (6 hours)  
**Priority:** Critical  
**Dependencies:** Task 6.11, Task 6.12, Task D.3

**Description:**
Prepare and submit application for Safe App listing in Safe{Wallet} app store.

**Files to Create:**
- `docs/SAFE_LISTING_APPLICATION.md`
- `docs/TEST_PLAN.md`
- `docs/KNOWN_LIMITATIONS.md`

**Steps:**
1. Fill out [Safe App Listing Form](https://docs.google.com/forms/d/e/1FAIpQLSeN2m94-jvGjvUF9MpZSkwxGPPjNz7QKZj9h9kMVXvnNdp2Mg/viewform?usp=sf_link)
2. Prepare commercial terms discussion
3. Create test plan document
4. Document known limitations
5. Provide repository access
6. Submit application

**Listing Form Information:**
- **App Name:** CeloAfricaDAO Invoice - Batch Payments
- **Description:** Pay multiple invoices in a single batch transaction through Safe multisig wallet. Supports CELO and cUSD on Celo network.
- **Target Users:** DAOs, organizations, treasurers managing multiple payments
- **App URL:** https://yourapp.com
- **Manifest URL:** https://yourapp.com/manifest.json
- **Supported Networks:** Celo Mainnet (42220), Celo Alfajores (44787)
- **Contact:** [Your contact info]

**Test Plan Contents:**
- Setup instructions
- Test scenarios (2 invoices, 10 invoices, 50 invoices)
- Expected behavior
- Known limitations
- Test results from staging

**Known Limitations:**
- Maximum 100 invoices per batch
- Requires all invoices to have same currency
- Only supports CELO and cUSD (v1)
- Requires invoices to be pre-approved

**Repository Access:**
- Provide read access to Safe team
- Include README with setup instructions
- Document architecture and key components

**Acceptance Criteria:**
- [ ] Listing form submitted
- [ ] Test plan document created
- [ ] Known limitations documented
- [ ] Repository access provided
- [ ] ABIs documented (Task 6.11)
- [ ] Custom app testing complete (Task 6.12)
- [ ] Manifest and CORS working (Task 1.6, 1.7)
- [ ] Contracts documented (we use existing cUSD/CELO)
- [ ] Safe team responds to application

**Timeline:**
- Safe team typically responds in a few days
- Commercial terms discussion: 1-2 weeks
- Staging review: 1 week
- Production listing: After approval

**Reference:** [Safe App Listing Requirements](https://help.safe.global/en/articles/145503-how-to-build-a-safe-app-and-get-it-listed-in-safe-wallet)

---

### Task D.6: Align on Commercial Terms
**Effort:** Variable (depends on negotiation)  
**Priority:** High  
**Dependencies:** Task D.5

**Description:**
Discuss and agree on commercial terms with Safe team.

**Discussion Topics:**
- Listing fee (if any)
- Revenue share (if applicable)
- Launch support and campaigns
- Timeline for integration and launch
- Marketing collaboration

**Preparation:**
- Review Safe's typical terms
- Prepare business case
- Define success metrics
- Plan launch strategy

**Acceptance Criteria:**
- [ ] Commercial terms discussed
- [ ] Agreement reached
- [ ] Timeline established
- [ ] Launch plan agreed

**Note:** This may happen in parallel with technical review

---

### Task D.7: Staging Review and Approval
**Effort:** S (3 hours)  
**Priority:** Critical  
**Dependencies:** Task D.5, Task D.6

**Description:**
Work with Safe team on staging review and approval.

**Process:**
1. Safe team adds app to staging environment
2. Safe team conducts product/UX review
3. Address any feedback or issues
4. Get final approval for production

**Review Areas:**
- Product functionality
- User experience
- Security (contracts, ABIs)
- Performance
- Error handling
- Mobile compatibility

**Acceptance Criteria:**
- [ ] App added to Safe staging
- [ ] Product/UX review complete
- [ ] All feedback addressed
- [ ] Final approval received
- [ ] Ready for production listing

---

### Task D.8: Production Listing and Launch
**Effort:** S (2 hours)  
**Priority:** Critical  
**Dependencies:** Task D.7

**Description:**
Coordinate production listing and launch with Safe team.

**Steps:**
1. Safe team promotes app to production
2. App appears in Safe{Wallet} app store
3. Coordinate launch announcement
4. Monitor initial usage
5. Respond to user feedback

**Launch Checklist:**
- [ ] App live in Safe{Wallet}
- [ ] Visible on all supported networks (Celo Mainnet, Alfajores)
- [ ] Launch announcement prepared
- [ ] Social media posts ready
- [ ] User documentation published
- [ ] Support channels ready
- [ ] Monitoring active

**Announcement Channels:**
- CeloAfricaDAO social media
- Safe community channels (if coordinated)
- Email to existing users
- Blog post or article

**Acceptance Criteria:**
- [ ] App listed in Safe{Wallet} production
- [ ] Launch announcement published
- [ ] Monitoring active
- [ ] Support ready
- [ ] Initial user feedback collected

---

### Task D.9: Monitor and Iterate
**Effort:** Ongoing  
**Priority:** High  
**Dependencies:** Task D.8

**Description:**
Monitor feature usage and iterate based on feedback.

**Metrics to Track:**
- Batch payment creation rate
- Success rate
- Error rate
- Average batch size
- Time to execution
- User satisfaction
- Safe{Wallet} app store ratings/reviews

**Actions:**
- [ ] Set up analytics
- [ ] Monitor error logs
- [ ] Collect user feedback
- [ ] Monitor Safe app store reviews
- [ ] Create improvement backlog
- [ ] Prioritize fixes
- [ ] Plan v2 features

**Safe-Specific Monitoring:**
- App usage within Safe{Wallet}
- User ratings and reviews
- Support requests
- Feature requests from Safe users

---

## Summary

### Total Effort Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: Foundation | 7 tasks | 2 weeks |
| Phase 2: Selection | 4 tasks | 1 week |
| Phase 3: Building | 4 tasks | 1 week |
| Phase 4: Submission | 3 tasks | 1 week |
| Phase 5: Tracking | 4 tasks | 1 week |
| Phase 6: Polish | 12 tasks | 2 weeks |
| Deployment | 9 tasks | 2 weeks |
| **Total** | **43 tasks** | **10 weeks** |

**Note:** Deployment phase includes Safe App listing process which may take additional time depending on Safe team review and commercial terms negotiation.

### Critical Path

```
Task 1.1 → Task 1.2 → Task 2.1 → Task 2.2 → Task 3.1 → Task 3.3 → 
Task 3.4 → Task 4.1 → Task 4.2 → Task 5.1 → Task 5.2 → Task 6.5 → 
Task D.1 → Task D.2 → Task D.3
```

### Parallel Work Opportunities

**Week 1-2:**
- Task 1.1, 1.4, 1.5 can be done in parallel
- Task 1.2 and 1.3 sequential

**Week 3:**
- Task 2.3 and 2.4 can be done in parallel after 2.1

**Week 4:**
- Task 3.1 and 3.2 can be done in parallel
- Task 3.3 depends on both

**Week 7-8:**
- Task 6.1, 6.2, 6.6, 6.7 can be done in parallel
- Task 6.3, 6.4, 6.5 sequential

### Risk Mitigation

**High Risk Tasks:**
- Task 4.1: Safe SDK integration (may have unexpected issues)
- Task 5.3: Safe API integration (API may change)
- Task 6.5: E2E testing (may reveal major issues)

**Mitigation:**
- Allocate buffer time for high-risk tasks
- Test early and often
- Have fallback plans
- Engage Safe community for support

### Success Criteria

**MVP (Minimum Viable Product):**
- [ ] Can select multiple invoices
- [ ] Can create batch transaction
- [ ] Can submit to Safe
- [ ] Can track status
- [ ] Works on testnet

**V1 (Production Ready):**
- [ ] All MVP features
- [ ] Comprehensive error handling
- [ ] Full test coverage
- [ ] User documentation
- [ ] Production deployment
- [ ] Monitoring active

**V2 (Future Enhancements):**
- [ ] Support for more tokens
- [ ] Batch templates
- [ ] CSV import
- [ ] Email notifications
- [ ] Scheduled batches

---

## Getting Started

### For Developers

1. **Read the requirements:** `requirements.md`
2. **Read the design:** `design.md`
3. **Start with Phase 1:** Begin with Task 1.1
4. **Follow the critical path:** Complete tasks in order
5. **Test as you go:** Don't wait until the end
6. **Ask for help:** Engage Safe community if stuck

### For Project Managers

1. **Review the timeline:** 9 weeks total
2. **Assign resources:** 1 full-time developer
3. **Track progress:** Use this document as checklist
4. **Monitor risks:** Watch high-risk tasks
5. **Communicate:** Keep stakeholders updated
6. **Celebrate milestones:** Recognize progress

### For Stakeholders

1. **Understand the value:** 90% time savings, 70% gas savings
2. **Review the timeline:** 9 weeks to production
3. **Provide feedback:** Early and often
4. **Test the feature:** On staging before production
5. **Promote adoption:** Help users understand benefits

---

## Appendix

### Useful Commands

```bash
# Install dependencies
npm install

# Run tests
npm test
npm run test:coverage
npm run test:integration

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

### Useful Links

- [Safe Apps SDK Docs](https://docs.safe.global/safe-core-aa-sdk/safe-apps)
- [Safe Transaction Service API](https://docs.safe.global/safe-core-api/transaction-service-overview)
- [Celo Documentation](https://docs.celo.org/)
- [Ethers.js Docs](https://docs.ethers.org/v5/)
- [React Testing Library](https://testing-library.com/react)

### Contact

- **Developer Support:** [Safe Discord](https://discord.gg/safe)
- **Celo Support:** [Celo Discord](https://discord.gg/celo)
- **Project Lead:** [Your contact info]

---

**Last Updated:** December 16, 2025  
**Version:** 1.0  
**Status:** Ready for Implementation

