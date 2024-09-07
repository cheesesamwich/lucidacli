import path from "path";
import os from "os";

export function getDownloadDir() {
    return process.env.DOWNLOAD_PATH ?? path.join(os.homedir(), "Downloads");
}