import { smsWorkerQueue } from "../configs/redis.config";
import { Result } from "../helper-func/result";
import { injector } from "../locator/injector";



// This is listener function for sending email 
export default async function smsTaskProcessor() {

    smsWorkerQueue.process(async (job) => {
        const task = job.data;

        try {

            const response = await injector.smsService.sendOtp<any>(task)
            const result = response as Result<any, Error>

            if (result.isErr()) {
                // handle error exception 
                console.error("Failed to send otp")
            }

            console.error("OTP sent ")

        } catch (error: any) {
            console.error(error)
        }
    })

}