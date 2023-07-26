"use client";
import Button from "@/components/Button";
import React, { useEffect } from "react";
import axios from "axios";
import { useState } from "react";
import {
  FieldValues,
  useForm,
  SubmitHandler,
  Controller,
} from "react-hook-form";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { BiCheckCircle } from "react-icons/bi";
import Loading from "@/components/LoadingScreen";
import Link from "next/link";

async function checkUsernameAvailability(
  usernames: string[]
): Promise<string[]> {
  return await axios
    .post("/api/checkUsernames/", usernames)
    .then((response) => {
      const validUsernames = response.data;
      return validUsernames;
    });
}

async function getUsernameSuggestions(username: string): Promise<string[]> {
  function getSuggestion(prefix: string, numSuggestions: number) {
    const suggestions = [];
    for (let i = 0; i < numSuggestions; i++) {
      const maxDigits = 12 - prefix.length;
      const digits = Math.min(maxDigits, 5);
      const randomNum = Math.floor(Math.random() * Math.pow(10, digits));
      suggestions.push(`${prefix}${randomNum}`);
    }
    return suggestions;
  }

  let email = username;
  let prefix = email.split("@")[0];

  if (!isNaN(parseInt(prefix[0]))) {
    prefix = prefix.substring(1);
  }

  prefix = prefix.slice(0, 7);

  const checkNames = getSuggestion(prefix, 3);
  return checkUsernameAvailability(checkNames);
}

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    setValue,
    control,
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
    },
  });

  const validate = (data: any) => {
    const validation = {
      isValid: true,
      errors: {} as Record<string, { message: string }>,
    };

    if (!data.password) {
      validation.isValid = false;
      setError("password", { message: "Password is required" });
    }
    if (data.password.length < 8) {
      validation.isValid = false;
      setError("password", {
        message: "Password must be at least 8 characters",
      }); 
    }
    if (data.password.length > 20) {
      validation.isValid = false;
      setError("password", {
        message: "Password must be less than 20 characters",
      }); 
    }
    if (data.password) {
      validation.isValid = true; // isValidPassword(data.password);
      setError("password", {
        message:
          "Invalid password. Password should contain at least one digit, one special character, one lower-case letter, one upper-case letter, and should be at least eight characters long.",
      });
    }
    if (!data.confirmPassword) {
      validation.isValid = false;
      setError("confirmPassword", {
        message: "Confirm Password is required",
      });
    }

    if (data.password !== data.confirmPassword) {
      validation.isValid = false;
      setError("passwordNotConfirmed", {
        message: "Passwords do not match",
      });
    }

    if (!data.name) {
      validation.isValid = false;
      setError("name", { message: "Your name is required" });
    }
    if (!data.username) {
      validation.isValid = false;
      setError("username", { message: "Username is required" });
    } else if (!/^[a-zA-Z][a-zA-Z0-9]{2,11}$/.test(data.username)) {
      validation.isValid = false;
      setError("username", {
        message:
          "Username must start with a letter and can only contain letters and numbers",
      });
    } else if (!usernameIsAvailable) {
      validation.isValid = false;
      setError("username", {
        message: "Username is not available",
      });
    }
    data.username = data.username.toLowerCase();
  };

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [usernameIsAvailable, setUsernameIsAvailable] = useState(false);
  useEffect(() => {
    getUsernameSuggestions(newUsername).then((result) => {
      setSuggestions(result);
    });
    checkUsernameAvailability([newUsername]).then((result) => {
      setUsernameIsAvailable(
        newUsername.length > 2 && result[0] === newUsername
      );
    });
  }, [newUsername]);

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);
    setDisabled(true);

    const validation = {
      isValid: true,
      errors: {} as Record<string, { message: string }>,
    };

    if (!data.password) {
      validation.isValid = false;
      setError("password", { message: "Password is required" });
    }
    if (data.password.length < 8) {
      validation.isValid = false;
      setError("password", {
        message: "Password must be at least 8 characters",
      }); 
    }
    if (data.password.length > 20) {
      validation.isValid = false;
      setError("password", {
        message: "Password must be less than 20 characters",
      }); 
    }
    if (data.password) {
      validation.isValid = false; // isValidPassword(data.password);
      setError("password", {
        message:
          "Invalid password. Password should contain at least one digit, one special character, one lower-case letter, one upper-case letter, and should be at least eight characters long.",
      });
    }
    if (!data.confirmPassword) {
      validation.isValid = false;
      setError("confirmPassword", {
        message: "Confirm Password is required",
      });
    }

    if (data.password !== data.confirmPassword) {
      validation.isValid = false;
      setError("passwordNotConfirmed", {
        message: "Passwords do not match",
      });
    }

    if (!data.name) {
      validation.isValid = false;
      setError("name", { message: "Your name is required" });
    }
    if (!data.username) {
      validation.isValid = false;
      setError("username", { message: "Username is required" });
    } else if (!/^[a-zA-Z][a-zA-Z0-9]{2,11}$/.test(data.username)) {
      validation.isValid = false;
      setError("username", {
        message:
          "Username must start with a letter and can only contain letters and numbers",
      });
    } else if (!usernameIsAvailable) {
      validation.isValid = false;
      setError("username", {
        message: "Username is not available",
      });
    }
    data.username = data.username.toLowerCase();
 
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      setDisabled(false);
      setConfirmPassword(false);
      setError("passwordNotConfirmed", {
        message: "Passwords do not match",
      });
    }
      axios
        .post("/api/register", data)
        .then((res) => {
          setIsLoading(false);
          setDisabled(false);
          toast.success(res.data.message);
          router.push("/login");
        })
        .catch((err) => {
          console.log(err);
          toast.error(err.response.data.message);
        });
    }

    if (isLoading) {
      return <Loading />;
    }

    return (
      <div className="bg-gray-50">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <Link
            href="/"
            className="flex items-center mb-6 text-2xl font-semibold text-gray-900 "
          >
            <img src="/images/cat.png" className="h-[30px] mr-2" />{" "}
            <span className="self-center text-xl font-semibold whitespace-nowrap">
              MYAO
            </span>
          </Link>
          <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 ">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Create Account
              </h1>
              <form
                className="space-y-4 md:space-y-6"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div>
                  <label
                    htmlFor="name"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Your name
                  </label>
                  <input
                    {...register("name", {
                      required: "This field is required",
                    })}
                    type="text"
                    name="name"
                    id="name"
                    className="bg-gray-50 border capitalize border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    placeholder="joe bloggs"
                  />
                  {errors.name && errors.name.message && (
                    <span className="text-red-500">
                      {errors.name.message as String}
                    </span>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="username"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    MYAO name
                  </label>
                  <div className="relative">
                    <Controller
                      control={control}
                      name="username"
                      render={({ field }) => (
                        <input
                          type="text"
                          id="username"
                          className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg outline-none ${
                            usernameIsAvailable
                              ? "focus:border-green-500 focus:ring-green-600"
                              : "focus:border-red-500 focus:ring-red-600"
                          } block w-full p-2.5 `}
                          placeholder="johnbaker79"
                          onChange={(e) => {
                            field.onChange(e);
                            setNewUsername(e.target.value);
                          }}
                          value={field.value}
                        />
                      )}
                      rules={{ required: "A valid username is required" }}
                    />
                    {usernameIsAvailable && (
                      <div className="absolute top-0 right-0 flex items-center h-full mr-2">
                        <BiCheckCircle className="text-green-500" />
                      </div>
                    )}
                  </div>

                  {errors.username ? (
                    errors.username.message && (
                      <span className="text-red-500">
                        {errors.username.message as String}
                      </span>
                    )
                  ) : (
                    <div className="w-full mt-4 flex gap-2">
                      {newUsername &&
                        suggestions.map((suggestion) => (
                          <div
                            key={suggestion}
                            onClick={() => {
                              setValue("username", suggestion);
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
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Your email
                  </label>
                  <input
                    {...register("email", { required: "Enter your email" })}
                    type="email"
                    name="email"
                    id="email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    placeholder="name@company.com"
                  />
                  {errors.email && errors.email.message && (
                    <span className="text-red-500">
                      {errors.email.message as String}
                    </span>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Password
                  </label>
                  <input
                    {...register("password", { required: "Enter a password" })}
                    type="password"
                    name="password"
                    id="password"
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  />
                  {errors.password && errors.password.message && (
                    <span className="text-red-500">
                      {errors.password.message as String}
                    </span>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Confirm password
                  </label>
                  <input
                    {...register("confirmPassword", {
                      required: "Enter a password",
                    })}
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  />
                  {errors.confirmPassword && errors.confirmPassword.message && (
                    <span className="text-red-500">
                      {errors.confirmPassword.message as String}
                    </span>
                  )}
                </div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      aria-describedby="terms"
                      type="checkbox"
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                      required
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="terms"
                      className="font-light text-gray-500 dark:text-gray-300"
                    >
                      I accept the{" "}
                      <Link
                        className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                        href="#"
                      >
                        Terms and Conditions
                      </Link>
                    </label>
                  </div>
                </div>

                <Button label={`Register`} disabled={disabled} type="submit" />
                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-primary-600 hover:underline text-primary-alt"
                  >
                    Login
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };


export default Register;
