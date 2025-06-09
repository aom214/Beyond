import crypto from "crypto";
import fs from "fs";
import { scryptSync, createCipheriv } from "crypto";

const encrypt = async (filePath, output) => {
    return new Promise((resolve, reject) => {
        const password = "0000";
        const algorithm = "aes-192-cbc";
        const key = scryptSync(password, "salt", 24);
        const iv = Buffer.alloc(16, 0);

        const fileStream = fs.createReadStream(filePath);
        const outputFileStream = fs.createWriteStream(output);
        const cipher = createCipheriv(algorithm, key, iv);

        fileStream.on("error", (err) => {
            console.error("File Read Error:", err);
            reject(err);
        });
        outputFileStream.on("error", (err) => {
            console.error("File Write Error:", err);
            reject(err);
        });

        fileStream.on("data", (data) => {
            let encrypted = cipher.update(data);
            outputFileStream.write(encrypted);
        });

        fileStream.on("end", async () => {
            outputFileStream.write(cipher.final()); // Ensures final block is written
            outputFileStream.end();
            console.log(`Encryption completed: ${output}`);

            try {
                await fs.promises.unlink(filePath); // Delete original file after encryption
                console.log(`Original file deleted: ${filePath}`);
                resolve();
            } catch (unlinkErr) {
                console.error("Error deleting file:", unlinkErr);
                reject(unlinkErr);
            }
        });
    });
};

export default encrypt;
