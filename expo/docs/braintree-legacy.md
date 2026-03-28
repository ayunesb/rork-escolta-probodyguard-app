# Braintree legacy references

This repository historically contained Braintree integration files. The codebase now uses Braintree as the primary payment provider. The following notes summarize the state and what to do with legacy Braintree references:

- Braintree init stubs (services/braintreeInit.*) were removed as part of the migration to Braintree.
- Many documentation files still contain Braintree references and test keys. These are safe but should be cleaned up before release.

Action items

- Remove any real API keys from markdown files. Replace test keys with placeholders.
- Archive or delete any remaining `services/braintreeInit.*` files if they still exist.
- Confirm tests and CI do not attempt to import braintree modules.

If you need to recover previous Braintree code, check the audit logs in `audit/` for the deleted revisions.

## Archived excerpts (provenance)

### QUICK_FIX_GUIDE.md (Braintree section)
- Test Braintree Payment (instructions and env var examples were here; test card 4242 4242 4242 4242)

### CURRENT_STATUS.md (Braintree section)
- Described Braintree payment testing steps, env var examples, and status checks. Included example env entries (publishable key placeholder and a redacted secret key).

### START_INSTRUCTIONS.md (Braintree section)
- Short instructions for testing Braintree payments once the backend is running. Included test card and env var example (publishable key placeholder and redacted secret key).

### FIX_API_ERRORS.md (Braintree section)
- Troubleshooting steps for API routes and a "Testing Braintree After Fix" checklist. Included the test card and env var example (publishable key placeholder and redacted secret key).

### TEST_PAYMENT_NOW.md (Braintree section)
- Quick guide for testing payment flow with expected console logs and common issues. Contained notes warning that secret keys exposed via EXPO_PUBLIC_ prefix are not production safe.

Notes:
- Any full secret keys found in these files were redacted and replaced with placeholders like `pk_test_<REDACTED>` or `sk_test_<REDACTED>`.
- For historic details see `audit/` and `PHASE2_CHANGELOG.md` which record deleted stub files and the migration to Braintree.

### AUDIT_COMPLETE.md (Braintree sections)
- Audit document referenced Braintree PCI compliance, test card 4242 4242 4242 4242, and pre-launch Braintree checklist (keys, webhooks, production switching). These references were consolidated here and placeholders inserted in originals.

### TESTING_GUIDE.md (Braintree sections)
- Testing guide referenced Braintree test mode, configuration steps, and production migration checklist. Those instructions were archived here.

### PRODUCTION_CHECKLIST.md (Braintree sections)
- Production checklist included a full Braintree integration checklist (create account, keys, webhooks, PCI compliance). The env var template had Braintree placeholders; keys were redacted.

### SECURITY_AUDIT.md (Braintree sections)
- Security audit contained payment security notes mentioning Braintree integration, PCI compliance action items, and environment variable examples. Those were archived and the original updated to point here.

### README.md (Braintree sections)
- The README referenced Braintree as a payment option in the "Add Payments" section; that mention was left but heavy Braintree-specific steps were archived.

### COMPREHENSIVE_TECHNICAL_REPORT.md (Braintree sections)
- The technical report listed "Unused Braintree References" and archive paths; those entries now point to this consolidated archive and redundant archive references were pruned.
