import * as dotenv from 'dotenv';
import Lucida from 'lucida';
import { info } from './lucidaInfo.js';

dotenv.config();

const lucida = new Lucida(info);

lucida.login();

export function getLucida() {
    return lucida;
}