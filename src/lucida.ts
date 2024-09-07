import * as dotenv from 'dotenv';
import Lucida from 'lucida';
import Soundcloud from 'lucida/streamers/soundcloud';

dotenv.config();

export function getLucida() {

    const soundcloudPassword = process.env.SOUNDCLOUD_PASSWORD;
    const soundcloudUsername = process.env.SOUNDCLOUD_USERNAME;

    if (!soundcloudPassword || !soundcloudUsername) {
        console.log("Your soundcloud details are missing! Set SOUNDCLOUD_PASSWORD and SOUNDCLOUD_USERNAME in your .env");
        process.exit();
    }

    const lucida = new Lucida({
        modules: {
            soundcloud: new Soundcloud({ dispatcher: undefined })
        },
        logins: {
            soundcloud: {
                username: soundcloudPassword,
                password: soundcloudUsername
            }
        }
    });

    lucida.login();
    return lucida;
}