import dotenv from "dotenv"



dotenv.config();


const env = {
    projectName: process.env.PROJECT_NAME,
    jwtSecret: process.env.JWT_SECRET,
    redisUrl: process.env.REDIS_URL,
    redisPassword: process.env.REDIS_PASSWORD,
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT,
    domain: process.env.DOMAIN ?? "http://localhost:4000",
    mailUsername: process.env.MAIL_USERNAME,
    mailPassword: process.env.MAIL_PASSWORD,
}


export default env;