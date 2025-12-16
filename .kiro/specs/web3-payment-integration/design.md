# Design Document: Web3 Payment Integration

## Overview

This design implements Web3 wallet integration for processing invoice payments on the Celo blockchain. The system will support MetaMask and WalletConnect, enabling admins to pay approved invoices directly with cUSD tokens.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   Admin UI      │
│  (React App)    │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌─────────────────┐  ┌──────────────────┐
│  Web3 Provider  │  │  Supabase DB     │
│  (wagmi/viem)   │  │  (Invoice Data)  │
└────────┬────────┘  └──────────────────┘
         │
         ▼
┌─────────────────┐
│  Celo Network   │
│  (cUSD Token)   │
└─────────────────┘
```

### Component Architecture

```
src/
├── contexts/
│   └── Web3Context.jsx          # Web3 wallet state management
├── hooks/
│   ├── useWeb3Wallet.js         # Wallet connection hook
│   ├── usePayment.js            # Payment processing hook
│   └── useNetwork.js            # Network verification hook
├── components/
│   ├── WalletConnect.jsx        # Wallet connection UI
│   ├── PaymentButton.jsx        # Payment action button
│   ├── PaymentModal.jsx         # Payment confirmation modal
│   ├── TransactionStatus.jsx   # Transaction status display
│   └── NetworkWarning.jsx       # Network mismatch warning
├── lib/
│   ├── web3.js                  # Web3 utility functions
│   ├── contracts.js             # Contract addresses and ABIs
│   └── payment.js               # Payment processing logic
└── utils/
    ├── validation.js            # Address and amount validation
    └── formatting.js            # Display formatting utilities
```

## Technology Stack

### Core Libraries

1. **wagmi** (v2.x) - React hooks for Ethereum
   - Wallet connection management
   - Transaction handling
   - Network switching

2. **viem** (v2.x) - TypeScript Ethereum library
   - Low-level blockchain interactions
   - Contract interactions
   - Transaction encoding

3. **@rainbow-me/rainbowkit** (v2.x) - Wallet connection UI
   - Pre-built wallet connection modal
   - Support for MetaMask, WalletConnect, and more
   - Responsive design

### Celo Integration

- **Celo Mainnet**: Chain ID 42220
- **Alfajores Testnet**: Chain ID 44787
- **cUSD Token Contract**: 
  - Mainnet: `0x765DE816845861e75A25fCA122bb6898B8B1282a`
  - Alfajores: `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1`

## Components and Interfaces

### 1. Web3Context

Provides global Web3 state management.

```javascript
// Context State
{
  address: string | null,           // Connected wallet address
  isConnected: boolean,             // Connection status
  chainId: number | null,           // Current network chain ID
  balance: string | null,           // cUSD balance
  isCorrectNetwork: boolean,        // Network verification
  connect: () => Promise<void>,     // Connect wallet
  disconnect: () => void,           // Disconnect wallet
  switchNetwork: () => Promise<void> // Switch to Celo network
}
```

### 2. WalletConnect Component

Displays wallet connection button and status.

**Props:**
- `onConnect?: () => void` - Callback after successful connection
- `showBalance?: boolean` - Display cUSD balance

**UI States:**
- Not connected: "Connect Wallet" button
- Connecting: Loading spinner
- Connected: Address display with disconnect option
- Wrong network: Warning with switch button

### 3. PaymentButton Component

Initiates payment for a single invoice.

**Props:**
```typescript
{
  invoice: {
    id: string,
    invoice_number: string,
    amount: number,
    profiles: {
      wallet_address: string,
      full_name: string
    }
  },
  onSuccess?: (txHash: string) => void,
  onError?: (error: Error) => void
}
```

**States:**
- Idle: "Pay with Wallet" button
- Confirming: "Confirm in Wallet..."
- Processing: "Processing Transaction..."
- Success: "Payment Successful"
- Error: Error message display

### 4. PaymentModal Component

Confirmation modal before payment.

**Props:**
```typescript
{
  invoice: Invoice,
  isOpen: boolean,
  onClose: () => void,
  onConfirm: () => Promise<void>
}
```

**Display:**
- Invoice details (number, amount, recipient)
- Current wallet balance
- Estimated gas fee
- Total cost
- Confirm/Cancel buttons

### 5. TransactionStatus Component

Displays transaction progress and result.

**Props:**
```typescript
{
  status: 'idle' | 'pending' | 'success' | 'error',
  txHash?: string,
  error?: string
}
```

**Features:**
- Loading animation for pending
- Success checkmark with explorer link
- Error message with retry option

## Data Models

### Database Schema Updates

```sql
-- Add Web3 payment fields to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS transaction_hash TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payer_wallet_address TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'manual';

-- Add index for transaction hash lookups
CREATE INDEX IF NOT EXISTS idx_invoices_transaction_hash 
ON invoices(transaction_hash);

-- Add payment_transactions table for detailed tracking
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  transaction_hash TEXT NOT NULL UNIQUE,
  payer_address TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  amount DECIMAL(20, 2) NOT NULL,
  currency TEXT DEFAULT 'cUSD',
  chain_id INTEGER NOT NULL,
  status TEXT NOT NULL, -- 'pending', 'confirmed', 'failed'
  block_number BIGINT,
  gas_used BIGINT,
  gas_price TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Add index for transaction lookups
CREATE INDEX idx_payment_transactions_invoice_id 
ON payment_transactions(invoice_id);

CREATE INDEX idx_payment_transactions_hash 
ON payment_transactions(transaction_hash);
```

### TypeScript Interfaces

```typescript
interface PaymentTransaction {
  id: string
  invoice_id: string
  transaction_hash: string
  payer_address: string
  recipient_address: string
  amount: number
  currency: string
  chain_id: number
  status: 'pending' | 'confirmed' | 'failed'
  block_number?: number
  gas_used?: number
  gas_price?: string
  error_message?: string
  created_at: string
  confirmed_at?: string
}

interface PaymentRequest {
  invoiceId: string
  amount: number
  recipientAddress: string
  currency: 'cUSD'
}

interface PaymentResult {
  success: boolean
  transactionHash?: string
  error?: string
}
```

## Payment Flow

### Single Invoice Payment Flow

```
1. Admin clicks "Pay with Wallet" button
   ↓
2. System validates:
   - Wallet is connected
   - Correct network (Celo)
   - Invoice is approved
   - Recipient address is valid
   ↓
3. Display PaymentModal with details
   ↓
4. Admin confirms payment
   ↓
5. Prepare cUSD transfer transaction
   ↓
6. Request wallet signature
   ↓
7. Submit transaction to blockchain
   ↓
8. Monitor transaction status
   ↓
9. On confirmation:
   - Update invoice status to 'paid'
   - Store transaction hash
   - Store payer address
   - Create payment_transaction record
   - Send email notification
   ↓
10. Display success message with explorer link
```

### Bulk Payment Flow

```
1. Admin selects multiple approved invoices
   ↓
2. Click "Pay Selected" button
   ↓
3. Display bulk payment summary
   ↓
4. Admin confirms bulk payment
   ↓
5. For each invoice:
   a. Prepare transaction
   b. Request signature
   c. Submit transaction
   d. Wait for confirmation
   e. Update invoice status
   f. Display progress
   ↓
6. Display summary of results
```

## Error Handling

### Error Categories

1. **Connection Errors**
   - Wallet not installed
   - User rejected connection
   - Network error

2. **Network Errors**
   - Wrong network
   - Network switch failed
   - RPC endpoint unavailable

3. **Transaction Errors**
   - Insufficient balance
   - User rejected transaction
   - Transaction failed on-chain
   - Gas estimation failed

4. **Validation Errors**
   - Invalid recipient address
   - Invalid amount
   - Invoice not approved
   - Invoice already paid

### Error Handling Strategy

```javascript
try {
  // Attempt payment
  const result = await processPayment(invoice)
} catch (error) {
  if (error.code === 'ACTION_REJECTED') {
    // User cancelled - no action needed
    showMessage('Payment cancelled')
  } else if (error.code === 'INSUFFICIENT_FUNDS') {
    // Show balance error
    showError('Insufficient cUSD balance')
  } else if (error.code === 'NETWORK_ERROR') {
    // Network issue - suggest retry
    showError('Network error. Please try again.')
  } else {
    // Unknown error - log and show generic message
    console.error('Payment error:', error)
    showError('Payment failed. Please try again.')
  }
}
```

## Security Considerations

1. **Address Validation**
   - Validate all wallet addresses using checksum validation
   - Verify recipient address exists in user profile

2. **Amount Validation**
   - Verify amount matches invoice amount
   - Prevent amount manipulation

3. **Transaction Verification**
   - Verify transaction hash on-chain before updating status
   - Check transaction recipient and amount match invoice

4. **Access Control**
   - Only admins can initiate payments
   - Verify admin role before showing payment buttons

5. **Rate Limiting**
   - Implement client-side rate limiting for payment requests
   - Prevent spam transactions

## Testing Strategy

### Unit Tests

1. **Validation Functions**
   - Address validation
   - Amount validation
   - Network validation

2. **Utility Functions**
   - Balance formatting
   - Transaction hash formatting
   - Error message generation

### Integration Tests

1. **Wallet Connection**
   - Connect wallet flow
   - Disconnect wallet flow
   - Network switching

2. **Payment Processing**
   - Single payment flow
   - Bulk payment flow
   - Error handling

### E2E Tests

1. **Complete Payment Flow**
   - Connect wallet → Select invoice → Confirm payment → Verify status
   
2. **Error Scenarios**
   - Insufficient balance
   - Wrong network
   - Transaction rejection

## Performance Considerations

1. **Lazy Loading**
   - Load Web3 libraries only when needed
   - Defer wallet connection until user action

2. **Caching**
   - Cache wallet balance
   - Cache network information
   - Refresh on user action or interval

3. **Optimistic Updates**
   - Update UI immediately on transaction submission
   - Revert on failure

4. **Transaction Monitoring**
   - Poll for transaction confirmation
   - Use exponential backoff
   - Timeout after reasonable period

## UI/UX Design

### Wallet Connection Button

```
┌─────────────────────────────────┐
│  🦊 Connect Wallet              │
└─────────────────────────────────┘

After connection:
┌─────────────────────────────────┐
│  ✓ 0x742d...0bEb  │  Disconnect │
│  Balance: 1,234.56 cUSD         │
└─────────────────────────────────┘
```

### Payment Button States

```
Idle:
┌─────────────────────────────────┐
│  💰 Pay with Wallet             │
└─────────────────────────────────┘

Processing:
┌─────────────────────────────────┐
│  ⏳ Processing Transaction...   │
└─────────────────────────────────┘

Success:
┌─────────────────────────────────┐
│  ✓ Payment Successful           │
└─────────────────────────────────┘
```

### Payment Confirmation Modal

```
┌─────────────────────────────────────────┐
│  Confirm Payment                        │
├─────────────────────────────────────────┤
│                                         │
│  Invoice: #2025-12-00024                │
│  Recipient: Chuta Chimex                │
│  Address: 0xe066...5219                 │
│                                         │
│  Amount: 100.00 cUSD                    │
│  Gas Fee: ~0.001 CELO                   │
│  ─────────────────────────              │
│  Total: 100.00 cUSD + gas               │
│                                         │
│  Your Balance: 1,234.56 cUSD            │
│                                         │
│  ┌─────────┐  ┌─────────┐              │
│  │ Cancel  │  │ Confirm │              │
│  └─────────┘  └─────────┘              │
└─────────────────────────────────────────┘
```

## Deployment Considerations

1. **Environment Variables**
   ```
   VITE_CELO_MAINNET_RPC=https://forno.celo.org
   VITE_CELO_ALFAJORES_RPC=https://alfajores-forno.celo-testnet.org
   VITE_CUSD_MAINNET_ADDRESS=0x765DE816845861e75A25fCA122bb6898B8B1282a
   VITE_CUSD_ALFAJORES_ADDRESS=0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1
   VITE_ENABLE_TESTNET=true
   ```

2. **Network Configuration**
   - Support both mainnet and testnet
   - Allow switching via environment variable
   - Display current network in UI

3. **Monitoring**
   - Log all payment attempts
   - Track success/failure rates
   - Monitor gas costs

## Future Enhancements

1. **Multi-Currency Support**
   - Support CELO, cEUR in addition to cUSD
   - Currency selection in payment modal

2. **Batch Transactions**
   - Use multicall for bulk payments
   - Reduce gas costs

3. **Payment Scheduling**
   - Schedule payments for future date
   - Recurring payment support

4. **Safe Integration**
   - Support Safe (Gnosis Safe) multisig wallets
   - Batch transaction proposals

5. **Payment Analytics**
   - Dashboard for payment metrics
   - Gas cost tracking
   - Payment success rates
