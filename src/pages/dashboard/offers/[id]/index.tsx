import getBidByID from "@/actions/getBidByID";
import Timeline from "@/components/chat/Timeline";
import PriceWidget from "@/components/widgets/PriceWidget";
import useSearchModal from "@/hooks/useSearchModal";
import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import { GetServerSideProps } from "next";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getSession, useSession } from "next-auth/react";
import useDeleteConfirmationModal from "@/hooks/useDeleteConfirmationModal";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { Listing, User } from "@prisma/client";
import { useRouter } from "next/navigation";
import StatusChecker from "@/utils/status";
import { useQRCode } from "next-qrcode";
import { toast } from "react-hot-toast";
import "react-datepicker/dist/react-datepicker.css";
import SetExpiryDate from "@/components/SetExpiryDate";
import { format, set } from "date-fns";
import { IoThumbsUp } from "react-icons/io5";
import axios from "axios";
import { AppConfig } from "@/utils/AppConfig";
import { BsHandThumbsUp } from "react-icons/bs";
import { AiFillWarning } from "react-icons/ai";

const Index = ({ listing }: any) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [recipientId, setRecipientId] = useState<string | null>(null);
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
    if (status === "accepted") {
      setDisabled(true);
    }
   
  }, [listing]);



  const { data: session } = useSession();

  console.log(session?.user);

  const [bidPrice, setBidPrice] = useState<string | null>(
    listing?.bid ? listing.bid : listing?.price
  );

  const handleBidPriceChange = (updatedBidPrice: string | null) => {
    setBidPrice(updatedBidPrice);
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
      })
      .catch((err) => {
        console.log("Something went wrong!");
      })
      .finally(() => {
        // setLoading(false);
      });
  };

  return (
    listing && (
      <Dash meta={<Meta title="" description="" />}>
        <div className=" px-4 py-10 lg:py-24 mx-auto xl:grid xl:grid-cols-12 gap-6">
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
          {status === "pending" && (
            <div
              className="col-span-12 flex flex-col md:flex-row md:items-center md:justify-between p-4 mb-8 text-sm font-semibold text-white bg-gray-600 rounded-lg shadow-md focus:outline-none focus:shadow-outline-purple"
              onClick={(e) => {
                e.preventDefault();
                SearchModal.onOpen(listing.id, setRecipientId, setStatus);
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

          <div className="col-span-12 flex border-b border-gray-200 font-bold font-xl gap-4 uppercase">
            <div className="border-b-2 border-orange-500">Activity</div>
            <div>Details</div>

          </div>

          <div className="w-full md:col-span-8 lg:col-span-9 ">
            <div className="mx-auto flex flex-col bg-white border border-gray-200 rounded-t-md">
              <div className="aspect-w-16 aspect-h-9 flex justify-center">
                <img
                  alt="ecommerce"
                  className="object-center object-contain lg:object-scale-down w-full h-full max-h-96"
                  src={
                    listing?.image ? listing.image : "/images/placeholder.png"
                  }
                />
              </div>

              <hr className="border-t border-gray-200" />
              <div className=" w-full mt-6 lg:mt-0 ">
                <div className="px-6 pt-6 bg-gray-100 border-b pb-6 border-gray-200">
                  <div className="md:flex md:justify-between">
                    <div>
                      <div className="text-gray-900 text-xl  md:text-2xl  font-medium  px-4 lg:px-0">
                        {listing.title}
                      </div>
                      <p className="  text-gray-500 px-4 lg:px-0">
                        {listing.category}
                      </p>
                    </div>
                    <div className="hidden md:block">
                      <div className="text-right text-sm">Current Bid</div>
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
                    <Timeline
                      listing={listing}
                      user={session?.user}
                      disabled={disabled}
                    />
                  )}
                  {status === "accepted" && (
                    <div className="w-full  p-4 white border-l-4 border-orange-500">
                      <div>
                        Your offer has been accepted. If you need to contact the
                        seller{" "}
                        <span className="text-orange-400 underline cursor-pointer">
                          click here
                        </span>
                      </div>
                    </div>
                  )}
                  {status === "pending" && (
                    <div className="w-full  p-4 white border-l-4 border-orange-500" onClick={(e) => {
                      e.preventDefault();
                      SearchModal.onOpen(listing.id, setRecipientId, setStatus);
                    }}>
                      <div>
                        Your offer has been created. Assign a user to start negotiating{" "}
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
          <div className="w-full lg:col-span-3 flex flex-col gap-4">
            <div className="border border-gray-200 rounded p-4 bg-white flex flex-col gap-2">
              <div className="flex">
                <div className="w-1/3 aspect-video">
                  <img
                    src={
                      listing?.image ? listing.image : "/images/placeholder.png"
                    }
                    alt="user"
                    width="100%"
                    height="100%"
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex flex-col">
                  <p>{listing.title}</p>
                  <div className="my-2">{StatusChecker(listing.status)}</div>
                </div>
              </div>
              <div className="flex justify-between">
                <p className="font-bold">Current Bid</p>
                <div className="flex items-center gap-1 font-extrabold">
                  £ {bidPrice ? bidPrice : listing.bid}
                </div>
              </div>
              <div className="flex justify-between">
                <p className="font-bold">Status</p>
                <div className="flex items-center gap-1">
                  {StatusChecker(listing.status)}
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

                  <div className="flex justify-between">
                    <p className="font-bold">Expiry</p>

                    {session?.user.id === listing.sender.id ? (
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
                          {new Date(listing.expireAt).toLocaleString("lookup")}
                        </div>
                      )
                    ) : (
                      "N/A"
                    )}
                  </div>
                  {listing.sender.email === session?.user.email && (
                    <div className="flex text-sm gap-2 mt-2">
                      <button
                        onClick={handleEditListing}
                        className="flex text-orange-500 border-orange-500 border-2 py-2 px-6 focus:outline-none hover:bg-orange-600 hover:text-white rounded"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => DeleteListing.onOpen(listing.id)}
                        className="flex text-white bg-orange-500 border-0 py-2 px-6 focus:outline-none hover:bg-orange-600 rounded "
                      >
                        Delete
                      </button>
                    </div>
                  )}

                  {listing?.recipientId === session?.user?.id && (
                    <div>
                      {status === "negotiating" && (
                        <div className="flex text-sm gap-2">
                          <button
                            className="flex  text-orange-500 border-orange-500 border-2 py-2 px-2 focus:outline-none hover:bg-orange-600 rounded"
                            onClick={() => handleStatusChange("accepted")}
                          >
                            Accept Offer
                          </button>
                          <button
                            className="flex text-white bg-orange-500 border-0 py-2 px-2 focus:outline-none hover:bg-orange-600 rounded"
                            onClick={() => handleStatusChange("rejected")}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            className="flex text-sm mt-2  text-white bg-orange-500  py-2 px-2 focus:outline-none hover:bg-orange-600 rounded"
                            onClick={() => handleStatusChange("negotiating")}
                          >
                            Start negotiatingg
                          </button>
                          <button
                            className="flex items-center text-sm mt-2  text-white bg-orange-500  px-2 focus:outline-none hover:bg-orange-600 rounded"
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

            {session?.user.id !== listing?.recipient?.id && (
              <div
                className="border border-gray-200 rounded p-4 bg-white cursor-pointer"
                onClick={() =>
                  router.push(`/dashboard/profile/${listing.sender.id}`)
                }
              >
                <div>
                  <h5 className="mb-2">
                    {listing?.recipient?.email === session?.user.email
                      ? "You"
                      : "Seller"}
                  </h5>
                  {listing?.recipient && (
                    <div className="flex flex-col gap-1">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-500 w-1/5 ">
                            <img
                              src={`${listing.recipient?.profile?.image ? listing.recipient?.profile?.image : '/images/placeholders/avatar.png'}`}
                              alt="user avatar"
                              className="rounded-full border-2 p-2 border-gray-200"
                            />
                          </span>
                          <div>
                            <div className="capitalize font-bold">
                              {listing?.recipient
                                ? listing.recipient.name
                                : "No name"}
                            </div>

                            <div>
                              {listing?.recipient
                                ? listing?.recipient.email
                                : "No email"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {status === "pending" && listing.sender.id === session?.user.id && (
              <div className="border border-gray-200 bg-white p-4">
                <p className="font-bold mb-1">Assign a user</p>
                <p className="mb-4">Assign a user to start negotiating</p>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    SearchModal.onOpen(listing.id, setRecipientId, setStatus);
                  }}
                  className="flex text-white bg-orange-500 border-0 py-2 px-6 focus:outline-none hover:bg-orange-600 rounded "
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
                />
              </div>
            )}
            <div className="flex flex-col border border-gray-200 bg-white p-4">
              <p className="font-bold mb-2">QR Code</p>
              <div className="items-center mx-auto border-2 border-gray-200 mb-4">
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
                  className="flex text-white bg-orange-500 border-0 py-2 px-4 focus:outline-none hover:bg-orange-600 rounded "
                >
                  Download QR
                </button>
                <button
                  onClick={handleCopy}
                  className="flex text-white bg-orange-500 border-0 py-2 px-4 focus:outline-none hover:bg-orange-600 rounded "
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
