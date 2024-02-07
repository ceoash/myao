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
import { BsChevronRight } from "react-icons/bs";
import { Dash } from "@/templates/dash";
import { Meta } from "@/layouts/meta";
import Dropdown, { DropdownItem } from "@/components/Dropdown";
import { BiDotsVerticalRounded } from "react-icons/bi";
import StatusChecker from "@/utils/status";

interface PageProps {
  session: Session;
  currentUser: any;
  listings: any;
  bids: any;
  stats: {
    highestBid: number;
    lowestBid: number;
  };
  countItems: {
    listingsCount: number;
    activeListingsCount: number;
    bidsCount: number;
    usersCount?: number;
  };
}

const index = ({
  session,
  currentUser,
  listings,
  bids,
  stats: { highestBid, lowestBid },
  countItems: { listingsCount, activeListingsCount, bidsCount, usersCount },
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
            <div className="relative flex flex-col min-w-0 break-words bg-white shadow-soft-xl rounded-2xl bg-clip-border">
              <div className="flex-auto p-4">
                <div className="flex flex-row -mx-3">
                  <div className="flex-none w-2/3 max-w-full px-3">
                    <div>
                      <p className="mb-0 font-sans font-semibold leading-normal text-sm">
                        Total Trades
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
                    <CgShoppingBag className="inline-block w-12 h-12 text-center rounded-lg bg-gradient-to-tl text-gray-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
            <div className="relative flex flex-col min-w-0 break-words bg-white shadow-soft-xl rounded-2xl bg-clip-border">
              <div className="flex-auto p-4">
                <div className="flex flex-row -mx-3">
                  <div className="flex-none w-2/3 max-w-full px-3">
                    <div>
                      <p className="mb-0 font-sans font-semibold leading-normal text-sm">
                        Under Negotiation
                      </p>
                      <h5 className="mb-0 font-bold">
                        {activeListingsCount}
                        <span className="leading-normal text-sm font-weight-bolder text-lime-500">
                          +3%
                        </span>
                      </h5>
                    </div>
                  </div>
                  <div className="px-3 text-right basis-1/3">
                    <MdOutlineShield className="inline-block w-12 h-12 text-center rounded-lg bg-gradient-to-tl text-gray-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:mb-0 xl:w-1/4">
            <div className="relative flex flex-col min-w-0 break-words bg-white shadow-soft-xl rounded-2xl bg-clip-border">
              <div className="flex-auto p-4">
                <div className="flex flex-row -mx-3">
                  <div className="flex-none w-2/3 max-w-full px-3">
                    <div>
                      <p className="mb-0 font-sans font-semibold leading-normal text-sm">
                        Total Offers
                      </p>
                      <h5 className="mb-0 font-bold">
                        {bidsCount}
                        <span className="leading-normal text-red-600 text-sm font-weight-bolder">
                          -2%
                        </span>
                      </h5>
                    </div>
                  </div>
                  <div className="px-3 text-right basis-1/3">
                    <MdOutlinePayments className="inline-block w-12 h-12 text-center rounded-lg bg-gradient-to-tl text-gray-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-full px-3 sm:w-1/2 sm:flex-none xl:w-1/4">
            <div className="relative flex flex-col min-w-0 break-words bg-white shadow-soft-xl rounded-2xl bg-clip-border">
              <div className="flex-auto p-4">
                <div className="flex flex-row -mx-3">
                  <div className="flex-none w-2/3 max-w-full px-3">
                    <div>
                      <p className="mb-0 font-sans font-semibold leading-normal text-sm">
                        Users
                      </p>
                      <h5 className="mb-0 font-bold">
                        {usersCount ? usersCount : "NA"}
                        <span className="leading-normal text-sm font-weight-bolder text-lime-500">
                          +5%
                        </span>
                      </h5>
                    </div>
                  </div>
                  <div className="px-3 text-right basis-1/3">
                    <ImUsers className="inline-block w-12 h-12 text-center rounded-lg bg-gradient-to-tl text-gray-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap mt-6 -mx-3 flex-grow">
          <div className="w-full max-w-full px-3 mt-0 mb-6 lg:mb-0 lg:w-5/12 lg:flex-none">
            <div className="border-black/12.5 shadow-soft-xl relative flex h-full min-w-0 pb-6 flex-col break-words rounded-2xl border-0 border-solid bg-white bg-clip-border">
              <div className="border-black/12.5 mb-0 rounded-t-2xl border-b-0 border-solid bg-white p-6 pb-4">
                <h6 className="text-md">Latest Offers</h6>
                <p className="leading-normal text-sm">
                  <i
                    className="fa fa-arrow-up text-lime-500"
                    aria-hidden="true"
                  ></i>
                  <span className="font-semibold">NA</span> this month
                </p>
              </div>
              {bids.map((bid: any, idx: number) => {
                return (
                  <div className=" w-full px-6 mb-3 last:mb-0" key={idx}>
                    <div className="flex flex-between w-full items-end">
                      <div className="mb-0 p-0 font-semibold w-full text-sm text-slate-700">
                        {bid.listing.title}
                      </div>
                      <h4 className="text-sm text-slate-400">£{bid.price}</h4>
                    </div>
                    <p className=" mb-0 font-semibold leading-tight text-xs text-slate-400">
                      {bid.user.name} - {bid.createdAt}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="w-full max-w-full px-3 mt-0 lg:w-7/12 lg:flex-none">
            <div className="border-black/12.5 shadow-soft-xl relative z-20 flex min-w-0 flex-col break-words rounded-2xl border-0 border-solid bg-white bg-clip-border">
              <div className="border-black/12.5 mb-0 rounded-t-2xl border-b-0 border-solid bg-white p-6 pb-0">
                <h6>Statistics</h6>
                <p className="leading-normal text-sm">
                  <i
                    className="fa fa-arrow-up text-lime-500"
                    aria-hidden="true"
                  ></i>
                  {/* <span className="font-semibold">4% more</span> in 2021 */}
                </p>
              </div>
              <div className="flex-auto p-4">
                <div className="flex flex-grow items-center justify-center text-xs text-gray-500 pb-6">
                  No data to display
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-full flex flex-wrap my-6 -mx-3">
          <div className="w-full max-w-full px-3 mt-0 mb-6 md:mb-0  md:flex-none lg:flex-none">
            <section className="antialiased bg-gray-100 text-gray-600 h-screen px-4 pt-6">
              <div className="flex flex-col  h-full">
                <div className="w-full  mx-auto bg-white  rounded-sm border border-gray-200">
                  <header className="px-5 pt-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800 mb-1">
                      Negotiations
                    </h3>
                  </header>
                  <div className="p-3">
                    <div className="overflow-x-auto">
                      <table className="table-auto w-full">
                        <thead className="text-xs font-semibold uppercase text-gray-400 bg-gray-50">
                          <tr>
                            <th className="p-2 whitespace-nowrap">
                              <div className="font-semibold text-left">
                                Item
                              </div>
                            </th>
                            <th className="p-2 whitespace-nowrap">
                              <div className="font-semibold text-left">
                                Users
                              </div>
                            </th>
                            <th className="p-2 whitespace-nowrap">
                              <div className="font-semibold text-left">
                                Start Price
                              </div>
                            </th>
                            <th className="p-2 whitespace-nowrap">
                              <div className="font-semibold text-left">
                                Current Offer
                              </div>
                            </th>
                            <th className="p-2 whitespace-nowrap">
                              <div className="font-semibold text-left">
                                Status
                              </div>
                            </th>
                            <th className="p-2 whitespace-nowrap">
                              <div className="font-semibold text-center">
                                Created
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-100">
                          {listings.map((listing: any) => {
                            const sellerIcon =
                              listing.type === "buyerOffer"
                                ? "/images/cat.png"
                                : "/images/dog.png";
                            const buyerIcon =
                              listing.type === "buyerOffer"
                                ? "/images/dog.png"
                                : "/images/cat.png";

                            const img = listing.image
                              ? JSON.parse(listing.image)
                              : null;

                            const icon =
                              listing.type === "sellerOffer"
                                ? sellerIcon
                                : buyerIcon;

                            return (
                              <tr key={listing.id}>
                                <td className="p-2 align-middle bg-transparent border-b whitespace-nowrap">
                                  <div className="flex px-2 py-1">
                                    <div>
                                      <img
                                        src={img ? img[0] : icon}
                                        className="inline-flex items-center justify-center mr-4 text-white transition-all duration-200 ease-soft-in-out text-sm h-9 w-9 rounded-xl"
                                        alt="xd"
                                      />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                      <h6 className="mb-0 leading-normal text-sm">
                                        {listing.title}
                                      </h6>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-2 align-middle bg-transparent border-b whitespace-nowrap">
                                  <div className="flex items-center justify-start">
                                    <div className="flex flex-col justify-center">
                                      <h6 className="mb-0 leading-normal text-sm">
                                        {listing.type === "sellerOffer"
                                          ? listing.seller.username
                                          : listing.buyer.username}
                                      </h6>
                                    </div>
                                    <span className="px-3">
                                      <BsChevronRight />
                                    </span>
                                    <div className="flex flex-col justify-center">
                                      <h6 className="mb-0 leading-normal text-sm">
                                        {listing.type === "sellerOffer"
                                          ? listing.buyer.username
                                          : listing.seller.username}
                                      </h6>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-2 leading-normal text-center align-middle bg-transparent border-b text-sm whitespace-nowrap">
                                  <span className="font-semibold leading-tight text-xs">
                                    {" "}
                                    £{listing.price || "0"}
                                  </span>
                                </td>
                                <td className="p-2 leading-normal text-center align-middle bg-transparent border-b text-sm whitespace-nowrap">
                                  <span className="font-semibold leading-tight text-xs">
                                    {" "}
                                  </span>
                                </td>
                                <td className="p-2 align-middle bg-transparent border-b whitespace-nowrap">
                                  <div className="w-3/4 mx-auto">
                                    <div>
                                      <div>
                                        <span className="font-semibold leading-tight text-xs capitalize">
                                          {StatusChecker(listing.status)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-2 leading-normal text-center align-middle bg-transparent border-b text-sm whitespace-nowrap">
                                  <span className="font-semibold leading-tight text-xs">
                                    {" "}
                                    {listing.createdAt}
                                  </span>
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
                                      link={`/admin/negotiations`}
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
            </section>
          </div>
        </div>
        {/*           <footer className="pt-4 text-xs mt-auto">MYAO © 2024 - All Rights Reserved</footer>
         */}{" "}
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

  const usersCount = await prisma.user.count();
  const newUsersCount = await prisma.user.count({
    where: {
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
  });

  const listingsCount = await prisma.listing.count();
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
    take: 5,
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
      seller: {
        ...listing.seller,
        createdAt: listing.seller.createdAt.toLocaleDateString("en-GB"),
        updatedAt: listing.seller.updatedAt.toLocaleDateString("en-GB"),
      },
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
      stats: {
        highestBid: higestBid,
        lowestBid: lowestBid,
      },
      countItems: {
        users: usersCount,
        newUsers: newUsersCount,
        listingsCount: listingsCount,
        activeListingsCount: activeListingsCount,
        bidsCount: bidsCount,
      },
    },
  };
};

export default index;
