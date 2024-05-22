import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Button from "../Button";
import useModal from "@/hooks/useModal";
import { BiCheckCircle } from "react-icons/bi";
import {
  checkUsernameAvailability,
  getUsernameSuggestions,
} from "@/utils/user";
import { Controller } from "react-hook-form";

const CreateUserForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    username: "",
  });

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    username?: string;
  }>({
    name: "",
    email: "",
    password: "",
    role: "",
    username: "",
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [usernameIsAvailable, setUsernameIsAvailable] = useState(false);

  useEffect(() => {
    if (formData.username.length < 3) return;
    console.log(suggestions);
    checkUsernameAvailability([formData.username]).then((result) => {
      if (result && result[0] === formData.username && result[0].length > 3) {
        setUsernameIsAvailable(true);
      } else {
        setUsernameIsAvailable(false);
      }
    });
  }, [formData.username]);

  const { name, email, password, role, username } = formData;

  const router = useRouter();
  const modal = useModal();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validate = () => {
    let isValid = true;
    if (!name) {
      setErrors((prev) => ({ ...prev, name: "Name is required" }));
      isValid = false;
    }
    if (name.length < 3) {
      setErrors((prev) => ({
        ...prev,
        name: "Name must be at least 3 characters",
      }));
      isValid = false;
    }
    if (!email) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      isValid = false;
    }
    if (!email.includes("@") || !email.includes(".") || email.length < 5) {
      setErrors((prev) => ({ ...prev, email: "Email is invalid" }));
      isValid = false;
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: "Password is required" }));
      isValid = false;
    }
    if (!role) {
      setErrors((prev) => ({ ...prev, role: "Role is required" }));
      isValid = false;
    }
    return isValid;
  };

  const onSubmit = async () => {
    if (validate()) {
      try {
        const res = await axios.post("/api/users", formData);

        router.refresh();
        modal.onClose();
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Form is invalid");
    }
  };
  return (
    <div>
      <div className="flex flex-col pb-3">
        <label
          htmlFor="name"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Name
        </label>
        <input
          className=" bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg px-2 py-2 outline-none "
          type="text"
          name="name"
          value={name}
          onChange={(e) => onChange(e)}
        />
        {errors.name && <span className="text-red-400">{errors.name}</span>}
      </div>
      <div className="flex flex-col pb-3">
        <label
          htmlFor="email"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Email
        </label>
        <input
          className=" bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg px-2 py-2 outline-none "
          type="text"
          name="email"
          value={email}
          onChange={(e) => onChange(e)}
        />
        {errors.email && <span className="text-red-400">{errors.email}</span>}
      </div>
      <label
        htmlFor="username"
        className="block mb-2 text-sm font-medium text-gray-900"
      >
        MYAO name
      </label>
      <div className="relative">
        <input
          type="text"
          id="username"
          className={`lowercase bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg px-2 py-2 outline-none ${
            usernameIsAvailable
              ? "focus:border-green-500 focus:ring-green-600"
              : "focus:border-red-500 focus:ring-red-600"
          } block w-full p-2.5 `}
          placeholder="johnbaker79"
          onChange={(e) => onChange(e)}
          value={username}
          name="username"
        />

        {usernameIsAvailable && (
          <div className="absolute top-0 right-0 flex items-center h-full mr-2">
            <BiCheckCircle className="text-green-500" />
          </div>
        )}
      </div>

      {errors.username ? (
        errors.username && (
          <span className="text-red-500">{errors.username as String}</span>
        )
      ) : (
        <div className="w-full mt-4 flex gap-2">
          {newUsername &&
            suggestions.map((suggestion) => (
              <div
                key={suggestion}
                onClick={() => {
                  setFormData({ ...formData, username: suggestion });
                  setNewUsername(suggestion);
                }}
                className="
                                bg-gray-100 
                                border-2 
                                border-gray-200 
                                text-sm 
                                text-gray-700 
                                rounded-full
                                px-2
                                cursor-pointer  
                            "
              >
                {suggestion}
              </div>
            ))}
        </div>
      )}
      <div className="flex flex-col">
        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">Password</label>
        <input
          type="password"
          name="password"
          className=" bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg px-2 py-2 outline-none "
          value={password}
          onChange={(e) => onChange(e)}
        />
      </div>

      <div className="flex flex-col mb-6 pt-3">
        <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-900">Role</label>

        <label htmlFor="admin" className="block mb-2 text-sm font-medium text-gray-900">
        <input
          id="admin"
          type="radio"
          name="role"
          className=" bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg px-2 py-2 outline-none "
          value={"admin"}
          defaultChecked={role === "admin"}
          onChange={(e) => onChange(e)}
        /> Admin</label>
        <label htmlFor="admin" className="block mb-2 text-sm font-medium text-gray-900">
        <input
          id="admin"
          type="radio"
          name="role"
          className=" bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg px-2 py-2 outline-none "
          value={"user"}
          defaultChecked={role !== "admin"}
          onChange={(e) => onChange(e)}
        /> User</label>
      </div>
      <Button type="button" onClick={onSubmit}>
        Save
      </Button>
    </div>
  );
};

export default CreateUserForm;
