import crypto from "crypto";
import prisma from "@/libs/prismadb";
import { mailOptions, transporter } from "@/utils/nodemailer";
import { NextApiRequest, NextApiResponse } from "next";
import { AppConfig } from "@/utils/AppConfig";
import { emailTemplate } from "@/templates/template";
import { IEmailTemplate } from "@/interfaces/authenticated";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any | { error: string }>
) {
  if (req.method === "POST") {
    const {
      listing,
      name,
      body,
      url,
      linkText,
      title,
      email,
      description,
      image,
    } = req.body;
    if (!body || !url || !title || !linkText || !name || !email) {
      return res.status(400).json({ error: "Missing necessary parameters." });
    }

    const data: IEmailTemplate = {
      listing: listing || null,
      name: name as string,
      body: body,
      image: image || null,
      description: description,
      url: url,
      linkText: linkText,
      title: title,
    };

    try {
      await transporter.sendMail({
        ...mailOptions,
        ...emailTemplate(data),
        to: email,
      });
      return res.status(200).json({ success: true });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ message: "Bad request" });
    }
  }
}
