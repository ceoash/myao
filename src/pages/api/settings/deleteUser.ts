import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { User } from ".prisma/client";
import bcrypt from "bcrypt";
import axios from "axios";
import { AppConfig } from "@/utils/AppConfig";

interface ErrorResponse {
  error: string;
}

export default async function UpdateProfile(
  req: NextApiRequest,
  res: NextApiResponse<{ id: string } | ErrorResponse>
) {
  const { id } = req.body;

  async function checkUsernameAvailability(
    usernames: string[]
  ): Promise<string[]> {
    return await axios
      .post(AppConfig.siteUrl + "/api/checkUsernames/", usernames)
      .then((response) => {
        const validUsernames = response.data;
        return validUsernames;
      });
  }
  
async function getUsernameSuggestions(username: string): Promise<string[]> {
    function getSuggestion(prefix: string, numSuggestions: number) {
      const suggestions = [];
      for (let i = 0; i < numSuggestions; i++) {
        const maxDigits = 12 - prefix.length;
        const digits = Math.min(maxDigits, 5);
        const randomNum = Math.floor(Math.random() * Math.pow(10, digits));
        suggestions.push(`${prefix}${randomNum}`);
      }
      return suggestions;
    }
  
    let email = username;
    let prefix = email.split("@")[0];
  
    if (!isNaN(parseInt(prefix[0]))) {
      prefix = prefix.substring(1);
    }
  
    prefix = prefix.slice(0, 7);
  
    const checkNames = getSuggestion(prefix, 3);
    return checkUsernameAvailability(checkNames);
  }


  const generateDeleteData = async (id: string) => {

    const username = await getUsernameSuggestions("deleteduser");
    const hashedPassword = await bcrypt.hash("defaultPassword", 10);
    const now = Date.now();
  
    const data = {
      name: "Deleted User",
      email: username[0] + "@myao.life",
      username: username[0],
      hashedPassword: hashedPassword,
      updatedAt: new Date(now),
      verified: false,
      activated: false,
    };
  
    return data;
  }

 

  try {

    const findUser = await prisma.user.findUnique({
      where: { id: id },
      select: { id: true },
    });

    if (!findUser) return res.status(404).json({ error: "User not found" });

    const data = await generateDeleteData(id);

    if(!data) return res.status(500).json({ error: "Something went wrong" });

    const user = await prisma.user.update({
      where: { id: findUser.id },
      data: data,
      select: { id: true },
    });

    const profileExists = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (profileExists) {
      await prisma.profile.delete({
        where: { userId: user.id },
      });
    } else {
      console.log(`No profile found for user ID: ${user.id}`);
    }

    res.status(200).json(user);

  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
}
