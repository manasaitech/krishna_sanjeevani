import { Env } from "../shared/config/env";
import { logger } from "../shared/logger";
import { connect } from "cloudflare:sockets";

export class SMTPClient {
  static async sendMail(config: {
    host: string;
    port: number;
    user?: string;
    pass?: string;
    from: string;
    to: string;
    subject: string;
    html: string;
    text: string;
  }) {
    const isSecure = config.port === 465;

    // Connect to TCP socket
    let socket = connect(
      { hostname: config.host, port: config.port },
      isSecure
        ? { secureTransport: "on", allowHalfOpen: false }
        : { allowHalfOpen: false }
    );

    let writer = socket.writable.getWriter();
    let reader = socket.readable.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    let buffer = "";

    async function readLine(): Promise<string> {
      while (!buffer.includes("\r\n")) {
        const { value, done } = await reader.read();
        if (done) {
          if (buffer.length > 0) {
            const line = buffer;
            buffer = "";
            return line;
          }
          throw new Error("SMTP connection closed unexpectedly");
        }
        buffer += decoder.decode(value, { stream: true });
      }
      const idx = buffer.indexOf("\r\n");
      const line = buffer.substring(0, idx);
      buffer = buffer.substring(idx + 2);
      return line;
    }

    async function sendCommand(cmd: string, expectedCode: number) {
      await writer.write(encoder.encode(cmd + "\r\n"));
      
      let response = "";
      while (true) {
        const line = await readLine();
        response += line + "\n";
        
        // SMTP multiline responses have a '-' after the status code, e.g. "250-PIPELINING\r\n250 HELP"
        if (line.length >= 4 && line.charAt(3) !== "-") {
          const code = parseInt(line.substring(0, 3));
          if (code !== expectedCode) {
            throw new Error(`SMTP Error: Expected ${expectedCode}, got: ${response.trim()}`);
          }
          break;
        } else if (line.length < 4) {
          // Fallback if response is too short
          const code = parseInt(line.substring(0, 3));
          if (code !== expectedCode) {
            throw new Error(`SMTP Error: Expected ${expectedCode}, got: ${response.trim()}`);
          }
          break;
        }
      }
      return response;
    }

    // Read initial SMTP banner
    const banner = await readLine();
    if (!banner.startsWith("220")) {
      throw new Error("Invalid SMTP Banner: " + banner);
    }

    // Send EHLO
    await sendCommand("EHLO localhost", 250);

    // If port 587 (STARTTLS), negotiate TLS upgrade
    if (config.port === 587) {
      await sendCommand("STARTTLS", 220);
      
      // Release streams to secure connection
      writer.releaseLock();
      reader.releaseLock();

      // Upgrade socket to secure TLS
      socket = socket.startTls();
      writer = socket.writable.getWriter();
      reader = socket.readable.getReader();

      // Send EHLO again over TLS
      await sendCommand("EHLO localhost", 250);
    }

    // Authentication (AUTH LOGIN)
    if (config.user && config.pass) {
      await sendCommand("AUTH LOGIN", 334);
      await sendCommand(btoa(config.user), 334);
      await sendCommand(btoa(config.pass), 235);
    }

    // MAIL FROM
    await sendCommand(`MAIL FROM:<${config.from}>`, 250);

    // RCPT TO
    await sendCommand(`RCPT TO:<${config.to}>`, 250);

    // DATA
    await sendCommand("DATA", 354);

    // Format and send full email headers & body
    const messageId = `<${Date.now()}.${Math.random().toString(36).substring(2)}@krishnasanjeevani.com>`;
    const emailData = [
      `From: <${config.from}>`,
      `To: <${config.to}>`,
      `Subject: ${config.subject}`,
      `Date: ${new Date().toUTCString()}`,
      `Message-ID: ${messageId}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=utf-8`,
      `Content-Transfer-Encoding: 7bit`,
      ``,
      config.html,
      `.`
    ].join("\r\n");

    await sendCommand(emailData, 250);

    // QUIT
    await writer.write(encoder.encode("QUIT\r\n"));

    writer.releaseLock();
    reader.releaseLock();
    await socket.close();
  }
}

export class EmailService {
  static async sendEmail(
    env: Env,
    { to, subject, html, text }: { to: string; subject: string; html: string; text: string }
  ): Promise<boolean> {
    const from = env.EMAIL_FROM || "onboarding@resend.dev";

    // 1. Check if Hostinger Mail API is configured
    if (env.HOSTINGER_MAIL_TOKEN && env.HOSTINGER_MAILBOX_ID) {
      logger.info(`Sending email via Hostinger Mail API to ${to}`);
      try {
        const response = await fetch(`https://api.mail.hostinger.com/api/v1/mailboxes/${env.HOSTINGER_MAILBOX_ID}/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.HOSTINGER_MAIL_TOKEN}`,
          },
          body: JSON.stringify({
            to: [to],
            displayName: "Krishna Sanjeevani",
            subject,
            text,
            html,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          logger.error("Failed to send email via Hostinger Mail API", { status: response.status, error: errorText });
        } else {
          logger.info("Email sent successfully via Hostinger Mail API", { to, subject });
          return true;
        }
      } catch (error: any) {
        logger.error("Error sending email via Hostinger Mail API", { error: error.message });
      }
    }

    // 2. Check if SMTP is configured
    if (env.SMTP_HOST) {
      const port = parseInt(env.SMTP_PORT || "465");
      logger.info(`Sending email via SMTP to ${to} using host ${env.SMTP_HOST}:${port}`);
      try {
        await SMTPClient.sendMail({
          host: env.SMTP_HOST,
          port,
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
          from,
          to,
          subject,
          html,
          text,
        });
        logger.info("Email sent successfully via SMTP", { to, subject });
        return true;
      } catch (error: any) {
        logger.error("Failed to send email via SMTP", { error: error.message, to });
        return false;
      }
    }

    // 2. Fall back to Resend if API key is present
    const apiKey = env.RESEND_API_KEY;
    if (apiKey) {
      logger.info(`Sending email via Resend API to ${to}`);
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            from,
            to: [to],
            subject,
            html,
            text,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          logger.error("Failed to send email via Resend", { status: response.status, error: errorText });
          return false;
        }

        logger.info("Email sent successfully via Resend", { to, subject });
        return true;
      } catch (error) {
        logger.error("Error sending email via Resend", { error });
        return false;
      }
    }

    // 3. Fallback to Local Simulator
    logger.info(`[LOCAL EMAIL SIMULATOR] Sending email...`, {
      from,
      to,
      subject,
      body: text || html,
    });
    
    console.log("\n==================================================");
    console.log(`[EMAIL SIMULATOR] - EMAIL SENT OUT`);
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:    ${text || html}`);
    console.log("==================================================\n");
    return true;
  }
}
