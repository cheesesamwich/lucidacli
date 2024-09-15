import { AlbumGetByUrlResponse, ItemType, TrackGetByUrlResponse } from "lucida/types";
import { getLucida } from "./lucida.js"
import { getUrlWithRetry, urlRegex } from "./utils/urlPrompt.js";
import { downloadTrack } from "./downloadTrack.js";
import { createAlbumPath } from "./utils/createAlbumPath.js";
import { getDownloadDir } from "./utils/getDownloadDir.js";

import * as fs from "fs";
import { cleanseTitle } from "./utils/cleanseTitle.js";
import { sleep } from "./utils/sleep.js";

const lucida = getLucida();

//determines the type of a url, then downloads it properly
export async function downloadMedia(url: string) {
    const type: ItemType = await lucida.getTypeFromUrl(url);
    if (!urlRegex.test(url)) return;

    switch (type) {
        case "track":
            const trackData = await getUrlWithRetry(url) as TrackGetByUrlResponse;
            await downloadTrack(trackData.metadata.album, trackData, undefined, [], [], createAlbumPath(trackData, trackData.metadata.album));
            break;
        case "album":
            const album = await lucida.getByUrl(url) as AlbumGetByUrlResponse;

            const albumYear = new Date(album.metadata.releaseDate).getFullYear();

            const albumPath = `${getDownloadDir()}/${album.metadata.artists[0].name}/${cleanseTitle(album.metadata.title)} ${(albumYear && albumYear != 1970) ? `(${albumYear})` : ""}`;

            if (!fs.existsSync(albumPath)) {
                fs.mkdirSync(albumPath, { recursive: true });
            }

            const albumTracks = album.tracks ?? [];
            let failedDownloads = [];
            let completedDownloads = [];

            for (let index = 0; index < albumTracks.length; index++) {
                const track = albumTracks[index];
                await downloadTrack(album, track, index, failedDownloads, completedDownloads, albumPath);
                completedDownloads.push(track);
                console.log(`Downloaded ${track.title}`);
                await sleep(250);
            }
            break;
    }
}