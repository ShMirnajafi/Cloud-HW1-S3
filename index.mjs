import { processRequests } from './src/lib/serviceThree.js';
import dotenv from 'dotenv';

dotenv.config();

setInterval(() => {
    processRequests();
}, 10000);
