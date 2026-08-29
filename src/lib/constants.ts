export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "ShipKit";

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const PAGINATION_DEFAULT_TAKE = 20;

export const PASSWORD_RESET_TOKEN_EXPIRY_HOURS = 1;

export const EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS = 24;

export const INVITATION_EXPIRY_DAYS = 7;

export const AVATAR_MAX_SIZE_MB = 2;
export const ORG_LOGO_MAX_SIZE_MB = 2;
export const ORG_FILE_MAX_SIZE_MB = 8;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
] as const;
