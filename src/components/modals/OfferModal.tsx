"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Modal from "./Modal";
import useOfferModal from "@/hooks/useOfferModal";
import Heading from "./Heading";
import Input from "../inputs/Input";
import ImageUpload from "../inputs/ImageUpload";
import Button from "../dashboard/Button";
import UserType from "../wizard/UserType";
import PriceInput from "../inputs/PriceInput";
import CityAutocomplete from "../dashboard/AutoComplete";
import { BiChevronRight } from "react-icons/bi";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { itemCategories, itemSubCategories } from "@/data/cateories";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useSocketContext } from "@/context/SocketContext";
import { useRouter } from "next/navigation";

enum STEPS {
  TYPE = 0,
  BUYER = 1,
  DESCRIPTION = 2,
  ITEM = 3,
  IMAGES = 4,
  REVIEW = 5,
}

const FormType = {
  title: "",
  description: "",
  additionalInformation: "",
  price: "0",
  category: "",
  subcategory: "",
  image: "",
  buyerId: "",
  sellerId: "",
  public: false,
  type: "",
  location: {
    region: "",
    city: "",
  },
  options: {
    location: {
      region: "",
      city: "",
    },
    condition: "",
    color: "",
  },
};

const OfferModal = () => {
  const offerModal = useOfferModal();
  const listing = offerModal?.listing || null;

  const { data: session, status } = useSession();
  const [step, setStep] = useState(STEPS.TYPE);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState<FieldValues>(FormType);
  const router = useRouter();

  useEffect(() => {
    if (listing) {
      setFormData((prev) => ({
        ...prev,
        title: listing.title,
        description: listing.description,
        price: listing.price.toString(),
        category: listing.category,
        subcategory: listing.subcategory,
        image: listing.image,
        buyerId: listing.buyerId,
        sellerId: listing.sellerId,
        public: true,
        type: listing.type,
        location: {
          region: listing?.location?.region || "",
          city: listing?.location?.city || "",
        },
        options: {
          location: {
            region: listing.options.location.region,
            city: listing.options.location.city,
          },
          condition: listing.options.condition,
          color: listing?.options?.color || "",
        },
      }));
      setStep(STEPS.DESCRIPTION);
    }
  } , [listing]);

  useEffect(() => {
    session && setIsLoading(false);
  }, [session]);

  const [errors, setErrors] = useState({
    title: {
      message: "",
    },
    description: {
      message: "",
    },
    price: {
      message: "",
    },
    category: {
      message: "",
    },
    subcategory: {
      message: "",
    },
    image: {
      message: "",
    },
    buyerId: {
      message: "",
    },
    sellerId: {
      message: "",
    },
    public: {
      message: "",
    },
    type: {
      message: "",
    },
    location: {
      region: {
        message: "",
      },
      city: {
        message: "",
      },
    },
    user: {
      message: "",
    },
    options: {
      location: {
        region: {
          message: "",
        },
        city: {
          message: "",
        },
      },
      condition: {
        message: "",
      },
      color: {
        message: "",
      },
    },
  });

  const [foundUser, setFoundUser] = useState<any | null>(
    offerModal?.participant || null
  );
  // console.log("foundUser", foundUser);
  // console.log("session", session);

  type Category = keyof typeof itemSubCategories;

  const socket = useSocketContext();

  const actionLabel = useMemo(() => {
    switch (step) {
      case STEPS.TYPE:
        return "Continue";
      case STEPS.BUYER:
        return "Next";
      case STEPS.DESCRIPTION:
        return "Next";
      case STEPS.ITEM:
        return "Next";
      case STEPS.IMAGES:
        return "Next";
      case STEPS.REVIEW:
        return listing ? "Update" : "Create";
    }
  }, [step]);

  const secondaryActionLabel = useMemo(() => {
    switch (step) {
      case STEPS.TYPE:
        return undefined;
      case STEPS.BUYER:
        return "Back";
      case STEPS.DESCRIPTION:
        return "Back";
      case STEPS.ITEM:
        return "Back";
      case STEPS.IMAGES:
        return "Back";
      case STEPS.REVIEW:
        return "Back";
    }
  }, [step]);

  const clearError = (name: string) => {
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  let im = null;

  if (formData.image) {
    let arr = new Array(formData.image);
    im = JSON.parse(formData.image);
  }

  const setCity = (city: string, region?: string) => {

    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        city: city,
        region: region ? region : "England",
      },
    }));
  };

  const setError = (name: string, error: { message: string }) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  useEffect(() => {
    if (foundUser === null && offerModal?.participant) {
      setFoundUser(offerModal?.participant || null);
    }
  }, [offerModal?.participant]);

  const changeColor = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        color: color,
      },
    }));
  };

  const onSearchUser = () => {
    if (!search) {
      return;
    }
    axios
      .get(`/api/getUserByUsernameApi?username=${search.toLowerCase()}`)
      .then((res) => {
        if (res.data.id && res.data.id === session?.user?.id) {
          setFoundUser(null);
          setError("user", {
            message: "You can't create an offer with yourself",
          });
        } else {
          if(!res.data || !res.data.id) {
            setFoundUser(null);
            setError("user", { message: "User not found" });
            return;
          }
          setFoundUser(res.data);
          setError("user", { message: "" });
        }
      })
      .catch((err) => {
        console.log("error");
      })
      .catch((err) => {
        toast.error("Something went wrong!");
        setFoundUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const validateStep = (step: any, data: any) => {
    const validation = {
      isValid: true,
      errors: {} as Record<string, { message: string }>,
    };

    switch (step) {
      case STEPS.TYPE:
        if (!data.type) {
          validation.isValid = false;
          setError("type", {
            message: "Select the type of listing you would like to create",
          });
        }
        break;
      case STEPS.BUYER:
        if (!foundUser) {
          validation.isValid = false;
          setError("user", { message: "Select a user" });
        }
        break;
      case STEPS.DESCRIPTION:
        if (!data.title) {
          validation.isValid = false;
          setError("title", { message: "Title is required" });
        }

        break;
      case STEPS.ITEM:
        break;
     
      case STEPS.IMAGES:
        break;

      case STEPS.REVIEW:
        break;
      default:
        break;
    }

    return validation;
  };

  const updateListing = (data: any) => {
    if (!listing) {
      return;
    }
    if(listing.userId !== session?.user.id) {
      toast.error("You can't update this offer");
      return;
    }
    const transaction = {
      id: listing.id,
      userId: session?.user.id,
      data: data
  }
    axios
      .put(`/api/listings/${listing?.id}`, transaction)
      .then((response) => {
        toast.success("Offer updated successfully!");
        offerModal.onClose();
        setStep(STEPS.TYPE);
        setFormData(FormType);
        setFoundUser(null);
        setSearch("");
        socket.emit(
          "update_listing",
          response.data.listing,
          session?.user.id,
          listing?.sellerId === session?.user.id ? listing?.buyerId : listing?.sellerId,
        );
        socket.emit(
          "update_activities",
          response.data.transactionResult,
          response.data.listing?.sellerId || "",
          response.data.listing?.buyerId || ""
        );
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong!");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const onSubmit: SubmitHandler<FieldValues> = async (formData) => {
    if (!session) {
      toast.error("Please login to create an offer");
      router.push("/login");
      return;
    }
    if (!foundUser) {
      toast.error("Please select a user to send the offer to");
      setStep(STEPS.BUYER);
      return;
    }

    if(!formData.type) {
      toast.error("Please select the type of offer you want to create");
      setStep(STEPS.TYPE);
      return;
    }

    const data = { ...formData };

   // console.log("data", data);

    setIsLoading(true);
    data.participantId = foundUser?.id;
    data.conversationId = offerModal.conversationId;
    
    data.sellerId = data.type === "seller" ? session?.user.id : foundUser?.id;
    data.buyerId = data.type === "buyer" ? session?.user.id : foundUser?.id;
    
    await axios
      .post("/api/listings", data)
      .then((response) => {
        toast.success("Offer created successfully!");
        setStep(STEPS.TYPE);
        setFormData(FormType);
        offerModal.onClose();
        setFoundUser(null);
        setSearch("");
        setStep(STEPS.TYPE);

        let urlArray = JSON.parse(data.image || "[]");
        let firstImageUrl = urlArray[0];
        console.log("firstImageUrl", firstImageUrl);
        axios.post("/api/email/emailNotification", {
          listing: { ...response.data.listing },
          name: foundUser?.name,
          email: foundUser?.email,
          title: "New Offer",
          image: firstImageUrl || "/images/cat.png",
          body: `You have a new offer from ${session?.user?.username}`,
          linkText: "View Offer",
          url: `/dashboard/trades/${response.data.listing.id}`,
        });

        socket.emit(
          "new_listing",
          response.data.listing,
          response.data.listing.userId,
          foundUser?.id
        );

        if (response.data.message) {
          socket.emit(
            "new_message",
            response.data.message,
            session?.user.id,
            foundUser.id
          );
        }

        socket.emit(
          "update_activities",
          response.data.transactionResult,
          response.data.listing.sellerId,
          response.data.listing.buyerId
        );
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong!");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onClose = () => {
    setFormData(FormType);
    setFoundUser(null);
    setSearch("");
    setStep(STEPS.TYPE);
    offerModal.onClose();
  };

  const onBack = () => {
    if (formData.type === "buyer" && step === STEPS.REVIEW) {
      setStep(STEPS.DESCRIPTION);
      return;
    }
    setStep((prev) => prev - 1);
  };

  const onNext = () => {
    const validation = validateStep(step, formData);
    if (STEPS.REVIEW === step) {
      if (listing) {
        return updateListing(formData);
      }
      return onSubmit(formData);
    }
    if(formData.type === "buyer" && step === STEPS.DESCRIPTION) {
      setStep(STEPS.REVIEW);
      return;
    }
    setStep((prev) => prev + 1);
  };

  let bodyContent = (
    <div className="flex flex-col">
      <Heading
        title={
          formData.type === "buyer"
            ? "What would you like to buy"
            : "What would you like to sell"
        }
        description="Name and describe the item"
        nounderline
      />
      <div className="mb-5">
        <Input
          id="title"
          label="Name of the item"
          type="text"
          disabled={isLoading}
          value={formData.title}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              title: e.target.value,
            }));
          }}
          placeholder="Eg. iPhone 12 Pro Max"
        />
        {errors.title && typeof errors.title.message === "string" && (
          <div className="text-red-500 text-sm">{errors.title.message}</div>
        )}
      </div>
      {/* <div className="grid grid-cols-2 gap-4">
        <div className="mb-4">
          <label htmlFor={"category"} className="mb-3 flex gap-1">
            Category
          </label>
          <select
            defaultValue={""}
            className="w-full border border-gray-200 rounded-xl p-3 focus:border-orange-300 focus:ring-0"
            value={formData.category}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                category: e.target.value,
              }));
              clearError("category");
            }}
          >
            <option value="" disabled className="text-gray-600">
              Select a category
            </option>
            {itemCategories.map((item, i) => (
              <option key={i} value={item}>
                {item}
              </option>
            ))}
          </select>
          {errors.category && typeof errors.category.message === "string" && (
            <div className="text-red-500 text-sm">
              {errors.category.message}
            </div>
          )}
        </div>
        {formData.type && (
          <div className="mb-4">
            <label htmlFor={"subcategory"} className="mb-3 flex gap-1">
              Type
            </label>
            <select
              value={formData.subcategory}
              className="w-full border border-gray-200 rounded-xl p-3 focus:border-orange-300 focus:ring-0"
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  subcategory: e.target.value,
                }));
              }}
            >
              <option value="" disabled className="text-gray-600">
                Select the type
              </option>
              {formData.category &&
                itemSubCategories[formData.category as Category].map(
                  (item, i) => (
                    <option key={i} value={item}>
                      {item}
                    </option>
                  )
                )}
            </select>
            {errors.subcategory &&
              typeof errors.subcategory.message === "string" && (
                <div className="text-red-500 text-sm">
                  {errors.subcategory.message}
                </div>
              )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2">
        <div className="mb-4">
          <label className="block mb-3">
            Condition{" "}
            <span className="italic text-gray-500 text-sm"> (Optional)</span>
          </label>
          <label className="block mb-3 space-x-2">
            <input
              type="radio"
              checked={formData?.options?.condition === "new"}
              onChange={(e) =>
                setFormData((prev) => {
                  return {
                    ...prev,
                    options: {
                      ...prev.options,
                      condition: "new",
                    },
                  };
                })
              }
              value="new"
            />
            <span>New</span>
          </label>
          <label className="block mb-3 space-x-2">
            <input
              type="radio"
              checked={formData?.options?.condition === "used"}
              onChange={(e) =>
                setFormData((prev) => {
                  return {
                    ...prev,
                    options: {
                      ...prev.options,
                      condition: "used",
                    },
                  };
                })
              }
              value="used"
            />
            <span>Used</span>
          </label>
          <label className="block mb-3 space-x-2">
            <input
              type="radio"
              checked={formData?.options?.condition === "damaged"}
              onChange={(e) =>
                setFormData((prev) => {
                  return {
                    ...prev,
                    options: {
                      ...prev.options,
                      condition: "damaged",
                    },
                  };
                })
              }
              value="damaged"
            />
            <span>Damaged</span>
          </label>
        </div>
        <div className="">
          <div className="mb-3">
            <div className="w-1/3 sm:w-1/5 mb-3">
              <p className="font-hk text-secondary">Color</p>
            </div>
            <div className="flex w-2/3 items-center sm:w-5/6">
              <div
                onClick={() =>
                  setFormData((prev) => {
                    return {
                      ...prev,
                      options: { ...prev.options, color: "bg-black" },
                    };
                  })
                }
                className={`mr-2 cursor-pointer rounded-full border p-1 bg-black px-2 py-2 transition-colors hover:border-black ${
                  formData.options.color === "bg-black" ? "border-black" : ""
                }`}
              ></div>
              <div
                onClick={() =>
                  setFormData((prev) => {
                    return {
                      ...prev,
                      options: { ...prev.options, color: "bg-white" },
                    };
                  })
                }
                className={`mr-2 cursor-pointer rounded-full border p-1 bg-white px-2 py-2 transition-colors hover:border-black ${
                  formData.options.color === "bg-white" ? "border-black" : ""
                }`}
              ></div>
              <div
                onClick={() =>
                  setFormData((prev) => {
                    return {
                      ...prev,
                      options: { ...prev.options, color: "bg-gray-200" },
                    };
                  })
                }
                className={`mr-2 cursor-pointer rounded-full border p-1 bg-gray-200 px-2 py-2 transition-colors hover:border-black ${
                  formData.options.color === "bg-gray-200" ? "border-black" : ""
                }`}
              ></div>
              <div
                onClick={() =>
                  setFormData((prev) => {
                    return {
                      ...prev,
                      options: { ...prev.options, color: "bg-gray-600" },
                    };
                  })
                }
                className={`mr-2 cursor-pointer rounded-full border p-1 bg-gray-500 px-2 py-2 transition-colors hover:border-black ${
                  formData.options.color === "bg-gray-500" ? "border-black" : ""
                }`}
              ></div>
              <div
                onClick={() =>
                  setFormData((prev) => {
                    return {
                      ...prev,
                      options: { ...prev.options, color: "bg-red-500" },
                    };
                  })
                }
                className={`mr-2 cursor-pointer rounded-full border p-1 bg-red-500 px-2 py-2 transition-colors hover:border-black ${
                  formData.options.color === "bg-red-500" ? "border-black" : ""
                }`}
              ></div>
              <div
                onClick={() =>
                  setFormData((prev) => {
                    return {
                      ...prev,
                      options: { ...prev.options, color: "bg-blue-500" },
                    };
                  })
                }
                className={`mr-2 cursor-pointer rounded-full border p-1 bg-blue-500 px-2 py-2 transition-colors hover:border-black ${
                  formData.options.color === "bg-blue-500" ? "border-black" : ""
                }`}
              ></div>
              <div
                onClick={() =>
                  setFormData((prev) => {
                    return {
                      ...prev,
                      options: { ...prev.options, color: "bg-green-500" },
                    };
                  })
                }
                className={`mr-2 cursor-pointer rounded-full border p-1 bg-green-500 px-2 py-2 transition-colors hover:border-black ${
                  formData.options.color === "bg-green-500"
                    ? "border-black"
                    : ""
                }`}
              ></div>
              <div
                onClick={() =>
                  setFormData((prev) => {
                    return {
                      ...prev,
                      options: { ...prev.options, color: "bg-orange-500" },
                    };
                  })
                }
                className={`cursor-pointer rounded-full border p-1 bg-orange-500 px-2 py-2 transition-colors hover:border-black ${
                  formData.options.color === "bg-orange-500"
                    ? "border-black"
                    : ""
                }`}
              ></div>
            </div>
          </div>

          <div className="">
            <p className="font-hk text-secondary mb-3">Size</p>
            <select
              className=" border border-gray-200 rounded-xl px-2 p-2 w-24 focus:border-orange-300 focus:ring-0 text-sm"
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  options: {
                    ...prev.options,
                    size: e.target.value,
                  },
                }));
              }}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
      </div> */}

      <div className="mb-3">
        <label className="block mb-3">
          Description{" "}
          <span className="italic text-gray-500 text-sm "> (Optional)</span>
        </label>

        <textarea
          className="w-full border border-gray-200 rounded-xl p-3 focus:border-orange-300 focus:ring-0"
          placeholder="Enter a description of the item"
          id="description"
          rows={5}
          value={formData.description}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              description: e.target.value,
            }));
            clearError("description");
          }}
        ></textarea>
        {errors.description &&
          typeof errors.description.message === "string" && (
            <div className="text-red-500 text-sm">
              {errors.description.message}
            </div>
          )}
      </div>

      <div className="w-1/3">
        <PriceInput
          id="price"
          label="Starting price"
          type="number"
          modal
          formatPrice
          disabled={listing ? true : false}
          placeholder="0.00"
          value={formData.price}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              price: e.target.value,
            }));
          }}
          sm
          optional
        />
      </div>
      {errors.price && typeof errors.price.message === "string" && (
        <div className="text-red-500 text-sm">{errors.price.message}</div>
      )}
    </div>
  );

  if (step === STEPS.ITEM) {
    bodyContent = (
      <div className="flex flex-col">
        <Heading
          title="Item Details"
          description="Important infortmation about your thing"
          nounderline
        />
        

        <div className="mb-5">
          <CityAutocomplete
            selectedCity={formData.location.city}
            setSelectedCity={setCity}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-3">
            Delivery{" "}
            <span className="italic text-gray-500 text-sm "> (Optional)</span>
          </label>
          <select
            defaultValue={"Select"}
            className="w-full border border-gray-200 rounded-xl p-3 focus:border-orange-300 focus:ring-0"
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                pickup: e.target.value,
              }));
            }}
          >
            <option value="Select" disabled className="text-gray-600">
              Select
            </option>
            <option
              className=" focus:border-orange-300 focus:ring-0"
              value="collection"
            >
              Collection Only
            </option>
            <option value="pickup">Pickup Only</option>
            <option value="both">Collection or Pickup</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="block mb-3">
            Additional Information{" "}
            <span className="italic text-gray-500 text-sm "> (Optional)</span>
          </label>

          <textarea
            className="w-full border border-gray-200 rounded-xl p-3 focus:border-orange-300 focus:ring-0"
            placeholder="Enter additional information about the item"
            id="additionalInformation"
            rows={5}
            value={formData.additionalInformation}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                additionalInformation: e.target.value,
              }));
              clearError("additionalInformation");
            }}
          ></textarea>
        </div>
      </div>
    );
  }

  if (step === STEPS.TYPE) {
    bodyContent = (
      <div className="flex flex-col">
        <Heading
          nounderline
          title="Offer type"
          description="Choose the type of offer you want to create"
        />
        <div className="mb-5">
          <UserType
            setValue={formData.type}
            setUserType={(value) => {
              setFormData((prev) => ({
                ...prev,
                type: value,
              }));
              clearError("type");
            }}
            userType={formData.type}
            notrade
            clearErrors={() => {
              clearError("type");
            }}
          />
          {errors.type && (
            <span className="text-red-500">
              {errors.type.message as string}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (step === STEPS.IMAGES) {
    bodyContent = (
      <div className="flex flex-col">
        <Heading
          title="Image upload"
          description="Upload a image of the item."
          nounderline
        />
        <div>
          <ImageUpload
            value={formData.image}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, image: value }))
            }
          />
        </div>
      </div>
    );
  }
  if (step === STEPS.BUYER) {
    bodyContent = (
      <div className="flex flex-col">
        <Heading
          title={`Select the ${formData.type === "buyer" ? "Seller" : "Buyer"}`}
          description={`Who would you like to send this offer to?`}
          nounderline
        />
        <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto">
          {foundUser ? (
            <>
              <p className="font-bold">Found: {}</p>
              <div className="flex justify-between items-center border border-gray-200 rounded-lg px-4 py-2 bg-gray-50">
                <div>
                  <div className="flex items-center gap-2  ">
                    <div>
                      <img
                        src={
                          foundUser?.profile?.image ||
                          "/images/placeholders/avatar.png"
                        }
                        alt={foundUser.username + "Avatar" || "Avatar"}
                        width={50}
                        height={50}
                        className="rounded-full p-1 border border-gray-200"
                      />
                    </div>
                    <h5 className="font-extrabold text-orange-600 text-2xl">
                      {foundUser.username}
                    </h5>
                  </div>
                </div>
                <div>
                  <Button
                    options={{ size: "xs" }}
                    onClick={() => {
                      setFoundUser(null);
                      clearError("user");
                    }}
                  >
                    Change
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex rounded-lg relative pb-8">
                <input
                  id="username"
                  type="text"
                  required
                  placeholder="Enter MYAO name"
                  className="rounded-l-lg border border-gray-200 p-2 flex-1 lowercase focus:border-orange-300 hover:border-orange-300 focus:outline-none"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                />
                <button
                  className="bg-orange-default border border-orange-default px-2 my-auto rounded-r-lg mr-auto text-sm py-2 text-white flex gap-2 items-center"
                  onClick={onSearchUser}
                >
                  Search <BiChevronRight />
                </button>
                {errors && errors?.user && (
                  <div className=" text-sm text-red-500 absolute bottom-0">
                    {String(errors?.user?.message)}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
  if (step === STEPS.REVIEW) {
    bodyContent = (
      <div className="flex flex-col">
        <Heading
          title="Finalise Offer"
          description="If you are happy with the offer, click the button below to create the offer."
          nounderline
        />
        <div>
          <h5 className="mb-5">Review Details</h5>
          <div className="md:flex gap-4">
            <div className="flex-1">
              <div className="flex gap-2 md:gap-3 mb-2">
                <div className="w-1/3 md:w-1/5 border rounded">
                  <img
                    src={`${im && im[0] ? im[0] : "/images/cat.png"}`}
                    alt="offer"
                    className="object-cover rounded-md"
                  />
                </div>
                <div>
                  <div className="first-letter:uppercase title-sm font-bold">
                    {formData.title}
                  </div>
                  <div className="flex items-center gap-2 text-[16px] text-[#979797]">
                    {formData.category} - {formData.subcategory}
                  </div>
                </div>
              </div>
              <div className="md:flex justify-between border-t pt-2 mt-3">
                <div className="flex  gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Price: </span>

                    {!formData.price || formData.price === "0"
                      ? "Open Offer"
                      : `£ ${formData.price}`}
                  </div>
                  <span className="border-l"></span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Sent to: </span>
                    {foundUser?.username} - (
                    {formData.type === "buyer" ? "Seller" : "Buyer"})
                  </div>
                  <span className="border-l"></span>
                  <div className="flex items-center gap-2 capitalize">
                    <span className="font-bold">Type: </span>

                    {formData.type}
                  </div>
                </div>
              </div>
              <hr className="mt-2 mb-2" />
              <div className="">
                <div className="font-medium">Description</div>
                <p className="text-[#979797]">{formData.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <Modal
      title={listing ? "Edit Offer" : "Create Offer"}
      isOpen={offerModal.isOpen}
      onClose={onClose}
      actionLabel={actionLabel}
      secondaryAction={step > STEPS.TYPE ? onBack : undefined}
      secondaryActionLabel={secondaryActionLabel}
      body={bodyContent}
      isLoading={isLoading}
      onSubmit={onNext}
    />
  );
};

export default OfferModal;
