import nodemailer from "nodemailer";
import config from "config";
import pug from "pug";
import { convert } from "html-to-text";
import { Prisma } from "@prisma/client";
import sgMail from "@sendgrid/mail";

const SENDGRID_API_KEY = config.get<string>("sendGridApiKey");

export default class Email {
  #firstName: string;
  #to: string;
  #from: string;
  constructor(private user: Prisma.UserCreateInput, private url: string) {
    this.#firstName = user.name.split(" ")[0];
    this.#to = user.email;
    // this.#from = `Codevo <admin@admin.com>`;
    this.#from = "katsumi.ishihara08@gmail.com";
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
  }

  private async send(template: string, subject: string) {
    // Generate HTML template based on the template string
    const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      firstName: this.#firstName,
      subject,
      url: this.url,
    });
    // Create mailOptions
    const mailOptions = {
      from: this.#from,
      to: this.#to,
      subject,
      text: convert(html),
      html,
    };

    try {
      await sgMail.send(mailOptions);
      console.log(`Mail successfully sent! VerificationCode is: ${this.url}`);
    } catch (error) {
      console.error("There's an error: ", error);
      if ((error as any).response) {
        console.error("There's an unknown error: ", (error as any).response.body);
      }
    }
  }

  async sendVerificationCode() {
    await this.send("verificationCode", "Your account verification code");
  }

  async sendPasswordResetToken() {
    await this.send(
      "resetPassword",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
}
