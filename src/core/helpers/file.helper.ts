// src/modules/admin/category/file.service.ts

import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { debug, debugError } from "./debug";

interface SaveFileOptions {
    destination: string;
    name?: string;
    unique?: boolean;
}

// Sanitize filenames
function sanitize(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

export async function saveFile(file: Express.Multer.File, options: SaveFileOptions): Promise<string> {
    debug("----- saveFile START -----");
    debug("Original file path:", file.path);
    debug("Original file name:", file.originalname);
    debug("Options received:", options);

    try {
        // Resolve absolute destination path
        const destination = path.resolve(options.destination);
        debug("Resolved destination path:", destination);

        // Always check/create folder before saving
        try {
            await fs.promises.access(destination, fs.constants.F_OK);
            debug("Directory exists.");
        } catch {
            debug("Directory does not exist. Creating...");
            await fs.promises.mkdir(destination, { recursive: true });
            debug("Directory created.");
        }

        // Extract file extension
        const ext = path.extname(file.originalname);
        debug("File extension:", ext);

        // Build filename
        const parts: string[] = [];
        if (options.name) {
            const sanitized = sanitize(options.name);
            debug("Sanitized name:", sanitized);
            parts.push(sanitized);
        }
        if (options.unique) {
            const id = uuidv4();
            debug("Generated UUID:", id);
            parts.push(id);
        }

        const filename = `${parts.join("-")}${ext}`;
        debug("Final filename:", filename);

        // Full save path
        const savePath = path.join(destination, filename);
        debug("Full save path:", savePath);

        // Move file from temp location
        debug("Moving file...");
        await fs.promises.rename(file.path, savePath);
        debug("File saved successfully!");

        debug("----- saveFile END -----");
        return savePath;

    } catch (error) {
        debugError("File Save Error:", error);
        throw new Error("Failed to save file");
    }
}