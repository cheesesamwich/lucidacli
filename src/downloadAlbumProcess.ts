import { cleanseTitle } from "./utils/cleanseTitle.js";

import { getAlbum } from './getAlbum.js';
import { getDownloadDir } from "./utils/getDownloadDir.js";
import * as cliProgress from "cli-progress";

import * as fs from "fs";

import { getLucida } from "./lucida.js";
import { downloadTrack } from "./downloadTrack.js";

const lucida = getLucida();

export async function downloadAlbumProcess() {

    let album = await getAlbum();

    if (!album) return;
    const albumYear = new Date(album.metadata.releaseDate).getFullYear();

    const albumPath = `${getDownloadDir()}/${album.metadata.artists[0].name}/${cleanseTitle(album.metadata.title)} (${albumYear})`;

    if (!fs.existsSync(albumPath)) {
        fs.mkdirSync(albumPath, { recursive: true });
    }

    const albumTracks = album.tracks ?? [];
    let failedDownloads = [];
    let completedDownloads = [];
    
    const downloadBar = new cliProgress.SingleBar({
        format: '{bar} {value}/{total} - {trackName}'
    }, cliProgress.Presets.shades_classic);

    downloadBar.start(albumTracks.length, 0, { trackName: "" });

    const downloadPromises = albumTracks.map(async (track, index) => {
        await downloadTrack(album, track, index, failedDownloads, completedDownloads, albumPath);
        completedDownloads.push(track);
        downloadBar.update(completedDownloads.length, { trackName: cleanseTitle(track.title) });
    
    });

    await Promise.all(downloadPromises);
    downloadBar.stop();

    lucida.disconnect();
}