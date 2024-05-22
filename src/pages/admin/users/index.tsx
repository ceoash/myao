import React, { useEffect } from "react";
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
import CreateUserForm from "@/components/forms/CreateUserForm";
import { ImUserPlus } from "react-icons/im";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import EditUserForm from "@/components/forms/EditUserForm";
import Pagination from "@/components/Pagination";
import { BsFilter, BsSearch } from "react-icons/bs";
import { MdFilter } from "react-icons/md";
import { TbFilter, TbUserPlus } from "react-icons/tb";
import { getSession } from "next-auth/react";
import getCurrentUser from "@/actions/getCurrentUser";
import { GetServerSideProps } from "next";

const index = ({
  users,
  pages,
  page,
  limit,
  count,
}: {
  pages: number;
  page: number;
  limit: number;
  count: number;
  users: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    role: string;
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
  const [searchQuery, setSearchQuery] = React.useState("");
  const buttonRef = React.useRef<HTMLDivElement | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement | null>(null);
  const modal = useModal();
  const router = useRouter();
  const params = useSearchParams();
  const search = params.get("search") || "";
  const admin = params.get("admin") || "";

  useEffect(() => {
    setSearchQuery(search);
  }, [search]);

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
    };

    const res = await axios.put(`/api/users`, data);
    if (res.status === 200) {
      router.refresh();
    }
  };

  const enableUser = async (id: string) => {
    const data = {
      id,
      status: "active",
    };

    const res = await axios.put(`/api/users`, data);
    if (res.status === 200) {
      console.log(res);
      router.refresh();
    }
  };

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
              <div>{count || 0} Users</div>
            </header>
            <div>
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3 border rounded ">
                  <input
                    type="text"
                    placeholder="Search Users"
                    className=" p-2 rounded-lg text-sm outline-0 focus:outline-0 ring-0 border-0 focus:ring-0 focus:border-0 "
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    onClick={() =>
                      router.push(`/admin/users?search=${searchQuery}`)
                    }
                    className="px-3"
                  >
                    <BsSearch className="text-gray-500" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm">
                    <input
                      type="checkbox"
                      name="admin"
                      defaultChecked={admin === "true"}
                      onChange={(e) =>
                        e.target.checked
                          ? router.push("/admin/users?admin=true")
                          : router.push("/admin/users")
                      }
                    />{" "}
                    Show admin
                  </label>
                  <div className="relative" ref={buttonRef}>
                    <button
                      type="button"
                      onClick={handleToggle}
                      className="border p-2 hover:bg-gray-50 bg-gray-50 text-gray-500 text-sm rounded-lg flex gap-2 items-center"
                    >
                      <TbFilter />
                      Filter
                    </button>
                    <div
                      ref={dropdownRef}
                      className={`${
                        isOpen ? "block" : "hidden"
                      } absolute right-0 w-48 mt-2 py-2 bg-white rounded-lg shadow-xl border border-gray-200 z-10`}
                    >
                      <MenuItem label="All" onClick={() => setToggle(false)} />
                      <MenuItem
                        label="Active"
                        onClick={() => setToggle(true)}
                      />
                      <MenuItem
                        label="Disabled"
                        onClick={() => setToggle(true)}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="border p-2 hover:bg-gray-50 bg-gray-50 text-gray-500 text-sm rounded-lg flex gap-2 items-center"
                    onClick={() => modal.onOpen("Add User", <CreateUserForm />)}
                  >
                    <TbUserPlus /> Add User
                  </button>
                </div>
              </div>
            </div>
            <div className="p-3">
              <div className="overflow-x-auto">
                <table className="table-auto w-full">
                  <thead className="text-xs font-semibold text-left uppercase text-gray-500 bg-gray-50">
                    <tr>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">Name</div>
                      </th>

                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">Trades</div>
                      </th>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">Status</div>
                      </th>

                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">Last Seen</div>
                      </th>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">Created</div>
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
                                {user.name}{" "}
                                {user.role === "admin" && (
                                  <span className="text-xs text-orange-500 bg-orange-100 border-orange-300">
                                    Admin
                                  </span>
                                )}
                              </Link>
                              <div className="text-left font-normal text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-2 whitespace-nowrap text-center">
                          <div className="text-left font-medium">
                            {user._count.listings}
                          </div>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <div className="text-left font-medium capitalize flex items-center">
                            <span
                              className={`rounded-full w-3 h-3 mr-2  ${
                                user.status === "disabled"
                                  ? "bg-red-400"
                                  : "bg-green-400"
                              }`}
                            ></span>
                            {user.status || "active"}
                          </div>
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
                              onClick={() =>
                                modal.onOpen(
                                  "Edit User",
                                  <EditUserForm user={user} />
                                )
                              }
                            />
                            <DropdownItem
                              id={
                                user.status === "disabled"
                                  ? "enable"
                                  : "disable"
                              }
                              name={
                                user.status === "disabled"
                                  ? "Enable"
                                  : "Disable"
                              }
                              onClick={() =>
                                user.status === "disabled"
                                  ? enableUser(user.id)
                                  : disableUser(user.id)
                              }
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
        <Pagination
          page={page}
          setPage={null}
          pages={pages || null}
          total={count || 0}
          limit={limit || 10}
          model="admin/user"
        />
      </section>
    </Dash>
  );
};

export default index;

export const getServerSideProps: GetServerSideProps<any> = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const currentUser = await getCurrentUser(session);

  if (!currentUser) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  if (currentUser.role !== "admin") {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  const page = Number(context?.query.page) || 1;
  const search = context?.query.search || "";
  const limit = 10;
  let includeAdmin = context?.query.admin === "true" ? true : false;
  let where = {};

  if (search) {
    Object.assign(where, {
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (!includeAdmin) {
    Object.assign(where, {
      role: "user",
    });
  }

  const usersCount = await prisma.user.count({
    where,
  });

  const pages = Math.ceil(usersCount / limit);
  const users = await prisma.user.findMany({
    where,
    take: limit,
    skip: (page - 1) * limit,
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
    props: { users: transformedUsers, pages, page, limit, count: usersCount },
  };
};
