import { BsInfo } from "react-icons/bs";
import { CgDanger } from "react-icons/cg";
import { CiChat1, CiCreditCard1, CiSettings, CiShoppingTag, CiUser } from "react-icons/ci";
import { IoShieldOutline, IoWarningOutline } from "react-icons/io5";

export function notificationIcon(type: string) {

    switch (type) {
        case "listing":
          return <div className="rounded-xl p-1 bg-green-50 text-green-400">
          <CiShoppingTag /></div>;
        case "Offer":
          return <div className="rounded-xl p-1 bg-green-50 text-green-400">
          <CiShoppingTag /></div>;
        case "payment":
          return <div className="rounded-xl p-1 bg-purple-50 text-purple-400">
          <CiCreditCard1 /></div>;
        case "conversation":
          return <div className="rounded-xl p-1 bg-blue-50 text-blue-400">
          <CiChat1 /></div>;
        case "offer":
          return <div className="rounded-xl p-1 bg-green-50 text-green-400">
          <CiShoppingTag /></div>;
        case "friend":
           return <div className="rounded-xl p-1 bg-pink-50 text-pink-400">
          <CiUser /></div>;
        case "settings":
           return <div className="rounded-xl p-1 bg-gray-50 text-gray-400">
          <CiSettings /></div>;
        case "alert":
           return <div className="rounded-xl p-1 bg-gray-50 text-gray-400">
          <IoWarningOutline /></div>;
        case "security":
           return <div className="rounded-xl p-1 bg-blue-50 text-blue-400">
          <IoShieldOutline /></div>;
        case "warning":
           return <div className="rounded-xl p-1 bg-red-50 text-red-400">
          <CgDanger /></div>;
          default:
            return <div className="rounded-xl p-1 bg-gray-50 text-gray-400">
            <BsInfo /></div>;
      }

}
export const notificationTextColor = (type: string) => {

    switch (type) {
        case "listing":
          return <div className="rounded-xl p-1 bg-green-50 text-green-400">
          <CiShoppingTag /></div>;
        case "Offer":
          return <div className="rounded-xl p-1 bg-green-50 text-green-400">
          <CiShoppingTag /></div>;
        case "payment":
          return <div className="rounded-xl p-1 bg-purple-50 text-purple-400">
          <CiCreditCard1 /></div>;
        case "conversation":
          return <div className="rounded-xl p-1 bg-blue-50 text-blue-400">
          <CiChat1 /></div>;
        case "offer":
          return <div className="rounded-xl p-1 bg-green-50 text-green-400">
          <CiShoppingTag /></div>;
        case "friend":
           return <div className="rounded-xl p-1 bg-pink-50 text-pink-400">
          <CiUser /></div>;
        case "settings":
           return <div className="rounded-xl p-1 bg-gray-50 text-gray-400">
          <CiSettings /></div>;
        case "alert":
           return <div className="rounded-xl p-1 bg-gray-50 text-gray-400">
          <IoWarningOutline /></div>;
        case "security":
           return <div className="rounded-xl p-1 bg-blue-50 text-blue-400">
          <IoShieldOutline /></div>;
        case "warning":
           return <div className="rounded-xl p-1 bg-red-50 text-red-400">
          <CgDanger /></div>;
          default:
            return <div className="rounded-xl p-1 bg-gray-50 text-gray-400">
            <BsInfo /></div>;
      }

}