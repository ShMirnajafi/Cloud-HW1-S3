import { MailerSend, EmailParams, Recipient, Sender } from "mailersend";

export const sendEmail = async (recipientEmail, imageUrl) => {
    const mailersend = new MailerSend({
        apiKey: 'mlsn.941e2068854298db0ec2f0fe7a29d848962f451a395b5dd54fa288d46db42d05',
    });

    const recipients = [
        new Recipient(recipientEmail, "User"),
    ];

    const emailParams = new EmailParams()
        .setFrom(new Sender("info@trial-jpzkmgq2ry2g059v.mlsender.net", "Image Generator"))
        .setTo(recipients)
        .setSubject("Here is your generated image!")
        .setHtml(`<p>Your image is ready. You can view or download it using the following link:</p>
              <a href="${imageUrl}">${imageUrl}</a>`)
        .setText(`Your image is ready. Here is the link to your image: ${imageUrl}`);

    try {
        await mailersend.email.send(emailParams);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Failed to send email:', error);
    }
};
