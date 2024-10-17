import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
    endpoint: 'https://storage.c2.liara.space',
    region: 'us-east-1',
    credentials: {
        accessKeyId: '6csqpkber0d5e1q9',
        secretAccessKey: '6ac31b2d-c339-4984-bcf7-8406a6c890e3',
    },
});

export const saveImageToS3 = async (imageData, filename) => {
    const key = `${uuidv4()}_${filename}`;

    const params = {
        Bucket: 'image-bucket',
        Key: key,
        Body: Buffer.from(imageData, 'base64'),
        ContentEncoding: 'base64',
        ContentType: 'image/png',
    };

    try {
        const command = new PutObjectCommand(params);
        await s3Client.send(command);
        return `https://storage.c2.liara.space/image-bucket/${key}`;
    } catch (error) {
        console.error('Error saving image to S3:', error);
        return null;
    }
};
