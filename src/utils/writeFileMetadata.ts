import { AlbumGetByUrlResponse, TrackGetByUrlResponse } from "lucida/types";
import { cleanseTitle } from "./cleanseTitle.js";
import id3pkg from 'node-id3';
const { update } = id3pkg;
import { downloadURLToFilePath } from "./downloadURLToFilePath.js";
import * as fs from "fs";

async function getAlbumInfo(artist: string, album: string) {
    const apiKey = process.env.LASTFM_API_KEY;

    const response = await fetch(`https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${apiKey}&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&format=json`);

    if (response) {
        return response.json();
    }

    else return null;
}

async function getMetadataObject(album, track: TrackGetByUrlResponse, index, overrideArtistName) {
    const dict = {
        album: cleanseTitle(album?.name) ?? undefined,
        title: cleanseTitle(track?.metadata?.title),
        artist: overrideArtistName ?? album?.artist ?? track.metadata.artists[0].name,
        year: new Date(album?.releaseDate).getFullYear().toString() ?? undefined,
        trackNumber: index || index == 0 ? index + 1 : 1,
        discNumber: 1,
        mbid: album?.mbid ?? undefined
    };

    return dict;
}

export async function writeFileMetadata(album: AlbumGetByUrlResponse, track: TrackGetByUrlResponse, path, albumPath, index, overrideArtistName) {
    const lastFMAlbum = album && album?.metadata && (await getAlbumInfo(album.metadata.artists[0].name, album.metadata.title)).album;

    const metadata = await getMetadataObject(lastFMAlbum, track, index ?? undefined, overrideArtistName);

    await update(metadata, path, (err) => { if (err) console.log(`Error: ${err}`) });

    function hasCoverImage(dir: string): string | undefined {
        const files = fs.readdirSync(dir);
        const coverFile = files.find(file => {
            if (!file) return false;
            const parts = file.split(".");
            return parts[0] === 'cover' && ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff'].includes(parts[1]);
        });
        return coverFile ?? undefined;
    }
    
    const assetUrl = lastFMAlbum?.image
    .filter(e => e.hasOwnProperty("#text"))
    .filter(e => e["#text"].length)
    .pop()?.["#text"] ?? album?.metadata.coverArtwork[0].url ?? track.metadata.artists[0].pictures[0];

    const existingCover = hasCoverImage(albumPath);

    if (assetUrl && !existingCover) {
        await downloadURLToFilePath(assetUrl, `${albumPath}/cover.${assetUrl?.split(/[#?]/)[0]?.split('.').pop().trim()}`);
    }
}