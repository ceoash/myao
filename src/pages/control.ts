import getConversationsByUserId from "@/actions/getConversationsByUserId";
import prisma from "@/libs/prismadb";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

const Control = ({}) => {
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        const conversations = await prisma.conversation.findMany({
            select: {
                id: true,
                participant1Id: true,
                participant2Id: true,
            },
        });

        if (!conversations) {
            return {
                props: {
                    session: null,
                },
            };
        }

        for (const conversation of conversations) {
            await prisma.directMessage.updateMany({
                where: {
                    conversationId: conversation.id,
                    userId: conversation.participant1Id,
                },
                data: { receiverId: conversation.participant2Id },
            });

            await prisma.directMessage.updateMany({
                where: {
                    conversationId: conversation.id,
                    userId: conversation.participant2Id,
                },
                data: { receiverId: conversation.participant1Id },
            });
        }
    } catch (error) {
        console.error("Error updating message:", error);
    }

    return {
        props: {
            session: null,
        },
    };
};




export default Control
  
