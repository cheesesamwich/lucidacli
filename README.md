# lucidacli
## A downloader for soundcloud that utilises the lucida library

## Installation
Clone the repo, install the deps, fill out the `.env`, `npm start`. I'm not smart or dedicated enough to write a command by command tutorial

## Faq

### 1) Why only soundcloud? Why not support other services?
I planned to initially, but a lot of services require api keys (except spotify, which is just unreliable)

### 2) What are all of the environment variables?
`SOUNDCLOUD_PASSWORD`: The password of your soundcloud account\
`SOUNDCLOUD_USERNAME`: The username of your soundcloud account\
`DOWNLOAD_PATH`: The absolute directory you want files to be downloaded to (default is home/Downloads)

### 3) Some albums don't show up with a search
I'm not sure why this happens, but it's usually more reliable to use the direct link option

### 4) Some tracks fail to download
Try again :P

### 5) I experience issues/crashes/other weird shit
Try debug it yourself! A lot of the code here isn't heavily vetted for stability, i wrote it in a couple days. I will maintain bugs in the future (but no guarantees)