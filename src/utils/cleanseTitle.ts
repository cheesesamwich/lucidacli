export function cleanseTitle(title: string, removeBrackets: boolean = false): string {
    let returnedTitle = title;
    if (removeBrackets) {
        returnedTitle = returnedTitle.replace(/\(.*\)/g, "");
    }
    returnedTitle = returnedTitle.replace(/\//g, "-").replace(/[<>:"/\\|?*]/g, "").replace(/\s+/g, ' ').trim();
    return returnedTitle;
}