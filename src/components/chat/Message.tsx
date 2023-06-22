import { timeInterval, timeSince } from "@/utils/formatTime";
import Link from "next/link";
import { useEffect, useState, forwardRef } from "react";

type MessageProps = {
  message: any;
  session: any;
  chat?: boolean
};

const MessageComponent = forwardRef<HTMLDivElement, MessageProps>(({ message, session, chat }, ref) => {
  const [timeSinceCreated, setTimeSinceCreated] = useState<string | null>(null);

  useEffect(() => {      
    const createdAt = new Date(message.createdAt);
    timeInterval(createdAt, setTimeSinceCreated);
  }, [message.createdAt]);

  return (
    <div
      ref={ref}
      className={`flex gap-2 w-1/2 ${
         message.user.id === session.user.id ? "justify-end ml-auto" : "justify-start mr-auto"
      }`}
    >
      <div className="flex items-center justify-end h-10 w-10 rounded-full text-white flex-shrink-0">
        <img
          src={message?.user?.profile?.image || "/images/placeholders/avatar.png"}
          className="rounded-full border-2 border-gray-200 p-1"
        />
      </div>
      <div
        className={` py-2 px-4 rounded-lg  ${
          message.user.id === session.user.id
            ? " bg-orange-200 text-gray-700"
            : " bg-gray-100 text-gray-700"
        }`}
      >
        <div className="font-bold">
          {message.userId === session.user.id ? "You" : <Link href={`/dashboard/profile/${message.user?.username}`}>{message.user?.username}</Link>}
        </div>
        <div>
          {message?.image && (
            <div>
              <img src={message.image} className="w-full" />
            </div>
          )}
          {message?.text && <p className="text-sm">{message.text}</p>}
          <div className="text-xs text-gray-500">
            <i>{timeSinceCreated} ago</i>
          </div>
        </div>
      </div>
    </div>
  );
});

export default MessageComponent;
