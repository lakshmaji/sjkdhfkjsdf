# Contributing to Timer App

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the Timer App project.

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/sjkdhfkjsdf.git
   cd sjkdhfkjsdf
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

## Project Structure

```
timer-app-monorepo/
├── apps/
│   ├── server/          # Golang WebSocket server
│   │   ├── main.go      # Main server code
│   │   ├── go.mod       # Go dependencies
│   │   └── README.md    # Server documentation
│   └── mobile/          # React Native mobile app
│       ├── components/  # Reusable UI components
│       ├── contexts/    # React contexts
│       ├── screens/     # Screen components
│       ├── services/    # API and WebSocket services
│       └── App.tsx      # Main app component
├── packages/            # Shared packages (future)
└── turbo.json           # Turborepo configuration
```

## Making Changes

### Backend (Go)

1. Navigate to the server directory:
   ```bash
   cd apps/server
   ```

2. Make your changes to `main.go` or related files

3. Test your changes:
   ```bash
   go run main.go
   ```

4. Build to ensure no compilation errors:
   ```bash
   go build -o bin/server main.go
   ```

### Frontend (React Native)

1. Navigate to the mobile directory:
   ```bash
   cd apps/mobile
   ```

2. Make your changes

3. Run TypeScript type checking:
   ```bash
   npm run lint
   ```

4. Test on a simulator/emulator:
   ```bash
   npm start
   ```

## Code Style

### Go
- Follow [Effective Go](https://golang.org/doc/effective_go.html) guidelines
- Use `gofmt` for formatting
- Keep functions focused and concise
- Add comments for exported functions and types

### TypeScript/React Native
- Use TypeScript for all new files
- Follow React hooks best practices
- Use functional components
- Keep components small and focused
- Add proper TypeScript types

## Changelog Management with Changesets

This project uses [Changesets](https://github.com/changesets/changesets) to manage changelogs and versioning.

### Creating a Changeset

When you make changes that should be included in the changelog (features, fixes, breaking changes), create a changeset:

```bash
npm run changeset
```

This will prompt you to:
1. Select which packages have changed (server, mobile, or both)
2. Choose the type of change (major, minor, or patch)
3. Write a summary of the changes

The changeset will be saved as a markdown file in `.changeset/` directory and should be committed with your changes.

### Changeset Types

- **Major**: Breaking changes that require users to update their code
- **Minor**: New features that are backward compatible
- **Patch**: Bug fixes and small improvements

### Example Workflow

```bash
# Make your code changes
git checkout -b feature/new-timer-feature

# Create a changeset
npm run changeset
# Follow the prompts to describe your changes

# Commit both your code changes and the changeset
git add .
git commit -m "feat: add new timer feature"
git push origin feature/new-timer-feature
```

### Versioning and Publishing

Maintainers will use these commands to version and publish:

```bash
# Bump versions and update CHANGELOGs based on changesets
npm run changeset:version

# Publish packages (if applicable)
npm run changeset:publish
```

## Testing

Currently, the project doesn't have automated tests. If you'd like to add testing:

### Backend
- Use Go's built-in testing package
- Place tests in `*_test.go` files
- Run with `go test ./...`

### Frontend
- Use Jest and React Native Testing Library
- Place tests next to components: `ComponentName.test.tsx`

## Adding Features

When adding new features:

1. **Create an Issue**: Describe the feature and discuss the approach
2. **Branch**: Create a feature branch (`git checkout -b feature/amazing-feature`)
3. **Implement**: Write clean, documented code
4. **Test**: Manually test thoroughly
5. **Commit**: Write clear commit messages
6. **Pull Request**: Open a PR with a description of changes

## WebSocket Protocol

When adding new WebSocket message types:

1. **Define the message structure** in both Go and TypeScript
2. **Update server handler** in `apps/server/main.go`
3. **Update client service** in `apps/mobile/services/WebSocketService.ts`
4. **Document** the new message type in both READMEs

Example message structure:
```json
{
  "type": "new_action",
  "room_id": "room123",
  "timer_id": "timer456",
  "payload": {
    // Action-specific data
  }
}
```

## Commit Message Format

Use clear, descriptive commit messages:

```
type: short description

Longer description if needed

- Bullet points for multiple changes
- Keep it clear and concise
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Pull Request Process

1. **Update Documentation**: If you change APIs or add features, update READMEs
2. **Test Thoroughly**: Ensure your changes work on different devices/platforms
3. **Describe Changes**: Write a clear PR description explaining what and why
4. **Link Issues**: Reference any related issues
5. **Be Responsive**: Address review comments promptly

## Questions?

Feel free to open an issue for:
- Bug reports
- Feature requests
- Questions about the codebase
- Suggestions for improvement

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).
