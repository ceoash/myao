import { GetServerSideProps } from 'next';
import prisma from "@/libs/prismadb";

const Conversations = ({ conversations }: any) => {
  return (
    <div>
      <h1>Conversations</h1>
      {conversations.map((conversation: any) => (
        <div key={conversation.id}>
          <h2>Conversation ID: {conversation.id}</h2>
          <p>User ID: {conversation.userId}</p>
          <p>Recipient ID: {conversation.recipientId}</p>
          <ul>
            {conversation.directMessages.map((message: any) => (
              <li key={message.id}>Message: {message.text}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const conversations = await prisma.conversation.findMany({
    include: {
      directMessages: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    props: {
      conversations,
    },
  };
};

export default Conversations;
