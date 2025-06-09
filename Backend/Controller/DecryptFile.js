import fs from "node:fs";
import path from "node:path";
import upload_on_cloudinary from "../utils/cloudinary.js";

const publicDir = path.join(process.cwd(), "public");

// Ensure public directory exists
console.log("Public directory:", publicDir);
try {
  if (!fs.existsSync(publicDir)) {
    console.log("Creating public directory...");
    fs.mkdirSync(publicDir, { recursive: true });
    console.log("Public directory created.");
  } else {
    console.log("Public directory already exists.");
  }
} catch (mkdirError) {
  console.error("Failed to create public directory:", mkdirError.message);
}

const DecryptFile = async (req, res) => {
    try {
      // Check authentication
      if (!req.user) {
        console.log("No user authenticated.");
        return res.status(401).json({ error: "Login first to decrypt file" });
      }
  
      const { algo, pass } = req.body;
      const key=pass

      const decryptionAlgo = algo?.toLowerCase() || "caesar"; // Default to caesar
      const shift = parseInt(key);
      console.log(`Decryption algo: ${decryptionAlgo}, key: ${key}, shift: ${shift}`);
  
      // Validate inputs
      if (decryptionAlgo !== "caesar") {
        console.log("Unsupported algorithm:", decryptionAlgo);
        return res.status(400).json({ error: "Only 'caesar' algorithm is supported" });
      }
      if (isNaN(shift)) {
        console.log("Invalid key provided.");
        return res.status(400).json({ error: "Key must be a number" });
      }
  
      // Check uploaded file
      if (!req.file) {
        console.log("No file uploaded for decryption.");
        return res.status(400).json({ error: "No file uploaded" });
      }
      const encryptedPath = req.file.path; // Multer saves to public/
      const fileName = req.file.originalname;
      console.log(`Encrypted file: ${fileName} at ${encryptedPath}`);
  
      // Verify encrypted file
      if (!fs.existsSync(encryptedPath)) {
        console.error(`Encrypted file missing at: ${encryptedPath}`);
        return res.status(500).json({ error: "Encrypted file not found" });
      }
  
      // Read encrypted file
      console.log("Reading encrypted file...");
      let encryptedBuffer;
      try {
        encryptedBuffer = fs.readFileSync(encryptedPath);
        console.log(`Encrypted file size: ${encryptedBuffer.length} bytes`);
      } catch (readError) {
        console.error(`Failed to read encrypted file: ${readError.message}`);
        return res.status(500).json({ error: "Failed to read encrypted file", details: readError.message });
      }
  
      // Decrypt with Caesar cipher
      console.log("Decrypting file...");
      const decryptedBuffer = Buffer.alloc(encryptedBuffer.length);
      for (let i = 0; i < encryptedBuffer.length; i++) {
        decryptedBuffer[i] = (encryptedBuffer[i] - shift + 256) % 256;
      }
  
      // Save decrypted file to public/
      const decryptedFileName = `decrypted_${fileName}`;
      const decryptedPath = path.join(publicDir, decryptedFileName);
      console.log(`Saving decrypted file to: ${decryptedPath}`);
      try {
        fs.writeFileSync(decryptedPath, decryptedBuffer);
        console.log("Decrypted file saved.");
        if (!fs.existsSync(decryptedPath)) {
          console.error("Verification failed: Decrypted file not found at:", decryptedPath);
          return res.status(500).json({ error: "Failed to verify decrypted file" });
        }
        console.log(`Public directory contents: ${fs.readdirSync(publicDir)}`);
      } catch (writeError) {
        console.error(`Failed to save decrypted file: ${writeError.message}`);
        return res.status(500).json({ error: "Failed to save decrypted file", details: writeError.message });
      }
  
      return res.json({
        message: "File decrypted successfully",
        originalEncryptedName: fileName,
        decryptedName: decryptedFileName,
        localPath: decryptedPath,
        note: "Decrypted file should now be accessible as the original file type (e.g., PDF).",
      });
    } catch (error) {
      console.error(`Decryption error: ${error.message}`);
      return res.status(500).json({ error: "Internal server error", details: error.message });
    }
  };
  
  export { DecryptFile };