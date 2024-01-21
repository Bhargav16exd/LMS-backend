import {google} from "googleapis"
import nodemailer from "nodemailer"
import { SUBJECT } from "../const.js"


export const sendMail = async(email,text)=>{
    
    
          const oAuth2Client = new google.auth.OAuth2(
          process.env.OAUTH_CLIENTID,
          process.env.OAUTH_SECRETTOKEN,
          process.env.OAUTH_REDIRECTURL
          )
  
          oAuth2Client.setCredentials({refresh_token:process.env.OAUTH_REFRESHTOKEN})
  
          const trasporter = nodemailer.createTransport({
              service:'gmail',
              auth:{
                  type:'OAuth2',
                  user: process.env.OAUTH_EMAIL,
                  clientId: process.env.OAUTH_CLIENTID,
                  clientSecret: process.env.OAUTH_SECRETTOKEN,
                  refreshToken: process.env.OAUTH_REFRESHTOKEN,
                  accessToken: oAuth2Client.getAccessToken(),
              }
          })
  
          const mailOptions = {
              from: process.env.OAUTH_EMAIL ,
              to:email,
              subject:SUBJECT,
              text:text,
            }    
         
           const info = await trasporter.sendMail(mailOptions) 
           return info;
  
}



