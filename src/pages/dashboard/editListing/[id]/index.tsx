import { GetServerSideProps } from "next";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import getListingById from "@/actions/getListingById";
import axios from "axios";
import { Dash } from "@/templates/dash";
import { Meta } from "@/layouts/meta";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import Input from "@/components/inputs/Input";
import { itemCategories } from "@/data/cateories";
import CategoryInput from "@/components/inputs/CategoryInput";
import Button from "@/components/dashboard/Button";
import ImageUpload from "@/components/inputs/ImageUpload";
import { getSession, useSession } from "next-auth/react";
import PriceInput from "@/components/inputs/PriceInput";
import TextArea from "@/components/inputs/TextArea";
import { BiCategory, BiCategoryAlt, BiUserCircle } from "react-icons/bi";
import { IoPricetagOutline } from "react-icons/io5";
import { useSocket } from "@/hooks/useSocket";

enum STEPS {
  DESCRIPTION = 0,
  CATEGORY = 1,
  IMAGES = 2,
  REVIEW = 3,
}

interface EditListingProps {
  listing: any;
}

enum INPUTS {
  TITLE = "title",
  DESCRIPTION = "description",
  PRICE = "price",
  CATEGORY = "category",
  IMAGE = "image",
  PUBLIC = "public",
  EMAIL = "email",
  SELLERID = "sellerId",
  BUYERID = "buyerId",
} 

enum LISTINGSTATE {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

type INITLISTILNG = {
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  email: string;
  sellerId: string;
  buyerId: string;
};

const EditListing: React.FC<EditListingProps> = ({ listing }) => {
  const INIT = {
    title: "",
    description: "",
    price: 0,
    category: "",
    image: "",
    buyerId: "",
    sellerId: "",
    email: "",
  };

  const [ currentListing, setCurrentListing ] = useState<INITLISTILNG>(INIT);
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(STEPS.DESCRIPTION);
  const [disabled, setDisabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const router = useRouter();
  const { data: session } = useSession();
  const { emitEvent } = useSocket(session);

  const { title, price, description, category, image: img, buyerId, sellerId, email } = currentListing;

  useEffect(() => {
    setCurrentListing(listing);
  },[listing])

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
      title: title,
      description: description,
      price: price,
      category: category,
      image: img,
      buyerId: buyerId,
      public: isPublic,
      email: email,
      sellerId: sellerId,
    },
  });

  const [formValues, setFormValues] = useState<FieldValues>({
    title: title,
    description: description,
    price: price,
    category: category,
    image: img,
    buyerId: buyerId,
    public: isPublic,
    email: email,
    sellerId: sellerId,
  });

  const updateFormValues = (values: FieldValues) => {
    setFormValues(values);
  };

  const validateStep = (step: any, data: any) => {
    const validation = {
      isValid: true,
      errors: {},
    };

    switch (step) {
      case STEPS.DESCRIPTION:
        if (!data.title) {
          validation.isValid = false;
          setError("title", { message: "Title is required" });
        }
        if (!data.description) {
          validation.isValid = false;
          setError("description", { message: "Description is required" });
        }
        if (!data.price) {
          validation.isValid = false;
          setError("price", { message: "Price is required" });
        }
        break;
      case STEPS.CATEGORY:
        if (!data.category) {
          validation.isValid = false;
          setError("category", { message: "Category is required" });
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
      case STEPS.REVIEW:
        return "Update Offer";
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
      case STEPS.REVIEW:
        return "Back";
    }
  }, [step]);

  const image = watch("image");

  let im = null;

  if (image) {
    let arr = new Array(image);
    im = JSON.parse(image);
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
    setIsSubmitting(true);

    await axios
      .put(`/api/updateListing/${listing.id}`, data)
      .then((response) => {
        const data = response.data;
        toast.success("Offer updated successfully!");
        router.push(`/dashboard/offers/${listing.id}`);
        reset();
        setStep(STEPS.DESCRIPTION);
        // emitEvent("update_listing", listing);
        emitEvent(
          "updated_activities",
          data.transactionOperations,
          data.listing.sellerId,
          data.listing.buyerId
        );
      })
      .catch((err) => {
        console.log("Something went wrong!");
        toast.error("Something went wrong!");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  let bodyContent = (
    <div className="flex flex-col">
      <Input id="title" label="Title" type="text" register={register} />
      <label className="mb-2" htmlFor="description">
        Description
      </label>
      <TextArea
        id="description"
        label="Description"
        errors={errors}
        disabled={isLoading || isSubmitting}
        register={register}
        rows={5}
        clearErrors={() => clearErrors("description")}
      />
      <PriceInput
        id="price"
        label="Price"
        type="number"
        modal
        formatPrice
        required
        register={register}
        errors={errors}
        disabled={isLoading || isSubmitting}
      />
    </div>
  );
  if (step === STEPS.CATEGORY) {
    const updateCategory = (category: string) => {
      setSelectedCategory(category);
      setValue("category", category);
    };

    bodyContent = (
      <div className="flex flex-col">
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
  if (step === STEPS.IMAGES) {
    bodyContent = (
      <div className="flex flex-col">
        <div>
          <ImageUpload
            value={image}
            onChange={(value) => setCustomValue("image", value)}
          />
        </div>
      </div>
    );
  }

  if (step === STEPS.REVIEW) {
    bodyContent = (
      <div className="flex flex-col">
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
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium flex">
                  <BiUserCircle />
                </span>
                {listing?.type === "sellerOffer"
                  ? listing.buyer.username
                  : listing.seller.username}
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
    );
  }

  return (
    <Dash meta={<Meta title="" description="" />}>
      <div className="container px-4 mx-auto max-w-xl bg-oange-50 flex-grow lg:items-end">
        <div className="md:flex md:flex-wrap mt-10 gap-6">
          <div className="flex-1 bg-white border-2 border-gray-200 p-8 rounded-lg">
            <div className="flex flex-wrap items-center justify-between -mx-4 mb-8 pb-6 border-b border-gray-400 border-opacity-20">
              <div className="w-full sm:w-auto px-4 mb-6 sm:mb-0">
                <h4 className="text-2xl font-bold tracking-wide mb-1">
                  Edit Listing
                </h4>
                <p className="text-sm">Edit Your Offer</p>
              </div>
            </div>
            {bodyContent}
            <div className="flex mt-4 gap-4 justify-between">
              {step > STEPS.DESCRIPTION && (
                <Button
                  disabled={disabled}
                  label={secondaryActionLabel || "Back"}
                  onClick={step > STEPS.DESCRIPTION ? onBack : undefined}
                />
              )}
              <div className="ml-auto">
                <Button
                  disabled={disabled || isSubmitting}
                  isLoading={isSubmitting}
                  label={actionLabel || "Submit"}
                  onClick={handleSubmit(onSubmit)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dash>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  
  const offerId = context?.params?.id as string;
  const session = getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  try {
    const listing = await getListingById({ offerId });
    return {
      props: {
        listing,
      },
    };
  } catch (error) {
    console.error("Error fetching listing:", error);
    return {
      notFound: true,
    };
  }
};

export default EditListing;
