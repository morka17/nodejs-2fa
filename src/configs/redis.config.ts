import Redis from "ioredis"
import Queue from "bull"

import env from "./env.config";


const options = {
    host: env.redisHost!,
    port: +env.redisPort!,
    password: env.redisPassword!,
    retryStrategy: (times: number) => {
        // Reconnect after 
        return Math.min(times * 50, 2000);
    }
}


export const emailWorker = new Redis(options)
export const smsWorker = new Redis(options)



export const emailWorkerQueue = new Queue<EmailTask>("EMAIL_PROCESSOR", {
    redis: {
        ...options
    }
})

export const smsWorkerQueue = new Queue<SmsOtpPayload>("SMS_PROCESSOR", {
    redis: {
        ...options
    }
})




