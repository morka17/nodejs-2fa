import { emailWorkerQueue } from "../configs/redis.config";
import { Result } from "../helper-func/result";
import { injector } from "../locator/injector";



// This is listener function for sending email 
export default async function emailTaskProcessor() {

    emailWorkerQueue.process(async (job) => {
        const task = job.data;

        let result: Result<unknown, Error>;

        try {
            if (task.type === EmailType.PasswordReset) {
                result = await injector.mailService.sendResetPasswordEmail(task);
                if (result.isErr()) {
                    // Handle error 
                    return
                }

            }

            if (task.type === EmailType.EmailVerification) {
                result = await injector.mailService.sendVerificationEmail(task)
                if (result.isErr()) {
                    // Handle error 
                    return
                }

            }
        } catch (error: any) {
            console.error(error)
        }
    })





}