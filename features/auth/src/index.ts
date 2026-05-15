// Task 1: Auth Feature — Magic Link + WebAuthn (Passkeys)
// Public API surface. Only export what other packages can use.

export { AuthService } from "./auth.service";
export { MagicLinkController } from "./magic-link.controller";
export { WebAuthnController } from "./webauthn.controller";
export { JwtAuthGuard, WebAuthnGuard } from "./guards";
export { JwtStrategy } from "./strategies/jwt.strategy";
export type { AuthModuleConfig } from "./auth.types";
