import fs from "fs/promises"
import path from 'path';
import nodemailer from "nodemailer"
import env from "../../configs/env.config";
import { Err, Ok, Result } from "../../helper-func/result";




interface Nodemailer {
    sendMail<T>(msg: object): Promise<T>
}



export default class AppNodeMailer {
    private transporter: Nodemailer;
    // private transporter = nodemailer.createTransport({
    //     service: "gmail",
    //     auth: {
    //         user: ENVConfig.MAIL_USERNAME,
    //         pass: ENVConfig.MAIL_PASSWORD,
    //     }
    // })


    constructor(mailer: Nodemailer) {
        this.transporter = mailer
    }




    async sendVerificationEmail<T>(task: EmailTask): Promise<Result<T, Error>> {

        // Load the HTML template from the file
        const templatePath = path.join(__dirname, "html", 'email.confirmation.html');
        let htmlContent = await fs.readFile(templatePath, 'utf-8');

        // Replace placeholders with actual values
        const actionUrl = `${env.domain}/auth/verify-email/?token=${task.token}`
        htmlContent = htmlContent.replace(/{{action_url}}/g, actionUrl);

        const { mailUsername, projectName } = env
        const { subject, to } = task

        const msg = {
            to,
            from: `${projectName} ${mailUsername}`,
            subject,
            html: htmlContent,
        };

        try {
            const response = await this.transporter.sendMail<T>(msg);

            return new Ok(response as T)

        } catch (error: any) {
            return new Err(new InternalException("Failed to send "))
        }
    };


    async sendResetPasswordEmail<T>(task: EmailTask): Promise<Result<T, Error>> {

        const { token, to, subject } = task

        // Load the HTML template from the file
        const templatePath = path.join(__dirname, "html", 'reset.password.html');
        let htmlContent = await fs.readFile(templatePath, 'utf-8');

        // Replace placeholders with actual values
        htmlContent = htmlContent.replace(/{{code}}/g, token || "");

        const msg = {
            to,
            from: `${env.projectName} ${env.mailUsername}`,
            subject,
            html: htmlContent,
        };

        try {
            const response = await this.transporter.sendMail<T>(msg);
            return new Ok(response as T)
        } catch (error: any) {
            return new Err(new InternalException(`Error sending verification email: ${error.message}`))
        }
    };
}
