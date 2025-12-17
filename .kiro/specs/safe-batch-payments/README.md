# Safe Batch Payments - Specification

## Overview

This specification defines the Safe Batch Payments feature for the CeloAfricaDAO Invoice app. This feature enables users to pay multiple approved invoices in a single batch transaction through their Safe multisig wallet, saving time and gas fees.

## Value Proposition

**Current State:** Pay 20 invoices = 20 separate transactions, 20 approval rounds, hours of work

**Future State:** Pay 20 invoices = 1 batch transaction, 1 approval round, minutes of work

**Benefits:**
- ⏱️ **90% time savings** - Pay 50 invoices in minutes instead of hours
- 💸 **70% gas savings** - One transaction instead of many
- 🎯 **Reduced errors** - Automated batch creation
- 🔒 **Maintained security** - Still requires multisig approval
- 📊 **Better tracking** - Batch payment history

## Documents

This specification consists of four documents:

### 1. [Requirements](./requirements.md)
**Purpose:** Define what the feature must do

**Contents:**
- 12 main requirements using EARS format
- User stories with acceptance criteria
- Non-functional requirements (performance, security, usability)
- Out of scope items for future versions

**Key Requirements:**
- Safe environment detection
- Invoice selection for batch payment
- Batch payment preview
- Native token (CELO) and ERC20 (cUSD) support
- Safe transaction submission
- Batch payment tracking and status updates
- Batch payment history
- Error handling and validation

**Read this if:** You want to understand what the feature does from a user perspective

---

### 2. [Design](./design.md)
**Purpose:** Define how the feature will be built

**Contents:**
- Correctness properties (invariants, preconditions, postconditions)
- System architecture and component design
- Database schema and state machines
- API integration details
- Error handling strategy
- Security considerations
- Performance optimization
- Testing strategy

**Key Design Decisions:**
- React Context for Safe SDK integration
- Custom hooks for business logic
- Service layer for transaction building
- Polling with exponential backoff for status updates
- RLS policies for data security
- Maximum 100 invoices per batch

**Read this if:** You want to understand the technical architecture and design decisions

---

### 3. [Tasks](./tasks.md)
**Purpose:** Break down implementation into actionable tasks

**Contents:**
- 35 detailed tasks across 6 phases
- Effort estimates (XS to XL)
- Dependencies between tasks
- Acceptance criteria for each task
- Testing requirements
- Deployment tasks

**Phases:**
1. **Foundation** (Week 1-2): Safe SDK integration, database setup
2. **Selection** (Week 3): Multi-select UI, batch action bar
3. **Building** (Week 4): Transaction builder, preview modal
4. **Submission** (Week 5): Safe submission, database records
5. **Tracking** (Week 6): Status monitoring, batch history
6. **Polish** (Week 7-8): Testing, documentation, optimization

**Read this if:** You're implementing the feature and need a step-by-step guide

---

### 4. [README](./README.md) (This Document)
**Purpose:** Provide overview and navigation

**Contents:**
- Feature overview
- Document structure
- Quick start guide
- Timeline and resources
- Success metrics

**Read this if:** You're new to the project and want an overview

---

## Quick Start

### For Product Managers

1. **Understand the value:** Read the "Value Proposition" section above
2. **Review requirements:** Read [requirements.md](./requirements.md)
3. **Check timeline:** 9 weeks from start to production (see below)
4. **Allocate resources:** 1 full-time developer needed
5. **Track progress:** Use [tasks.md](./tasks.md) as checklist

### For Developers

1. **Read requirements:** [requirements.md](./requirements.md) - Understand what to build
2. **Read design:** [design.md](./design.md) - Understand how to build it
3. **Follow tasks:** [tasks.md](./tasks.md) - Step-by-step implementation
4. **Start with Phase 1:** Install dependencies and create SafeContext
5. **Test as you go:** Don't wait until the end

### For Designers

1. **Review user flows:** See requirements.md for user stories
2. **Check UI components:** See design.md for component specs
3. **Review mockups:** See SAFE_MULTISIG_INTEGRATION_ANALYSIS.md
4. **Provide feedback:** Early and often during implementation

### For Stakeholders

1. **Understand ROI:** See "Value Proposition" and "Success Metrics"
2. **Review timeline:** 9 weeks to production
3. **Test on staging:** Before production release
4. **Promote adoption:** Help users understand benefits

---

## Timeline

### High-Level Schedule

```
Week 1-2: Foundation
├─ Install Safe SDK
├─ Create SafeContext
├─ Database migration
└─ Safe indicator in UI

Week 3: Selection
├─ Add checkboxes to invoice list
├─ Create batch action bar
├─ Add "Select All" functionality
└─ Currency filter validation

Week 4: Building
├─ Create transaction builder
├─ Create token encoder
├─ Create preview modal
└─ Create useBatchPayment hook

Week 5: Submission
├─ Implement Safe submission
├─ Create database records
└─ Add notifications

Week 6: Tracking
├─ Create batch payments page
├─ Create status monitoring
├─ Integrate Safe API
└─ Add detail view

Week 7-8: Polish
├─ Error handling
├─ Loading states
├─ Unit tests
├─ Integration tests
├─ E2E testing
├─ Documentation
├─ Performance optimization
├─ Accessibility audit
├─ Security audit
└─ Deployment

Week 9: Production
├─ Deploy database migration
├─ Deploy to staging
├─ Deploy to production
├─ Create video tutorial
└─ Monitor and iterate
```

### Milestones

- **Week 2:** Safe detection working ✓
- **Week 3:** Can select multiple invoices ✓
- **Week 4:** Can preview batch payment ✓
- **Week 5:** Can submit to Safe ✓
- **Week 6:** Can track status ✓
- **Week 8:** Feature complete and tested ✓
- **Week 9:** Production deployment ✓

---

## Resources Required

### Team

**Required:**
- 1 Full-time Developer (9 weeks)

**Optional:**
- 1 Designer (for UI review and feedback)
- 1 QA Engineer (for testing support)
- 1 Technical Writer (for documentation)

### Tools & Services

**Development:**
- Node.js 18+
- React 18+
- Vite
- Supabase
- Safe Apps SDK

**Testing:**
- Vitest (unit tests)
- React Testing Library (component tests)
- Playwright or Cypress (E2E tests)
- Celo Alfajores Testnet
- Safe Test Environment

**Monitoring:**
- Sentry (error tracking)
- Analytics (usage tracking)
- Supabase Dashboard (database monitoring)

### External Dependencies

**Safe Global:**
- Safe Apps SDK v8.0.0+
- Safe Transaction Service API
- Safe UI (for transaction approval)

**Celo:**
- Celo Mainnet (Chain ID: 42220)
- Celo Alfajores Testnet (Chain ID: 44787)
- cUSD Token Contract

---

## Success Metrics

### User Metrics

**Adoption:**
- Target: 50% of active users try batch payments within 3 months
- Measure: Track batch_payment_created events

**Usage:**
- Target: Average 10 invoices per batch
- Measure: Track invoice_count in batch_payments table

**Satisfaction:**
- Target: 80%+ user satisfaction score
- Measure: Post-feature survey

### Performance Metrics

**Time Savings:**
- Target: 90% reduction in payment time
- Measure: Compare time for 20 individual payments vs 1 batch
- Baseline: 20 payments × 5 min = 100 minutes
- Goal: 1 batch × 5 min = 5 minutes

**Gas Savings:**
- Target: 70% reduction in gas fees
- Measure: Compare gas costs
- Baseline: 20 transactions × $2 = $40
- Goal: 1 transaction × $2 = $2

**Success Rate:**
- Target: 95%+ successful batch submissions
- Measure: Track executed vs failed batches

### Technical Metrics

**Performance:**
- Target: Batch of 100 invoices loads in < 2 seconds
- Target: Preview modal opens in < 500ms
- Target: Status updates in < 1 second

**Reliability:**
- Target: 99.9% uptime
- Target: < 0.1% error rate
- Target: Zero data loss incidents

**Quality:**
- Target: 90%+ code coverage
- Target: Zero critical bugs in production
- Target: All accessibility checks pass

---

## Risk Assessment

### High Risks

**1. Safe SDK Integration Complexity**
- **Risk:** SDK may have unexpected behavior or limitations
- **Impact:** High - Core feature dependency
- **Mitigation:** Early testing, engage Safe community, have fallback plan
- **Status:** Monitor during Phase 1

**2. Safe API Reliability**
- **Risk:** API may be slow or unavailable
- **Impact:** Medium - Affects status tracking
- **Mitigation:** Implement retry logic, caching, fallback UI
- **Status:** Monitor during Phase 5

**3. Gas Limit Constraints**
- **Risk:** Large batches may exceed gas limits
- **Impact:** Medium - Limits batch size
- **Mitigation:** Set max batch size to 100, test on testnet
- **Status:** Validate during Phase 4

### Medium Risks

**4. User Adoption**
- **Risk:** Users may not understand or use feature
- **Impact:** Medium - Low ROI
- **Mitigation:** Clear documentation, video tutorial, onboarding
- **Status:** Address in Phase 6

**5. Performance with Large Batches**
- **Risk:** UI may be slow with 100 invoices
- **Impact:** Medium - Poor UX
- **Mitigation:** Optimization, pagination, lazy loading
- **Status:** Address in Phase 6

### Low Risks

**6. Browser Compatibility**
- **Risk:** Feature may not work in all browsers
- **Impact:** Low - Most users on modern browsers
- **Mitigation:** Test on major browsers, provide compatibility notice
- **Status:** Test during Phase 6

---

## Dependencies

### External Dependencies

**Safe Global:**
- Safe Apps SDK must be stable
- Safe Transaction Service API must be available
- Safe UI must support Celo network

**Celo:**
- Celo network must be operational
- Token contracts must be deployed
- Block explorer must be available

**Supabase:**
- Database must be available
- RLS must be working
- API must be performant

### Internal Dependencies

**Existing Features:**
- Invoice management system
- User authentication
- Wallet address validation
- Invoice approval workflow

**Infrastructure:**
- Netlify deployment
- Environment variables
- Error tracking
- Analytics

---

## Future Enhancements (Out of Scope for V1)

### V2 Features

**Additional Token Support:**
- Support for cEUR, cREAL
- Support for custom ERC20 tokens
- Multi-currency batches

**Batch Templates:**
- Save batch configurations
- Recurring batch payments
- Quick batch from template

**Advanced Features:**
- CSV import for batch creation
- Scheduled batch execution
- Email notifications for status changes
- Automatic retry for failed batches
- Partial batch execution

**Integrations:**
- Gnosis Chain support
- Ethereum mainnet support
- Other multisig wallet support

### V3 Features

**Analytics:**
- Batch payment analytics dashboard
- Gas savings calculator
- Payment trends and insights

**Automation:**
- Auto-batch approved invoices
- Smart batch optimization
- Predictive gas pricing

---

## FAQ

### General Questions

**Q: What is Safe?**
A: Safe (formerly Gnosis Safe) is a smart contract wallet that requires multiple signatures (multisig) to execute transactions. It's used by DAOs and organizations for secure fund management.

**Q: Why batch payments?**
A: Batch payments save time and gas fees by combining multiple payments into a single transaction. Instead of creating 20 separate transactions, you create one.

**Q: How much can I save?**
A: Approximately 90% time savings and 70% gas fee savings for batches of 20+ invoices.

### Technical Questions

**Q: What tokens are supported?**
A: V1 supports CELO (native token) and cUSD (stablecoin). Future versions will support cEUR, cREAL, and other tokens.

**Q: What's the maximum batch size?**
A: 100 invoices per batch. This limit ensures transactions stay within gas limits and UI remains performant.

**Q: Does this work outside of Safe?**
A: No, batch payments only work when the app is opened inside a Safe wallet. Regular users can still pay invoices individually.

**Q: What happens if a batch fails?**
A: The batch status is marked as "failed" and all invoices revert to "approved" status. You can then retry or pay individually.

### Implementation Questions

**Q: How long will this take to build?**
A: Approximately 9 weeks with 1 full-time developer, including testing and deployment.

**Q: What are the main technical challenges?**
A: Safe SDK integration, transaction encoding, status monitoring, and handling edge cases.

**Q: Do we need to modify the database?**
A: Yes, we need to add a batch_payments table and update the invoices table with new columns.

---

## Support

### For Users

**Documentation:**
- User guide: `docs/BATCH_PAYMENTS_GUIDE.md` (created in Task 6.6)
- Video tutorial: (created in Task D.4)
- FAQ: See above

**Support Channels:**
- In-app help
- Email support
- Community Discord

### For Developers

**Documentation:**
- Architecture: [design.md](./design.md)
- API reference: [design.md](./design.md#api-integration)
- Testing guide: [tasks.md](./tasks.md#task-63-write-unit-tests)

**Resources:**
- [Safe Apps SDK Docs](https://docs.safe.global/safe-core-aa-sdk/safe-apps)
- [Celo Documentation](https://docs.celo.org/)
- [Safe Discord](https://discord.gg/safe)
- [Celo Discord](https://discord.gg/celo)

---

## Changelog

### Version 1.0 (December 16, 2025)
- Initial specification created
- Requirements defined (12 main requirements)
- Design documented (architecture, components, database)
- Tasks broken down (35 tasks across 6 phases)
- Timeline established (9 weeks)

---

## Approval

### Stakeholder Sign-off

**Product Owner:** _________________ Date: _______

**Technical Lead:** _________________ Date: _______

**Designer:** _________________ Date: _______

**Security:** _________________ Date: _______

---

## Next Steps

1. **Review this specification** with all stakeholders
2. **Get approval** from product owner and technical lead
3. **Allocate resources** (1 developer for 9 weeks)
4. **Set up project tracking** (use tasks.md as checklist)
5. **Begin Phase 1** (Task 1.1: Install Dependencies)
6. **Schedule regular check-ins** (weekly progress reviews)
7. **Communicate timeline** to users and stakeholders

---

**Document Version:** 1.0  
**Last Updated:** December 16, 2025  
**Status:** Ready for Review  
**Next Review:** After stakeholder approval

