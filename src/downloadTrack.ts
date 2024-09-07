import { getLucida } from "./lucida.js";
import { cleanseTitle } from "./utils/cleanseTitle.js";
import { AlbumGetByUrlResponse, TrackGetByUrlResponse } from 'lucida/types';
import { optionPrompt } from "./utils/optionPrompt.js";
import { writeFileMetadata } from "./utils/writeFileMetadata.js";
import { downloadURLToFilePath } from "./utils/downloadURLToFilePath.js";
import { fileTypeFromStream } from 'file-type';
import * as fs from "fs";

const lucida = getLucida();

export async function downloadTrack(album, track, index, failedDownloads, completedDownloads, albumPath) {
    //this isn't used for anything yet
    function fail() {
        failedDownloads.push(track);
        console.log("failed");
        return;
    }

    try {
        const url = track.url;

        if (!url) return;

        const path = `${albumPath}/${cleanseTitle(track.title)}`;
        const tempPath = `${path}temp`;

        const trackData = await lucida.getByUrl(url) as TrackGetByUrlResponse;
        const trackStream = await trackData.getStream();

        //need to make some kind of error/retry handler
        await fs.promises.writeFile(tempPath, trackStream.stream);

        const fileType = await fileTypeFromStream(fs.createReadStream(tempPath));

        if (!fileType?.ext) {
            console.log(`Filetype is ${fileType.ext}`);
            fail();
        }

        const pathWithType = `${path}.${fileType.ext}`;
        await fs.promises.rename(tempPath, pathWithType);

        await writeFileMetadata(album, trackData, pathWithType, albumPath, index);


    } catch (error) {
        console.log(`Failed to download "${track.title}": ${error.message}`);
        fail();
    }
}