import { processRequests } from './src/lib/serviceThree.js';
import dotenv from 'dotenv';

dotenv.config();

setInterval(async () => {
    console.log("Checking for 'ready' requests...");
    try {
        await processRequests();
    } catch (error) {
        console.error("Error processing requests:", error);
    }
}, 10000);
