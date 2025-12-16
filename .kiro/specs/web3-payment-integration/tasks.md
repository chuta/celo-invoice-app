# Implementation Plan: Web3 Payment Integration

## Phase 1: Setup and Infrastructure

- [ ] 1. Install and configure Web3 dependencies
  - Install wagmi, viem, and @rainbow-me/rainbowkit packages
  - Configure Celo network settings (mainnet and testnet)
  - Set up environment variables for RPC endpoints and contract addresses
  - _Requirements: 1.1, 2.1_

- [ ] 2. Create database schema updates
  - Add transaction_hash, payer_wallet_address, and payment_method columns to invoices table
  - Create payment_transactions table for detailed transaction tracking
  - Add necessary indexes for performance
  - Create migration script
  - _Requirements: 4.1, 4.2_

- [ ] 3. Set up Web3 configuration files
  - Create lib/contracts.js with cUSD contract addresses and ABI
  - Create lib/web3.js with network configurations
  - Define Celo mainnet and Alfajores testnet settings
  - _Requirements: 2.1, 2.4_

## Phase 2: Core Web3 Integration

- [ ] 4. Implement Web3Context provider
  - Create contexts/Web3Context.jsx with wallet state management
  - Implement wallet connection/disconnection logic
  - Add network detection and switching
  - Implement balance fetching for cUSD
  - Add event listeners for account and network changes
  - _Requirements: 1.1, 1.2, 1.3, 2.1_

- [ ] 5. Create wallet connection hooks
  - Implement hooks/useWeb3Wallet.js for wallet operations
  - Implement hooks/useNetwork.js for network verification
  - Add error handling for connection failures
  - _Requirements: 1.1, 1.6, 2.1, 5.1_

- [ ] 6. Build WalletConnect component
  - Create components/WalletConnect.jsx with connection UI
  - Display wallet address when connected
  - Show cUSD balance
  - Add disconnect functionality
  - Handle connection errors gracefully
  - _Requirements: 1.1, 1.3, 1.6_

- [ ] 7. Implement NetworkWarning component
  - Create components/NetworkWarning.jsx for network mismatch alerts
  - Display current network and required network
  - Add "Switch Network" button
  - Handle network switching errors
  - _Requirements: 2.2, 2.3, 2.5_

## Phase 3: Payment Processing

- [ ] 8. Create payment utility functions
  - Implement lib/payment.js with payment processing logic
  - Add cUSD token contract interaction functions
  - Implement transaction preparation and submission
  - Add transaction monitoring and confirmation waiting
  - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [ ] 9. Implement validation utilities
  - Create utils/validation.js for address and amount validation
  - Add Ethereum address checksum validation
  - Implement amount validation (positive, sufficient balance)
  - Add invoice status validation
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 10. Build usePayment hook
  - Create hooks/usePayment.js for payment operations
  - Implement single invoice payment function
  - Add transaction status tracking
  - Handle payment errors and retries
  - _Requirements: 3.1, 3.2, 3.6, 5.2, 5.3_

- [ ] 11. Create PaymentButton component
  - Implement components/PaymentButton.jsx for payment initiation
  - Add loading states during transaction
  - Display success/error messages
  - Disable button when wallet not connected or wrong network
  - _Requirements: 3.1, 3.6, 5.1, 5.2_

- [ ] 12. Build PaymentModal component
  - Create components/PaymentModal.jsx for payment confirmation
  - Display invoice details and payment summary
  - Show current balance and estimated gas
  - Add confirm/cancel actions
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 13. Implement TransactionStatus component
  - Create components/TransactionStatus.jsx for status display
  - Show pending, success, and error states
  - Add blockchain explorer link for completed transactions
  - Display transaction hash
  - _Requirements: 3.6, 4.2, 4.3_

## Phase 4: Database and Backend Integration

- [ ] 14. Create payment transaction service
  - Implement database functions for payment_transactions table
  - Add function to create transaction record
  - Add function to update transaction status
  - Add function to fetch transaction history
  - _Requirements: 4.1, 4.4, 4.5_

- [ ] 15. Update invoice payment handlers
  - Modify handleMarkAsPaid to support Web3 payments
  - Store transaction hash and payer address
  - Update payment_method field
  - Trigger email notification after successful payment
  - _Requirements: 3.7, 3.8, 3.9_

- [ ] 16. Add transaction verification
  - Implement on-chain transaction verification
  - Verify transaction recipient and amount
  - Update invoice status only after verification
  - Handle verification failures
  - _Requirements: 8.6, 3.8_

## Phase 5: Admin UI Integration

- [ ] 17. Integrate WalletConnect in Admin page
  - Add WalletConnect component to Admin page header
  - Display connection status
  - Show network warning if on wrong network
  - _Requirements: 1.1, 1.3, 2.2_

- [ ] 18. Add payment buttons to invoice list
  - Add "Pay with Wallet" button for approved invoices
  - Show button only when wallet is connected
  - Disable button for non-approved or already paid invoices
  - _Requirements: 3.1, 8.3, 8.5_

- [ ] 19. Update InvoiceDetail page with payment option
  - Add PaymentButton to invoice detail view
  - Display transaction hash for paid invoices
  - Add blockchain explorer link
  - Show payer wallet address
  - _Requirements: 3.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 20. Implement bulk payment UI
  - Add checkbox selection for multiple invoices
  - Add "Pay Selected" button
  - Display total amount for selected invoices
  - Show bulk payment progress
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

## Phase 6: Error Handling and Edge Cases

- [ ] 21. Implement comprehensive error handling
  - Add error handling for wallet connection failures
  - Handle transaction rejection by user
  - Handle insufficient balance errors
  - Handle network errors and RPC failures
  - Display user-friendly error messages
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ] 22. Add balance checking
  - Check cUSD balance before payment
  - Display balance in payment modal
  - Prevent payment if insufficient balance
  - _Requirements: 5.4, 6.5, 8.4_

- [ ] 23. Implement duplicate payment prevention
  - Check invoice status before payment
  - Prevent payment for already paid invoices
  - Add UI indicators for paid invoices
  - _Requirements: 8.5_

## Phase 7: Testing and Quality Assurance

- [ ] 24. Write unit tests for Web3 utilities
  - Test address validation functions
  - Test amount validation functions
  - Test network detection logic
  - Test balance formatting
  - _Requirements: All validation requirements_

- [ ] 25. Write integration tests for payment flow
  - Test wallet connection flow
  - Test payment processing flow
  - Test error handling scenarios
  - Test transaction status updates
  - _Requirements: 3.1-3.9, 5.1-5.6_

- [ ] 26. Perform end-to-end testing
  - Test complete payment flow on testnet
  - Test bulk payment functionality
  - Test error scenarios (wrong network, insufficient balance, etc.)
  - Verify database updates and email notifications
  - _Requirements: All requirements_

## Phase 8: Documentation and Deployment

- [ ] 27. Create user documentation
  - Write guide for connecting Web3 wallet
  - Document payment process
  - Add troubleshooting section
  - Create FAQ for common issues
  - _Requirements: N/A_

- [ ] 28. Update environment configuration
  - Add environment variables for RPC endpoints
  - Configure contract addresses for mainnet and testnet
  - Set up network selection
  - _Requirements: 2.1_

- [ ] 29. Deploy database migrations
  - Run migration to add new columns to invoices table
  - Create payment_transactions table
  - Add indexes
  - Verify migration success
  - _Requirements: 4.1_

- [ ] 30. Deploy and test on staging
  - Deploy application to staging environment
  - Test with Alfajores testnet
  - Verify all functionality works
  - Test with multiple wallet providers
  - _Requirements: All requirements_

## Phase 9: Production Deployment

- [ ] 31. Configure production environment
  - Set up Celo mainnet RPC endpoints
  - Configure mainnet contract addresses
  - Set up monitoring and logging
  - _Requirements: N/A_

- [ ] 32. Deploy to production
  - Deploy application with Web3 features
  - Monitor for errors
  - Verify payment functionality
  - _Requirements: All requirements_

- [ ] 33. Monitor and optimize
  - Monitor transaction success rates
  - Track gas costs
  - Optimize RPC calls
  - Gather user feedback
  - _Requirements: N/A_

## Notes

- Each task should be completed and tested before moving to the next
- All tasks with database changes should include rollback scripts
- Security review should be conducted before production deployment
- Consider implementing feature flags for gradual rollout
