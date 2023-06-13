import { timeSince } from "@/utils/formatTime";
import { useEffect, useState, forwardRef } from "react";

type MessageProps = {
  message: any;
  session: any;
  chat?: boolean
};

const ChatMessage = forwardRef<HTMLDivElement, MessageProps>(({ message, session }, ref) => {
  
  const [timeSinceCreated, setTimeSinceCreated] = useState<string | null>(null);

  useEffect(() => {
    setTimeSinceCreated(timeSince(new Date(message.createdAt)));
  }, [message.createdAt]);

  return (
    <div
      key={message.id}
      ref={ref}
      className={`flex gap-2 w-1/2 ${
        message.userId === session.user.id 
        ? "justify-end ml-auto" 
        : "justify-start mr-auto"
        }
      `}
    >
      <div className="flex items-center justify-end h-10 w-10 rounded-full text-white flex-shrink-0">
        <img
          src={message?.user?.profile?.image || "/images/placeholders/avatar.png"}
          className="rounded-full border-2 border-gray-200 p-1"
        />
      </div>
      <div
        className={` py-2 px-4 rounded-lg  ${
          message.userId === session.user.id
            ? " bg-orange-200 text-gray-700"
            : " bg-gray-100 text-gray-700"
        }`}
      >
        <div className="font-bold">
          {message.userId === session.user.id ? "You" : "@"+message.user?.username}
        </div>
        <div>
          {message?.image && (
            <div>
              <img src={message.image} className="w-full" />
            </div>
          )}
          {message?.text && <p>{message.text}</p>}
          <div className="text-xs text-gray-500">
            <i>{timeSinceCreated} ago</i>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ChatMessage;
