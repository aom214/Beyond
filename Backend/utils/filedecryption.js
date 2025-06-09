import crypto from "crypto";
import fs from "fs";
import axios from "axios";
import { scryptSync, createDecipheriv } from "crypto";

const decrypt = async (cloudinaryFileUrl, outputFilePath) => {
  return new Promise(async (resolve, reject) => {
    try {
      const password = "0000";
      const algorithm = "aes-192-cbc";
      let key = scryptSync(password, "salt", 24);
      let iv = Buffer.alloc(16, 0);

      // Fetch file from Cloudinary (as binary)
      const response = await axios.get(cloudinaryFileUrl, { responseType: "arraybuffer" });
      const encryptedBuffer = Buffer.from(response.data);

      // Create decipher
      const decipher = createDecipheriv(algorithm, key, iv);

      // Decrypt data
      const decryptedBuffer = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);

      // Save decrypted file locally
      fs.writeFileSync(outputFilePath, decryptedBuffer);
      console.log(`Decryption complete: ${outputFilePath}`);

      resolve(outputFilePath);
    } catch (error) {
      console.error("Decryption failed:", error);
      reject(error);
    }
  });
};

export default decrypt;
