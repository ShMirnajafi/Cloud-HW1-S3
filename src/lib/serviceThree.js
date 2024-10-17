import fetch from 'node-fetch';
import { saveImageToS3 } from './s3.js';
import { sendEmail } from './emailSender.js';
import { updateRequestStatus, getReadyRequests } from './db.js';

export const processRequests = async () => {
    try {
        const requests = await getReadyRequests();

        for (const request of requests) {
            const caption = request.image_caption;

            // Generate image based on the caption
            const generatedImage = await imageGenerator(caption);
            if (!generatedImage) {
                console.error(`Failed to generate image for request ID: ${request.id}`);
                await updateRequestStatus(request.id, 'failed');
                continue;
            }

            // Update the request in the database
            await updateRequestStatus(request.id, 'done', generatedImage);

            // Send the image URL to the user's email
            await sendEmail(request.email, generatedImage);

            console.log(`Request ID ${request.id} processed successfully`);
        }
    } catch (error) {
        console.error('Error processing requests:', error);
    }
};

export const imageGenerator = async (caption) => {
    try {
        const response = await fetch("https://api-inference.huggingface.co/models/ZB-Tech/Text-to-Image", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: caption,
            }),
        });

        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`Failed to generate image: ${response.statusText}`);
        }

        // Fetch the image data as binary
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Save the image to S3
        const imageUrl = await saveImageToS3(buffer, 'generated-image.png');
        return imageUrl;

    } catch (error) {
        console.error("Error generating image:", error);
        throw error;
    }
};
