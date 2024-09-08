import { GetByUrlResponse, ItemType } from "lucida/types";
import { getLucida } from "../lucida.js";
import promptSync from 'prompt-sync';

const lucida = getLucida();

export const urlRegex = /https?:\/\/(soundcloud\.com).*/;

export async function getUrlWithRetry(url: string): Promise<GetByUrlResponse> {
    const tryGet = await lucida.getByUrl(url);
    if (tryGet) { return tryGet }
    else {
        return getUrlWithRetry(url);
    }
}

export async function urlPrompt(wantedType?: ItemType): Promise<any> {
    while (true) {
        try {
            const prompt = promptSync()("Enter Soundcloud URL: ");
            if (prompt && urlRegex.test(prompt)) {

                const data = await getUrlWithRetry(prompt);

                if (data) {
                    if (wantedType) {
                        const type = await lucida.getTypeFromUrl(prompt);
                        if (type == wantedType) {
                            return data;
                        }
                    }
                    else {
                        return data;
                    }
                }
            }
        }
        catch { }
        console.log("Invalid input! Try again");
    }
}
