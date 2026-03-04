# Changesets

This folder is managed by `@changesets/cli`. It holds changeset files — markdown
files that describe package changes and their semver bump type.

## Workflow

1. **Add a changeset** when you make a user-facing change:

   ```bash
   pnpm changeset
   ```

   Select the affected packages, choose a bump type (patch / minor / major),
   and write a short summary of the change.

2. **Version packages** before a release:

   ```bash
   pnpm version-packages
   ```

   This consumes all pending changesets, bumps `package.json` versions, and
   updates `CHANGELOG.md` files.

3. **Publish to npm**:

   ```bash
   pnpm release
   ```

   This builds all packages and publishes them to the registry.
