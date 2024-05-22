import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { DashListing } from "@/interfaces/authenticated";
import Offers from "@/components/offers/Offers";
import getAllOffersByUserId from "@/actions/dashboard/getAllOffersByUserId";
import prisma from "@/libs/prismadb";
import Pagination from "@/components/Pagination";
import { sk } from "date-fns/locale";
import { BsChevronRight } from "react-icons/bs";
import Image from "next/image";
import { ImSortAmountAsc, ImSortAmountDesc } from "react-icons/im";
import Link from "next/link";
import StatusChecker from "@/utils/status";
import getCurrentUser from "@/actions/getCurrentUser";

interface IndexProps {
  session: any;
  listings: DashListing[];
  orderBy: string;
  sortBy: string;
  defaultTab?: string;
  tradesCount: number;
  pages: number;
  page: number;
  limit: number;
}

const Index = ({
  tradesCount,
  pages,
  page,
  limit,
  listings,
  session,
  defaultTab,
  orderBy,
  sortBy,
}: IndexProps) => {
  const sortDesc = <ImSortAmountDesc className="inline ml-1 text-gray-500" />;
  const sortAsc = <ImSortAmountAsc className="inline ml-1 text-gray-500" />;
  return (
    <Dash
     admin
      meta={
        <Meta title="Offers" description="View your offers and manage them" />
      }
    >
      <div className="px-6 pt-4">
        <div className=" bg-white rounded px-4">
          <div className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3>Trades</h3>
            </div>
            {listings && listings.length > 0 ? (
              <table className="text-left w-full font-normal">
                <thead className="borde">
                  <tr>
                    <th className="p-2">Item</th>
                    <th className="p-2">
                      <Link
                        href={`/dashboard/trades?orderBy=price&sort=${
                          orderBy === "price" && sortBy === "desc"
                            ? "asc"
                            : sortBy === "asc"
                            ? "desc"
                            : "asc"
                        }`}
                      >
                        Start Price{" "}
                        {orderBy === "price"
                          ? sortBy === "asc"
                            ? sortAsc
                            : sortDesc
                          : null}
                      </Link>
                    </th>
                    <th className="p-2">
                      <Link
                        href={`/dashboard/trades?orderBy=currentOffer&sort=${
                          orderBy === "currentOffer" && sortBy === "desc"
                            ? "asc"
                            : sortBy === "asc"
                            ? "desc"
                            : "asc"
                        }`}
                      >
                        Current Offer{" "}
                        {orderBy === "currentOffer"
                          ? sortBy === "asc"
                            ? sortAsc
                            : sortDesc
                          : null}
                      </Link>
                    </th>
                    <th className="p-2">
                      <Link
                        href={`/dashboard/trades?orderBy=status&sort=${
                          orderBy === "status" && sortBy === "desc"
                            ? "asc"
                            : sortBy === "asc"
                            ? "desc"
                            : "asc"
                        }`}
                      >
                        Status{" "}
                        {orderBy === "status"
                          ? sortBy === "asc"
                            ? sortAsc
                            : sortDesc
                          : null}
                      </Link>
                    </th>
                    <th className="p-2">
                      <Link
                        href={`/dashboard/trades?orderBy=createdAt&sort=${
                          orderBy === "createdAt" && sortBy === "desc"
                            ? "asc"
                            : sortBy === "asc"
                            ? "desc"
                            : "asc"
                        }`}
                      >
                        Created{" "}
                        {orderBy === "createdAt"
                          ? sortBy === "desc"
                            ? sortAsc
                            : sortDesc
                          : null}
                      </Link>
                    </th>
                    <th className="p-2">
                      <Link
                        href={`/dashboard/trades?orderBy=updatedAt&sort=${
                          orderBy === "updatedAt" && sortBy === "desc"
                            ? "asc"
                            : sortBy === "asc"
                            ? "desc"
                            : "asc"
                        }`}
                      >
                        Last Updated{" "}
                        {!orderBy || orderBy === "updatedAt"
                          ? sortBy === "asc"
                            ? sortAsc
                            : sortDesc
                          : null}
                      </Link>
                    </th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {listings.map((listing) => (
                    <tr key={listing.id}>
                      <td className="p-2 ">
                        <Link className="flex" href={`/dashboard/trades/${listing.id}`}>
                        <div className="pr-4">
                          <Image
                            src={
                              listing.image
                                ? JSON.parse(listing.image)[0]
                                : "/images/cat.png"
                            }
                            alt={listing.title || "item"}
                            className="w-10 h-10 rounded-lg"
                            width={40}
                            height={40}
                          />
                        </div>
                        <div>
                          {listing.title}
                          <div className="flex items-center justify-start text-gray-500">
                            <div className="flex flex-col justify-center">
                              <h6 className="mb-0 leading-normal text-sm ">
                                {listing.type === "seller"
                                  ? listing?.seller.username === session?.user?.username ? "You" : listing?.seller.username
                                  : listing?.buyer.username === session?.user?.username ? "You" : listing?.buyer.username}
                              </h6>
                            </div>
                            <span className="px-2">
                              <BsChevronRight size={10} />
                            </span>
                            <div className="flex flex-col justify-center">
                              <h6 className="mb-0 leading-normal text-sm">
                                {listing.type === "seller"
                                  ? listing?.buyer.username === session?.user?.username ? "You" : listing?.buyer.username
                                  : listing?.seller.username === session?.user?.username ? "You" : listing?.seller.username} 
                              </h6>
                            </div>
                          </div>
                        </div>
                        </Link>
                      </td>
                      <td className="p-2">£{Number(listing.price)}</td>
                      <td className="p-2">£{listing.bids[0].price ? Number(listing.bids[0].price) : "0.00"}</td>
                      <td className="p-2">{StatusChecker(listing.status)}</td>
                      <td className="p-2">{listing.createdAt}</td>
                      <td className="p-2">{listing.updatedAt}</td>
                      <td className="p-2"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center text-gray-600">
                <p>No trades found</p>
              </div>
            )}
          </div>
          <Pagination
            total={tradesCount || 0}
            page={page || 1}
            limit={limit || 10}
            pages={pages || 1}
            model="admin/trade"
          />
        </div>
      </div>
    </Dash>
  );
};

export const getServerSideProps: GetServerSideProps<any> = async (context) => {
  try {
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

    if(session?.user.role !== "admin") {
      return {
        redirect: {
          destination: "/dashboard",
          permanent: false,
        },
      };
    }

    const id = context.query?.id ?? null;
    const page = Number(context.query.page) || 1;
    const limit = 5;
    const status = context.query.status || "all";
    const orderBy = context.query.orderBy || "updatedAt";
    const sortBy = context.query.sort || "desc";
  
    let where = {
      
    };

    if (status !== "all") Object.assign(where, { status });

    const tradesCount = await prisma.listing.count({
      where,
    });
    let query = "";

    const pages = Math.ceil(tradesCount / limit);
    let orderByObj = {};
    if (orderBy === "currentOffer") {
    } else {
      orderByObj = {
        [orderBy as string]: sortBy,
      };
    }

    if (!session) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    const skip = (page - 1) * limit;

    const fetchSortedListings = async (
      userId: string,
      limit: number | string,
      skip: number | string
    ) => {
      const rawData = await prisma.listing.findMany({
        where,
        include: {
          seller: {
            select: {
              name: true,
              id: true,
              role: true,
              createdAt: true,
              username: true,
            },
          },
          buyer: {
            select: {
              name: true,
              id: true,
              role: true,
              createdAt: true,
              username: true,
            },
          },
          bids: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      });

      const listingsArr = rawData.map((model: any) => {
        return {
          ...model,
          createdAt: model?.createdAt?.toLocaleString("en-GB") || "",
          updatedAt: model?.updatedAt?.toLocaleString("en-GB") || "",
          seller: model.seller && {
            ...model.seller,
            createdAt: model?.seller?.createdAt?.toLocaleString("en-GB") || "",
            updatedAt: model?.seller?.updatedAt?.toLocaleString("en-GB") || "",
          },
          buyer: model.buyer && {
            ...model.buyer,
            createdAt: model?.buyer?.createdAt?.toLocaleString("en-GB") || "",
            updatedAt: model?.buyer?.updatedAt?.toLocaleString("en-GB") || "",
          },
          bid:
            model.bids && model.bids.length > 0
              ? {
                  ...model?.bids[0],
                  createdAt:
                    model?.bids[0]?.createdAt?.toLocaleString("en-GB") || "",
                  updatedAt:
                    model?.bids[0]?.updatedAt?.toLocaleString("en-GB") || "",
                }
              : null,
        };
      });

      const listings = listingsArr.sort((a, b) => {
        if (sortBy === "asc") return (a.bid?.price || 0) - (b.bid?.price || 0);
        return (b.bid?.price || 0) - (a.bid?.price || 0);
      });

      const paginatedListings = listings.slice(Number(skip), Number(skip) + Number(limit));

      return paginatedListings;
    };

    const fetchListings =
      orderBy && orderBy === "currentOffer"
        ? await fetchSortedListings(session?.user.id, limit, skip)
        : await prisma.listing.findMany({
            orderBy: orderByObj,
            where,
            include: {
              seller: true,
              buyer: true,
              bids: {
                orderBy: {
                  createdAt: "desc",
                },
                take: 1,
              },
            },
            take: limit,
            skip: skip,
          });

    const transformedListings = fetchListings.map((model: any) => {
      return {
        ...model,
        createdAt: model?.createdAt?.toLocaleString("en-GB") || "",
        updatedAt: model?.updatedAt?.toLocaleString("en-GB") || "",
        seller: model.seller && {
          ...model.seller,
          createdAt: model?.seller?.createdAt?.toLocaleString("en-GB") || "",
          updatedAt: model?.seller?.updatedAt?.toLocaleString("en-GB") || "",
        },
        buyer: model.buyer && {
          ...model.buyer,
          createdAt: model?.buyer?.createdAt?.toLocaleString("en-GB") || "",
          updatedAt: model?.buyer?.updatedAt?.toLocaleString("en-GB") || "",
        },
        bids:
          [
            model.bids &&
              model.bids.length > 0 && {
                ...model?.bids[0],
                createdAt:
                  model?.bids[0]?.createdAt?.toLocaleString("en-GB") || "",
                updatedAt:
                  model?.bids[0]?.updatedAt?.toLocaleString("en-GB") || "",
              },
          ] || [],
      };
    });

    console.log(transformedListings.map((listing) => listing.bids));

    if (!transformedListings) {
      return {
        props: {
          listings: [],
          session,
        },
      };
    }

    return {
      props: {
        tradesCount,
        orderBy,
        sortBy,
        pages,
        limit,
        page,
        listings: transformedListings,
        session,
        id,
      },
    };
  } catch (error) {
    console.error("Error fetching listings:", error);
    return {
      props: {
        listings: [],
      },
    };
  }
};

export default Index;
