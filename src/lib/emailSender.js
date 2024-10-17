import nodemailer from 'nodemailer';

export const sendEmail = async (recipientEmail, imageUrl) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.mailersend.net",
        port: 465,
        secure: false,
        auth: {
            user: "MS_98y7hL@trial-jpzkmgq2ry2g059v.mlsender.net",
            pass: "AiVrsRKpSTLmJWDc",
        },
    });

    const mailOptions = {
        from: '"Image Generator" <MS_98y7hL@trial-jpzkmgq2ry2g059v.mlsender.net>',
        to: recipientEmail,
        subject: "Here is your generated image!",
        text: `Your image is ready. Here is the link to your image: ${imageUrl}`,
        html: `<p>Your image is ready. You can view or download it using the following link:</p>
               <a href="${imageUrl}">${imageUrl}</a>`,
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
    } catch (error) {
        console.error('Failed to send email:', error);
    }
};
