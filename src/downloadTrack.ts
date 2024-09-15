import { getLucida } from "./lucida.js";
import { cleanseTitle } from "./utils/cleanseTitle.js";
import { AlbumGetByUrlResponse, TrackGetByUrlResponse } from 'lucida/types';
import { writeFileMetadata } from "./utils/writeFileMetadata.js";
import { fileTypeFromStream } from 'file-type';
import * as fs from "fs";

const lucida = getLucida();

export async function downloadTrack(album, track, index, failedDownloads, completedDownloads, albumPath, retries = 3) {
    function fail() {
        failedDownloads.push(track);
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const url = track.url;

            if (!url) return;

            const path = `${albumPath}/${cleanseTitle(track.title)}`;
            const tempPath = `${path}temp`;

            const trackData = await lucida.getByUrl(url, 5) as TrackGetByUrlResponse;

            const trackStream = await trackData.getStream();

            await fs.promises.writeFile(tempPath, trackStream.stream);

            const fileType = await fileTypeFromStream(fs.createReadStream(tempPath));

            if (!fileType?.ext) {
                console.log(`Filetype is ${fileType.ext}`);
                fail();
            }

            const pathWithType = `${path}.${fileType.ext}`;
            await fs.promises.rename(tempPath, pathWithType);

            await writeFileMetadata(album, trackData, pathWithType, albumPath, index);

            completedDownloads.push(track);
            break;

        } catch (error) {
            console.log(`Attempt ${attempt} failed to download "${track.title}": ${error.message}`);

            if (attempt === retries) {
                console.log(`Failed to download "${track.title}" after ${retries} attempts.`);
                fail();
            } else {
                console.log(`Retrying in 5 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
}
