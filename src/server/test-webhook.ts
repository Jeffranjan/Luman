import { corsair } from "./corsair";

const main = async () => {
    // We send an email to the authenticated user using the raw Gmail API wrapper
    
    // Create an RFC 2822 standard email format and encode to base64url
    const rawEmail = `To: ranjanguptajeff@gmail.com\r\nSubject: Corsair Webhook Test\r\n\r\nThis is a test email sent from the Corsair SDK to verify if the webhook triggers!`;
    const encodedEmail = Buffer.from(rawEmail).toString('base64url');

    try {
        console.log("Sending test email...");
        const res = await corsair.withTenant("Ranjan").gmail.api.messages.send({
            userId: "me",
            requestBody: {
                raw: encodedEmail
            }
        });
        
        console.log("Email sent successfully!", res.data);
        console.log("Now watch your ngrok and Next.js terminal for the incoming webhook!");
    } catch (e: any) {
        console.error("Failed to send email", e.message);
    }
};

main();
