import crypto from "crypto";

// The encryption key from the environment variable or a default one
const rawEncryptionKey =
  process.env.PHOTO_ENCRYPTION_KEY || "noKey".padEnd(32, "a");

// Convert the hexadecimal string to a Buffer of 32 bytes (256 bits)
const PHOTO_ENCRYPTION_KEY = Buffer.from(rawEncryptionKey, "hex");
if (PHOTO_ENCRYPTION_KEY.length !== 32) {
  throw new Error("Encryption key must be exactly 32 bytes long.");
}

// Algorithm configuration
const ALGO_NON_DETERMINISTIC = "aes-256-cbc";
const IV_LENGTH = 16;

export function encryptPhoto(buffer: Buffer): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGO_NON_DETERMINISTIC,
    PHOTO_ENCRYPTION_KEY,
    iv
  );
  let encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const result = iv.toString("hex") + ":" + encrypted.toString("hex");
  return result;
}

export function decryptPhoto(encryptedData: string): Buffer {
  const textParts = encryptedData.split(":");
  if (textParts.length !== 2) {
    throw new Error("Invalid encrypted data format");
  }

  const iv = Buffer.from(textParts[0], "hex");
  if (iv.length !== IV_LENGTH) {
    throw new Error("Invalid IV length");
  }

  const encrypted = Buffer.from(textParts[1], "hex");
  const decipher = crypto.createDecipheriv(
    ALGO_NON_DETERMINISTIC,
    PHOTO_ENCRYPTION_KEY,
    iv
  );
  let decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted;
}
