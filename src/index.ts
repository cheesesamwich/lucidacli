import EventEmitter from 'events';
import { getLucida } from "./lucida.js";
import { optionPrompt } from './utils/optionPrompt.js';
import { downloadAlbumProcess } from './downloadAlbumProcess.js';
import { downloadTrack } from './downloadTrack.js';
import { getDownloadDir } from './utils/getDownloadDir.js';
import { cleanseTitle } from './utils/cleanseTitle.js';
import { TrackGetByUrlResponse } from 'lucida/types';
import { urlPrompt } from './utils/urlPrompt.js';
import * as fs from "fs";

//thank you lucida
EventEmitter.defaultMaxListeners = 0;

//absolutely behemoth function but i have no fucking clue how to cut it down
async function mainProcess() {
    const mode = optionPrompt("What would you like to download, a song (BETA) or an album? (s/a): ", ["s", "a"]);

    switch (mode) {
        case "s":

            const track = await urlPrompt("track") as TrackGetByUrlResponse;
            
            //i'm not sure if this is ever actually valid
            const album = track.metadata.album;

            const albumPath = `${getDownloadDir()}/${track.metadata.artists[0].name}/${album?.title &&
                album.trackCount > 1 ?
                cleanseTitle(album.title) :
                "Singles"
                }`;


            if (!fs.existsSync(albumPath)) {
                fs.mkdirSync(albumPath, { recursive: true });
            }


            await downloadTrack(album, track.metadata, undefined, [], [], albumPath)
            break;
        case "a":
            downloadAlbumProcess();
            break;
    }
}

mainProcess();