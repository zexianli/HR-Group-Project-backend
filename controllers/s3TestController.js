import { uploadToS3 } from "../config/aws.js";

export async function testUploadToS3(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        const key = `${Date.now()}-${req.file.originalname}`;

        const result = await uploadToS3({
            body: req.file.buffer,
            key: key,
            contentType: req.file.mimetype,
        });
        return res.status(200).json(result);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || "Upload failed" });
    }
}

/**
 * Sample test:
 * method: POST
 * 
 */