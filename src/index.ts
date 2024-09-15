import EventEmitter from 'events';
import { getLucida } from "./lucida.js";
import { optionPrompt } from './utils/optionPrompt.js';
import { downloadTrack } from './downloadTrack.js';
import { TrackGetByUrlResponse } from 'lucida/types';
import { urlPrompt } from './utils/urlPrompt.js';
import * as fs from "fs";

import * as readline from "readline";
import { createAlbumPath } from './utils/createAlbumPath.js';
import { downloadMedia } from './downloadMedia.js';
import { getAlbum } from './getAlbum.js';

function awaitPipe() {
    return new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        });

        let lines = [];

        rl.on('line', (line) => {
            lines.push(line);
        });

        rl.on('close', () => {
            resolve(lines);
        });

        rl.on('error', (err) => {
            reject(err);
        });
    });
}

//thank you lucida
EventEmitter.defaultMaxListeners = 0;

//absolutely behemoth function but i have no fucking clue how to cut it down
async function mainProcess() {
    let pipe = null;

    if (!process.stdin.isTTY) {
        pipe = await awaitPipe() as string[];
    }

    if (pipe && pipe.length > 0) {
        for (const e of pipe) {
            await downloadMedia(e);
        }
        return;
    }

    const mode = optionPrompt("What would you like to download, a song (BETA) or an album? (s/a): ", ["s", "a"]);

    switch (mode) {
        case "s":
            const track = await urlPrompt("track") as TrackGetByUrlResponse;

            //i'm not sure if this is ever actually valid
            const album = track.metadata.album;

            const albumPath = createAlbumPath(track, album);


            if (!fs.existsSync(albumPath)) {
                fs.mkdirSync(albumPath, { recursive: true });
            }

            await downloadTrack(album, track.metadata, undefined, [], [], albumPath)
            break;
        case "a":

            await downloadMedia(await getAlbum());
            break;
    }
}

mainProcess();