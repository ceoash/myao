"use client";

import React, { useMemo, useState } from "react";
import Modal from "./Modal";
import useOfferModal from "@/hooks/useOfferModal";
import { categories } from "@/data/cateories";
import Heading from "./Heading";
import CategoryInput from "../inputs/CategoryInput";
import { FieldValues, SubmitHandler, set, useForm } from "react-hook-form";
import Input from "../inputs/Input";
import ImageUpload from "../inputs/ImageUpload";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getSession, useSession } from "next-auth/react";
import { BiCheckbox, BiCheckboxChecked, BiChevronRight } from "react-icons/bi";
import UsernameSelect from "../UsernameSelect";
import UserSelect from "../UsernameSelect";
import { User } from "@prisma/client";

enum STEPS {
  DESCRIPTION = 0,
  CATEGORY = 1,
  IMAGES = 2,
  BUYER = 3,
  REVIEW = 4,
}

interface ErrorResponse {
  error: string;
}

const currentUser = async () => {
  const session = await getSession();

  return session?.user?.email;
};

const OfferModal = () => {
  const offerModal = useOfferModal();
  const [step, setStep] = useState(STEPS.DESCRIPTION);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [buyer, setBuyer] = useState(true);
  const [location, setLocation] = useState(true);
  const { data: session, status } = useSession(); // Get the session and status from next-auth/react
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [notFoundUser, setNotFoundUser] = useState("");
  const [invitationSent, setInvitationSent] = useState(false);
  const [userAssigned, setUserAssigned] = useState(false);

  console.log(foundUser);

  const [formValues, setFormValues] = useState<FieldValues>({
    email: "",
    buyerId: "",
    title: "",
    description: "",
    price: "",
    category: "",
    image: "",
    sellerId: "",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    setError,
  } = useForm<FieldValues>({
    defaultValues: {
      title: "",
      description: "",
      price: "",
      category: "",
      image: "",
      buyerId: "",
      sellerId: "",
      public: false,
    },
  });

  const onSearchUser = () => {
    axios
      .get(`/api/getUserByUsernameApi?username=${search.toLowerCase()}`)
      .then((res) => {
        setFoundUser(res.data);
        console.log("search complete");
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
      case STEPS.DESCRIPTION:
        if (!data.title) {
          validation.isValid = false;
          setError("title", { message: "Title is required" }); // Set the error for the "title" field
        }
        if (!data.description) {
          validation.isValid = false;
          setError("description", { message: "Description is required" }); // Set the error for the "description" field
        }
        if (!data.price) {
          validation.isValid = false;
          setError("price", { message: "Price is required" }); // Set the error for the "price" field
        }
        break;
      case STEPS.CATEGORY:
        if (selectedCategory.length === 0) {
          validation.isValid = false;
          validation.errors["category"] = { message: "Category is required" };
        }
        break;
      case STEPS.IMAGES:
        // Add validation for the image field if required
        break;
      case STEPS.BUYER:
        // Add validation for the seller fields if required
        break;
      case STEPS.REVIEW:
        // No validation required for the review step
        break;
      default:
        break;
    }

    return validation;
  };

  const onBack = () => {
    setStep(step - 1);
  };
  const onNext = () => {
    handleSubmit((data, event) => {
      // Perform form validation
      event?.preventDefault();
      event?.stopPropagation();

      if (step !== STEPS.REVIEW) {
        const stepValidationResult = validateStep(step, data); // Implement your own validation logic
        if (stepValidationResult.isValid) {
          setTitle(data.title);
          setDescription(data.description);
          setPrice(data.price);
          setCategory(data.category);

          setStep(step + 1);
        }
      } else {
        onSubmit(data);
      }
    })();
  };

  const actionLabel = useMemo(() => {
    switch (step) {
      case STEPS.DESCRIPTION:
        return "Next";
      case STEPS.CATEGORY:
        return "Next";
      case STEPS.IMAGES:
        return "Next";
      case STEPS.BUYER:
        return "Next";
      case STEPS.REVIEW:
        return "Create Offer";
    }
  }, [step]);

  const secondaryActionLabel = useMemo(() => {
    switch (step) {
      case STEPS.DESCRIPTION:
        return undefined;
      case STEPS.CATEGORY:
        return "Back";
      case STEPS.IMAGES:
        return "Back";
      case STEPS.BUYER:
        return "Back";
      case STEPS.REVIEW:
        return "Back";
    }
  }, [step]);

  const image = watch("image");

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

    setIsLoading(true);

    data.category = selectedCategory;
    data.buyerId = formValues.buyerId;
    data.bidderId = session.user.id;

    await axios
      .post("/api/listings", data)
      .then(() => {
        toast.success("Offer created successfully!");
        router.refresh();
        reset();
        setStep(STEPS.DESCRIPTION);
        offerModal.onClose();
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
      />
      <div className="mb-4">

      <Input id="title" label="Name of thing" type="text" register={register} />
      {errors.title && typeof errors.title.message === "string" && (
        <div className="text-red-500">{errors.title.message}</div>
      )}
      </div>
      <div className="mb-4">

      <label className="mb-2" htmlFor="description">
        Description
      </label>
      <textarea
        id="description"
        rows={5}
        className={`
          peer
          w-full
          p-2
          
          bg-white
          border-2
          rounded-md
          outline-none
          transition
          disabled:cursor-not-allowed
          disabled:opacity-50
        `}
        {...register("description")}
      />
      {errors.description && typeof errors.description.message === "string" && (
        <div className="text-red-500">{errors.description.message}</div>
      )}
      </div>


      <Input
        id="price"
        label="Starting price (optional)"
        type="number"
        modal
        formatPrice
        register={register}
      />
      {errors.price && typeof errors.price.message === "string" && (
        <div className="text-red-500">{errors.price.message}</div>
      )}
    </div>
  );
  if (step === STEPS.CATEGORY) {
    const updateCategory = (category: string) => {
      setSelectedCategory(category);
      setValue("category", category);
    };

    bodyContent = (
      <div className="flex flex-col">
        <Heading
          title="Select a category"
          description="Choose the category that best describes the item."
        />
        {errors.category && typeof errors.category.message === "string" && (
          <div className="text-red-500 text-sm">{errors.category.message}</div>
        )}
        {!selectedCategory && (
          <div className="text-red-500 text-sm">Select a category</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
          {categories.map((category) => (
            <div key={category.id}>
              <div className="font-bold">{category.name}</div>
              {category.items.map((item) => (
                <CategoryInput
                  name={item.name}
                  key={item.slug}
                  selected={selectedCategory === item.name}
                  onClick={updateCategory}
                  register={register}
                />
              ))}
            </div>
          ))}
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
          title="Seller information"
          description="Enter the seller information."
        />

        <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto">
          {foundUser ? (
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">Found:</p>
                <h2 className="-mt-4 font-extrabold text-orange-600 text-4xl">{foundUser.username}</h2>
              </div>
              <div>
                <button onClick={() => setFoundUser(null)} className="rounded-md bg-orange-500 text-white px-2 ">
                  Change
                </button>
              </div>
            </div>
            
          ) : (
            <div className="flex border-2 border-gray-300 ">
              <input
                id="username"
                type="text"
                required
                placeholder="Enter MYAO name"
                className="rounded-md p-2 flex-1"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                {...register}
              />
              <button
                className="bg-orange-500 px-2 my-auto rounded-r-md mr-auto text-sm py-2 text-white flex gap-2 items-center"
                onClick={onSearchUser}
              >
                Search <BiChevronRight />
              </button>{" "}
            </div>
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
        />
        <div>
          <h5 className="mb-4">Review Details</h5>
          <div className="flex gap-4">
            <div className="w-1/5">
              <img
                src={`${image ? image : `/images/cat.png`}`}
                alt="offer"
                className="object-cover rounded-md"
              />
            </div>

            <div className="flex-1">
              <div className="font-medium">{title}</div>
              <div className="flex justify-between">
                <div className=""><span className="font-medium">Category:</span> {category}</div>
                <div className=""><span className="font-medium">Bid:</span> £{price}</div>
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
      onClose={offerModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      actionLabel={actionLabel}
      secondaryAction={step > STEPS.DESCRIPTION ? onBack : undefined}
      secondaryActionLabel={secondaryActionLabel}
      body={bodyContent}
      disabled={Object.keys(errors).length > 0}
      errors={errors}
    />
  );
};

export default OfferModal;
