# GitHub Actions Workflows

This directory contains all the CI/CD workflows for `@syntrojs/singleton`.

## Workflows

### 🔄 CI (Continuous Integration)
**File:** `workflows/ci.yml`

Runs on every push and pull request to `main` and `develop` branches.

**Jobs:**
- **Test on Node.js** (18.x, 20.x, 22.x)
  - Checkout code
  - Install dependencies with npm
  - Lint code with Biome
  - Type check with TypeScript
  - Build the project
  - Run tests with Vitest
  - Generate and upload coverage reports
  
- **Test on Bun**
  - Checkout code
  - Install dependencies with Bun
  - Run tests with Bun

**Badges:** CI status, coverage

---

### 🔒 CodeQL (Security Analysis)
**File:** `workflows/codeql.yml`

Runs on every push, pull request, and weekly on Mondays.

**Jobs:**
- Initialize CodeQL for JavaScript/TypeScript
- Autobuild the project
- Perform security and quality analysis

**Badges:** CodeQL status

---

### 🧬 Mutation Testing
**File:** `workflows/mutation-testing.yml`

Runs on every push to `main`, pull requests, or manually.

**Jobs:**
- Install dependencies
- Run Stryker mutation testing
- Upload mutation report as artifact
- Comment on PR with mutation score (if PR)

**Badges:** Mutation Testing status, Mutation Score

---

### 📦 Publish to npm
**File:** `workflows/publish.yml`

Runs on release creation or manually via workflow dispatch.

**Jobs:**
- Install dependencies
- Run linting
- Run tests with coverage
- Build the project
- Publish to npm with provenance
- Upload dist artifacts

**Requirements:**
- `NPM_TOKEN` secret must be set in repository settings

---

### 🤖 Dependabot
**File:** `dependabot.yml`

Automated dependency updates.

**Configuration:**
- **npm dependencies:** Weekly updates on Mondays at 09:00
  - Groups development and production dependencies
  - Ignores major version updates
  - Auto-merge patch updates
  
- **GitHub Actions:** Weekly updates on Mondays at 09:00
  - Keeps workflow actions up to date

**Pull Request Settings:**
- Maximum 10 PRs for npm dependencies
- Maximum 5 PRs for GitHub Actions
- Auto-labeled with `dependencies`, `automated`, or `github-actions`
- Conventional commit messages with `chore:` or `ci:` prefix

---

## Setup Requirements

### Secrets
Add these secrets in your GitHub repository settings:

1. **NPM_TOKEN** - npm authentication token for publishing
   - Go to Settings → Secrets and variables → Actions
   - Add `NPM_TOKEN` with your npm token

### Permissions
The workflows require these permissions:
- `contents: read` - Read repository contents
- `security-events: write` - Write security events (CodeQL)
- `id-token: write` - Generate provenance (npm publish)

### Branch Protection
Recommended branch protection rules for `main`:
- Require status checks to pass (CI workflow)
- Require branches to be up to date before merging
- Require CodeQL analysis to pass

---

## Manual Triggers

Some workflows can be triggered manually:

### Mutation Testing
```bash
# Via GitHub UI: Actions → Mutation Testing → Run workflow
```

### Publish to npm
```bash
# Via GitHub UI: Actions → Publish to npm → Run workflow
# Optional: specify version number
```

---

## Monitoring

All workflows can be monitored at:
`https://github.com/Syntropysoft/syntrojs-singleton/actions`

---

## Troubleshooting

### CI fails on Node.js version X
- Check if the code is compatible with that Node.js version
- Update `engines` field in `package.json` if needed

### CodeQL analysis fails
- Review the security alerts in the Security tab
- Update dependencies with known vulnerabilities

### Mutation testing timeout
- Increase timeout in `stryker.config.mjs`
- Optimize test execution time

### Publish fails
- Verify `NPM_TOKEN` is valid
- Check if version already exists on npm
- Ensure all tests pass before publishing

---

## Best Practices

1. **Always run CI locally before pushing:**
   ```bash
   npm run lint
   npm run test:coverage
   npm run build
   ```

2. **Keep dependencies updated:**
   - Review and merge Dependabot PRs regularly
   - Test after dependency updates

3. **Monitor mutation score:**
   - Aim for >90% mutation score
   - Review survived mutants and improve tests

4. **Security first:**
   - Review CodeQL alerts promptly
   - Never commit secrets to the repository

---

## Contributing

When adding new workflows:
1. Follow the existing naming conventions
2. Add documentation in this README
3. Test the workflow in a fork first
4. Use the latest versions of actions

