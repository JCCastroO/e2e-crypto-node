import type { CipherCCMTypes, CipherKey, BinaryLike } from "node:crypto";
import { createCipheriv, createDecipheriv, createHash } from "node:crypto";

export default class CryptoHelper {
  private readonly _algorithm: CipherCCMTypes = "aes-256-gcm" as CipherCCMTypes;

  public encrypt(key: string, text: string): string {
    const transformedKey = this._transform(key);
    const { secretKey, iv } = this._keys(transformedKey);
    const cipher = createCipheriv(this._algorithm, secretKey, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    return encrypted;
  }

  public decrypt(key: string, hash: string): string {
    const transformedKey = this._transform(key);
    const { secretKey, iv } = this._keys(transformedKey);

    const cipher = createCipheriv(this._algorithm, secretKey, iv);
    const authTag = (cipher as any).getAuthTag().toString("hex");

    const decipher = createDecipheriv(
      this._algorithm,
      secretKey,
      Buffer.from((iv as any).toString("hex"), "hex") as BinaryLike,
    );

    (decipher as any).setAuthTag(Buffer.from(authTag, "hex"));

    let decrypted = decipher.update(hash, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  private _transform(text: string): number[] {
    return text.split("").map((char) => (char.charCodeAt(0) * 2) % 256);
  }

  private _keys(transformedKey: number[]): {
    secretKey: CipherKey;
    iv: BinaryLike;
  } {
    const rawBuffer = Buffer.from(transformedKey);
    const secretKey = createHash("sha256")
      .update(rawBuffer)
      .digest()
      .subarray(0, 32);
    const iv = createHash("sha256").update(rawBuffer).digest().subarray(0, 12);

    return { secretKey, iv };
  }
}
