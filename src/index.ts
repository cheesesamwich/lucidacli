import * as cliProgress from "cli-progress";

import { fileTypeFromStream } from 'file-type';
import * as fs from "fs";

import { AlbumGetByUrlResponse, TrackGetByUrlResponse } from 'lucida/types';
import EventEmitter from 'events';

import { getAlbum } from './getAlbum.js';
import { getDownloadDir } from "./utils/getDownloadDir.js";
import { getLucida } from "./lucida.js";
import { cleanseTitle } from "./utils/cleanseTitle.js";
import { optionPrompt } from "./utils/optionPrompt.js";
import { writeFileMetadata } from "./utils/writeFileMetadata.js";
import { downloadURLToFilePath } from "./utils/downloadURLToFilePath.js";
import { exec } from "child_process";

//thank you lucida
EventEmitter.defaultMaxListeners = 0;

const lucida = getLucida();

//absolutely behemoth function but i have no fucking clue how to cut it down
async function mainProcess() {

    let album = await getAlbum();

    if (!album) return;
    const albumYear = new Date(album.metadata.releaseDate).getFullYear();

    const albumPath = `${getDownloadDir()}/${album.metadata.artists[0].name}/${cleanseTitle(album.metadata.title)} (${albumYear})`;

    if (!fs.existsSync(albumPath)) {
        fs.mkdirSync(albumPath, { recursive: true });
    }

    const albumTracks = album.tracks ?? [];
    let completedDownloads = [];
    let failedDownloads = [];

    const downloadBar = new cliProgress.SingleBar({
        format: '{bar} {value}/{total} - {trackName}'
    }, cliProgress.Presets.shades_classic);

    downloadBar.start(albumTracks.length, 0, { trackName: "" });

    const downloadPromises = albumTracks.map(async (track, index) => {
        //this isn't used for anything yet
        function fail() {
            failedDownloads.push(track);
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

            completedDownloads.push(trackData);
            downloadBar.update(completedDownloads.length, { trackName: cleanseTitle(track.title) });
            
        } catch (error) {
            console.log(`Failed to download "${track.title}": ${error.message}`);
            fail();
        }
    });

    await Promise.all(downloadPromises);
    downloadBar.stop();

    lucida.disconnect();
}

mainProcess();