import React from "react";
import { BiChevronRight, BiSearch } from "react-icons/bi";
import { User } from "@prisma/client";
import axios from "axios";
import useQuickConnect from "@/hooks/useQuickConnect";
import { FieldValues, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { IoShareSocialOutline } from "react-icons/io5";

const QuickConnect = ({ session }: any) => {
  const [search, setSearch] = React.useState("");
  const connect = useQuickConnect();
  const username = search.toLowerCase();

  const onSearch = () => {
    if (username === session?.user.username) {
      toast.error("You cannot connect with yourself");
      return;
    }
    axios
      .get(`/api/getUserByUsernameApi?username=${username}`)
      .then((res) => {
        connect.onOpen(res.data, session?.user.id, connect.isLoading);
      })
      .catch((err) => {
        console.log("error");
      });
  };

  return (
    <div className="p-6">
      <div className="flex gap-1 items-center">
        <h4 className="">Quick Connect</h4>
      </div>
      <p className="pb-4">Search users by their username. Connect fast!</p>
      <div className="flex">
        <input
          type="text"
          className="flex-1 px-2 py-2 lowercase rounded-l-lg border border-gray-200"
          placeholder="joe7621"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={onSearch}
          className="bg-purple-default px-4 py-2 text-white rounded-r-lg"
        >
          <BiChevronRight />
        </button>
      </div>
    </div>
  );
};

export default QuickConnect;
