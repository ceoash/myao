import { notificationIcon } from '@/utils/checkers';
import { timeInterval } from '@/utils/formatTime';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { BsInfo } from 'react-icons/bs';
import { CgDanger } from 'react-icons/cg';
import { CiChat1, CiCreditCard1, CiInboxIn, CiSettings, CiShoppingTag, CiUser } from 'react-icons/ci';
import { IoShieldOutline, IoWarningOutline } from 'react-icons/io5';

interface NotificationCardProps {
    id: string;
    type: string;
    message: string;
    userId: string;
    createdAt: string;
    action: string;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
    id,
    type,
    message,
    userId,
    createdAt,
    action
}) => {
    const [timeSinceCreated, setTimeSinceCreated] = useState<string | null>(null);

    useEffect(() => {
      if (createdAt) {
        const time = new Date(createdAt);
        timeInterval(time, setTimeSinceCreated);
      }
    }, [createdAt]);

    let icon;

    switch (type) {
      case "listing":
       icon = <div className="rounded-xl p-1 bg-green-50 text-green-400">
        <CiShoppingTag /></div>;
        break;
      case "Offer":
       icon = <div className="rounded-xl p-1 bg-green-50 text-green-400">
        <CiShoppingTag /></div>;
        break;
      case "payment":
       icon = <div className="rounded-xl p-1 bg-purple-50 text-purple-400">
        <CiCreditCard1 /></div>;
        break;
      case "conversation":
       icon = <div className="rounded-xl p-1 bg-blue-50 text-blue-400">
        <CiChat1 /></div>;
        break;
      case "offer":
       icon = <div className="rounded-xl p-1 bg-green-50 text-green-400">
        <CiShoppingTag /></div>;
        break;
      case "friend":
        icon = <div className="rounded-xl p-1 bg-pink-50 text-pink-400">
        <CiUser /></div>;
        break;
      case "settings":
        icon = <div className="rounded-xl p-1 bg-gray-50 text-gray-400">
        <CiSettings /></div>;
        break;
      case "alert":
        icon = <div className="rounded-xl p-1 bg-gray-50 text-gray-400">
        <IoWarningOutline /></div>;
        break;
      case "security":
        icon = <div className="rounded-xl p-1 bg-blue-50 text-blue-400">
        <IoShieldOutline /></div>;
        break;
      case "warning":
        icon = <div className="rounded-xl p-1 bg-red-50 text-red-400">
        <CgDanger /></div>;
        break;
        default:
         icon = <div className="rounded-xl p-1 bg-gray-50 text-gray-400">
          <BsInfo /></div>;
          break;
    }
  
  return (
    <Link href={action || '#'} className="flex gap-3 items-start">
                {icon}
                <div>
                  <p className="text-sm text-gray-800 truncate xl:max-w-[150px]">{message}</p>
                  <div className="text-gray-600 text-xs">{timeSinceCreated}</div>
                </div>
              </Link>
  )
}

export default NotificationCard