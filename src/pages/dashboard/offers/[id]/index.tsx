import getBidByID from "@/actions/getBidByID";
import ListingChat from "@/components/chat/ListingChat";
import PriceWidget from "@/components/widgets/PriceWidget";
import useSearchModal from "@/hooks/useSearchModal";
import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import { GetServerSideProps } from "next";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import useDeleteConfirmationModal from "@/hooks/useDeleteConfirmationModal";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { useRouter } from "next/navigation";
import StatusChecker from "@/utils/status";
import { useQRCode } from "next-qrcode";
import { toast } from "react-hot-toast";
import "react-datepicker/dist/react-datepicker.css";
import SetExpiryDate from "@/components/SetExpiryDate";
import { format } from "date-fns";
import { IoThumbsUp } from "react-icons/io5";
import axios from "axios";
import { AppConfig } from "@/utils/AppConfig";
import { BsHandThumbsUp } from "react-icons/bs";
import { AiFillWarning } from "react-icons/ai";
import { BiTrash } from "react-icons/bi";
import Link from "next/link";
import { io, Socket } from "socket.io-client";

const Index = ({ listing }: any) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const SearchModal = useSearchModal();
  const DeleteListing = useDeleteConfirmationModal();
  const router = useRouter();
  const { Canvas } = useQRCode();
  const [status, setStatus] = useState<string | null>(listing.status);

  const handleEditListing = () => {
    router.push(`/dashboard/editListing/${listing.id}`);
  };

  useEffect(() => {
    if (status === "pending") {
      setDisabled(true);
    }
    if (status === "awaiting approval") {
      setDisabled(true);
    }
    if (status === "accepted") {
      setDisabled(true);
    }
  }, [listing]);

  const socketRef = useRef<Socket>();

  useEffect(() => {
  socketRef.current = io('http://localhost:3001');

  return () => {
    socketRef.current?.disconnect();
  };
  }, []);

  const { data: session } = useSession();

  const [bidPrice, setBidPrice] = useState<string | null>(
    listing?.bid ? 
    listing.bid : 
    listing?.price
  );

  const [bidder, setBidder] = useState<any>(listing.bidder);

  console.log("new bidder", bidder);

  const handleBidPriceChange = (updatedBidPrice: string | null) => {
    setBidPrice(updatedBidPrice);

    setBidder((prevBidder: any) => {
      const updatedBidderValue = { ...prevBidder, bid: updatedBidPrice };
      socketRef.current?.emit('update_bidder', updatedBidderValue);
      return updatedBidderValue;
    });

    socketRef.current?.emit('update_bidPrice', {
      newBidPrice: updatedBidPrice,
      listingId: listing.id,
      updatedBidder: bidder,
    });
    
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${AppConfig.siteUrl || "localhost:3000"}/dashboard/offers/${listing.id}`
    );
    toast.success("Link copied to clipboard");
  };

  const handleDownloadQR = () => {
    const qrCodeElement = document.querySelector("canvas");

    if (!qrCodeElement) {
      return;
    }

    html2canvas(qrCodeElement).then((canvas) => {
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, "qr-code.png");
        }
      });
    });
  };

  const handleStatusChange = async (status: string) => {
    await axios
      .put(`/api/updateListing/status`, {
        status: status,
        listingId: listing.id,
      })
      .then(() => {
        toast.success("Offer created successfully!");
        router.push(`/dashboard/offers/${listing.id}`);
        setStatus(status);

        socketRef.current?.emit('update_status', {
          newStatus: status,
          listingId: listing.id,
        });
      })
      .catch((err) => {
        console.log("Something went wrong!");
      })
      .finally(() => {});
  };

  useEffect(() => {
    socketRef.current = io('http://localhost:3001');
    socketRef.current.emit('join_room', listing.id);

    socketRef.current.on('update_bidPrice', ({ newBidPrice, listingId, updatedBidder }) => {
      if (listingId === listing.id) {
        console.log(`Received bid price update for listing ${listingId}: ${newBidPrice}`);
        setBidPrice(newBidPrice);
        setBidder(updatedBidder);
      }
    });

    socketRef.current.on('update_bidder', (updatedBidder) => {
      if (updatedBidder.listingId === listing.id) {
        console.log(`Received bidder update for listing ${updatedBidder.listingId}: ${updatedBidder}`);
        setBidder(updatedBidder);
      }
    });

    socketRef.current.on('update_status', ({ newStatus, listingId }) => {
      if (listingId === listing.id) {
        console.log(`Received status update for listing ${listingId}: ${newStatus}`);
        setStatus(newStatus);
      }
    });
  
    return () => {
      socketRef.current?.emit('leave_room', listing.id);
      socketRef.current?.off('update_bidPrice');
      socketRef.current?.off('update_status');
      socketRef.current?.disconnect();
    };
  }, [listing.id]);

  useEffect(() => {
    setBidder(listing.bidder);
  }, [listing.bidder]);
  
  return (
    listing && (
      <Dash meta={<Meta title="" description="" />}>
        <div className=" px-4 py-10 lg:py-10 mx-auto xl:grid xl:grid-cols-12 gap-6">
          {status === "complete" && (
            <div className="col-span-12 flex items-center justify-between p-4 mb-8 text-sm font-semibold text-white bg-green-600 rounded-lg shadow-md focus:outline-none focus:shadow-outline-purple">
              <div className="flex items-center  ">
                <BsHandThumbsUp />
                <div>This offer is complete</div>
              </div>
              <span>View more →</span>
            </div>
          )}
          {status === "rejected" && (
            <div className="col-span-12 flex items-center justify-between p-4 mb-8 text-sm font-semibold text-white bg-red-600 rounded-lg shadow-md focus:outline-none focus:shadow-outline-purple">
              <div className="flex items-center">
                <AiFillWarning />
                <div>This offer has been rejected</div>
              </div>
              <span>View more →</span>
            </div>
          )}
          {status === "pending" && session?.user.id === listing?.buyerId && (
            <div
              className="col-span-12 flex flex-col md:flex-row md:items-center md:justify-between p-4 mb-8 text-sm font-semibold text-white bg-gray-600 rounded-lg shadow-md focus:outline-none focus:shadow-outline-purple"
              onClick={(e) => {
                e.preventDefault();
                SearchModal.onOpen(listing.id, setSellerId, setStatus);
              }}
            >
              <div className="flex items-start md:items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span>Assign a seller to start negotiating</span>
              </div>
              <span className="ml-auto  md:ml-0">Assign user →</span>
            </div>
          )}

          <div className="col-span-12 flex border-b border-gray-200 font-bold font-xl gap-4 uppercase mb-6 xl:mb-0">
            {/* <div className="border-b-4 border-orange-500">Activity</div> */}
            <div className="border-b-4 border-orange-500">Details</div>
          </div>

          <div className="w-full col-span-8 xl:col-span-9 ">
            <div className=" mx-auto flex flex-col bg-white border border-gray-200 rounded-t-md">
              <div className="hidden md:flex aspect-w-16 aspect-h-9 = justify-center">
                <img
                  alt="MYAO listing image"
                  className="object-center object-contain lg:object-scale-down w-full h-full max-h-96"
                  src={
                    listing?.image ? listing.image : "/images/cat.png"
                  }
                />
              </div>

              <hr className="hidden md:flex border-t border-white" />
              <div className=" w-full mt-6 lg:mt-0 ">
                <div className="hidden md:block px-6 pt-6 bg-gray-100 border-b pb-6 border-gray-200">
                  <div className="md:flex md:justify-between">
                    <div>
                      <div className="text-gray-900 text-xl  md:text-2xl  font-medium  px-4 lg:px-0">
                        {listing.title}
                      </div>
                      <div className="  text-gray-500 px-4 lg:px-0">
                        {listing.category}
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <div className="text-right text-sm">
                        Bid by <Link href={`/dashboard/profile/${listing.bidder.id}`} className="underline">{listing.bidder.username}</Link> 
                      </div>
                      <div className="font-extrabold text-3xl text-right -mt-2">
                        £ {bidPrice ? bidPrice : listing.bid}
                      </div>
                    </div>
                  </div>

                  <p className="leading-relaxed p-4 mt-2 lg:p-0">
                    {listing.description}
                  </p>
                </div>
                <div className="messages">
                  {status === "negotiating" && (
                    <ListingChat
                      listing={listing}
                      user={session?.user}
                      disabled={disabled}
                      session={session}
                    />
                  )}
                  {status === "accepted" && (
                    <div className="w-full  p-4 white border-l-4 border-orange-500">
                      <div>
                        Your offer has been accepted. If you need to contact the{" "}
                        {listing.buyerId === session?.user?.id
                          ? "seller"
                          : "buyer"}{" "}
                        seller{" "}
                        <span className="text-orange-400 underline cursor-pointer">
                          click here
                        </span>
                      </div>
                    </div>
                  )}
                  {status === "awaiting approval" && (
                    <div className="w-full  p-4 white border-l-4 border-orange-500">
                      {listing.sellerId === session?.user?.id ? (
                        <div>
                          Your offer has been created. A request has been sent
                          to the buyer.{" "}
                        </div>
                      ) : (
                        <div>
                          You have received a offer. To start negotiating.{" "}
                          <span className="text-orange-400 underline cursor-pointer">
                            click here
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  {status === "pending" &&
                    session?.user.id === listing?.seller?.id && (
                      <div
                        className="w-full  p-4 white border-l-4 border-orange-500"
                        onClick={(e) => {
                          e.preventDefault();
                          SearchModal.onOpen(
                            listing.id,
                            setSellerId,
                            setStatus
                          );
                        }}
                      >
                        <div>
                          Your offer has been created. Assign a user to start
                          negotiating{" "}
                          <span className="text-orange-400 underline cursor-pointer">
                            click here
                          </span>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full md:col-span-4 xl:col-span-3 flex flex-col gap-4 mt-6 lg:mt-0">
            <div className="border border-gray-200 rounded p-6 bg-white md:flex xl:flex-col gap-6">
              <div className="w-full md:flex md:gap-2  md:w-1/3  xl:w-full">
                <div className="w-full xl:w-1/3 xl:full aspect-video mb-4">
                  <img
                    src={listing?.image ? listing.image : "/images/cat.png"}
                    alt="user"
                    width="100%"
                    height="100%"
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="hidden xl:flex flex-col">
                  <p className="font-medium mt-1">{listing.title}</p>
                  <div className="my-2 text-sm">
                    {StatusChecker(listing.status)}
                  </div>
                </div>
              </div>
              <div className="w-full">
                <div className=" xl:hidden">
                  <p className="mb-2 font-medium text-lg">{listing.title}</p>
                  <div className="flex justify-between mb-2">
                    <p className="font-bold">Status</p>
                    <div className="">
                      <div className="">{StatusChecker(listing.status)}</div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mb-2">
                  <p className="font-bold">Offer Price</p>
                  <div className="flex items-center gap-1 font-extrabold">
                    £ {listing.price}
                  </div>
                </div>
                <div className="flex justify-between mb-2">
                  <p className="font-bold">Current Bid</p>
                  <div className="flex items-center gap-1 font-extrabold">
                    £ {bidPrice ? bidPrice : listing.bid}
                  </div>
                </div>

                <div className="">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <p className="font-bold">Created</p>

                      <span className="title-font">
                        {format(
                          new Date(listing.createdAt),
                          "MM/dd/yyyy, HH:mm:ss"
                        )}
                      </span>
                    </div>
                    {listing.expireAt && (
                      <div className="flex justify-between">
                        <div className="font-bold">Expiry</div>

                        {session?.user.id === listing.seller.id ? (
                          listing.expireAt === null ? (
                            !isDatePickerOpen ? (
                              <div>
                                <SetExpiryDate id={listing.id} />
                              </div>
                            ) : (
                              <div
                                className="text-orange-300 underline"
                                onClick={() => setIsDatePickerOpen(false)}
                              >
                                Set expiry date
                              </div>
                            )
                          ) : (
                            <div>
                              {new Date(listing.expireAt).toLocaleString(
                                "lookup"
                              )}
                            </div>
                          )
                        ) : (
                          "N/A"
                        )}
                      </div>
                    )}

                    {listing.seller.email === session?.user.email && (
                      <div className="flex text-sm gap-2 mt-2">
                        <button
                          onClick={handleEditListing}
                          className="flex text-orange-400 border-orange-400 border-2 py-1 px-6 focus:outline-none hover:bg-orange-400 hover:text-white rounded"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => DeleteListing.onOpen(listing.id)}
                          className="flex items-center gap-1 text-white bg-orange-400 border-0 py-1 px-4 focus:outline-none hover:bg-orange-400 rounded "
                        >
                          {" "}
                          <BiTrash />
                          Delete
                        </button>
                      </div>
                    )}

                    {listing?.buyerId === session?.user?.id && (
                      <div>
                        {status === "negotiating" && (
                          <div className="flex text-sm gap-2 mt-2">
                            <button
                              className=" text-white bg-orange-400 py-1 text-xs px-3 focus:outline-none hover:bg-orange-400 rounded"
                              onClick={() => handleStatusChange("accepted")}
                            >
                              Accept Offer
                            </button>
                            <button
                              className="flex text-white text-sx bg-orange-400 border-0 py-1 px-3 focus:outline-none hover:bg-orange-500 rounded"
                              onClick={() => handleStatusChange("rejected")}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {status === "awaiting approval" && (
                          <div className="flex gap-2 mt-2">
                            <button
                              className="flex text-sm mt-2  text-white bg-orange-400  py-2 px-2 focus:outline-none hover:bg-orange-500 rounded"
                              onClick={() => handleStatusChange("negotiating")}
                            >
                              Start negotiating
                            </button>
                            <button
                              className="flex items-center text-sm mt-2 gap-2  text-white bg-orange-500  px-2 focus:outline-none hover:bg-orange-500 rounded"
                              onClick={() => handleStatusChange("accepted")}
                            >
                              <IoThumbsUp className="mr-[2px]" /> Accept Offer
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="border border-gray-200 rounded p-4 bg-white cursor-pointer"
              onClick={() =>
                router.push(
                  `/dashboard/profile/${
                    listing?.buyer?.id !== session?.user.id
                      ? listing?.buyer?.id
                      : listing?.seller.id
                  }`
                )
              }
            >
              <div>
                <h5 className="mb-2 text-sm md:text-md">
                  {listing?.seller?.email === session?.user.email ? (
                    <span className="flex items-center justify-between gap-2">
                      BUYER <img src="/images/cat.png" className="h-6" />
                    </span>
                  ) : (
                    <span className="flex items-center justify-between gap-2">
                      SELLER <img src="/images/dog.png" className="h-6" />
                    </span>
                  )}
                </h5>
                {listing?.seller?.id !== session?.user.id ? (
                  <div className="flex flex-col gap-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500 w-1/5 ">
                          <img
                            src={
                              listing.seller?.profile?.image
                                ? listing.seller?.profile?.image
                                : "/images/placeholders/avatar.png"
                            }
                            alt="user avatar"
                            className="rounded-full border-2 p-2 border-gray-200"
                          />
                        </span>
                        <div>
                          <div className="capitalize font-bold">
                            {listing?.seller ? listing.seller.name : "No name"}
                          </div>

                          <div>
                            {listing?.seller
                              ? "@" + listing?.seller.username
                              : "No username"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500 w-1/5 ">
                          <img
                            src={`${
                              listing.buyer?.profile?.image
                                ? listing.buyer?.profile?.image
                                : "/images/placeholders/avatar.png"
                            }`}
                            alt="user avatar"
                            className="rounded-full border-2 p-2 border-gray-200"
                          />
                        </span>
                        <div>
                          <div className="capitalize font-bold">
                            {listing?.buyer ? listing.buyer.name : "No name"}
                          </div>

                          <div>
                            {listing?.buyer
                              ? "@" + listing?.buyer.username
                              : "No username"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {status === "pending" && listing.seller.id === session?.user.id && (
              <div className="border border-gray-200 bg-white p-4">
                <h5 className="text-sm">ASSIGN USER</h5>
                <p className="mb-4">Assign a user to start negotiating</p>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    SearchModal.onOpen(listing.id, setSellerId, setStatus);
                  }}
                  className="flex  md:text-md text-white bg-orange-400 border-0 py-2 px-6 focus:outline-none hover:bg-orange-500 rounded "
                >
                  Assign User
                </button>
              </div>
            )}
            {status === "negotiating" && (
              <div className="border border-gray-200 bg-white p-4">
                <PriceWidget
                  listingId={listing.id}
                  onBidPriceChange={handleBidPriceChange}
                  bid={bidPrice}
                  isBuyer={listing.buyer.id === session?.user.id}
                  onBidderChange={setBidder}
                />
              </div>
            )}
            <div className="flex flex-col border border-gray-200 bg-white p-4">
              <h5 className="text-sm md:text-md mb-4">QR CODE</h5>
              <div className="items-center mx-auto border-2 border-gray-200 rounded-md mb-4">
                <Canvas
                  text={`${AppConfig.siteUrl}/dashboard/offers/${listing.id}`}
                  options={{
                    level: "M",
                    margin: 3,
                    scale: 4,
                    width: 260,
                    color: {
                      dark: "#000000",
                      light: "#FFFFFF",
                    },
                  }}
                />
              </div>

              <div className="flex gap-2 text-sm justify-center">
                <button
                  onClick={handleDownloadQR}
                  className="flex text-white bg-orange-400 border-0 py-2 px-4 focus:outline-none hover:bg-orange-500 rounded "
                >
                  Download QR
                </button>
                <button
                  onClick={handleCopy}
                  className="flex text-white bg-orange-400 border-0 py-2 px-4 focus:outline-none hover:bg-orange-500 rounded "
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </Dash>
    )
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const bidId = params?.id as string; // Update as per your requirements
  try {
    const listing = await getBidByID({ bidId });
    return {
      props: {
        listing,
      },
    };
  } catch (error) {
    console.error("Error fetching listing:", error);
    return {
      notFound: true, // You can customize the error handling
    };
  }
};

export default Index;
