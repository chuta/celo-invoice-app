# CSV Export for Safe Wallet Guide

Complete guide for exporting invoices to CSV format for bulk payments via Safe (Gnosis Safe) wallet.

## Overview

The CSV export feature allows admins to export all approved invoices in a format compatible with the Safe wallet CSV Airdrop app, enabling bulk ERC20 token transfers with multisig signing.

## CSV Format

The exported CSV follows the Safe wallet CSV Airdrop format:

```csv
token_type,token_address,receiver,amount,id
erc20,0x765DE816845861e75A25fCA122bb6898B8B1282a,0x1234...5678,1000.00,2025-12-00001
erc20,0x765DE816845861e75A25fCA122bb6898B8B1282a,0x8765...4321,250.50,2025-12-00002
```

### Column Definitions

| Column | Description | Example |
|--------|-------------|---------|
| **token_type** | Type of token transfer | `erc20` (for cUSD) |
| **token_address** | Smart contract address of the token | `0x765DE816845861e75A25fCA122bb6898B8B1282a` |
| **receiver** | Recipient wallet address | `0x1234567890abcdef...` |
| **amount** | Amount to transfer (decimal format) | `1000.00` |
| **id** | Invoice reference number | `2025-12-00001` |

## Token Addresses

### cUSD (Celo Dollar)

**Mainnet:**
```
0x765DE816845861e75A25fCA122bb6898B8B1282a
```

**Alfajores Testnet:**
```
0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1
```

The app is currently configured for **Celo Mainnet**. To use testnet, update the `cUSD_ADDRESS` constant in `src/pages/Admin.jsx`.

## How to Export

### Step 1: Approve Invoices

1. Go to Admin Dashboard (`/admin`)
2. Review pending invoices
3. Approve invoices that are ready for payment
4. Ensure all users have wallet addresses configured

### Step 2: Export to CSV

1. Click "📥 Export Approved to CSV" button
2. File downloads automatically
3. File name format: `celo-invoices-YYYY-MM-DD.csv`

### Step 3: Verify Export

Open the CSV file and verify:
- All approved invoices are included
- Wallet addresses are correct
- Amounts are accurate
- Token address is correct

## Using with Safe Wallet

### Step 1: Access Safe App

1. Go to [app.safe.global](https://app.safe.global)
2. Connect your Safe wallet
3. Select the correct network (Celo Mainnet)

### Step 2: Open CSV Airdrop App

1. Click "Apps" in the sidebar
2. Search for "CSV Airdrop" or "Transaction Builder"
3. Open the CSV Airdrop app

### Step 3: Upload CSV

1. Click "Choose File" or drag-and-drop
2. Select your exported CSV file
3. App will parse and validate the file

### Step 4: Review Transactions

The app will show:
- Number of transactions
- Total amount to be sent
- List of recipients
- Gas estimates

Review carefully:
- ✅ Correct token (cUSD)
- ✅ Correct recipients
- ✅ Correct amounts
- ✅ Total matches your records

### Step 5: Create Transaction

1. Click "Create Transaction" or "Submit"
2. Safe will create a multisig transaction
3. Transaction appears in queue

### Step 6: Sign Transaction

1. First signer approves transaction
2. Additional signers approve (based on your Safe threshold)
3. Once threshold met, execute transaction

### Step 7: Execute Transaction

1. Click "Execute" on the transaction
2. Confirm in your wallet
3. Pay gas fees
4. Wait for confirmation

### Step 8: Mark as Paid

After successful execution:
1. Return to Admin Dashboard
2. Find the paid invoices
3. Click "Mark as Paid" for each
4. Or use bulk mark as paid (future feature)

## Requirements

### Before Exporting

✅ **All users must have wallet addresses configured**
- Users set wallet in Settings page
- Super admins can set in User Management
- Export will fail if any user missing wallet

✅ **Invoices must be approved**
- Only approved invoices are exported
- Pending invoices are not included
- Draft invoices are not included

✅ **Correct network**
- Ensure Safe wallet is on Celo network
- Token address must match network
- Testnet vs Mainnet

### Safe Wallet Requirements

✅ **Sufficient Balance**
- Safe must have enough cUSD
- Plus gas fees (CELO tokens)
- Check balance before executing

✅ **Multisig Threshold**
- Know your signing threshold
- Coordinate with other signers
- Plan signing schedule

✅ **Network Connection**
- Stable internet connection
- Wallet extension installed
- Correct network selected

## Troubleshooting

### Export Fails: "No approved invoices"

**Problem:** No invoices with "approved" status

**Solution:**
1. Go to Admin Dashboard
2. Approve pending invoices
3. Try export again

### Export Fails: "Users without wallet addresses"

**Problem:** One or more users haven't set wallet address

**Solution:**
1. Check error message for count
2. Go to User Management (super admin)
3. Identify users without wallets
4. Contact users to add wallet in Settings
5. Or add wallet addresses manually (super admin)

### CSV Upload Fails in Safe

**Problem:** Safe app rejects the CSV file

**Solutions:**
1. **Check format:** Ensure no extra columns or rows
2. **Check addresses:** All wallet addresses must be valid
3. **Check amounts:** Must be positive numbers
4. **Check token address:** Must match network
5. **Re-export:** Try exporting again

### Wrong Token Address

**Problem:** CSV has wrong token address for network

**Solution:**
1. Check which network you're using
2. Update `cUSD_ADDRESS` in `src/pages/Admin.jsx`:
   ```javascript
   // For Mainnet
   const cUSD_ADDRESS = '0x765DE816845861e75A25fCA122bb6898B8B1282a'
   
   // For Testnet
   const cUSD_ADDRESS = '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1'
   ```
3. Re-export CSV

### Transaction Fails

**Problem:** Safe transaction fails to execute

**Solutions:**
1. **Insufficient balance:** Add more cUSD to Safe
2. **Insufficient gas:** Add CELO tokens for gas
3. **Invalid recipient:** Check wallet addresses
4. **Network issues:** Try again later
5. **Nonce issues:** Clear pending transactions

## Best Practices

### 1. Regular Export Schedule

**Weekly Payments:**
```
Monday: Review pending invoices
Tuesday: Approve valid invoices
Wednesday: Export CSV
Thursday: Upload to Safe and get signatures
Friday: Execute payment
```

### 2. Verification Process

Before executing:
1. ✅ Cross-check invoice amounts
2. ✅ Verify recipient addresses
3. ✅ Confirm total matches
4. ✅ Check Safe balance
5. ✅ Review gas estimates

### 3. Record Keeping

After payment:
1. Save CSV file with date
2. Save transaction hash
3. Mark invoices as paid
4. Update payment records
5. Notify users (optional)

### 4. Security

- ✅ Verify CSV before uploading
- ✅ Double-check amounts
- ✅ Use multisig (don't use 1-of-1)
- ✅ Review all signers
- ✅ Keep transaction records

## CSV File Example

```csv
token_type,token_address,receiver,amount,id
erc20,0x765DE816845861e75A25fCA122bb6898B8B1282a,0x1234567890abcdef1234567890abcdef12345678,1000.00,2025-12-00001
erc20,0x765DE816845861e75A25fCA122bb6898B8B1282a,0x8765432109876543210987654321098765432109,250.50,2025-12-00002
erc20,0x765DE816845861e75A25fCA122bb6898B8B1282a,0xabcdefabcdefabcdefabcdefabcdefabcdefabcd,500.00,2025-12-00003
```

## Amount Format

The CSV uses decimal format (not Wei):
- ✅ `1000.00` (correct)
- ✅ `250.50` (correct)
- ❌ `1000000000000000000000` (wrong - this is Wei)

Safe wallet handles the Wei conversion internally.

## Monitoring

### Check Export Success

```javascript
// In browser console after export
console.log('Exported invoices:', invoices.length)
console.log('Total amount:', invoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0))
```

### Verify in Database

```sql
-- Check approved invoices
SELECT 
  invoice_number,
  amount,
  profiles.wallet_address,
  profiles.full_name
FROM invoices
JOIN profiles ON invoices.user_id = profiles.id
WHERE status = 'approved'
ORDER BY invoice_number;
```

## Future Enhancements

Planned features:
- [ ] Bulk mark as paid after export
- [ ] Export history tracking
- [ ] Transaction hash recording
- [ ] Automatic payment status updates
- [ ] Email notifications after payment
- [ ] Export filters (date range, user, amount)
- [ ] Multiple token support
- [ ] Testnet/Mainnet toggle in UI

## Support

### Common Questions

**Q: Can I export pending invoices?**
A: No, only approved invoices are exported. Approve them first.

**Q: Can I edit the CSV after export?**
A: Yes, but be careful. Wrong addresses = lost funds.

**Q: What if a user changes their wallet after export?**
A: Payment goes to the wallet in the CSV. Update and re-export if needed.

**Q: Can I export to other formats?**
A: Currently only CSV. Other formats may be added later.

**Q: Does export include paid invoices?**
A: No, only approved (unpaid) invoices.

## Summary

✅ **Export Format:** Safe wallet CSV Airdrop compatible
✅ **Token:** cUSD (Celo Dollar)
✅ **Network:** Celo Mainnet (configurable)
✅ **Requirements:** Approved invoices + wallet addresses
✅ **Process:** Export → Upload to Safe → Sign → Execute → Mark Paid

---

**Ready to export? Go to Admin Dashboard and click "📥 Export Approved to CSV"!**
