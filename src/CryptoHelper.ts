const crypto = require("node:crypto");

class CryptoHelper {
  private readonly _algorithm: string = "aes-256-gcm";

  encrypt(key: string, text: string): { content: string; tag: string } {
    const transformedKey = this._transform(key);
    const { secretKey, iv } = this._keys(transformedKey);
    const cipher = crypto.createCipheriv(this._algorithm, secretKey, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag().toString("hex");

    return {
      content: encrypted,
      tag: authTag,
    };
  }

  decrypt(key: string, hash: string, tag: string): string {
    const transformedKey = this._transform(key);
    const { secretKey, iv } = this._keys(transformedKey);
    const decipher = crypto.createDecipheriv(
      this._algorithm,
      secretKey,
      Buffer.from((iv as any).toString("hex"), "hex"),
    );

    decipher.setAuthTag(Buffer.from(tag, "hex"));

    let decrypted = decipher.update(hash, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  _transform(text: string): number[] {
    return text.split("").map((char) => (char.charCodeAt(0) * 2) % 256);
  }

  _keys(transformedKey: number[]): { secretKey: number[]; iv: number[] } {
    const rawBuffer = Buffer.from(transformedKey);
    const secretKey = crypto
      .createHash("sha256")
      .update(rawBuffer)
      .digest()
      .subarray(0, 32);
    const iv = crypto
      .createHash("sha256")
      .update(rawBuffer)
      .digest()
      .subarray(0, 12);

    return { secretKey, iv };
  }
}

module.exports = CryptoHelper;
