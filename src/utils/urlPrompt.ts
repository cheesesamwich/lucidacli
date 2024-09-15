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

export async function urlPrompt(wantedType?: ItemType, returnURL?: boolean): Promise<any> {
    while (true) {
        try {
            const prompt = promptSync()("Enter Soundcloud URL: ");
            if (prompt && urlRegex.test(prompt)) {

                const type = await lucida.getTypeFromUrl(prompt);

                let data;

                if (!returnURL) {
                    data = await getUrlWithRetry(prompt);
                }

                const returnedValue = returnURL ? prompt : data;

                if (data || returnURL) {
                    if (wantedType) {
                        if (type == wantedType) {
                            return returnedValue;
                        }
                    }
                    else {
                        return returnedValue;
                    }
                }
            }
        }
        catch { }
        console.log("Invalid input! Try again");
    }
}
