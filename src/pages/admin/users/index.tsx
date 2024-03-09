import React from "react";
import prisma from "@/libs/prismadb";
import { Main } from "@/templates/main";
import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import Image from "next/image";
import MenuItem from "@/components/MenuItem";
import { BiDotsVerticalRounded } from "react-icons/bi";
import Dropdown, { DropdownItem } from "@/components/Dropdown";
import Link from "next/link";
import Button from "@/components/Button";
import useModal from "@/hooks/useModal";
import Input from "@/components/inputs/Input";
import CreateUserForm from "@/components/forms/CreateUserForm";
import { ImUserPlus } from "react-icons/im";
import axios from "axios";
import { useRouter } from "next/navigation";
import EditUserForm from "@/components/forms/EditUserForm";

const index = ({
  users,
}: {
  users: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    profile: {
      image: string;
    };
    _count: {
      listings: number;
      bids: number;
    };
  }[];
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [toggle, setToggle] = React.useState(false);
  const buttonRef = React.useRef<HTMLDivElement | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement | null>(null);
  const modal = useModal();
  const router = useRouter();

  const handleClickOutside = (e: any) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const disableUser = async (id: string) => {
    const data = {
        id,
        status: "disabled",
    }

    const res = await axios.put(`/api/users`, data);
    if(res.status === 200) {
        router.refresh();
    }

    }

  const enableUser = async (id: string) => {
    const data = {
        id,
        status: "active",
    }

    const res = await axios.put(`/api/users`, data);
    if(res.status === 200) {
        console.log(res);
        router.refresh();
    }

    }


  React.useEffect(() => {
    document.addEventListener("click", handleClickOutside, {
      capture: true,
    });
    return () => {
      document.removeEventListener("click", handleClickOutside, {
        capture: true,
      });
    };
  }, []);

  return (
    <Dash
      admin
      meta={
        <Meta
          title="Admin Dashboard"
          description="This is the Make You An Offer Web App"
        />
      }
    >
      <section className="antialiased bg-gray-100 text-gray-600 h-screen px-4 pt-6">
        <div className="flex flex-col  h-full">
          <div className="w-full  mx-auto bg-white  rounded-sm border border-gray-200">
            <header className="px-5 pt-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 mb-0">Users</h3>
              <button type="button" className="border p-2 hover:bg-gray-50 flex gap-2 items-center" onClick={() => modal.onOpen("Add User", <CreateUserForm />)}><ImUserPlus /> Add User</button>
            </header>
            <div className="p-3">
              <div className="overflow-x-auto">
                <table className="table-auto w-full">
                  <thead className="text-xs font-semibold uppercase text-gray-400 bg-gray-50">
                    <tr>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">Name</div>
                      </th>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">Email</div>
                      </th>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">
                          Negotiations
                        </div>
                      </th>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">Status</div>
                      </th>
                    
                    
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-center">
                          Last Seen
                        </div>
                      </th>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-center">Created</div>
                      </th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="p-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 flex-shrink-0 mr-2 sm:mr-3">
                              <Image
                                className="rounded-full"
                                src={user?.profile?.image || "/images/cat.png"}
                                width={40}
                                height={40}
                                alt="profile"
                              />
                            </div>
                            <div className="font-medium text-gray-800">
                              <Link href={`/admin/users/${user.id}`}>
                                {user.name}
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <div className="text-left">{user.email}</div>
                        </td>
                        <td className="p-2 whitespace-nowrap text-center">
                          <div className="text-left font-medium">{user._count.listings}</div>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <div className="text-left font-medium capitalize flex items-center"><span className={`rounded-full w-3 h-3 mr-2  ${user.status === "disabled" ? "bg-red-400" : "bg-green-400"}`}></span>{user.status || "active"}</div>
                        </td>
                  
                        <td className="p-2 whitespace-nowrap">
                          {user.createdAt}
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          {user.createdAt}
                        </td>
                        <td className="relative">
                          <Dropdown
                            right
                            button={
                              <BiDotsVerticalRounded
                                size={22}
                                className="text-gray-500"
                              />
                            }
                          >
                            <DropdownItem
                              id="view"
                              name="View"
                              link={`/admin/users/${user.id}`}
                            />
                            <DropdownItem
                              id="edit"
                              name="Edit"
                              onClick={() => modal.onOpen("Edit User", <EditUserForm user={user} />)}
                            />
                            <DropdownItem
                              id={user.status === "disabled" ? "enable" : "disable"}
                              name={user.status === "disabled" ? "Enable" : "Disable"}
                              onClick={() => user.status === "disabled" ? enableUser(user.id) : disableUser(user.id)}
                            />
                            <DropdownItem
                              id="delete"
                              name="Delete"
                              onClick={() => console.log("clicked")}
                            />
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Dash>
  );
};

export default index;

export const getServerSideProps = async () => {
  const users = await prisma.user.findMany({
    take: 10,
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      profile: true,
      _count: {
        select: { listings: true, bids: true },
      },
    },
  });

  const transformedUsers = users.map((user) => {
    return {
      ...user,
      createdAt: user.createdAt.toDateString(),
      updatedAt: user.updatedAt.toDateString(),
    };
  });

  return {
    props: { users: transformedUsers },
  };
};
