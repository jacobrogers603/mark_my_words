// We shall encrypt the note content non-deterministically, but the titles are to be deterministic to allow for lookup.
import crypto from 'crypto';

// The encryption key from the environment variable or a default one
const rawEncryptionKey = process.env.ENCRYPTION_KEY || "noKey".padEnd(32, 'a');

// Convert the hexadecimal string to a Buffer of 32 bytes (256 bits)
const ENCRYPTION_KEY = Buffer.from(rawEncryptionKey, 'hex');
if (ENCRYPTION_KEY.length !== 32) {
  throw new Error("Encryption key must be exactly 32 bytes long.");
}

// Algorithm configurations
const ALGO_DETERMINISTIC = 'aes-256-ecb';
const ALGO_NON_DETERMINISTIC = 'aes-256-cbc';
const IV_LENGTH = 16;

export function encrypt(text: string, deterministic: boolean = false): string {
  if (deterministic) {
    const cipher = crypto.createCipheriv(ALGO_DETERMINISTIC, ENCRYPTION_KEY, null);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  } else {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGO_NON_DETERMINISTIC, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }
}

export function decrypt(encryptedText: string, deterministic: boolean = false): string {
  if (deterministic) {
    const decipher = crypto.createDecipheriv(ALGO_DETERMINISTIC, ENCRYPTION_KEY, null);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } else {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift() || "", 'hex');
    const encryptedData = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGO_NON_DETERMINISTIC, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedData.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
