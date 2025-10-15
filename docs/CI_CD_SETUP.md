# CI/CD Pipeline Setup Guide

## Overview

The CI/CD pipeline is configured using GitHub Actions to automatically test, build, and deploy the Escolta Pro app.

## Pipeline Stages

### 1. Environment Check
- Validates all required environment variables are configured
- Runs on every push and pull request
- Ensures production secrets are properly set

### 2. Lint and Type Check
- Runs ESLint on main project and functions
- Performs TypeScript compilation check
- Ensures code quality and type safety

### 3. Security Scan
- Runs `npm audit` to check for vulnerabilities
- Scans both main project and functions dependencies
- Fails on high-severity vulnerabilities

### 4. Tests
- Runs Jest tests for main project
- Runs function tests with proper TypeScript support
- Validates all critical functionality

### 5. Deploy (main branch only)
- Deploys Firebase Functions
- Updates Firestore rules and indexes
- Only runs on pushes to main branch

### 6. EAS Build (main branch only)
- Creates Expo Application Service builds
- Builds for preview profile (development)
- Enables testing on physical devices

## Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

### Firebase Configuration
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=escolta-pro-fe90e
EXPO_PUBLIC_API_URL=your_cloud_functions_url
FIREBASE_TOKEN=your_firebase_ci_token
```

### Braintree Configuration
```
BRAINTREE_MERCHANT_ID=your_merchant_id
BRAINTREE_PUBLIC_KEY=your_public_key
BRAINTREE_PRIVATE_KEY=your_private_key
```

### Expo Configuration
```
EXPO_TOKEN=your_expo_access_token
```

## Setting Up Secrets

### 1. Firebase Token
```bash
firebase login:ci
# Copy the token and add as FIREBASE_TOKEN secret
```

### 2. Expo Token
```bash
# Go to https://expo.dev/accounts/settings/access-tokens
# Create a new token and add as EXPO_TOKEN secret
```

### 3. Environment Variables
Copy the values from your `.env` file and add them as individual secrets.

## Workflow Triggers

- **Push to main**: Full pipeline including deployment and builds
- **Push to develop**: Testing and validation only
- **Pull Request to main**: Testing and validation only

## Build Profiles

The pipeline uses these EAS build profiles:

- **Preview**: For internal testing and development
- **Production**: For app store releases (manual trigger)

## Manual Triggers

For production releases:
```bash
eas build --platform all --profile production
eas submit --platform all
```

## Monitoring

- Check GitHub Actions tab for pipeline status
- Firebase Console for deployment status
- Expo Dashboard for build status
- Sentry for error monitoring

## Troubleshooting

### Common Issues

1. **Environment Check Fails**
   - Verify all secrets are configured
   - Check secret names match exactly

2. **Build Fails**
   - Check TypeScript compilation
   - Verify all dependencies are installed

3. **Deployment Fails**
   - Check Firebase token is valid
   - Verify project permissions

4. **EAS Build Fails**
   - Check Expo token is valid
   - Verify EAS configuration in `eas.json`

### Debug Steps

1. Check GitHub Actions logs
2. Run scripts locally: `node scripts/checkEnv.js`
3. Test builds locally: `eas build --local`
4. Validate Firebase: `firebase deploy --dry-run`

## Security Best Practices

- All sensitive data stored as GitHub secrets
- Production secrets separate from development
- Regular dependency updates via `npm audit`
- Code quality enforced via linting and TypeScript
- Automated security scanning on every commit

## Performance Monitoring

The pipeline includes:
- Build time optimization via npm cache
- Parallel job execution where possible
- Efficient Docker layer caching
- Resource optimization for EAS builds

## Next Steps

1. Configure all required secrets in GitHub
2. Test the pipeline with a pull request
3. Monitor first deployment to main branch
4. Set up app store deployment automation
5. Configure notification channels for failures