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
import { BiCheckbox, BiCheckboxChecked } from "react-icons/bi";
import UsernameSelect from "../UsernameSelect";

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

  // Callback function to update form values
  const updateFormValues = (values: FieldValues) => {
    setFormValues(values);
  };

  console.log("formValues", formValues);

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
          setStep(step + 1);
          setFormValues({ ...formValues, ...data });
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

    data.buyerId = formValues.buyerId;
    data.category = selectedCategory;

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
        title="Tell us about your offer"
        description="Enter the title and description of the item."
      />
      <Input id="title" label="Title" type="text" register={register} />
      {errors.title && typeof errors.title.message === "string" && (
        <div className="text-red-500">{errors.title.message}</div>
      )}

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
          font-light
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

      <Input
        id="price"
        label="Price"
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
          <div
            className="flex gap-2 items-center cursor-pointer"
            onClick={() => setBuyer(!buyer)}
          >
            {buyer ? (
              <BiCheckbox className="text-xl" />
            ) : (
              <BiCheckboxChecked className="text-xl" />
            )}
            <span>I don't know the buyer</span>
          </div>
          {buyer && (
            <UsernameSelect
              create
              formValues={formValues}
              updateFormValues={updateFormValues}
            />
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
          <h5>Review Details</h5>
          <div className="flex gap-4">
            <div className="w-1/5">
              <img
                src={`${image ? image : `/images/cat.png` }` }
                alt="offer"
                className="object-cover rounded-md"
              />
            </div>

            <div className="flex-1">
              <div className="font-medium">{formValues.title}</div>
              <div className="flex justify-between">
                <div className="font-light">{formValues.category}</div>
                <div className="font-light">Bid: {formValues.price}</div>
              </div>
              <div className="font-light mt-4">
                <div className="font-medium">Description</div>
                
                {formValues.description}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <Modal
      title="Create an offer"
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
