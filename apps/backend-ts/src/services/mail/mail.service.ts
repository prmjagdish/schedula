import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class MailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${process.env.APP_URL}/auth/verify?token=${token}`;

    const msg = {
      to: email,
      from: process.env.MAIL_FROM as string,
      subject: 'Verify Your Account',
      html: `
        <h2>Welcome to Schedula</h2>
        <p>Please Open below link to verify your account:</p>
        <p>${verificationUrl}</p>
        <p>This link expires in 1 hour.</p>
      `,
    };

    await sgMail.send(msg);
  }
}
