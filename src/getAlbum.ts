import { Album, AlbumGetByUrlResponse, GetByUrlResponse } from 'lucida/types';
import promptSync from 'prompt-sync';
import { getLucida } from './lucida.js';
import { optionPrompt } from './utils/optionPrompt.js';

const lucida = getLucida();

async function getURL(url: string): Promise<GetByUrlResponse> {
    try {
        return await lucida.getByUrl(url);
    }
    catch {
        console.log(`Album does not exist or failed to get`);
        return;
    }
}

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

export async function getAlbum(): Promise<AlbumGetByUrlResponse | undefined> {
    const searchOrDirect = optionPrompt("Do you have a direct URL, or would you like to search? (d/s): ", ["d", "s"]);

    let url;

    switch (searchOrDirect) {
        case "s":
            const selection = await searchAndSelectValue();

            url = selection.url;
            break;
        case "d":
            url = promptSync()("Enter Soundcloud URL: ");

            const urlRegex = /https?:\/\/(soundcloud\.com).*/

            if (!urlRegex.test(url)) {
                console.log(`Invalid URL!`);
                return;
            }
            break;
        default:
        // ?????????????
    }

    return await getURL(url) as AlbumGetByUrlResponse;
}