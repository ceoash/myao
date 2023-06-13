import React from "react";
import { BiSearch } from "react-icons/bi";
import { User } from "@prisma/client";
import axios from "axios";
import useQuickConnect from "@/hooks/useQuickConnect";

const QuickConnect = ({session}: any) => {

    const [search, setSearch] = React.useState("");
    const [user, setUser] = React.useState<User | null>(null);

    const connect = useQuickConnect()

    const onSearch = () => {
        axios.get(`/api/getUserByUsernameApi?username=${search}`)
        .then((res) => {
            setUser(res.data);
            connect.onOpen(res.data, session.user.id);
            console.log(user);
        })
        .catch((err) => {
            console.log("error");
        });
    };

  return (
    <div className="py-6">
      <h5 className="mb-4">Quick Connect</h5>
      <div className="flex border-2 border-gray-200 rounded-r-md">
        <input type="text" 
            className="flex-1 px-2" 
            placeholder="Enter MYAO name to connect"
            value={search}
            onChange={(e) => setSearch(e.target.value)} 
        />
        <button onClick={onSearch} className="bg-orange-500 p-2 text-white rounded-r-md"><BiSearch /></button>
      </div>
      
    </div>
  );
};

export default QuickConnect;
