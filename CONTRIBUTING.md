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
