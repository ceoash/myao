import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import { GetServerSideProps } from "next";
import getUserById from "@/actions/getUserById";
import prisma from "@/libs/prismadb";

import UserCard from "@/components/widgets/UserCard";
import { BsFillStarFill, BsPostcard } from "react-icons/bs";
import Card from "@/components/dashboard/Card";
import { getSession } from "next-auth/react";
import useMessageModal from "@/hooks/useMessageModal";
import { toast } from "react-hot-toast";
import axios from "axios";
import { use, useEffect, useRef, useState } from "react";
import getCurrentUser from "@/actions/getCurrentUser";
import { Profile, Social, User } from "@prisma/client";
import { Session } from "next-auth";
import useConfirmationModal from "@/hooks/useConfirmationModal";
import InfoCard from "@/components/dashboard/InfoCard";
import Skeleton from "react-loading-skeleton";
import {
  MdHistory,
  MdOutlineCircleNotifications,
  MdOutlineContactPage,
  MdOutlineSwapVerticalCircle,
  MdOutlineTimelapse,
} from "react-icons/md";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaUserFriends,
  FaYoutube,
} from "react-icons/fa";
import { RiProfileLine } from "react-icons/ri";
import Button from "@/components/dashboard/Button";
import catAccept from "@/images/cat-accept.png";
import Image from "next/image";
import useOfferModal from "@/hooks/useOfferModal";
import { useSocket } from "@/hooks/useSocket";
import { useSocketContext } from "@/context/SocketContext";
import { is } from "date-fns/locale";



interface ProfieProps {
 activate: any;
}



const profile = ({ activate }: ProfieProps) => {
  

  return (
    <>
    ACTIVATED 
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const session = await getSession(context);
    const username = context.params?.username;

    if (!session) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    const activate = await prisma?.user.update({
      where: {
        username: username as string,
      },
      data: {
        activated: true,
      },
      select: {
        activated: true,
      },
    });

    return {
      props: {
        activate,
      },
    };
  } catch (error) {
    console.error("Error activating:", error);
    return {
      props: {
        user: null,
        session: null,
      },
    };
  }
};

export default profile;
