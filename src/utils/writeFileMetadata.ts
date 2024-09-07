import { TrackGetByUrlResponse } from "lucida/types";
import { cleanseTitle } from "./cleanseTitle.js";
import pkg from 'node-id3';
const { update } = pkg;

async function getMetadata(album, track) {
    const dict = {
        album: album.metadata.title,
        title: track.metadata.title,
        artist: track.metadata.artists.map(e => e.name),
        year: String(new Date(album.metadata.releaseDate).getFullYear()),
        track: track.metadata.trackNumber
    };
    return dict;
}

export async function writeFileMetadata(album, track: TrackGetByUrlResponse, path) {
    const metadata = await getMetadata(album, track);

    await update(metadata, path, (err) => { if (err) console.log(`Error: ${err}`) })
}
