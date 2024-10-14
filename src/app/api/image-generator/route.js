import { Client } from 'pg';
import amqp from 'amqplib';
import axios from 'axios';
import AWS from 'aws-sdk';
import nodemailer from 'nodemailer';

const { DATABASE_URL, CLOUDAMQP_URL, LIARA_OBJECT_STORAGE_URL, LIARA_ACCESS_KEY, LIARA_SECRET_KEY } = process.env;

const dbClient = new Client({
    connectionString: DATABASE_URL,
});

dbClient.connect();

export async function POST() {
    const connection = await amqp.connect(CLOUDAMQP_URL);
    const channel = await connection.createChannel();

    const queue = 'image_generation_queue';

    channel.consume(queue, async (msg) => {
        const imageRequest = JSON.parse(msg.content.toString());

        const { id, caption, userEmail } = imageRequest;

        // Step 1: Send caption to Image to Text (Image Generator) API
        const imageResponse = await axios.post('https://api-inference.huggingface.co/models/ZB-Tech/Text-to-Image', {
            caption,
        });

        const generatedImageBuffer = imageResponse.data.image;
        const imageName = `generated_image_${id}.png`;

        // Step 2: Save the image to Liara Object Storage
        const s3 = new AWS.S3({
            accessKeyId: LIARA_ACCESS_KEY,
            secretAccessKey: LIARA_SECRET_KEY,
            endpoint: LIARA_OBJECT_STORAGE_URL.replace('https://', ''),
            s3ForcePathStyle: true,
        });

        const uploadParams = {
            Bucket: 'image-bucket',
            Key: imageName,
            Body: generatedImageBuffer,
            ContentType: 'image/png',
            ACL: 'public-read',
        };

        const data = await s3.upload(uploadParams).promise();
        const publicUrl = data.Location;

        // Step 3: Update the database with the URL and change status to done
        await dbClient.query(
            'UPDATE Caption SET status = $1, imageUrl = $2 WHERE id = $3',
            ['done', publicUrl, id]
        );

        // Step 4: Send the URL to the user's email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'your-email@gmail.com',
                pass: 'your-email-password',
            },
        });

        const mailOptions = {
            from: 'your-email@gmail.com',
            to: userEmail,
            subject: 'Your Generated Image Ready',
            text: `Your image has been generated and is available at the following URL: ${publicUrl}`,
        };

        await transporter.sendMail(mailOptions);

        channel.ack(msg);
    });

    return new Response('Service is running', { status: 200 });
}
