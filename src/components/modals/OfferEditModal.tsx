"use client";

import Modal from "./Modal";
import Heading from "./Heading";
import CategoryInput from "../inputs/CategoryInput";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import TextArea from "../inputs/TextArea";
import Input from "../inputs/Input";
import ImageUpload from "../inputs/ImageUpload";
import CityAutocomplete from "../dashboard/AutoComplete";
import useOfferEditModal from "@/hooks/useOfferEditModal";
import { useEffect, useState } from "react";
import { useSocketContext } from "@/context/SocketContext";
import { itemCategories } from "@/data/cateories";
import { CustomListing } from "@/interfaces/authenticated";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { 
  FieldValues,
  SubmitHandler,
  useForm
} from "react-hook-form";

enum SECTIONS {
  DEFAULT = "default",
  DESCRIPTION = "description",
  ITEM = "item",
  CATEGORY = "category",
  IMAGES = "images",
}

type OfferEditModalProps = {
    listing?: CustomListing | null;
    data: any;
    user?: any;
    section?: string | null;
  };
type Location = {
   city: string | undefined;
   region: string;
  };
  type Options = {
    location: Location;
    condition: string;
    pickup: string;
  };
const OfferEditModal = () => {

  const offerEditModal = useOfferEditModal();

  const {listing, user, data, section: sectionProp}: OfferEditModalProps = offerEditModal
  const { data: session, status } = useSession();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCity, setSelectedCity] = useState<{
    region: string | '';
    city?: string | undefined;
  }>({ city: "" || undefined, region: "" });

  const [section, setSection] = useState("")
  // console.log("foundUser", foundUser);
  // console.log("session", session);

  const [currentListing, setCurrentListing] = useState<CustomListing | null | undefined>()

  useEffect(() => {
    if(!listing){
      setIsLoading(true)
    }
    setCurrentListing(listing)
    setIsLoading(false)
  }, [listing])

  let location: {}, condition: string, pickup: string;

    if (listing && listing.options) {
        ({ location, condition, pickup } = listing.options as Options);
    }

  useEffect(() => {
    if(offerEditModal?.section && data) 
    setSection(sectionProp ? sectionProp : "")
    setValue("title", listing?.title),
    setValue("description", listing?.description)
    setValue("image", listing?.image)
    setValue("category", listing?.category),
    setValue("condition", condition ? condition : "" ),
    setValue("pickup", pickup ? pickup : "")
    setSelectedCategory(listing?.category || "")
    setSelectedCity(location && (location as Location) )   
  }, [sectionProp]);

  let defaultValues = {}

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
    defaultValues: defaultValues,
  });
  
  const validate = (data: any) => {
    const validation = {
      isValid: true,
      errors: {} as Record<string, { message: string }>,
    };
    switch (offerEditModal.section) {
        case SECTIONS.DESCRIPTION:
        if (!data.title) {
          validation.isValid = false;
          setError("title", { message: "Title is required" });
        }
        if (!data.description) {
          validation.isValid = false;
          setError("description", { message: "Description is required" });
        }
        break;
      case SECTIONS.ITEM:
        break;
      case SECTIONS.CATEGORY:
        if (selectedCategory.length === 0) {
          validation.isValid = false;
          validation.errors["category"] = { message: "Category is required" };
        }
        break;
        case SECTIONS.DEFAULT:
        if (!data.title) {
          validation.isValid = false;
          setError("title", { message: "Title is required" });
        }
        if (!data.description) {
          validation.isValid = false;
          setError("description", { message: "Description is required" });
        }
        if (selectedCategory.length === 0) {
          validation.isValid = false;
          validation.errors["category"] = { message: "Category is required" };
        }
        break;
    }

    return validation;
  };

  const onClose = () => {
    
    offerEditModal.onClose();
  };

  const image = watch("image");

  let im = null;

  if (image) {
    let arr = new Array(image);
    im = JSON.parse(image);
  }

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const socket = useSocketContext()


  const onSubmit: SubmitHandler<FieldValues> = async (data: any) => {

    if(!offerEditModal.user || !offerEditModal.listing?.id){
        return console.log("Missing parameters")
    }
    const stepValidationResult = validate(data);
    if (!stepValidationResult.isValid) {
      return console.log("Validation failed!")
    }

    setIsSubmitting(true);
    data.category = selectedCategory ? selectedCategory : "";
    data.options = { location: selectedCity ? selectedCity : "" };

    const transaction = {
        id: offerEditModal.listing.id,
        userId: session?.user.id,
        data: data
    }

    await axios
      .put("/api/listings", transaction)
      .then((response) => {
        toast.success("Offer updated successfully!");
        offerEditModal.onClose();
        socket.emit(
          "update_listing",
          response.data.listing,
          session?.user.id,
          listing?.sellerId === session?.user.id ? listing?.buyerId : listing?.sellerId,
        );
        socket.emit(
          "update_activities",
          response.data.transactionResult,
          response.data?.listing?.sellerId,
          response.data.listing.buyerId
        );
        
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong!");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  if(SECTIONS.DESCRIPTION === section && !isLoading){

  }
  let bodyContent = (
    <div className="flex flex-col">
      <Heading
        title="Item description"
        description="Update the item title or description"
        nounderline
      />
      <div className="mb-5">
        <Input
          name="title"
          id="title"
          label="Name of thing"
          type="text"
          register={register}
          errors={errors}
          disabled={isLoading}
          onChange={() => clearErrors("title")}
        />
      </div>
      <div>
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
     
   </div>
  );


  if (SECTIONS.ITEM === section && !isLoading) {
    const city = selectedCity?.city 
    const region = selectedCity?.region 
    bodyContent = (
    <div className="flex flex-col">
      <Heading
        title="Item Details"
        description="Important infortmation about your thing"
        nounderline
      />
      <div className="mb-5">
      
       
      </div>
        <div className="mb-4">
        <label className="block mb-3">
          Condition <span className="italic text-gray-500 text-sm "> (Optional)</span>
        </label>
        <select defaultValue={'Select'} className="w-full border border-gray-200 rounded-xl p-3 focus:border-orange-300 focus:ring-0 active:ring-0 active:border-0 " {...register('condition')}>
          <option value="Select" disabled className="text-gray-600">Select</option>
          <option value="new">New</option>
          <option value="used">Used</option>
          <option value="damaged">Damaged</option>
        </select>

        </div>
        <div className="mb-4">
        <label className="block mb-3">
          Pickup <span className="italic text-gray-500 text-sm "> (Optional)</span>
        </label>
        <select defaultValue={'Select'} className="w-full border border-gray-200 rounded-xl p-3 focus:border-orange-300 focus:ring-0" {...register('pickup')}>
          <option value="Select" disabled className="text-gray-600">Select</option>
          <option className=" focus:border-orange-300 focus:ring-0" value="collection">Collection Only</option>
          <option value="pickup">Pickup Only</option>
          <option value="both">Collection or Pickup</option>
        </select>

        </div>
    
      </div>
    );
  };

  if (SECTIONS.CATEGORY === section && !isLoading) {
    const updateCategory = (category: string) => {
      setSelectedCategory(category);
      setValue("category", category);
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
          {itemCategories.map((item, i) => (
            <CategoryInput
              name={item}
              key={i}
              selected={selectedCategory === item}
              onClick={updateCategory}
              register={register}
            />
          ))}
        </div>
      </div>
    );
  }
  
  if (SECTIONS.IMAGES === section && !isLoading) {
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
  if (isLoading) {
    bodyContent = (
      <div className="flex flex-col">
        <Skeleton width={40} height={30} />
        <Skeleton width={30} height={20} />
        <div>
          <div className="flex flex-col gap-2">
        <Skeleton width={100} height={30} />
        <Skeleton width={100} height={30} />
        <Skeleton width={100} height={30} />
        <Skeleton width={100} height={30} />
        <Skeleton width={100} height={30} />

          </div>
        </div>
      </div>
    );
  }

  if (SECTIONS.DEFAULT === section) {

    const city = selectedCity?.city 
    const region = selectedCity?.region 
    
    const updateCategory = (category: string) => {
      setSelectedCategory(category);
      setValue("category", category);
      
    return (
      <>
      {/* Description */}
      <div className="flex flex-col">
      <Heading
        title="Update listing"
        description="Update the listing"
        nounderline
      />
      <div className="mb-5">
        <Input
          name="title"
          id="title"
          label="Name of thing"
          type="text"
          register={register}
          errors={errors}
          disabled={isLoading}
          onChange={() => clearErrors("title")}
        />
      </div>
      <div>
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
     
   </div>

      {/* Item */}

      <div className="flex flex-col">
      <Heading
        title="Item Details"
        description="Important infortmation about your thing"
        nounderline
      />
      <div className="mb-5">
      
       
      </div>
        <div className="mb-4">
        <label className="block mb-3">
          Condition <span className="italic text-gray-500 text-sm "> (Optional)</span>
        </label>
        <select defaultValue={'Select'} className="w-full border border-gray-200 rounded-xl p-3 focus:border-orange-300 focus:ring-0 active:ring-0 active:border-0 " {...register('condition')}>
          <option value="Select" disabled className="text-gray-600">Select</option>
          <option value="new">New</option>
          <option value="used">Used</option>
          <option value="damaged">Damaged</option>
        </select>

        </div>
        <div className="mb-4">
        <label className="block mb-3">
          Pickup <span className="italic text-gray-500 text-sm "> (Optional)</span>
        </label>
        <select defaultValue={'Select'} className="w-full border border-gray-200 rounded-xl p-3 focus:border-orange-300 focus:ring-0" {...register('pickup')}>
          <option value="Select" disabled className="text-gray-600">Select</option>
          <option className=" focus:border-orange-300 focus:ring-0" value="collection">Collection Only</option>
          <option value="pickup">Pickup Only</option>
          <option value="both">Collection or Pickup</option>
        </select>

        </div>
    
      </div>

      {/* Location */}

      
      
      {/* Category */}

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
          {itemCategories.map((item, i) => (
            <CategoryInput
              name={item}
              key={i}
              selected={selectedCategory === item}
              onClick={updateCategory}
              register={register}
            />
          ))}
        </div>
      </div>
      {/* Images */}
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
      </>
    )
   

   
  
    };
  

   
  }
  
  return (
    <Modal
      title="Update your thing"
      isOpen={offerEditModal.isOpen}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      actionLabel={"Update"}
      body={bodyContent}
      disabled={Object.keys(errors).length > 0}
      isLoading={isSubmitting}
      errors={errors}
    />
  );
};

export default OfferEditModal;
