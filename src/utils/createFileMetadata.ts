import { cleanseTitle } from "./cleanseTitle.js";

export function createFileMetadata(album, track) {
    return {
        Album: cleanseTitle(album.metadata.title),
        Title: cleanseTitle(track.metadata.title),
        Artist: cleanseTitle(album.metadata.artists[0].name),
        Year: cleanseTitle(String(new Date(album.metadata.releaseDate).getFullYear())),
        ...(album?.metadata?.genre?.length ? { Genre: album.metadata.genre?.join(", ") } : {}),
        TrackNumber: cleanseTitle(String(track.metadata.trackNumber))
    };
}