import { NextResponse } from 'next/server';
import { processRequests } from '@/lib/serviceThree';

let intervalId = null;

export async function GET(request) {
    if (intervalId !== null) {
        return NextResponse.json({ message: 'Process is already running periodically.' });
    }

    intervalId = setInterval(() => {
        console.log('Running periodic task to process requests...');
        processRequests()
            .then(() => console.log('Processed requests successfully'))
            .catch((err) => console.error('Error processing requests:', err));
    }, 10000);

    return NextResponse.json({ message: 'Periodic processing started. It will run every 10 seconds.' });
}

export async function DELETE(request) {
    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
        return NextResponse.json({ message: 'Periodic processing stopped.' });
    } else {
        return NextResponse.json({ message: 'No periodic process was running.' });
    }
}
