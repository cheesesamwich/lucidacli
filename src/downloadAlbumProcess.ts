import { cleanseTitle } from "./utils/cleanseTitle.js";
import { getAlbum } from './getAlbum.js';
import { getDownloadDir } from "./utils/getDownloadDir.js";
import * as cliProgress from "cli-progress";
import * as fs from "fs";
import { sleep } from "./utils/sleep.js";
import { getLucida } from "./lucida.js";
import { downloadTrack } from "./downloadTrack.js";
import PromptSync from "prompt-sync";
import { optionPrompt } from "./utils/optionPrompt.js";

const lucida = getLucida();

export async function downloadAlbumProcess() {
    let album = await getAlbum();

    if (!album) return;

    const albumYear = new Date(album.metadata.releaseDate).getFullYear();

    const overrideMetadata = await optionPrompt("Override album metadata? (y/n): ") == "y";
    
    let artistName = overrideMetadata ? PromptSync()("Artist name: ") : album.tracks[0].artists[0].name;

    const albumPath = `${getDownloadDir()}/${artistName ?? PromptSync()("Album artist name could not be found, input it manually: ")}/${cleanseTitle(album.metadata.title)} ${(albumYear && albumYear != 1970) && `(${albumYear})`}`;

    if (!fs.existsSync(albumPath)) {
        fs.mkdirSync(albumPath, { recursive: true });
    }

    const albumTracks = album.tracks ?? [];
    let failedDownloads = [];
    let completedDownloads = [];

    for (let index = 0; index < albumTracks.length; index++) {
        const track = albumTracks[index];
        await downloadTrack(album, track, index, failedDownloads, completedDownloads, albumPath, artistName);
        completedDownloads.push(track);
        console.log(`Downloaded ${track.title}`);
        await sleep(250);
    }

    lucida.disconnect();
}
