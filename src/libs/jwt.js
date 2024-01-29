import { config } from 'dotenv'
import jwt from 'jsonwebtoken'

config()

export function createAccessToken(payload) {
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            process.env.TOKEN_SECRET, 
            {
            expiresIn: '1d'
            },
            (error, token) => {
                if(error) reject(error)
                resolve(token)
            }
        );
    })
}