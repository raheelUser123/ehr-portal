import nodemailer from "nodemailer";
export async function sendOtp(email:string,otp:string,purpose:string){
  if(!process.env.SMTP_HOST){ console.log(`[EHR Portal] ${purpose} OTP for ${email}: ${otp}`); return; }
  const transporter=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:false,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});
  await transporter.sendMail({from:process.env.SMTP_FROM,to:email,subject:`EHR Portal ${purpose} code`,html:`<div style="font-family:Arial"><h2>EHR Portal</h2><p>Your ${purpose.toLowerCase()} code is:</p><div style="font-size:28px;font-weight:800;letter-spacing:6px">${otp}</div><p>This code expires in 10 minutes.</p></div>`});
}
