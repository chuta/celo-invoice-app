# Requirements Document - Safe Batch Payments

## Introduction

This feature enables users to pay multiple approved invoices in a single batch transaction through their Safe multisig wallet. Instead of creating and approving 20 separate transactions, users can select multiple invoices, generate one batch payment transaction, submit it to Safe for approval, and execute all payments at once.

## Glossary

- **Safe (Safe.global)**: A smart contract wallet that requires multiple signatures (multisig) to execute transactions
- **Batch Transaction**: A single transaction that contains multiple payment operations
- **MetaTransaction**: An individual payment operation within a batch transaction
- **Safe Apps SDK**: JavaScript library for integrating with Safe wallets
- **cUSD**: Celo Dollar, an ERC20 stablecoin on Celo network
- **CELO**: Native token of the Celo blockchain
- **Multisig**: Multi-signature wallet requiring multiple approvers
- **Safe Transaction Hash**: Unique identifier for a Safe transaction
- **Invoice Batch**: A group of invoices selected for batch payment

## Requirements

### Requirement 1: Safe Environment Detection

**User Story:** As a DAO treasurer, I want the app to detect when I'm using it inside Safe, so that I can access batch payment features.

#### Acceptance Criteria

1. WHEN the app loads THEN the system SHALL detect if running inside Safe iframe
2. WHEN running inside Safe THEN the system SHALL retrieve Safe wallet address
3. WHEN running inside Safe THEN the system SHALL retrieve chain ID
4. WHEN running inside Safe THEN the system SHALL display Safe connection indicator in UI
5. WHEN not running inside Safe THEN the system SHALL hide batch payment features

### Requirement 2: Invoice Selection for Batch Payment

**User Story:** As a DAO treasurer, I want to select multiple approved invoices, so that I can pay them all at once.

#### Acceptance Criteria

1. WHEN viewing invoice list THEN the system SHALL display checkboxes for approved invoices
2. WHEN an invoice is not approved THEN the system SHALL disable its checkbox
3. WHEN invoices have different currencies THEN the system SHALL only allow selection of same currency
4. WHEN user selects invoices THEN the system SHALL display selection count and total amount
5. WHEN user clicks "Select All Approved" THEN the system SHALL select all approved invoices with same currency
6. WHEN user deselects all invoices THEN the system SHALL hide batch action bar

### Requirement 3: Batch Payment Preview

**User Story:** As a DAO treasurer, I want to review all payment details before submitting, so that I can verify accuracy.

#### Acceptance Criteria

1. WHEN user clicks "Batch Pay" THEN the system SHALL display preview modal
2. WHEN preview modal opens THEN the system SHALL show total number of invoices
3. WHEN preview modal opens THEN the system SHALL show total payment amount
4. WHEN preview modal opens THEN the system SHALL list all recipients with amounts
5. WHEN preview modal opens THEN the system SHALL show estimated gas cost
6. WHEN preview modal opens THEN the system SHALL validate Safe has sufficient balance
7. WHEN Safe has insufficient balance THEN the system SHALL display error message and disable submission

### Requirement 4: Native Token (CELO) Batch Transactions

**User Story:** As a DAO treasurer, I want to pay multiple invoices in CELO, so that I can use native tokens for payments.

#### Acceptance Criteria

1. WHEN creating batch for CELO invoices THEN the system SHALL create MetaTransaction array with native transfers
2. WHEN encoding CELO transfer THEN the system SHALL set recipient address in "to" field
3. WHEN encoding CELO transfer THEN the system SHALL set amount in "value" field
4. WHEN encoding CELO transfer THEN the system SHALL set empty data field
5. WHEN encoding CELO transfer THEN the system SHALL set operation to 0 (Call)

### Requirement 5: ERC20 Token (cUSD) Batch Transactions

**User Story:** As a DAO treasurer, I want to pay multiple invoices in cUSD, so that I can use stablecoins for payments.

#### Acceptance Criteria

1. WHEN creating batch for cUSD invoices THEN the system SHALL create MetaTransaction array with token transfers
2. WHEN encoding cUSD transfer THEN the system SHALL set token contract address in "to" field
3. WHEN encoding cUSD transfer THEN the system SHALL set zero in "value" field
4. WHEN encoding cUSD transfer THEN the system SHALL encode transfer function call in "data" field
5. WHEN encoding transfer function THEN the system SHALL include recipient address and amount parameters
6. WHEN encoding cUSD transfer THEN the system SHALL set operation to 0 (Call)

### Requirement 6: Safe Transaction Submission

**User Story:** As a DAO treasurer, I want to submit batch payment to Safe, so that signers can approve it.

#### Acceptance Criteria

1. WHEN user confirms batch payment THEN the system SHALL submit transaction to Safe using SDK
2. WHEN submission succeeds THEN the system SHALL receive Safe transaction hash
3. WHEN submission succeeds THEN the system SHALL create batch payment record in database
4. WHEN submission succeeds THEN the system SHALL link all invoices to batch payment
5. WHEN submission succeeds THEN the system SHALL update invoice status to "pending_execution"
6. WHEN submission fails THEN the system SHALL display error message to user
7. WHEN submission fails THEN the system SHALL not modify invoice status

### Requirement 7: Batch Payment Tracking

**User Story:** As a DAO treasurer, I want to track batch payment status, so that I know when payments are executed.

#### Acceptance Criteria

1. WHEN batch payment is created THEN the system SHALL store Safe transaction hash
2. WHEN batch payment is created THEN the system SHALL store Safe address
3. WHEN batch payment is created THEN the system SHALL store chain ID
4. WHEN batch payment is created THEN the system SHALL store invoice IDs array
5. WHEN batch payment is created THEN the system SHALL set status to "pending"
6. WHEN viewing batch payments THEN the system SHALL display all batches with status
7. WHEN viewing batch payment THEN the system SHALL provide link to Safe transaction

### Requirement 8: Batch Payment Status Updates

**User Story:** As a DAO treasurer, I want invoices to update automatically when batch is executed, so that I don't have to manually update them.

#### Acceptance Criteria

1. WHEN user views batch payment page THEN the system SHALL check transaction status via Safe API
2. WHEN batch transaction is executed THEN the system SHALL update batch status to "executed"
3. WHEN batch transaction is executed THEN the system SHALL update all linked invoices to "paid"
4. WHEN batch transaction is executed THEN the system SHALL record execution timestamp
5. WHEN batch transaction fails THEN the system SHALL update batch status to "failed"
6. WHEN batch transaction fails THEN the system SHALL record error message
7. WHEN batch transaction fails THEN the system SHALL keep invoice status as "approved"

### Requirement 9: Batch Payment History

**User Story:** As a DAO treasurer, I want to view all batch payments, so that I can track payment history.

#### Acceptance Criteria

1. WHEN user navigates to batch payments page THEN the system SHALL display all batch payments
2. WHEN displaying batch payments THEN the system SHALL show creation date
3. WHEN displaying batch payments THEN the system SHALL show status (pending, executed, failed)
4. WHEN displaying batch payments THEN the system SHALL show total amount
5. WHEN displaying batch payments THEN the system SHALL show number of invoices
6. WHEN user clicks batch payment THEN the system SHALL show detailed view with all invoices
7. WHEN viewing batch details THEN the system SHALL provide link to Safe transaction

### Requirement 10: Error Handling and Validation

**User Story:** As a DAO treasurer, I want clear error messages, so that I can resolve issues quickly.

#### Acceptance Criteria

1. WHEN Safe wallet has insufficient balance THEN the system SHALL display balance error before submission
2. WHEN invoice has invalid wallet address THEN the system SHALL exclude it from selection
3. WHEN network request fails THEN the system SHALL display network error message
4. WHEN Safe SDK throws error THEN the system SHALL display user-friendly error message
5. WHEN transaction encoding fails THEN the system SHALL display encoding error message
6. WHEN user tries to batch invoices with different currencies THEN the system SHALL display validation error

### Requirement 11: Safe Connection Indicator

**User Story:** As a DAO treasurer, I want to see Safe connection status, so that I know the feature is available.

#### Acceptance Criteria

1. WHEN connected to Safe THEN the system SHALL display Safe badge in header
2. WHEN displaying Safe badge THEN the system SHALL show Safe wallet address (truncated)
3. WHEN displaying Safe badge THEN the system SHALL show chain name
4. WHEN displaying Safe badge THEN the system SHALL show number of owners
5. WHEN user clicks Safe badge THEN the system SHALL display full Safe information modal

### Requirement 12: Batch Action Bar

**User Story:** As a DAO treasurer, I want a clear action bar when selecting invoices, so that I can easily proceed with batch payment.

#### Acceptance Criteria

1. WHEN invoices are selected THEN the system SHALL display floating action bar at bottom
2. WHEN displaying action bar THEN the system SHALL show selection count
3. WHEN displaying action bar THEN the system SHALL show total amount
4. WHEN displaying action bar THEN the system SHALL show currency
5. WHEN displaying action bar THEN the system SHALL provide "Cancel" button to clear selection
6. WHEN displaying action bar THEN the system SHALL provide "Batch Pay" button to proceed
7. WHEN user scrolls page THEN the system SHALL keep action bar visible (sticky)

---

## Non-Functional Requirements

### Performance
- Batch transaction creation SHALL complete within 2 seconds for up to 100 invoices
- Safe API status checks SHALL timeout after 10 seconds
- UI SHALL remain responsive during transaction building

### Security
- All wallet addresses SHALL be validated before transaction creation
- Transaction amounts SHALL be validated against invoice amounts
- Safe transaction hash SHALL be stored securely in database
- User SHALL only access their own batch payments (RLS enforced)

### Usability
- Batch payment flow SHALL require maximum 4 clicks from selection to submission
- Error messages SHALL be clear and actionable
- Loading states SHALL be displayed during all async operations
- Success confirmations SHALL be displayed after successful operations

### Compatibility
- Feature SHALL work with Safe Apps SDK v8.0.0 or higher
- Feature SHALL support Celo Mainnet (Chain ID: 42220)
- Feature SHALL support Celo Alfajores Testnet (Chain ID: 44787)
- Feature SHALL work in Safe iframe environment only

---

## Out of Scope (Future Enhancements)

- Support for other ERC20 tokens beyond cUSD
- Support for other chains beyond Celo
- Scheduled batch payments
- Recurring batch payments
- Batch payment templates
- CSV import for batch payments
- Batch payment notifications via email
- Automatic retry for failed batches
- Partial batch execution (some succeed, some fail)
