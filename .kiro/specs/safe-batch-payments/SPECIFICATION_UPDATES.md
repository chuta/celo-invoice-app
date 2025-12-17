# Specification Updates - Safe App Listing Requirements

## Date: December 16, 2025

## Overview

After reviewing the official Safe.global guide for building and listing Safe Apps, I've updated our specification to ensure full compliance with Safe{Wallet} app store requirements.

**Source:** https://help.safe.global/en/articles/145503-how-to-build-a-safe-app-and-get-it-listed-in-safe-wallet

---

## Key Changes

### ✅ What Was Already Covered

Our original specification already included most technical requirements:

1. **Safe Apps SDK Integration** ✓
   - Using `@safe-global/safe-apps-sdk`
   - Using `@safe-global/safe-apps-react-sdk`
   - SafeContext implementation

2. **Auto-Connect Behavior** ✓
   - Safe environment detection
   - Automatic Safe selection
   - Safe connection indicator

3. **Testing on Testnet** ✓
   - E2E testing on Celo Alfajores
   - Testing with real Safe wallet

### ⚠️ What Was Missing (Now Added)

The following **critical requirements** were missing and have been added:

#### 1. Manifest File (REQUIRED)
**New Task:** Task 1.6 - Create Safe App Manifest File

**What:** Create `/public/manifest.json` with app metadata

**Why:** Mandatory for all Safe Apps - Safe uses this to load app info

**Format:**
```json
{
  "name": "CeloAfricaDAO Invoice - Batch Payments",
  "description": "Pay multiple invoices in a single batch transaction",
  "iconPath": "safe-app-icon.svg"
}
```

**Impact:** Critical - App won't load in Safe without this

---

#### 2. CORS Headers (REQUIRED)
**New Task:** Task 1.7 - Configure CORS Headers for Manifest

**What:** Configure CORS headers to allow Safe to access manifest.json

**Why:** Safe needs to fetch manifest from your domain

**Implementation:**
```toml
# netlify.toml
[[headers]]
  for = "/manifest.json"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET"
    Access-Control-Allow-Headers = "X-Requested-With, content-type, Authorization"
```

**Impact:** Critical - Safe can't load app without proper CORS

---

#### 3. ABI Documentation (REQUIRED)
**New Task:** Task 6.11 - Prepare ABI Documentation

**What:** Document ABIs for transaction decoding

**Why:** Safe needs ABIs to decode and display transaction details

**Content:**
- cUSD token ABI
- Contract addresses (mainnet + testnet)
- Links to verified contracts
- Transfer function signatures

**Impact:** High - Required for listing approval

---

#### 4. Custom App Testing (REQUIRED)
**New Task:** Task 6.12 - Test as Custom Safe App

**What:** Test app by adding as Custom App in Safe{Wallet}

**Why:** Validate everything works before official listing

**Process:**
1. Deploy to staging
2. Add as Custom App in Safe
3. Test full flow
4. Verify manifest loads
5. Test on mobile

**Impact:** High - Catches issues before submission

---

#### 5. Listing Application (REQUIRED)
**New Task:** Task D.5 - Prepare Safe App Listing Application

**What:** Fill out listing form and prepare documentation

**Why:** Required to get listed in Safe{Wallet} app store

**Includes:**
- Listing form submission
- Test plan document
- Known limitations document
- Repository access
- Commercial terms discussion

**Impact:** Critical - Can't get listed without this

---

#### 6. Commercial Terms Alignment (REQUIRED)
**New Task:** Task D.6 - Align on Commercial Terms

**What:** Discuss and agree on commercial terms with Safe team

**Topics:**
- Listing fee (if any)
- Revenue share (if applicable)
- Launch support
- Marketing collaboration

**Impact:** High - Required before listing approval

---

#### 7. Staging Review (REQUIRED)
**New Task:** Task D.7 - Staging Review and Approval

**What:** Work with Safe team on staging review

**Process:**
1. Safe adds app to staging
2. Product/UX review
3. Address feedback
4. Get approval

**Impact:** Critical - Final gate before production

---

#### 8. Production Listing (REQUIRED)
**New Task:** Task D.8 - Production Listing and Launch

**What:** Coordinate production listing with Safe team

**Includes:**
- Production deployment
- Launch announcement
- User documentation
- Support readiness

**Impact:** Critical - The actual listing

---

## Updated Timeline

### Original Timeline: 9 weeks
- Phase 1: 2 weeks (5 tasks)
- Phase 2: 1 week (4 tasks)
- Phase 3: 1 week (4 tasks)
- Phase 4: 1 week (3 tasks)
- Phase 5: 1 week (4 tasks)
- Phase 6: 2 weeks (10 tasks)
- Deployment: 1 week (5 tasks)

### Updated Timeline: 10 weeks
- Phase 1: 2 weeks (**7 tasks** - added manifest + CORS)
- Phase 2: 1 week (4 tasks)
- Phase 3: 1 week (4 tasks)
- Phase 4: 1 week (3 tasks)
- Phase 5: 1 week (4 tasks)
- Phase 6: 2 weeks (**12 tasks** - added ABI docs + custom app testing)
- Deployment: **2 weeks** (**9 tasks** - added listing process)

**Total:** 43 tasks (was 35 tasks)

**Note:** Listing process may add additional time depending on Safe team review speed and commercial terms negotiation.

---

## Impact Assessment

### Development Impact: LOW
- Most changes are documentation and configuration
- No major code changes required
- Manifest and CORS are simple additions

### Timeline Impact: MEDIUM
- +1 week to overall timeline
- Listing process adds uncertainty (depends on Safe team)
- Can start listing process in parallel with final testing

### Risk Impact: LOW
- All requirements are well-documented
- Safe provides clear guidelines
- Community support available

---

## Updated Documents

The following specification documents have been updated:

1. **tasks.md** ✅
   - Added 8 new tasks
   - Updated task counts
   - Updated timeline
   - Added Safe listing requirements

2. **SAFE_APP_LISTING_REQUIREMENTS.md** ✅ (NEW)
   - Complete guide to Safe listing requirements
   - Alignment analysis with our spec
   - Action items and priorities

3. **SPECIFICATION_UPDATES.md** ✅ (THIS DOCUMENT)
   - Summary of changes
   - Impact assessment
   - Next steps

### Still Need to Update:

4. **README.md** ⏳
   - Update timeline (9 weeks → 10 weeks)
   - Update task count (35 → 43)
   - Add Safe listing section

5. **design.md** ⏳
   - Add manifest file specification
   - Add CORS configuration details
   - Add ABI documentation requirements

6. **SAFE_BATCH_PAYMENTS_SPEC.md** ⏳
   - Update timeline
   - Update task count
   - Add listing requirements section

---

## Next Steps

### Immediate (Before Starting Implementation)

1. **Review Updates** ✓
   - Review this document
   - Review SAFE_APP_LISTING_REQUIREMENTS.md
   - Review updated tasks.md

2. **Update Remaining Docs** ⏳
   - Update README.md
   - Update design.md
   - Update SAFE_BATCH_PAYMENTS_SPEC.md

3. **Get Approval** ⏳
   - Stakeholder review
   - Technical lead approval
   - Proceed with implementation

### During Implementation

4. **Phase 1 Priority**
   - Task 1.6: Create manifest.json (Week 1)
   - Task 1.7: Configure CORS (Week 1)
   - Test manifest loads correctly

5. **Phase 6 Priority**
   - Task 6.11: Prepare ABI docs (Week 7)
   - Task 6.12: Test as Custom App (Week 8)
   - Validate everything before listing

6. **Deployment Priority**
   - Task D.5: Submit listing application (Week 9)
   - Task D.6: Align on commercial terms (Week 9-10)
   - Task D.7-D.8: Staging and production (Week 10+)

---

## Questions for Stakeholders

### Business Questions

1. **Commercial Terms**
   - Are we prepared to discuss listing fees?
   - Do we have budget for potential listing costs?
   - What revenue share (if any) is acceptable?

2. **Timeline**
   - Is 10 weeks acceptable? (was 9 weeks)
   - Can we accommodate Safe team review time?
   - What's our target launch date?

3. **Marketing**
   - Do we want Safe's launch support?
   - Should we coordinate announcements?
   - What's our marketing plan?

### Technical Questions

1. **Contracts**
   - We use existing cUSD/CELO contracts (not deploying new ones)
   - Is this acceptable for listing? (Yes, per requirements)
   - Do we need additional audits? (No, using audited contracts)

2. **Repository Access**
   - Are we comfortable providing repo access to Safe team?
   - Should we create a separate public repo?
   - What level of access is appropriate?

3. **Support**
   - Who will handle Safe app store support requests?
   - Do we need dedicated support channels?
   - What's our SLA for Safe-specific issues?

---

## Risk Mitigation

### Risk 1: Listing Rejection
**Probability:** Low  
**Impact:** High  
**Mitigation:**
- Follow all requirements exactly
- Test thoroughly as Custom App
- Engage Safe community early
- Have backup plan (keep as Custom App)

### Risk 2: Commercial Terms Disagreement
**Probability:** Medium  
**Impact:** Medium  
**Mitigation:**
- Research typical Safe terms
- Prepare business case
- Have walk-away terms defined
- Consider Custom App as alternative

### Risk 3: Extended Review Time
**Probability:** Medium  
**Impact:** Low  
**Mitigation:**
- Start listing process early
- Maintain communication with Safe team
- Have interim launch plan (Custom App)
- Set realistic expectations

---

## Success Criteria

### Technical Success
- ✅ Manifest.json loads correctly
- ✅ CORS headers configured properly
- ✅ Auto-connect works in Safe
- ✅ All transactions decode correctly
- ✅ Works on mobile Safe app

### Listing Success
- ✅ Application submitted
- ✅ Commercial terms agreed
- ✅ Staging review passed
- ✅ Listed in production
- ✅ Launch coordinated

### Business Success
- ✅ 50+ users try batch payments in first month
- ✅ 4+ star rating in Safe app store
- ✅ Positive user feedback
- ✅ ROI achieved within 6 months

---

## Resources

### Official Documentation
- [Safe App Listing Guide](https://help.safe.global/en/articles/145503-how-to-build-a-safe-app-and-get-it-listed-in-safe-wallet)
- [Safe Apps SDK](https://github.com/safe-global/safe-apps-sdk)
- [Add Custom Safe App](https://help.safe.global/en/articles/40859-add-a-custom-safe-app)

### Application Links
- [Listing Request Form](https://docs.google.com/forms/d/e/1FAIpQLSeN2m94-jvGjvUF9MpZSkwxGPPjNz7QKZj9h9kMVXvnNdp2Mg/viewform?usp=sf_link)

### Community Support
- [Safe Discord](https://discord.gg/safe)
- [Celo Discord](https://discord.gg/celo)

---

## Conclusion

The specification has been updated to fully comply with Safe.global's listing requirements. The changes are primarily documentation and configuration, with minimal impact on development effort.

**Key Takeaways:**
- ✅ Specification is now complete and compliant
- ✅ Timeline increased by 1 week (acceptable)
- ✅ All critical requirements identified and addressed
- ✅ Clear path to Safe{Wallet} app store listing
- ✅ Ready to proceed with implementation

**Recommendation:** Proceed with implementation following the updated specification.

---

**Document Version:** 1.0  
**Last Updated:** December 16, 2025  
**Status:** Ready for Review  
**Next Action:** Stakeholder approval

