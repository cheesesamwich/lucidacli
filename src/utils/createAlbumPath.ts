import { cleanseTitle } from "./cleanseTitle.js";
import { getDownloadDir } from "./getDownloadDir.js";

export function createAlbumPath(track, album) {
    return `${getDownloadDir()}/${track.metadata.artists[0].name}/${album?.title &&
        album.trackCount > 1 ?
        cleanseTitle(album.title) :
        "Singles"
        }`;
}