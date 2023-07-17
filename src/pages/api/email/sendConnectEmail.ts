import { mailOptions, transporter } from "@/utils/nodemailer";
import crypto from "crypto";
import prisma from "@/libs/prismadb";
import { NextApiRequest, NextApiResponse } from "next";
import { AppConfig } from "@/utils/AppConfig";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any | { error: string }>
) {

  if (req.method === "POST") {
    const { email: user, connectTo } = req.body;
    const token = crypto.randomBytes(20).toString("hex");

    const generateEmailContent = (data: any) => {
        const stringData = Object.entries(data).reduce(
          (str, [key, val]) => (str += `${[key]}: \n${val} \n \n`),
          ""
        );
      
        const email = `<!doctype html><html lang="en-US"><head> <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/> <title>MYAO | Connect With User</title> <meta name="description" content="Connect and start haggling"> <style type="text/css"> a:hover{text-decoration: underline !important;}</style></head><body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0"> <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8" style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;"> <tr> <td> <table style="background-color: #f2f3f8; max-width:670px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0"> <tr> <td style="height:80px;">&nbsp;</td></tr><tr> <td style="text-align:center;"> <a href={AppConfig.siteUrl}title="logo" target="_blank" style="text-decoration: none; color: #FB923C; font-weight: bold; font-size: 40px; hover:text-decoration "> <img width="60" src="https://i.ibb.co/KjBMMrG/cat.png" title="logo" style="margin-bottom: -6px" alt="logo"> MYAO </a> </td></tr><tr> <td style="height:20px;">&nbsp;</td></tr><tr> <td> <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);"> <tr> <td style="height:40px;">&nbsp;</td></tr><tr> <td style="padding:0 35px;"> <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif; margin-bottom: 30px;">You have requested to connect with</h1> <div> <img src="https://i.ibb.co/9HqLq87/avatar.png" height="140px" style="border-radius: 50%; border: 2px solid #eaeaea; padding: 2px"/> </div><div> <h2>${data.connectToUsername}</h2> </div><span style="display:inline-block; vertical-align:middle; margin:0px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span> <p style="color:#455056; font-size:15px;line-height:24px; margin:0;"> Click the link below to setup your account and start connecting </p><a href=${`${AppConfig.siteUrl}/connect?email=${data.user}&token=${data.token}&connectTo=${data.connectToUsername}&connectToId=${data.connectToId}`} style="background:#FB923C;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Connect</a> </td></tr><tr> <td style="height:40px;">&nbsp;</td></tr></table> </td><tr> <td style="height:20px;">&nbsp;</td></tr><tr> <td style="text-align:center;"> <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy;<strong>${AppConfig.siteUrl}</strong></p></td></tr><tr><td style="height:80px;">&nbsp;</td></tr></table> </td></tr></table> </body></html>`;
        
        return {
          text: stringData,
          html: email,
        };
      };

    try {
      await prisma.invitation.create({
        data: { token, email: user, inviterId: connectTo.id, },
      });
    } catch (error) {
      console.error("Error creating invitation:", error);
      res.status(500).json({ error: "Something went wrong." });
    }
    const data = {
      user,
      connectToUsername: connectTo.username,
      connectToId: connectTo.id,
      token,
    };

    try {
      await transporter.sendMail({
        ...mailOptions,
        ...generateEmailContent(data),
        subject: "Sign Up and Connect",
        to: data.user,
      });
      return res.status(200).json({ success: true });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ message: "Bad request" });
    }
  }
}
