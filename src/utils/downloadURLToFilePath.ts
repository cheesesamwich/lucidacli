import axios from "axios";
import * as fs from "fs";

export async function downloadURLToFilePath(url: string, path: string) {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
    });

    const writer = fs.createWriteStream(path);

    response.data.pipe(writer);

    return path;
}
