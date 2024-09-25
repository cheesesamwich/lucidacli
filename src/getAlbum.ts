import { Album, AlbumGetByUrlResponse, GetByUrlResponse } from 'lucida/types';
import promptSync from 'prompt-sync';
import { getLucida } from './lucida.js';
import { optionPrompt } from './utils/optionPrompt.js';
import { getUrlWithRetry, urlPrompt } from './utils/urlPrompt.js';

const lucida = getLucida();

async function searchAndSelectValue(): Promise<Album> {
    const query = promptSync()("Search query: ");

    const search = await lucida.search(query, 15);

    const albums = Object.values(search)
        .map(e => [...e.albums, ...e.artists.map(e => e.albums ?? []).flat()])
        .flat()
        .filter(async e => (await lucida.getTypeFromUrl(e.url)) == "album")
        .map(e => ({ [e.title]: e }))
        .reduce((acc, curr) => {
            return { ...acc, ...curr };
        }, {});

    if (!Object.values(albums).length) {
        console.log("No results! Sorry :(");
        process.exit();
    }

    console.log(Object.values(albums).map((e, index) => `${index}) "${e.title}" - ${e.artists[0].name} - ${e.url}`).join("\n").trim());

    return Object.values(albums)[Number(promptSync()("Select an album: "))];
}

export async function getAlbum(): Promise<string | undefined> {
    const searchOrDirect = optionPrompt("Do you have a direct URL, or would you like to search? (d/s): ", ["d", "s"]);

    switch (searchOrDirect) {
        case "s":
            const selection = await searchAndSelectValue();
            return await selection.url;
        case "d":
            return await urlPrompt("album", true);
        default:
        // ?????????????
    }

    return null;
}