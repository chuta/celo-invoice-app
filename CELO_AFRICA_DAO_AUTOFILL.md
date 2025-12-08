# CeloAfricaDAO Client Autofill Feature

## Overview
Added a convenient autofill feature for CeloAfricaDAO members when adding clients to the invoice app.

## Feature Details

### What It Does
When adding a new client, users can check a box labeled "I'm a CeloAfricaDAO member" to automatically populate the client form with CeloAfricaDAO's organization details.

### Autofilled Information
- **Name:** Celo Africa DAO
- **Email:** team@celoafricadao.xyz
- **Address:** P.O. Box 30772-00100, Nairobi, Kenya
- **Phone:** (left empty)

## How to Use

### For CeloAfricaDAO Members:
1. Navigate to the **Clients** page
2. Click **"+ Add Client"**
3. Check the box **"I'm a CeloAfricaDAO member"**
4. Form fields automatically populate with CeloAfricaDAO details
5. Fields are disabled to prevent accidental changes
6. Click **"Add Client"** to save

### For Other Users:
1. Navigate to the **Clients** page
2. Click **"+ Add Client"**
3. Leave the checkbox unchecked
4. Manually enter client information
5. Click **"Add Client"** to save

## User Experience

### Visual Design
- Checkbox appears in a highlighted blue box at the top of the form
- Clear label: "I'm a CeloAfricaDAO member"
- Helper text: "Check this to autofill CeloAfricaDAO organization details"
- When checked, form fields are disabled to prevent editing

### Behavior
- **Only shows when adding new clients** (not when editing existing ones)
- **Unchecking the box** clears all fields back to empty
- **Checking the box** instantly fills all fields with CeloAfricaDAO info
- **Disabled fields** prevent accidental modifications when autofilled

## Technical Implementation

### State Management
```javascript
const [isCeloAfricaDAO, setIsCeloAfricaDAO] = useState(false)

const CELO_AFRICA_DAO_INFO = {
  name: 'Celo Africa DAO',
  email: 'team@celoafricadao.xyz',
  phone: '',
  address: 'P.O. Box 30772-00100\nNairobi, Kenya',
}
```

### Toggle Handler
```javascript
const handleCeloAfricaDAOToggle = (checked) => {
  setIsCeloAfricaDAO(checked)
  if (checked) {
    setFormData(CELO_AFRICA_DAO_INFO)
  } else {
    setFormData({ name: '', email: '', phone: '', address: '' })
  }
}
```

## Benefits

1. **Time Saving** - CeloAfricaDAO members don't need to manually type organization details
2. **Accuracy** - Eliminates typos in organization information
3. **Consistency** - Ensures all CeloAfricaDAO client entries use the same format
4. **User Friendly** - Simple checkbox interface, no complex configuration needed
5. **Flexible** - Users can still manually enter any other client information

## Future Enhancements

Potential improvements for future versions:
- Add more organization presets
- Allow users to save their own custom presets
- Import client information from CSV
- Integration with contact management systems

---

**Status:** ✅ Implemented and Ready to Use
**Version:** 1.0
**Date:** December 8, 2025
