import getCurrentUser from "@/actions/getCurrentUser";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import React from "react";
import prisma from "@/libs/prismadb";
import cat from "@/assets/images/cat.jpg";
import { Session } from "next-auth";
import { count } from "console";
import { ImUsers } from "react-icons/im";
import { CgShoppingBag } from "react-icons/cg";
import { MdOutlinePayments, MdOutlineShield } from "react-icons/md";
import Link from "next/link";
import { FaChevronRight } from "react-icons/fa";
import { BsArrowRight, BsChevronRight } from "react-icons/bs";
import { Dash } from "@/templates/dash";
import { Meta } from "@/layouts/meta";
import Dropdown, { DropdownItem } from "@/components/Dropdown";
import { BiChevronRight, BiDotsVerticalRounded } from "react-icons/bi";
import StatusChecker from "@/utils/status";
import { TbCalendar, TbUserCircle } from "react-icons/tb";
import PerformanceChart from "@/components/charts/BarChart";

interface PageProps {
  session: Session;
  currentUser: any;
  listings: any;
  bids: any;
  chartData: any;
  stats: {
    highestBid: number;
    lowestBid: number;
  };
  countItems: {
    activeUsers: number;
    listingsCount: number;
    activeListingsCount: number;
    bidsCount: number;
    usersCount?: number;
    offersThisMonth?: number;
    offersLastMonth?: number;
  };
}

const goals = [
  {
    goal: 400,
  },
  {
    goal: 300,
  },
  {
    goal: 200,
  },
  {
    goal: 300,
  },
  {
    goal: 200,
  },
  {
    goal: 278,
  },
  {
    goal: 189,
  },
  {
    goal: 239,
  },
  {
    goal: 300,
  },
  {
    goal: 200,
  },
  {
    goal: 278,
  },
  {
    goal: 189,
  },
  {
    goal: 349,
  },
];

const index = ({
  session,
  currentUser,
  listings,
  bids,
  chartData,
  stats: { highestBid, lowestBid },
  countItems: {
    listingsCount,
    activeListingsCount,
    bidsCount,
    usersCount,
    offersThisMonth,
    offersLastMonth,
    activeUsers,
  },
}: PageProps) => {
  return (
    <Dash
      admin
      meta={Meta({
        title: "Admin Dashboard",
        description: "This is the Make You An Offer Web App",
      })}
    >
      <div className="w-full px-6 py-6 mx-auto flex flex-col">
        <div className="flex flex-wrap -mx-3">
          <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
            <div className="relative flex flex-col min-w-0 break-words bg-white border shadow-soft-xl rounded-2xl bg-clip-border">
              <div className="flex-auto p-4">
                <div className="flex flex-row -mx-3">
                  <div className="flex-none w-2/3 max-w-full px-3">
                    <div>
                      <p className="mb-0 font-sans font-semibold leading-normal text-sm">
                        Total Trades {session?.user?.role}
                      </p>
                      <h5 className="mb-0 font-bold">
                        {listingsCount}
                        <span className="leading-normal text-sm font-weight-bolder text-lime-500">
                          +55%
                        </span>
                      </h5>
                    </div>
                  </div>
                  <div className="px-3 text-right basis-1/3">
                    <CgShoppingBag className="inline-block w-12 h-12 text-center rounded-lg bg-gradient-to-tl text-orange-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
            <div className="relative flex flex-col min-w-0 break-words bg-white border shadow-soft-xl rounded-2xl bg-clip-border">
              <div className="flex-auto p-4">
                <div className="flex flex-row -mx-3">
                  <div className="flex-none w-2/3 max-w-full px-3">
                    <div>
                      <p className="mb-0 font-sans font-semibold leading-normal text-sm">
                        Under Negotiation
                      </p>
                      <h5 className="mb-0 font-bold">{activeListingsCount}</h5>
                    </div>
                  </div>
                  <div className="px-3 text-right basis-1/3">
                    <MdOutlineShield className="inline-block w-12 h-12 text-center rounded-lg bg-gradient-to-tl text-orange-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
            <div className="relative flex flex-col min-w-0 break-words bg-white border shadow-soft-xl rounded-2xl bg-clip-border">
              <div className="flex-auto p-4">
                <div className="flex flex-row -mx-3">
                  <div className="flex-none w-2/3 max-w-full px-3">
                    <div>
                      <p className="mb-0 font-sans font-semibold leading-normal text-sm">
                        Offers Made This Month
                      </p>
                      <h5 className="mb-0 font-bold">
                        {offersThisMonth ? offersThisMonth : "NA"}
                        <span
                          className={`leading-normal  text-sm font-weight-bolder ml-2 ${
                            ((offersThisMonth || 0) / (offersLastMonth || 1)) *
                              10 >
                            0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {((offersThisMonth || 0) / (offersLastMonth || 1)) *
                            100}
                          %
                        </span>
                      </h5>
                    </div>
                  </div>
                  <div className="px-3 text-right basis-1/3">
                    <MdOutlinePayments className="inline-block w-12 h-12 text-center rounded-lg bg-gradient-to-tl text-orange-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-full px-3 sm:w-1/2 sm:flex-none xl:w-1/4">
            <div className="relative flex flex-col min-w-0 break-words bg-white border shadow-soft-xl rounded-2xl bg-clip-border">
              <div className="flex-auto p-4">
                <div className="flex flex-row -mx-3">
                  <div className="flex-none w-2/3 max-w-full px-3">
                    <div>
                      <p className="mb-0 font-sans font-semibold leading-normal text-sm">
                        Users
                      </p>
                      <h5 className="mb-0 font-bold">
                        {activeUsers ? activeUsers : "none"}
                      </h5>
                    </div>
                  </div>
                  <div className="px-3 text-right basis-1/3">
                    <ImUsers className="inline-block w-12 h-12 text-center rounded-lg bg-gradient-to-tl text-orange-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap mt-6 -mx-3 flex-grow pb-6">
          <div className="w-full max-w-full px-3 mt-0 mb-6 lg:mb-0 lg:w-5/12 lg:flex-none">
            <div className="border-black/12.5 shadow-soft-xl relative flex h-full min-w-0 pb-6 flex-col break-words rounded-2xl border-solid bg-white bg-clip-border border mb-6">
              <div className="border-black/12.5 mb-0 rounded-t-2xl border-b-0 border-solid bg-white p-6 pb-4">
                <h6 className="text-md">Latest Offers</h6>
                <p className="leading-normal text-sm">
                  <i
                    className="fa fa-arrow-up text-green-600"
                    aria-hidden="true"
                  ></i>
                  <span className="font-semibold">NA</span> this month
                </p>
              </div>
              {bids.map((bid: any, idx: number) => {
                return (
                  <Link
                    href={`/trades/${bid.listingId}`}
                    className=" w-full px-6 mb-3 last:mb-0 border-b pb-3"
                    key={idx}
                  >
                    <div className="flex flex-between w-full items-end">
                      <div className="mb-0 p-0 font-semibold w-full text-sm text-gray-700 capitalize">
                        {bid.listing.title}
                      </div>
                      <h4 className="text-sm text-gray-500 flex gap-x-2">
                        <span>£{bid.previous || "0.00"}</span>
                        <span>
                          <BsArrowRight className="inline-block" />
                        </span>
                        <span>£{bid.price}</span>
                      </h4>
                    </div>
                    <p className=" mb-0 font leading-tight text-xs text-gray-500">
                      <span className="pr-2">
                        <TbUserCircle
                          size={14}
                          className="inline-block text-gray-500 pr-1"
                        />
                        {bid.user.username}
                      </span>
                      <span className="pr-2">
                        <TbCalendar
                          size={14}
                          className="inline-block text-gray-500 pr-1"
                        />
                        {bid.createdAt}
                      </span>
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="w-full max-w-full px-3 mt-0 lg:w-7/12 lg:flex-none">
            <div className="border-black/12.5 shadow-soft-xl relative z-20 flex min-w-0 flex-col break-words rounded-2xl  border-solid bg-white bg-clip-border border">
              <div className="border-black/12.5 mb-0 rounded-t-2xl border-b-0 border-solid bg-white">
                <h6 className="px-6 pt-4">Performannce</h6>
                <p className="leading-normal text-sm">
                  <i
                    className="fa fa-arrow-up text-lime-500"
                    aria-hidden="true"
                  ></i>
                  {/* <span className="font-semibold">4% more</span> in 2021 */}
                </p>
              </div>
         
              <div >
                <div className=" w-full flex-1">
                  <PerformanceChart
                    data={chartData}
                    />
                 
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap">
          <div className="w-full max-w-full  mt-0 mb-6 md:mb-0 md:flex-none lg:flex-none">
            <div className="bg-white border rounded-lg">
              <div className="flex flex-col">
                <div className="w-full  mx-auto rounded">
                  <div className="px-4 p-2 pt-4 flex justify-between">
                    <h6 className="text-md text-gray-600">Latest Trades</h6>
                    <div>
                      <Link href="/admin/trades" className="flex gap-2 text-orange-500 hover:text-orange-700 items-center">
                        <span className="text-sm ">
                          View All
                        </span>
                        <BiChevronRight />
                      </Link>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="overflow-x-auto">
                      <table className="table-auto w-full text-left">
                        <thead className="text-xs  uppercase text-gray-500 bg-gray-50">
                        <tr>
                            <th className="p-2 whitespace-nowrap">
                              <div className=" text-left">Item</div>
                            </th>

                            <th className="p-2 whitespace-nowrap">
                              <div className=" text-left">Start Price</div>
                            </th>
                            <th className="p-2 whitespace-nowrap">
                              <div className=" text-left">Current Offer</div>
                            </th>
                            <th className="p-2 whitespace-nowrap">
                              <div className=" text-left">Status</div>
                            </th>
                            <th className="p-2 whitespace-nowrap">
                              <div className=" text-center">Created</div>
                            </th>
                            <th className="p-2 whitespace-nowrap">
                              <div className=" text-center">Last Updated</div>
                            </th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-100">
                          {listings &&
                            listings.map((listing: any) => {
                              const sellerIcon =
                                listing.type === "buyer"
                                  ? "/images/cat.png"
                                  : "/images/dog.png";
                              const buyerIcon =
                                listing.type === "buyer"
                                  ? "/images/dog.png"
                                  : "/images/cat.png";

                              const img = listing.image
                                ? JSON.parse(listing.image)
                                : null;

                              const icon =
                                listing.type === "seller"
                                  ? sellerIcon
                                  : buyerIcon;

                              return (
                                <tr key={listing.id}>
                                  <td className="p-2 align-middle bg-transparent border-b whitespace-nowrap">
                                  <Link  className="flex"href={`/dashboard/trades/${listing.id}`}>
                                      <div>
                                        <img
                                          src={img ? img[0] : icon}
                                          className="inline-flex items-center justify-center mr-4 text-white transition-all duration-200 ease-soft-in-out text-sm h-9 w-9 rounded"
                                          alt="xd"
                                        />
                                      </div>
                                      <div className="flex flex-col justify-center">
                                        <h6 className="mb-0 leading-normal text-md capitalize font-semibold">
                                          {listing.title}
                                        </h6>
                                        <div className="flex items-center justify-start text-gray-500">
                                          <div className="flex flex-col justify-center">
                                            <h6 className="mb-0 leading-normal text-sm ">
                                              {listing.type === "seller"
                                                ? listing?.seller.username
                                                : listing?.buyer.username}
                                            </h6>
                                          </div>
                                          <span className="px-2">
                                            <BsChevronRight />
                                          </span>
                                          <div className="flex flex-col justify-center">
                                            <h6 className="mb-0 leading-normal text-sm">
                                              {listing.type === "seller"
                                                ? listing?.buyer.username
                                                : listing?.seller.username}
                                            </h6>
                                          </div>
                                        </div>
                                      </div>
                                    </Link>
                                  </td>

                                  <td className="p-2 leading-normal  bg-transparent border-b text-sm whitespace-nowrap">
                                    <span className=" leading-tight text-xs">
                                      {" "}
                                      £{listing.price || "0"}
                                    </span>
                                  </td>
                                  <td className="p-2 leading-normal  bg-transparent border-b text-sm whitespace-nowrap">
                                    <span className=" leading-tight text-xs">
                                      {" "}
                                      £{listing?.bids[0]?.price || "0"}
                                    </span>
                                  </td>
                                  <td className="p-2 align-middle bg-transparent border-b whitespace-nowrap">
                                    <span className=" leading-tight text-xs capitalize">
                                      {StatusChecker(listing.status)}
                                    </span>
                                  </td>
                                  <td className="p-2 selection:  bg-transparent border-b text-sm whitespace-nowrap">
                                    <span> {listing.createdAt}</span>
                                  </td>
                                  <td className="p-2  bg-transparent border-b text-sm whitespace-nowrap">
                                    <span> {listing.updatedAt}</span>
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
                                        link={`/admin/trades/${listing.id}`}
                                      />

                                      <DropdownItem
                                        id={
                                          listing.status === "disabled"
                                            ? "enable"
                                            : "disable"
                                        }
                                        name={
                                          listing.status === "disabled"
                                            ? "Enable"
                                            : "Disable"
                                        }
                                        onClick={() => console.log("clicked")}
                                      />
                                      <DropdownItem
                                        id="delete"
                                        name="Delete"
                                        onClick={() => console.log("clicked")}
                                      />
                                    </Dropdown>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dash>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
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

  if(currentUser.role !== "admin") {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  const usersCount = await prisma.user.count();
  const newUsersCount = await prisma.user.count({
    where: {
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
  });

  const listingsCount = await prisma.listing.count();

  const listingsThisMonth = await prisma.listing.count({
    where: {
      createdAt: {
        gte: new Date(new Date().setDate(1)),
      },
    },
  });

  const listingsLastMonth = await prisma.listing.count({
    where: {
      createdAt: {
        gte: new Date(new Date().setDate(1)),
        lt: new Date(new Date().setDate(0)),
      },
    },
  });

  let lastSevenDaysArr = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    lastSevenDaysArr.push(date);
  };

  const offersAmountLastSevenDays = await prisma.bid.findMany({
    where: {
      createdAt: {
        gte: lastSevenDaysArr[6],
      },
    },
  });

  const aggregateAmountsByDay = lastSevenDaysArr.map((day) => {
    const amount = offersAmountLastSevenDays.reduce((acc, bid) => {
      if (bid.createdAt.getDate() === day.getDate()) {
        acc += bid.price;
      }
      return acc;
    }, 0);

    return {
      date: day.toLocaleDateString("en-GB"),
      amount: amount,
    };
  }).reverse();

  const hagglingCount = await prisma.listing.count({
    where: { status: "haggling" },
  });

  const offersThisMonth = await prisma.bid.count({
    where: { createdAt: { gte: new Date(new Date().setDate(1)) } },
  });

  const activeUsersCount = await prisma.user.count({
    where: {
      status: "active",
    },
  });

  const activeListingsCount = await prisma.listing.count({
    where: {
      status: {
        notIn: [
          "COMPLETED",
          "CANCELLED",
          "EXPIRED",
          "completed",
          "cancelled",
          "expired",
        ],
      },
    },
  });

  const listings = await prisma.listing.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      seller: true,
      buyer: true,
      bids: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          price: true,
        },
      },
    },
    take: 5,
  });

  const higestBid = await prisma.bid.findFirst({
    orderBy: {
      price: "desc",
    },
    select: {
      price: true,
    },
  });

  const lowestBid = await prisma.bid.findFirst({
    orderBy: {
      price: "asc",
    },
    select: {
      price: true,
    },
  });

  const bidsCount = await prisma.bid.count();
  const bids = await prisma.bid.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
      listing: {
        select: {
          title: true,
          id: true,
        },
      },
    },
    take: 3,
  });

  const transformBids = bids.map((bid) => {
    return {
      ...bid,
      createdAt: bid.createdAt.toLocaleDateString("en-GB"),
      updatedAt: bid.updatedAt.toLocaleDateString("en-GB"),
      user: {
        ...bid.user,
        createdAt: bid.user.createdAt.toLocaleDateString("en-GB"),
        updatedAt: bid.user.updatedAt.toLocaleDateString("en-GB"),
      },
    };
  });

  const transformListings = listings.map((listing) => {
    return {
      ...listing,
      createdAt: listing.createdAt.toLocaleDateString("en-GB"),
      updatedAt: listing.updatedAt.toLocaleDateString("en-GB"),
      seller: listing.seller
        ? {
            ...listing.seller,
            createdAt: listing.seller.createdAt.toLocaleDateString("en-GB"),
            updatedAt: listing.seller.updatedAt.toLocaleDateString("en-GB"),
          }
        : null,
      buyer: listing.buyer
        ? {
            ...listing.buyer,
            createdAt: listing.buyer.createdAt.toLocaleDateString("en-GB"),
            updatedAt: listing.buyer.updatedAt.toLocaleDateString("en-GB"),
          }
        : null,
    };
  });

  return {
    props: {
      session,
      currentUser,
      listings: transformListings,
      bids: transformBids,
      chartData: aggregateAmountsByDay,
      stats: {
        highestBid: higestBid,
        lowestBid: lowestBid,
      },
      countItems: {
        activeUsers: activeUsersCount,
        users: usersCount,
        newUsers: newUsersCount,
        listingsCount: listingsCount,
        activeListingsCount: activeListingsCount,
        bidsCount: bidsCount,
        offersThisMonth: offersThisMonth,
        offersLastMonth: offersThisMonth,
      },
    },
  };
};

export default index;
