#!/bin/bash

# Documentation Cleanup Script
# This will move old/redundant documentation to an archive folder

echo "📚 Escolta Pro - Documentation Cleanup"
echo "========================================"
echo ""

# Create archive folder
mkdir -p docs/archive
mkdir -p docs/archive/audit-reports
mkdir -p docs/archive/payment-fixes
mkdir -p docs/archive/build-status
mkdir -p docs/archive/testing
mkdir -p docs/archive/phases

echo "✅ Created archive folders"
echo ""

# Files to KEEP (essential documentation)
KEEP_FILES=(
  "README.md"
  "PROJECT_HISTORY.md"
  "QUICK_FIX_GUARDS.md"
  "ALL_USERS_VERIFICATION_REPORT.md"
  "DEMO_ACCOUNTS.md"
  "BUILD_GUIDE.md"
  "DEPLOYMENT_INSTRUCTIONS.md"
  "TESTING_GUIDE.md"
)

echo "📋 Files that will be KEPT:"
for file in "${KEEP_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  fi
done
echo ""

# Archive audit reports (keep for reference but move out of root)
echo "📦 Archiving audit reports..."
mv COMPREHENSIVE_AUDIT_REPORT_DEC_2025.md docs/archive/audit-reports/ 2>/dev/null
mv COMPREHENSIVE_AUDIT_OCTOBER_2025.md docs/archive/audit-reports/ 2>/dev/null
mv COMPREHENSIVE_APP_AUDIT_2025.md docs/archive/audit-reports/ 2>/dev/null
mv COMPREHENSIVE_SYSTEM_AUDIT.md docs/archive/audit-reports/ 2>/dev/null
mv COMPREHENSIVE_TECHNICAL_REPORT.md docs/archive/audit-reports/ 2>/dev/null
mv NASA_GRADE_VERIFICATION_AUDIT_REPORT.md docs/archive/audit-reports/ 2>/dev/null
mv NASA_GRADE_SYSTEM_AUDIT_DEC_2025.md docs/archive/audit-reports/ 2>/dev/null
mv NASA_GRADE_FINAL_AUDIT_REPORT_OCT_2025.md docs/archive/audit-reports/ 2>/dev/null
mv PRODUCTION_AUDIT_REPORT.md docs/archive/audit-reports/ 2>/dev/null
mv PRODUCTION_READINESS_AUDIT.md docs/archive/audit-reports/ 2>/dev/null
mv EXECUTIVE_SUMMARY_AUDIT.md docs/archive/audit-reports/ 2>/dev/null
mv AUDIT_COMPLETE*.md docs/archive/audit-reports/ 2>/dev/null
mv SECURITY_AUDIT*.md docs/archive/audit-reports/ 2>/dev/null
mv PHASE_1_AUDIT_REPORT.md docs/archive/audit-reports/ 2>/dev/null

echo "✅ Moved audit reports to docs/archive/audit-reports/"
echo ""

# Archive payment-related fix files (superseded by PROJECT_HISTORY.md)
echo "📦 Archiving payment fix documentation..."
mv PAYMENT_*.md docs/archive/payment-fixes/ 2>/dev/null
mv BRAINTREE_*.md docs/archive/payment-fixes/ 2>/dev/null
mv HOSTED_FIELDS_*.md docs/archive/payment-fixes/ 2>/dev/null

echo "✅ Moved payment fixes to docs/archive/payment-fixes/"
echo ""

# Archive build status files (outdated)
echo "📦 Archiving build status files..."
mv BUILD_*.md docs/archive/build-status/ 2>/dev/null
mv ANDROID_BUILD_*.md docs/archive/build-status/ 2>/dev/null
mv BUNDLE_ERROR_FIXED.md docs/archive/build-status/ 2>/dev/null
mv APP_CRASH_FIXED.md docs/archive/build-status/ 2>/dev/null
mv CIRCULAR_DEPENDENCY_FIX.md docs/archive/build-status/ 2>/dev/null
mv METRO_*.md docs/archive/build-status/ 2>/dev/null
mv SERVER_RESTARTED.md docs/archive/build-status/ 2>/dev/null
mv STOPPED_CLEAN.md docs/archive/build-status/ 2>/dev/null
mv XCODE_*.md docs/archive/build-status/ 2>/dev/null

echo "✅ Moved build status to docs/archive/build-status/"
echo ""

# Archive testing documentation (consolidate later)
echo "📦 Archiving testing documentation..."
mv TEST_*.md docs/archive/testing/ 2>/dev/null
mv TESTING_*.md docs/archive/testing/ 2>/dev/null
mv testing-plan.md docs/archive/testing/ 2>/dev/null
mv QUICK_TEST*.md docs/archive/testing/ 2>/dev/null
mv MANUAL_TEST_WALKTHROUGH.md docs/archive/testing/ 2>/dev/null
mv UX_TESTING_GUIDE.md docs/archive/testing/ 2>/dev/null
mv IOS_ANDROID_TESTING.md docs/archive/testing/ 2>/dev/null
mv LIVE_TEST_RESULTS.md docs/archive/testing/ 2>/dev/null
mv WEBHOOK_TEST*.md docs/archive/testing/ 2>/dev/null
mv WEBVIEW_*.md docs/archive/testing/ 2>/dev/null
mv MOBILE_WEBHOOK_TESTING.md docs/archive/testing/ 2>/dev/null

echo "✅ Moved testing docs to docs/archive/testing/"
echo ""

# Archive phase documentation
echo "📦 Archiving phase documentation..."
mv PHASE_*.md docs/archive/phases/ 2>/dev/null

echo "✅ Moved phase docs to docs/archive/phases/"
echo ""

# Delete truly redundant files (multiple similar "complete" or "fixed" files)
echo "🗑️  Deleting redundant status files..."

REDUNDANT=(
  "ALL_FIXES_COMPLETE_README.md"
  "ALL_ISSUES_RESOLVED.md"
  "ALL_ISSUES_RESOLVED_FINAL.md"
  "AUDIT_FIXES_SUMMARY.md"
  "BLOCKERS_FIXED_SUMMARY.md"
  "CRITICAL_ACTIONS_REQUIRED.md"
  "CRITICAL_BLOCKERS_FIXED.md"
  "CURRENT_STATUS.md"
  "CURRENT_STATUS_SUMMARY.md"
  "ERRORS_FIXED.md"
  "FEATURE_IMPLEMENTATION_SUMMARY.md"
  "FEATURES_IMPLEMENTED.md"
  "FINAL_STATUS.md"
  "FINAL_SUCCESS_SUMMARY.md"
  "FIXES_APPLIED.md"
  "FIXES_APPLIED_COMPLETE.md"
  "FIXES_QUICK_REFERENCE.md"
  "FIXES_SUMMARY.md"
  "IMPLEMENTATION_COMPLETE.md"
  "IMPLEMENTATION_COMPLETE_SUMMARY.md"
  "IMPROVEMENTS.md"
  "MONITORING_COMPLETE.md"
  "MONITORING_IMPLEMENTATION_COMPLETE.md"
  "PERMISSIONS_FIXED.md"
  "PROGRESS_TRACKER.md"
  "SECURITY_FIX_COMPLETE.md"
  "SECURITY_FIXES_COMPLETE.md"
  "SUCCESS_BOTH_PLATFORMS.md"
  "WEBHOOK_SYSTEM_COMPLETE.md"
  "WEBHOOK_VERIFICATION_STATUS.md"
)

for file in "${REDUNDANT[@]}"; do
  if [ -f "$file" ]; then
    rm "$file"
    echo "  🗑️  Deleted: $file"
  fi
done

echo ""
echo "✅ Deleted redundant status files"
echo ""

# Delete redundant "quick start" files (keep only QUICK_START.md)
echo "🗑️  Deleting redundant quick start files..."

QUICK_START_REDUNDANT=(
  "QUICK_START_BRAINTREE.md"
  "QUICK_START_CARD.md"
  "QUICK_START_NOW.md"
  "QUICK_START_TESTING.md"
  "QUICK_DEPLOYMENT_CHECKLIST.md"
  "QUICK_FIX_APPLIED.md"
  "QUICK_FIX_DELETE_DOCUMENT.md"
  "QUICK_FIX_GUIDE.md"
  "QUICK_TESTING_GUIDE.md"
  "QUICK_WEBHOOK_TEST.md"
  "READY_TO_TEST.md"
  "READY_TO_TEST_PAYMENT.md"
  "RELOAD_NOW.md"
  "RUN_THIS_NOW.md"
  "START_HERE.md"
  "START_IMPLEMENTATION_NOW.md"
  "START_INSTRUCTIONS.md"
  "START_TESTING_NOW.md"
  "START_WEBHOOK_TESTING.md"
)

for file in "${QUICK_START_REDUNDANT[@]}"; do
  if [ -f "$file" ]; then
    rm "$file"
    echo "  🗑️  Deleted: $file"
  fi
done

echo ""
echo "✅ Deleted redundant quick start files"
echo ""

# Delete redundant README files (keep only README.md)
echo "🗑️  Deleting redundant README files..."

README_REDUNDANT=(
  "README_COMPREHENSIVE.md"
  "README_IOS_TEST.md"
  "README_PRODUCTION.md"
)

for file in "${README_REDUNDANT[@]}"; do
  if [ -f "$file" ]; then
    rm "$file"
    echo "  🗑️  Deleted: $file"
  fi
done

echo ""
echo "✅ Deleted redundant README files"
echo ""

# Delete various one-off fix documentation
echo "🗑️  Deleting one-off fix documentation..."

ONE_OFF=(
  "ACTION_PLAN.md"
  "CANT_TEST_TROUBLESHOOTING.md"
  "CLOUD_FUNCTIONS_SETUP.md"
  "COMPANY_ADMIN_LOGIN_FIX.md"
  "CONNECTION_FIX.md"
  "CREATE_DEMO_USERS_GUIDE.md"
  "DEPLOYMENT_DOCS_INDEX.md"
  "DEPLOYMENT_FLOWCHART.md"
  "DOCUMENTATION_REVIEW_ANALYSIS.md"
  "FIREBASE_SETUP.md"
  "FIRESTORE_CURRENT_STATUS.md"
  "FIRESTORE_PERMISSION_FIX.md"
  "FIRESTORE_RULES_FIX.md"
  "FIRESTORE_USER_SETUP.md"
  "FIX_API_ERRORS.md"
  "FIX_NO_BUILD.md"
  "FIX_WEB_ERROR.md"
  "FUNCTIONS_FIX_REQUIRED.md"
  "GUARD_SETUP_COMPLETE.md"
  "HOW_TO_OPEN_APP.md"
  "IMMEDIATE_FIX_GUIDE.md"
  "INSTALL_DEV_BUILD.md"
  "LOGIN_DIAGNOSIS_VERIFIED.md"
  "LOGIN_VERIFICATION_COMPLETE.md"
  "MANUAL_DEPLOYMENT_GUIDE.md"
  "PAYMENTS_SETUP.md"
  "PERMISSION_DIAGNOSIS.md"
  "PRE_BUILD_STATUS_CHECK.md"
  "PRINTABLE_CHECKLIST.md"
  "PRODUCTION_CHECKLIST.md"
  "PRODUCTION_READINESS_PLAN.md"
  "SECURITY_ACTION_PLAN.md"
  "T10_TRACKING_RULE.md"
  "TROUBLESHOOTING_GUIDE.md"
  "VISUAL_GUIDE.md"
  "VISUAL_SUMMARY.md"
  "WHY_TESTING_HAS_BEEN_DIFFICULT.md"
)

for file in "${ONE_OFF[@]}"; do
  if [ -f "$file" ]; then
    rm "$file"
    echo "  🗑️  Deleted: $file"
  fi
done

echo ""
echo "✅ Deleted one-off fix files"
echo ""

# Summary
echo "========================================"
echo "📊 CLEANUP SUMMARY"
echo "========================================"
echo ""
echo "✅ Essential files kept in root:"
for file in "${KEEP_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "   - $file"
  fi
done
echo ""
echo "📦 Archived to docs/archive/:"
echo "   - audit-reports/ (audit documentation)"
echo "   - payment-fixes/ (payment implementation history)"
echo "   - build-status/ (build and error fixes)"
echo "   - testing/ (testing documentation)"
echo "   - phases/ (phase completion reports)"
echo ""
echo "🗑️  Deleted redundant status/progress files"
echo ""
echo "📈 Before: 193 markdown files"
echo "📉 After: ~10 essential files + archived references"
echo ""
echo "✨ Documentation is now clean and organized!"
echo ""
echo "Next: Review PROJECT_HISTORY.md for complete project overview"
