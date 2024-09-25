# lucidacli
## A music downloader that utilises the lucida library

## Installation
Clone the repo, install the deps, fill out the `.env`, `npm start`. I'm not smart or dedicated enough to write a command by command tutorial.

### Info
The main thing you want to do is configure `src/lucidaInfo.ts`, to provide your logins.
Export an `info` object from that file, and it will be passed into the Lucida instance. You can find some basic documentation for what to input in the [lucida](https://www.npmjs.com/package/lucida) page. You also need to put DOWNLOAD_PATH (absolute) and LASTFM_API_KEY in the .env

### Example Config
```ts
import Soundcloud from "lucida/streamers/soundcloud";
import Deezer from "lucida/streamers/deezer";

export const info = {
    modules: {
        soundcloud: new Soundcloud({ dispatcher: undefined }),
        deezer: new Deezer({ arl: "your arl" })
    },
    logins: {
        soundcloud: {
            username: "",
            password: ""
        },
        deezer: {
            username: "",
            password: ""
        }
    }
};
```

## Faq

### 1) Why only a few services? Why not support other services?
I planned to initially, but a lot of services require api keys (ergo i couldn't test them) and spotify is just plain broken

### 2) Some albums don't show up with a search
I'm not sure why this happens, but it's usually more reliable to use the direct link option

### 3) Some tracks fail to download
Try again :P

### 4) I experience issues/crashes/other weird shit
Try to debug it yourself! A lot of the code here isn't heavily vetted for stability, i wrote it in a couple days. I will try to maintain bugs in the future, but no guarantees

### 5) All downloaded songs cut off at 0:29
I'm pretty sure this is because of soundcloud go limitations, no fix (unless you actually want to buy soundcloud go)

### 6) Metadata is broken or inaccurate
I've tried my best to do most of the heavy lifting with the metadata, but due to the nature of the scraping (and my shitty code) it often messes up. I recommend using Kid3 or another metadata editor to clean up the files after downloading