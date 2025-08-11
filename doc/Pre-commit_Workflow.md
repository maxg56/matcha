# Pre-commit GitHub Actions Workflow

This document describes the pre-commit GitHub Actions workflow created for the Matcha project.

## Workflow Overview

**File**: `.github/workflows/pre-commit.yml`

This workflow automatically runs all pre-commit hooks on every push and pull request to the `main` and `develop` branches.

## What it does

1. **Triggers on**:
   - Push to `main` or `develop` branches
   - Pull requests targeting `main` or `develop`
   - Manual trigger via GitHub Actions UI (`workflow_dispatch`)

2. **Environment Setup**:
   - Python 3.11 (for Python tools: black, isort, flake8)
   - Go 1.22 (for Go tools: go fmt, go vet)
   - Node.js 20 + pnpm (for TypeScript/React linting)

3. **Dependencies**:
   - Installs frontend dependencies with pnpm
   - Installs Python service dependencies (needed for import analysis)
   - Caches pre-commit environments for faster execution

4. **Execution**:
   - Runs `pre-commit run --all-files`
   - This executes all hooks defined in `.pre-commit-config.yaml`

## Benefits

- **Consistency**: Same checks locally and in CI
- **Speed**: Pre-commit framework is optimized for performance
- **Caching**: Environments are cached between runs
- **Comprehensive**: Covers all languages and tools in one workflow

## Comparison with Legacy Workflow

| Aspect | Pre-commit Workflow | Legacy Lint Workflow |
|--------|-------------------|---------------------|
| **Speed** | ✅ Faster (parallel execution) | ❌ Slower (sequential jobs) |
| **Maintenance** | ✅ Single configuration | ❌ Multiple job definitions |
| **Consistency** | ✅ Identical to local setup | ❌ May drift from local |
| **Caching** | ✅ Pre-commit environment cache | ❌ Limited caching |
| **Flexibility** | ✅ Easy to add new tools | ❌ Requires workflow changes |

## Usage

The workflow runs automatically, but you can also:

1. **Trigger manually**: Go to Actions tab → Pre-commit Checks → Run workflow
2. **Debug locally**: Run `pre-commit run --all-files` to see the same results
3. **Add new checks**: Update `.pre-commit-config.yaml` and they'll be included automatically

## Configuration

The workflow behavior is controlled by:
- `.pre-commit-config.yaml` - Defines which hooks to run
- `.github/workflows/pre-commit.yml` - Defines the CI environment and steps

## Troubleshooting

If the workflow fails:
1. Run `pre-commit run --all-files` locally to reproduce the issue
2. Fix any formatting or linting issues
3. Commit the fixes and push again

The workflow will provide detailed output showing which hooks failed and why.
