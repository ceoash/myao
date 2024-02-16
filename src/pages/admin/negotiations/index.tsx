import React from "react";
import prisma from "@/libs/prismadb";
import { Main } from "@/templates/main";
import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import { BsChevronRight } from "react-icons/bs";
import StatusChecker from "@/utils/status";
import Dropdown, { DropdownItem } from "@/components/Dropdown";
import { BiDotsVerticalRounded } from "react-icons/bi";

const index = ({
  listings,
}: {
  listings: any[];
}) => {

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
            <header className="px-5 pt-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-1">Negotations</h3>
            </header>
            <div className="p-3">
              <div className="overflow-x-auto">
                <table className="table-auto w-full">
                  <thead className="text-xs font-semibold uppercase text-gray-400 bg-gray-50">
                    <tr>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">Item</div>
                      </th>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">Users</div>
                      </th>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">
                          Start Price
                        </div>
                      </th>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">Current Offer</div>
                      </th>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-left">Status</div>
                      </th>
                      <th className="p-2 whitespace-nowrap">
                        <div className="font-semibold text-center">Created</div>
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
                                        ? listing?.seller.username
                                        : listing?.buyer.username}
                                    </h6>
                                  </div>
                                  <span className="px-3">
                                    <BsChevronRight />
                                  </span>
                                  <div className="flex flex-col justify-center">
                                    <h6 className="mb-0 leading-normal text-sm">
                                      {listing.type === "sellerOffer"
                                        ? listing?.buyer.username
                                        : listing?.seller.username}
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
                                  £{listing?.bids[0]?.price || "0"}
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
                              id={listing.status === "disabled" ? "enable" : "disable"}
                              name={listing.status === "disabled" ? "Enable" : "Disable"}
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
    </Dash>
  );
};

export default index;

export const getServerSideProps = async () => {
  const listings = await prisma.listing.findMany({
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
    take: 10,
    orderBy: {
      updatedAt: "desc",
    },
  });

  const transformedlistings = listings.map((model) => {
    return {
      ...model,
      createdAt: model.createdAt.toLocaleString("en-GB"),
      updatedAt: model.updatedAt.toLocaleString("en-GB"),
      seller: model.seller && {
        ...model.seller,
        createdAt: model.seller.createdAt.toString(),
        updatedAt: model.seller.updatedAt.toString(),
      },
      buyer: model.buyer && {
        ...model.buyer,
        createdAt: model?.buyer.createdAt.toString(),
        updatedAt: model?.buyer.updatedAt.toString(),
      },
      bids: [model.bids && model.bids.length > 0 && {
        ...model.bids[0],
        createdAt: model.bids[0].createdAt.toString(),
        updatedAt: model.bids[0].updatedAt.toString(),
      } ] || [],
    };
  });

  return {
    props: { listings: transformedlistings },
  };
};
