import { GetServerSideProps } from "next";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import getBidByID from "@/actions/getBidByID";
import axios from "axios";
import { Dash } from "@/templates/dash";
import { Meta } from "@/layouts/meta";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { BiCheckbox, BiCheckboxChecked } from "react-icons/bi";
import Input from "@/components/inputs/Input";
import { categories } from "@/data/cateories";
import CategoryInput from "@/components/inputs/CategoryInput";
import Button from "@/components/Button";
import ImageUpload from "@/components/inputs/ImageUpload";
import UsernameSelect from "@/components/UsernameSelect";

enum STEPS {
  DESCRIPTION = 0,
  CATEGORY = 1,
  IMAGES = 2,
  BUYER = 3,
  REVIEW = 4,
}

interface EditListingProps {
  listing: any; // Replace with your actual listing type
}

const EditListing: React.FC<EditListingProps> = ({ listing }) => {
  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description);
  const [price, setPrice] = useState(listing.price);
  const [category, setCategory] = useState(listing.category);
  const [img, setImg] = useState(listing?.image);
  const [buyerId, setBuyerId] = useState(listing.buyerId);
  const [location, setLocation] = useState(listing?.location);
  const [email, setEmail] = useState(listing?.email);
  const [isPublic, setIsPublic] = useState(listing.public);
  const [sellerId, setSellerId] = useState(listing.sellerId);
  const [selectedCategory, setSelectedCategory] = useState(listing.category);

  const [isBuyer, setIsBuyer] = useState(true);
  const [isLocation, setIsLocation] = useState(true);

  const [step, setStep] = useState(STEPS.DESCRIPTION);

  const [disabled, setDisabled] = useState(false);
  const router = useRouter();

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
        if (!data.category) {
          validation.isValid = false;
          setError("category", { message: "Category is required" }); // Set the error for the "category" field
        }
        break;
      case STEPS.IMAGES:
        // Add validation for the image field if required
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

    await axios
      .put(`/api/updateListing/${listing.id}`, data)
      .then(() => {
        toast.success("Offer created successfully!");
        router.push(`/dashboard/offers/${listing.id}`);
        reset();
        setStep(STEPS.DESCRIPTION);
      })
      .catch((err) => {
        console.log("Something went wrong!");
        toast.error("Something went wrong!");
      })
      .finally(() => {});
  };

  let bodyContent = (
    <div className="flex flex-col">
      <Input id="title" label="Title" type="text" register={register} />
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
      <Input
        id="price"
        label="Price"
        type="number"
        modal
        formatPrice
        required
        register={register}
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
                  register={register} // Add this
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
        <div>
          <div className="flex gap-4">
            <div>
              <img
                className="w-40 object-cover rounded-md"
                src={image || "/images/cat.png"}
                alt={title} />

            </div>
            <div>
              <h5>{title}</h5>
              
              <p><span className="font-medium">Price:</span> £{price}</p>
              <p><span className="font-medium">Category:</span> {category}</p>
             
              
              <hr className="my-4" />
              <h6 className="font-medium">Details</h6>
              <p>{description}</p>
            

            </div>
          </div>
          
          
        
        </div>
      </div>
    );
  }

  return (
    <Dash meta={<Meta title="" description="" />}>
      <div className="container px-4 mx-auto max-w-xl">
        <div className="md:flex md:flex-wrap mt-10 gap-6">
          <div className="flex-1 bg-white border-2 border-gray-200 p-8">
            <div className="flex flex-wrap items-center justify-between -mx-4 mb-8 pb-6 border-b border-gray-400 border-opacity-20">
              <div className="w-full sm:w-auto px-4 mb-6 sm:mb-0">
                <h4 className="text-2xl font-bold tracking-wide mb-1">
                  Edit Listing
                </h4>
                <p className="text-sm">Edit Your Offer</p>
              </div>
              
            </div>
            {bodyContent}
            <div className="flex mt-4 gap-4">
              {step > STEPS.DESCRIPTION && (
                <Button
                  disabled={disabled}
                  label={secondaryActionLabel || "Back"}
                  outline
                  onClick={step > STEPS.DESCRIPTION ? onBack : undefined}
                />
              )}
              <Button
                disabled={disabled}
                label={actionLabel || "Submit"}
                onClick={handleSubmit(onSubmit)}
              />
            </div>
          </div>
        </div>
      </div>
    </Dash>
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

export default EditListing;
