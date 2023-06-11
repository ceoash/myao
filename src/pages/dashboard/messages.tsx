import React from 'react';
import useDirectMessages from '@/hooks/useDirectMessages';
import { useSession } from 'next-auth/react';
import Messages from '@/components/chat/messages';

const MessagesPage = () => {
  const { data: session } = useSession();

  // In this example, I'm assuming that the recipientId is known. 
  // You would replace this with the appropriate recipientId.
  const userId = session?.user.id;

  const recipientId = "12345";



  return (
    <div>
      <h1>Direct Messages</h1>
        <Messages userId={userId} />
    </div>
  );
};

export default MessagesPage;
