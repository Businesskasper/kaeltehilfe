# kaeltehilfe-keycloak-theme

Custom Keycloak login theme built with [Keycloakify](https://www.keycloakify.dev/), based on the [keycloak-frontify-starter](https://github.com/keycloakify/keycloakify-starter) template. It replaces the default Keycloak login UI with a React + Mantine-based design.

## Requirements

- **Node.js** ^18.0.0 or >=20.0.0
- **Java 17** (OpenJDK)
- **Maven** (used internally by Keycloakify to package the theme as a `.jar`)

> When building via Docker, Java and Maven are installed automatically in the build stage — you only need Docker.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server for local development |
| `npm run build` | TypeScript check + Vite production build |
| `npm run build-keycloak-theme` | Build and package the theme as a Keycloak-compatible `.jar` |
| `npm run storybook` | Start Storybook on port 6006 for component preview |
| `npm run format` | Format code with Prettier |

## Building with Docker

The `dockerfile.build` produces a minimal image containing only the compiled theme JAR:

```bash
docker build -f dockerfile.build -t kaeltehilfe-theme .
```

The multi-stage build works as follows:

1. **Build stage** (`node:lts-alpine`) — installs OpenJDK 17 + Maven, runs `npm ci`, then `npm run build-keycloak-theme`.
2. **Output stage** (`busybox`) — copies the resulting `keycloak-theme-for-kc-22-to-25.jar` to `/keycloak-theme.jar`.

To extract the JAR from the image:

```bash
docker create --name theme-extract kaeltehilfe-theme
docker cp theme-extract:/keycloak-theme.jar ./keycloak-theme.jar
docker rm theme-extract
```

The JAR is compatible with **Keycloak 22–25** and can be deployed by placing it in Keycloak's `providers/` directory.

## Debugging with Storybook

Storybook allows you to develop and test login pages without running a Keycloak instance:

```bash
npm run storybook
```

Story variants are defined in `src/login/pages/Login.stories.tsx` and cover scenarios like invalid credentials, social providers, email-as-username, and error states. The `KcPageStory.tsx` helper mocks the Keycloak context so pages render with realistic data.

For the Vite dev server (`npm run dev`), Keycloakify provides mock context via auto-generated resources in `public/keycloakify-dev-resources/`.

## Integration with kaeltehilfe

The theme is not baked into the Keycloak Docker image — it is injected at runtime via a volume mount. The build script `build/build-keycloak-theme.ps1` runs the Docker build and copies the resulting JAR to the appropriate `keycloak/themes/` directory.

**Development:** `dev/docker-compose.yml` mounts `./keycloak/themes` → `/opt/keycloak/providers`
**Production:** `build/result/docker/docker-compose.yml` mounts `../keycloak/themes` → `/opt/keycloak/providers`

On startup, the `keycloak-init` container automatically discovers the theme by searching for a login theme matching `*kaelte*` in the Keycloak server info and applies it to the realm. No manual theme selection in the Keycloak admin console is required.

### Color Scheme Sync

The main frontend and the Keycloak theme share the same light/dark mode preference. When the frontend redirects to Keycloak for login, it reads the current color scheme from Mantine's localStorage (`mantine-color-scheme-value`) and passes it as a `theme` query parameter via OIDC `extraQueryParams`. On the Keycloak side, `Template.tsx` picks up this parameter and applies it to its own `MantineProvider` via `setColorScheme`, so the login page matches the appearance the user chose in the app.

## Implementation Details

**Only the login theme is customized** — `accountThemeImplementation` is set to `"none"` in `vite.config.ts`.

### Custom Pages

| Page | File | Purpose |
| --- | --- | --- |
| Login | `src/login/pages/Login.tsx` | Username/password login with social provider buttons |
| Update Password | `src/login/pages/LoginUpdatePassword.tsx` | Password reset/update form |
| X.509 Login | `src/login/pages/LoginX509Info.tsx` | Client certificate authentication |

All other login pages fall through to the default Keycloakify implementation.

### Shared Template

`src/login/Template.tsx` provides the layout wrapper for all custom pages — a centered Mantine `Card` with responsive sizing (fixed 400px on desktop, full-width on mobile), notification handling, and light/dark color scheme support via URL parameter.

### UI Stack

- **Mantine 7** for components and theming (custom color palette with branded reds, blues, and grays)
- **Tabler Icons** for iconography
- **PostCSS** with Mantine presets for breakpoint variables
- **DatesProvider** configured with `de` locale
