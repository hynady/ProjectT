# Script Organization Update

## Changes Made

The deployment and utility scripts have been moved to a dedicated `bin` directory for better organization:

### Scripts Moved
- `deploy.sh` and `deploy.cmd` → `bin/deploy.sh` and `bin/deploy.cmd`
- `create-env.sh` and `create-env.cmd` → `bin/create-env.sh` and `bin/create-env.cmd`
- `rebuild-backend.cmd` → `bin/rebuild-backend.cmd`
- `rebuild-frontend.cmd` → `bin/rebuild-frontend.cmd`
- `build-backend-docker.cmd` → `bin/build-backend-docker.cmd`

### New Scripts Added
- `bin/help.sh` and `bin/help.cmd` - Display available commands
- `bin/README.md` - Documentation for the bin directory

### Documentation Updated
- `README.md` - Added deployment section
- `PRODUCTION-DEPLOYMENT.md` - Updated script paths
- `ENV-GUIDE.md` - Updated script paths

## Usage

All scripts are now called from the project root with the `bin/` prefix:

```bash
# Linux/macOS
bin/deploy.sh

# Windows
bin\deploy.cmd
```

## Benefits

1. **Better Organization**: Scripts are now in a dedicated directory
2. **Clear Separation**: Distinguishes utility scripts from project files
3. **Improved Documentation**: Help scripts make it easier for new team members
4. **Consistent Path Handling**: All scripts use relative paths from project root

## Next Steps

1. Remove the old script files from the project root
2. Update any CI/CD configurations to use the new script paths
3. Make sure all team members are aware of the changes
