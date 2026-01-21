const CryptoHelper = require("./CryptoHelper");

const instance = new CryptoHelper();

function encrypt(key: string, text: string): { content: string; tag: string } {
  return instance.encrypt(key, text);
}

function decrypt(key: string, hash: string, tag: string): string {
  return instance.decrypt(key, hash, tag);
}

module.exports = { encrypt, decrypt };
