"use client";

import React, { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import useOfferModal from "@/hooks/useOfferModal";
import { itemCategories } from "@/data/cateories";
import Heading from "./Heading";
import CategoryInput from "../inputs/CategoryInput";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import Input from "../inputs/Input";
import ImageUpload from "../inputs/ImageUpload";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { io } from "socket.io-client";
import { config } from "@/config";
import {
  BiCategory,
  BiCategoryAlt,
  BiChevronRight,
  BiUserCircle,
} from "react-icons/bi";
import Button from "../dashboard/Button";
import TextArea from "../inputs/TextArea";
import { IoPricetagOutline } from "react-icons/io5";
import UserType from "../wizard/UserType";

enum STEPS {
  TYPE = 0,
  BUYER = 1,
  DESCRIPTION = 2,
  CATEGORY = 3,
  IMAGES = 4,
  REVIEW = 5,
}

const OfferModal = () => {
  const offerModal = useOfferModal();
  const { data: session, status } = useSession();
  const [step, setStep] = useState(STEPS.TYPE);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [userType, setUserType] = useState("sellerOffer");
  const [foundUser, setFoundUser] = useState<any | null>(offerModal?.participant || null);

  const port = config.PORT;
  const socket = io(port);

  useEffect(() => {
    setFoundUser(offerModal?.participant || null);
  }, [offerModal?.participant]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
  } = useForm<FieldValues>({
    defaultValues: {
      title: "",
      description: "",
      price: "0",
      category: "",
      image: "",
      buyerId: "",
      sellerId: "",
      public: false,
      userType: "",
    },
  });

  const onSearchUser = () => {
    if (!search) {
      return;
    }
    axios
      .get(`/api/getUserByUsernameApi?username=${search.toLowerCase()}`)
      .then((res) => {
        console.log(res.data);
        if (res.data.id  && res.data.id === session?.user?.id) {
          toast.error("You can't create an offer with yourself");
          setFoundUser(null);
          setError("user", { message: "You can't create an offer with yourself" });
        } else {
          setFoundUser(res.data);
          clearErrors("user")

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
  }

  const validateStep = (step: any, data: any) => {
    const validation = {
      isValid: true,
      errors: {} as Record<string, { message: string }>,
    };

    switch (step) {
      case STEPS.TYPE:
        if (!data.userType) {
          validation.isValid = false;
          setError("userType", { message: "Select the type of listing you would like to create" });
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
        if (!data.description) {
          validation.isValid = false;
          setError("description", { message: "Description is required" });
        }
        break;
      case STEPS.CATEGORY:
        if (selectedCategory.length === 0) {
          validation.isValid = false;
          validation.errors["category"] = { message: "Category is required" };
        }
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

  const onClose = () => {
    offerModal.onClose();
    reset();
    setStep(STEPS.TYPE);
  };

  const onBack = () => {
    setStep(step - 1);
  };
  const onNext = () => {
    handleSubmit((data, event) => {
      event?.preventDefault();
      event?.stopPropagation();

      if (step !== STEPS.REVIEW) {
        const stepValidationResult = validateStep(step, data);
        if (stepValidationResult.isValid) {
          setTitle(data.title);
          setDescription(data.description);
          setCategory(data.category);
          setPrice(data.price);
          setUserType(data.userType);
          setStep(step + 1);
        }
      } else {
        onSubmit(data);
      }
    })();
  };

  const actionLabel = useMemo(() => {
    switch (step) {
      case STEPS.TYPE:
        return "Continue";
      case STEPS.BUYER:
        return "Next";
      case STEPS.DESCRIPTION:
        return "Next";
      case STEPS.CATEGORY:
        return "Next";
      case STEPS.IMAGES:
        return "Next";
      case STEPS.REVIEW:
        return "Create Offer";
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
      case STEPS.CATEGORY:
        return "Back";
      case STEPS.IMAGES:
        return "Back";
      case STEPS.REVIEW:
        return "Back";
    }
  }, [step]);

  const image = watch("image");

  let im = null

  if (image) {
      let arr = new Array(image);
 im = JSON.parse(image)
  console.log("image", im);
  }
  


  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data: any) => {
    if (step !== STEPS.REVIEW) {
      return onNext();
    }
    if (status === "authenticated" && session?.user) {
      data.sellerId = session.user.id;
    } else {
      return;
    }

    if(!foundUser){
       toast.error("Please select a user to send the offer to")
       setStep(STEPS.BUYER)
       return
    };

    setIsLoading(true);
    data.category = selectedCategory;
    data.participantId = foundUser?.id;
    data.conversationId = offerModal.conversationId;
    data.type = userType === 'buyer' ? 'buyerOffer' : "sellerOffer";
    data.userId = session.user.id;
    data.sellerId = userType === "seller" ? session.user.id : foundUser?.id;
    data.buyerId = userType === "buyer" ? session.user.id : foundUser?.id;

    await axios
      .post("/api/listings", data)
      .then((response) => {
        toast.success("Offer created successfully!");
        reset();
        setStep(STEPS.TYPE);
        offerModal.onClose();
        socket.emit("new_listing", response.data.listing, response.data.listing.userId, foundUser?.id);
        if (response.data.message) {
          socket.emit("new_message", response.data.message);
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

  let bodyContent = (
    <div className="flex flex-col">
      <Heading
        title="What do they want to buy?"
        description="Name and describe your thing"
        nounderline
      />
      <div className="mb-4">
        <Input
          id="title"
          label="Name of thing"
          type="text"
          register={register}
          errors={errors}
          disabled={isLoading}
          onChange={() => clearErrors("title")}
        />
      </div>
      <div className="mb-4">
        <TextArea
          id="description"
          label="Description"
          errors={errors}
          disabled={isLoading}
          register={register}
          rows={5}
          clearErrors={() => clearErrors("description")}
        />
      </div>
      <Input
        id="price"
        label="Starting price (optional)"
        type="number"
        modal
        formatPrice
        register={register}
        errors={errors}
        placeholder="0.00"
        onChange={() => clearErrors("price")}
      />
    </div>
  );

  
  if (step === STEPS.CATEGORY) {
    const updateCategory = (category: string) => {
      setSelectedCategory(category);
      setValue("category", category);
      setValue("price", price);
    };
    bodyContent = (
      <div className="flex flex-col">
        <Heading
          nounderline
          title="Select a category"
          description="Choose the category that best describes the item"
        />
        {errors.category && typeof errors.category.message === "string" && (
          <div className="text-red-500 text-sm">{errors.category.message}</div>
        )}
        {!selectedCategory && (
          <div className="text-red-500 text-sm">Select a category</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
          {itemCategories.map((item) => (
            <CategoryInput
              name={item}
              key={item}
              selected={selectedCategory === item}
              onClick={updateCategory}
              register={register}
            />
          ))}
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
        <div className="mb-4">
          <UserType
            setValue={setValue}
            setUserType={setUserType}
            userType={userType}
            notrade 
          />
          {errors.userType && (
            <span className="text-red-500">
              {errors.userType.message as string}
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
            value={image}
            onChange={(value) => setCustomValue("image", value)}
          />
        </div>
      </div>
    );
  }
  if (step === STEPS.BUYER) {
    bodyContent = (
      <div className="flex flex-col">
        <Heading
          title={`Select the ${userType === 'buyer' ? 'Seller' : 'Buyer'}`}
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
                      setFoundUser(null)
                      clearErrors("buyer")
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
                onChange={(e) => {setSearch(e.target.value); clearErrors("user");}}
                {...register}
              />
              <button
                className="bg-orange-400 border border-orange-400 px-2 my-auto rounded-r-lg mr-auto text-sm py-2 text-white flex gap-2 items-center"
                onClick={onSearchUser}
              >
                Search <BiChevronRight />
              </button>
              {errors && errors.user && (
            <div className=" text-sm text-red-500 absolute bottom-0">
              {String(errors.user?.message)}
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
          <h5 className="mb-4">Review Details</h5>
          <div className="flex gap-4">
            <div className="w-1/5">
              <img
                src={`${im && im[0] ? im[0] : "/images/cat.png"}`}
                alt="offer"
                className="object-cover rounded-md"
              />
            </div>

            <div className="flex-1">
              <div className="font-medium first-letter:uppercase">{title}</div>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium flex">
                    <BiCategory />
                  </span>
                  {category}
                </div>
                <div className="flex items-center gap-2 capitalize">
                  <span className="font-medium flex">
                    <BiCategoryAlt />
                  </span>
                  {userType}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium flex">
                    <BiUserCircle />
                  </span>
                  {foundUser?.username}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    <IoPricetagOutline />
                  </span>
                  {!price ? "Not set" : `£ ${price}`}
                </div>
              </div>
              <hr className="mt-2 mb-2" />
              <div className="">
                <div className="font-medium">Description</div>
                <p>{description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <Modal
      title="Show your thing"
      isOpen={offerModal.isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      actionLabel={actionLabel}
      secondaryAction={step > STEPS.BUYER ? onBack : undefined}
      secondaryActionLabel={secondaryActionLabel}
      body={bodyContent}
      disabled={Object.keys(errors).length > 0}
      isLoading={isLoading}
      errors={errors}
    />
  );
};

export default OfferModal;
