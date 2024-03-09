import React, { useState } from "react";
import Heading from "../modals/Heading";
import Input from "../inputs/Input";

import { itemCategories, itemSubCategories } from "@/data/cateories";
import { useEffect } from "react";
import PriceInput from "../inputs/PriceInput";
import axios from "axios";
import { Session } from "next-auth";
import useDataModal from "@/hooks/useDataModal";
import Button from "../dashboard/Button";

type Category = keyof typeof itemSubCategories;

type Listing = {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  description: string;
  price: number;
  type: string;
};

type FormProps = {
  listing?: Listing;
  setCurrentListing: (listing: Listing) => void;
  session: Session;
};

const EditTradeDetailsForm = ({
  listing,
  updateDetails,
  session,
}: {
  listing?: {
    id: string;
    title: string;
    category: string;
    subcategory: string;
    description: string;
    price: number;
    type: string;
  };
  updateDetails: ({
    title,
    category,
    subcategory,
    description,
    price,
    type,
  } : {
    title: string,
    category: string,
    subcategory: string,
    description: string,
    price: number,
    type: string}) => void;
  session: Session;
}) => {
  if (!listing) return <div>No listing found</div>;
  if (!listing.id) return <div>Provide a listing id</div>;

  const itemCategories = Object.keys(itemSubCategories);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    subcategory: "",
    description: "",
    price: 0,
    type: "",
  });

  const [errors, setErrors] = useState<{
    title?: string;
    category?: string;
    subcategory?: string;
    description?: string;
    price?: string;
  }>({
    title: "",
    category: "",
    subcategory: "",
    description: "",
    price: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const { onClose } = useDataModal();

  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title || "",
        category: listing.category || "",
        subcategory: listing.subcategory || "",
        description: listing.description || "",
        price: listing.price || 0,
        type: listing.type || "",
      });
    }
  }, [listing]);

  const clearError = (key: string) => {
    setErrors((prev) => ({
      ...prev,
      [key]: "",
    }));
  };

  const validate = () => {
    let isValid = true;
    if (!formData.title) {
      setErrors((prev) => ({ ...prev, title: "Title is required" }));
      isValid = false;
    }
    if (!formData.category) {
      setErrors((prev) => ({ ...prev, category: "Category is required" }));
      isValid = false;
    }
    if (!formData.subcategory) {
      setErrors((prev) => ({
        ...prev,
        subcategory: "Subcategory is required",
      }));
      isValid = false;
    }
    if (!formData.description) {
      setErrors((prev) => ({
        ...prev,
        description: "Description is required",
      }));
      isValid = false;
    }
    return isValid;
  };

  const update = async () => {
    if (!validate()) return;
    setIsLoading(true);
    updateDetails(formData);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="flex flex-col">
      <div className="mb-5">
        <Input
          name="title"
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
        {errors.title && typeof errors.title === "string" && (
          <div className="text-red-500 text-sm">{errors.title}</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
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
          {errors.category && typeof errors.category === "string" && (
            <div className="text-red-500 text-sm">{errors.category}</div>
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
            {errors.subcategory && typeof errors.subcategory === "string" && (
              <div className="text-red-500 text-sm">{errors.subcategory}</div>
            )}
          </div>
        )}
      </div>

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
        {errors.description && typeof errors.description === "string" && (
          <div className="text-red-500 text-sm">{errors.description}</div>
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
          value={String(formData.price)}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              price: Number(e.target.value),
            }));
          }}
          sm
          optional
        />
      </div>
      {errors.price && typeof errors.price === "string" && (
        <div className="text-red-500 text-sm">{errors.price}</div>
      )}
      <div className="pt-5 flex justify-end">
        <Button onClick={update} isLoading={isLoading} primary>
          Update
        </Button>
      </div>
    </div>
  );
};

export default EditTradeDetailsForm;
