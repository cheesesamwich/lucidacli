import { AlbumGetByUrlResponse, TrackGetByUrlResponse } from "lucida/types";
import { cleanseTitle } from "./cleanseTitle.js";
import id3pkg from 'node-id3';
const { update } = id3pkg;
import { downloadURLToFilePath } from "./downloadURLToFilePath.js";

async function getAlbumInfo(artist: string, album: string) {
    const apiKey = process.env.LASTFM_API_KEY;

    const response = await fetch(`https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${apiKey}&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&format=json`);

    if (response) {
        return response.json();
    }
    else return null;
}

async function getMetadataObject(album, track, index) {
    const dict = {
        album: cleanseTitle(album.name),
        title: cleanseTitle(track.metadata.title),
        artist: album.artist,
        year: new Date(album.releaseDate).getFullYear().toString(),
        trackNumber: index + 1,
        discNumber: 1,
        mbid: album.mbid
    };

    return dict;
}

export async function writeFileMetadata(album: AlbumGetByUrlResponse, track: TrackGetByUrlResponse, path, albumPath, index) {
    const lastFMAlbum = (await getAlbumInfo(album.metadata.artists[0].name, album.metadata.title)).album;

    const metadata = await getMetadataObject(lastFMAlbum, track, index);

    await update(metadata, path, (err) => { if (err) console.log(`Error: ${err}`) });

    const assetUrl = lastFMAlbum.image
        .filter(e => e.hasOwnProperty("#text"))
        .filter(e => e["#text"].length)
        .pop()?.["#text"] ?? album.metadata.coverArtwork[0].url;

    if(assetUrl) {
        await downloadURLToFilePath(assetUrl, `${albumPath}/cover.${assetUrl.split(/[#?]/)[0].split('.').pop().trim()}`);
    }
    else {
        console.log("Could not find album cover");
    }
}