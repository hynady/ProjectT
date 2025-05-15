# Project Utilities

This directory contains utility scripts for managing the TackTicket application.

## Available Scripts

### For Windows Users:

- `help.cmd` - Display available commands
- `create-env.cmd` - Create .env file from template
- `deploy.cmd` - Build and deploy all services
- `build-backend-docker.cmd` - Build backend Docker image with improved settings
- `rebuild-backend.cmd` - Rebuild and restart backend service
- `rebuild-frontend.cmd` - Rebuild and restart frontend service

### For Linux/macOS Users:

- `help.sh` - Display available commands
- `create-env.sh` - Create .env file from template
- `deploy.sh` - Build and deploy all services

## Usage

All scripts are designed to be run from any directory and will automatically navigate to the project root.

### Example:

```
cd /path/to/project
bin/deploy.sh     # On Linux/macOS
bin\deploy.cmd    # On Windows
```

## Notes

- These scripts rely on the relative path structure of the project.
- All scripts should be executed from the project root directory.
- Make sure execution permissions are set correctly on Linux/macOS:
  ```
  chmod +x bin/*.sh
  ```
