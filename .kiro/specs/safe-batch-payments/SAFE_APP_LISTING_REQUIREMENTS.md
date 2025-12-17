# Safe App Listing Requirements

## Source
Based on: https://help.safe.global/en/articles/145503-how-to-build-a-safe-app-and-get-it-listed-in-safe-wallet

## Overview

To get listed in the Safe{Wallet} app store, there are **3 main steps**:

1. **Fill out the listing form**
2. **Align on commercial terms**
3. **Build your Safe App and meet listing requirements**

---

## Step 1: Fill Out Listing Form

**Action:** Submit the [Safe App Listing Request Form](https://docs.google.com/forms/d/e/1FAIpQLSeN2m94-jvGjvUF9MpZSkwxGPPjNz7QKZj9h9kMVXvnNdp2Mg/viewform?usp=sf_link)

**Information Required:**
- What your app does and who it's for
- App details
- Contact details

**Timeline:** Safe team responds in a few days

---

## Step 2: Align on Commercial Terms

**Discussion Topics:**
- Listing fee
- Revenue share
- Launch support and campaigns
- Timeline for integration and launch

**Outcome:** Agreement on terms before proceeding to implementation

---

## Step 3: Technical Requirements

### 3.1 Integration Path

**Option A: Existing dApp Integration**

If you already have a dApp:

1. **Using Onboard.js or Web3Modal?**
   - Use `safe-apps-web3modal`
   - Keeps existing wallet UX, adds Safe as first-class option

2. **Using Web3React?**
   - Use `safe-apps-web3react`

3. **Custom wallet logic?**
   - Use `safe-apps-provider` (lower-level)

**Option B: New Safe App**

Building from scratch:
- Use `cra-template-safe-app` to bootstrap React app
- Use `safe-apps-sdk` + `safe-apps-react-sdk` for Safe-specific context and hooks

**Documentation:** [Safe Apps SDK](https://github.com/safe-global/safe-apps-sdk)

---

### 3.2 Mandatory Technical Requirements

#### A. Manifest File (REQUIRED)

**Location:** Root directory (`/manifest.json`)

**Structure:**
```json
{
  "name": "YourAppName",
  "description": "A description of what your app does",
  "iconPath": "myAppIcon.svg"
}
```

**Notes:**
- `iconPath` is the public relative path where Safe loads your app icon
- Example: `https://yourAppUrl/myAppIcon.svg`

---

#### B. CORS Headers (REQUIRED)

**Purpose:** Allow Safe to reach the `manifest.json` file

**Required Headers:**
```
"Access-Control-Allow-Origin": "*"
"Access-Control-Allow-Methods": "GET"
"Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
```

**Implementation:** Set these headers on the `manifest.json` file

---

#### C. Auto-Connect to Safe (REQUIRED)

**Behavior:** When opened inside Safe{Wallet}, your app should:

1. **Detect** that it is running as a Safe App
2. **Automatically select** the connected Safe as the active account
3. **Fall back gracefully** when opened outside Safe with another wallet

**Implementation:** Examples provided in:
- `safe-apps-sdk`
- `safe-apps-react-sdk`
- `safe-apps-web3modal`
- `safe-apps-web3react`
- `safe-apps-provider`

---

### 3.3 Listing Requirements

To be listed in Safe{Wallet}, your app must have:

#### Security Requirements
- ✅ **Audited contracts** - Smart contracts must be audited
- ✅ **Valid manifest.json + CORS** - Properly configured
- ✅ **ABIs provided** - Via Sourcify, ABI files, or verified explorer links (for transaction decoding)

#### Review Requirements
- ✅ **Product/UX review** - Pass Safe team review
- ✅ **Repo access** - Provide access to code repository
- ✅ **Test plan** - Short test plan document
- ✅ **Known limitations** - Document any known issues

#### Launch Process
1. **Staging deployment** - App added to staging for final checks
2. **Production promotion** - Promoted to production after approval
3. **Coordinated launch** - Launch timing coordinated with Safe team

#### Testing Options
- **Custom App** - Test by adding as Custom App in Safe{Wallet}
- **Testnets** - Use supported testnets (Celo Alfajores, etc.)
- **Mainnet** - Test on mainnet before official listing

---

## Important Notes

⚠️ **Disclaimer:**
- Safe Apps aren't owned, controlled, maintained, or audited by Safe
- Safe can list or delist apps from Safe{Wallet} at its sole discretion

---

## Alignment with Our Specification

### ✅ Already Covered

Our current specification already includes:

1. **Safe Apps SDK Integration** (Task 1.1, 1.2)
   - Installing `@safe-global/safe-apps-sdk`
   - Installing `@safe-global/safe-apps-react-sdk`
   - Creating SafeContext

2. **Auto-Connect Behavior** (Task 1.2, 1.3)
   - Safe environment detection
   - Automatic Safe selection
   - Safe indicator in UI

3. **Testing Strategy** (Phase 6)
   - E2E testing on Celo Alfajores testnet
   - Testing with real Safe wallet

### ⚠️ Needs to be Added

The following requirements are **NOT** currently in our specification:

1. **Manifest File** ❌
   - Need to create `/public/manifest.json`
   - Need to configure icon path
   - Need to set CORS headers

2. **CORS Configuration** ❌
   - Need to configure server/hosting to serve manifest with CORS headers
   - Need to document CORS setup for Netlify

3. **Contract Audits** ❌
   - Our app doesn't deploy new contracts (uses existing cUSD/CELO)
   - But need to document this in listing application

4. **ABIs** ❌
   - Need to provide ABIs for transaction decoding
   - cUSD token ABI
   - Any custom contract ABIs

5. **Listing Application** ❌
   - Need to fill out listing form
   - Need to prepare commercial terms discussion
   - Need to provide repo access
   - Need to create test plan document

6. **Documentation for Listing** ❌
   - Product/UX documentation
   - Test plan
   - Known limitations document

---

## Action Items

### High Priority (Required for Listing)

1. **Add Manifest File Task** (Phase 1)
   - Create `/public/manifest.json`
   - Add app icon (SVG format recommended)
   - Configure CORS headers

2. **Add CORS Configuration Task** (Phase 1)
   - Document Netlify CORS setup
   - Configure headers for manifest.json
   - Test CORS from Safe iframe

3. **Add ABI Documentation Task** (Phase 6)
   - Document cUSD token ABI
   - Document CELO native transfer format
   - Provide ABI files or verified contract links

4. **Add Listing Preparation Task** (Phase 7)
   - Fill out listing form
   - Prepare commercial terms discussion
   - Create test plan document
   - Document known limitations
   - Provide repo access

### Medium Priority (Good Practice)

5. **Add Fallback Behavior** (Phase 2)
   - Ensure app works outside Safe
   - Graceful degradation when not in Safe
   - Clear messaging about Safe-only features

6. **Add Custom App Testing** (Phase 6)
   - Document how to add as Custom App
   - Test in Safe{Wallet} before submission
   - Create testing checklist

---

## Updated Timeline

With these additions, the timeline becomes:

- **Phase 1:** +1 task (Manifest + CORS) = 2 weeks
- **Phase 6:** +2 tasks (ABIs, Custom App testing) = 2 weeks
- **Phase 7 (New):** Listing preparation = 1 week

**Total:** 10 weeks (was 9 weeks)

---

## Resources

### Official Documentation
- [Safe Apps SDK](https://github.com/safe-global/safe-apps-sdk)
- [Listing Form](https://docs.google.com/forms/d/e/1FAIpQLSeN2m94-jvGjvUF9MpZSkwxGPPjNz7QKZj9h9kMVXvnNdp2Mg/viewform?usp=sf_link)
- [How to Add Custom Safe App](https://help.safe.global/en/articles/40859-add-a-custom-safe-app)

### Community Support
- [Safe Discord](https://discord.gg/safe)
- Safe team responds to listing form in a few days

---

## Next Steps

1. **Review this document** with stakeholders
2. **Update tasks.md** with new requirements
3. **Update design.md** with manifest/CORS specifications
4. **Update timeline** in README.md
5. **Proceed with implementation** following updated spec

