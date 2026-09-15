const crypto = require("crypto");

// AES-256-CBC Encryption configuration
const ALGORITHM = "aes-256-cbc";
const getEncryptionSeed = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "test") return "test_jwt_secret_key_for_unit_testing_12345";
  throw new Error("FATAL: JWT_SECRET environment variable is required for PHI encryption key derivation.");
};
const ENCRYPTION_KEY = crypto
  .createHash("sha256")
  .update(getEncryptionSeed())
  .digest(); // 32 bytes key

/**
 * Encrypt sensitive Personal Health Information (PHI) at rest
 * @param {string} text - Raw plain text
 * @returns {string} - Encrypted string formatted as "iv:hexCipher"
 */
function encryptPHI(text) {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
  } catch (error) {
    console.error("PHI Encryption error:", error.message);
    return text;
  }
}

/**
 * Decrypt sensitive Personal Health Information (PHI)
 * @param {string} cipherText - Encrypted string formatted as "iv:hexCipher"
 * @returns {string} - Decrypted plain text
 */
function decryptPHI(cipherText) {
  if (!cipherText || typeof cipherText !== "string" || !cipherText.includes(":")) {
    return cipherText;
  }
  try {
    const [ivHex, encryptedHex] = cipherText.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("PHI Decryption error:", error.message);
    return cipherText;
  }
}

module.exports = {
  encryptPHI,
  decryptPHI,
};
