import Image from "next/image";
import Link from "next/link";
import { Session } from "next-auth";

interface MessageCardProps {
    id: string;
    session: Session | null;
    participant1: {
        id: string;
        username: string | null;
        profilePicture?: string;
    }
    participant2: {
        id: string;
        username: string | null;
        profilePicture?: string;
    }
    message: string | null;
}

const MessageCard: React.FC<MessageCardProps> = ({
    id,
    session,
    participant1,
    participant2,
    message,
}) => {
    const otherUser = participant1.id === session?.user.id ? participant2 : participant1;
  return (
    <Link
      href={`/dashboard/conversations?conversationId=${id}`}
      key={id}
    >
      <div className="flex gap-2 items-center rounded-xl pb-6">
        <div className="rounded-full bg-gray-200 w-10 h-10 relative">
            <Image src={otherUser.profilePicture || "/images/placeholders/avatar.png"} alt="" layout="fill" className="rounded-full" />
        </div>
        <div className="flex flex-col">
          <p className="text-sm font-semibold">
            {otherUser.username}
          </p>
          <p className="text-xs text-gray-600 truncate xl:max-w-[280px]">
            {message}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default MessageCard;
