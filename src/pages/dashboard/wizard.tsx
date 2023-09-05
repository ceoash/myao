import getCurrentUser from "@/actions/getCurrentUser";
import Inviter from "@/components/Inviter";
import Loading from "@/components/LoadingScreen";
import Button from "@/components/dashboard/Button";
import AvatarUpload from "@/components/inputs/AvatarUpload";
import UserType from "@/components/wizard/UserType";
import {BiCheckShield, BiImageAdd, BiUserPin, BiBadge, BiCheck} from 'react-icons/bi'
import axios from "axios";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import {
  Controller,
  FieldValues,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { toast } from "react-hot-toast";
import { BiCheckCircle } from "react-icons/bi";
import { AiOutlineUserSwitch } from "react-icons/ai";

enum STEPS {
  PASSWORD = 0,
  REGISTRATION = 1,
  PROFILE = 2,
  CONNECTION = 3,
  FINISH = 4,
}

function isValidURL(string: string) {
  var res = string.match(/(http|https):\/\/[A-Za-z0-9\.-]{3,}\.[A-Za-z]{3,}/g);
  return res !== null;
}

function isValidPassword(password: string) {
  // At least one upper case letter
  // At least one lower case letter
  // At least one digit
  // At least one special character
  // At least eight characters long
  const regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

  return regex.test(password);
}

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
      const digits = Math.min(maxDigits, 5); // Ensure we don't exceed 5 digits
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

  // Ensure prefix is not longer than 7 characters
  prefix = prefix.slice(0, 7);

  const checkNames = getSuggestion(prefix, 3);
  return checkUsernameAvailability(checkNames);
}

const wizard = ({ session, user }: any) => {
  const [step, setStep] = useState(STEPS.PASSWORD);
  const [currentUser, setCurrentUser] = useState<any>(user);
  const [inviter, setInviter] = useState<any>(user.inviter);
  const [userType, setUserType] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    if (user.activated) {
      setIsLoading(true);
      router.push("/dashboard");
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setCurrentUser(user);
    setInviter(user.inviter);
  }, [user]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
    reset,
    setValue,
    clearErrors,
  } = useForm<FieldValues>({
    defaultValues: {
      password: "",
      confirmPassword: "",
      name: "",
      username: "",
      image: user?.profile?.image,
      bio: user?.profile?.bio,
    },
  });
  const validateStep = (step: any, data: any) => {
    const validation = {
      isValid: true,
      errors: {} as Record<string, { message: string }>,
    };

    switch (step) {
      case STEPS.PASSWORD:
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
        break;

      case STEPS.REGISTRATION:
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
        break;
      case STEPS.PROFILE:
     

        if (data.bio && data.bio.length < 10 && data.bio.length > 100) {
          validation.isValid = false;
          setError("bio", {
            message:
              "Bio must not be more than 100 characters and at least 10 characters",
          }); 
        }

        break;
      case STEPS.CONNECTION:
        break;
      case STEPS.FINISH:
        break;
      default:
        break;
    }

    return validation;
  };

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [newUsername, setNewUsername] = useState(currentUser.email);
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

  const onBack = () => {
    setStep(step - 1);
  };
  const onNext = () => {
    handleSubmit((data, event) => {
      event?.preventDefault();
      event?.stopPropagation();

      if (step !== STEPS.FINISH) {
        const stepValidationResult = validateStep(step, data);
        if (stepValidationResult.isValid) {
          setStep(step + 1);
        }
      } else {
        onSubmit(data);
      }
    })();
  };

  const onSecondaryAction = () => {
    if (step !== STEPS.PASSWORD) {
      onBack();
      clearErrors();
    }
  };

  const actionLabel = useMemo(() => {
    switch (step) {
      case STEPS.PASSWORD:
        return "Next";
      case STEPS.REGISTRATION:
        return "Next";
      case STEPS.PROFILE:
        return "Next";
      case STEPS.CONNECTION:
        return "Next";
      case STEPS.FINISH:
        return "Finish";
    }
  }, [step]);

  const secondaryActionLabel = useMemo(() => {
    switch (step) {
      case STEPS.PASSWORD:
        return undefined;
      case STEPS.REGISTRATION:
        return "Back";
      case STEPS.PROFILE:
        return "Back";
      case STEPS.CONNECTION:
        return "Back";
      case STEPS.FINISH:
        return "Back";
    }
  }, [step]);

  const image = watch("image");

  // console.log("suggestions", getUsernameSuggestions("0xdexta@gmail.com"));
  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data: any) => {
    if (step !== STEPS.FINISH) {
      return onNext();
    }

    setIsLoading(true);
    data.username = data.username.toLowerCase();
    data.userType = userType;
    data.activated = true;
    data.id = currentUser.id;
    await axios
      .post("/api/settings/update", data)
      .then((response) => {

        if (response.data.newConversation) {
          router.push("/dashboard/conversations");
        } else {
          router.push("/dashboard");
        }
        
        setIsLoading(true)
        toast.success("Account setup");
        reset();
        setStep(STEPS.PASSWORD);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong!");
      })
      .finally(() => {
        
      });
  };
  return isLoading ? (
    <Loading />
  ) : (
    <div className="flex flex-col items-center w-full p-4 bg-gray-50 h-screen">
      <div className="flex flex-col w-full md:w-9/12  lg:w-1/2 lg:mt-12 border border-gray-200 shadow bg-white rounded-md ">
        <div className="w-full py-4 px-6 mb-6 border-b border-gray-100 shadow-b">
          <h4>Account Setup Wizard</h4>
        </div>
        <div className="px-6 mb-6">
          
<ol  className="flex w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-100 after:border-4 after:inline-block ">
    <li className="flex w-full items-center text-white after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-4 after:inline-block ">
        <span className="flex items-center justify-center w-10 h-10 bg-orange-400  rounded-full lg:h-12 lg:w-12  shrink-0">
        <BiCheckShield />
        </span>
    </li>
    <li className="flex w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-100 after:border-4 after:inline-block ">
        <span className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full lg:h-12 lg:w-12  shrink-0">
            <BiUserPin />
        </span>
    </li>
    <li  className="flex w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-100 after:border-4 after:inline-block ">
        <span className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full lg:h-12 lg:w-12  shrink-0">
        <BiImageAdd />
        </span>
    </li>
    <li  className="flex w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-100 after:border-4 after:inline-block ">
        <span className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full lg:h-12 lg:w-12  shrink-0">
        <BiBadge />
        </span>
    </li>
    <li  className="flex w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-100 after:border-4 after:inline-block ">
        <span className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full lg:h-12 lg:w-12  shrink-0">
        <AiOutlineUserSwitch />
        </span>
    </li>
    <li  className="flex w-full items-center  ">
        <span className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full lg:h-12 lg:w-12  shrink-0">
        <BiCheck />
        </span>
    </li>
</ol>

        </div>
        <div className="px-6 pb-6">
          <form action="#" onChange={() => clearErrors("passwordNotConfirmed")}>
            {STEPS.PASSWORD === step && (
              <>
                <h2 className="mb-4 text-lg font-bold leading-none text-gray-900 ">
                  Enter a password
                </h2>
                <div className="mb-4">
                  {errors.passwordNotConfirmed && (
                    <span className="text-red-500">Passwords don't match</span>
                  )}
                  <div className="mb-4">
                    <label
                      htmlFor="password"
                      className="block mb-2 text-sm font-medium text-gray-900 "
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-orange-600 focus:border-orange-600 block w-full p-2.5 "
                      placeholder="•••••••••"
                      {...register("password", { required: true })}
                    />
                    {errors.password && (
                      <span className="text-red-500">
                        {errors.password.message as string}
                      </span>
                    )}
                  </div>{" "}
                  <div className="mb-4">
                    <label
                      htmlFor="confirmPassword"
                      className="block mb-2 text-sm font-medium text-gray-900 "
                    >
                      Confirm password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-orange-600 focus:border-orange-600 block w-full p-2.5 "
                      placeholder="•••••••••"
                      {...register("confirmPassword", { required: true })}
                    />
                    {errors.confirmPassword && (
                      <span className="text-red-500">
                        {errors.confirmPassword.message as string}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
            {STEPS.REGISTRATION === step && (
              <>
                <h2 className="mb-4 text-lg font-bold leading-none text-gray-900 ">
                  Account details
                </h2>
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-900 "
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-orange-600 focus:border-orange-600 block w-full p-2.5 "
                    placeholder={user.email}
                    required
                    disabled={true}
                  />
                </div>
                <div className="mb-4">
                  <div className="mb-4">
                    <label
                      htmlFor="username"
                      className="block mb-2 text-sm font-medium text-gray-900 "
                    >
                      What is your name?
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-orange-600 focus:border-orange-600 block w-full p-2.5 capitalize "
                      placeholder="John Doe"
                      {...register("name", { required: "Your name is required" })}
                    />
                    {errors?.name && errors?.name?.message && (
                      <span className="text-red-500">
                        {errors?.name.message as String}
                      </span>
                    )}
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="username"
                      className="block mb-2 text-sm font-medium text-gray-900 "
                    >
                      Create a MYAO name
                    </label>
                    <div className="relative flex flex-col justify-center">
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
                        rules={{ required: "A valid is required" }}
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
                        {suggestions.map((suggestion) => (
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
                  <label
                    htmlFor=""
                    className="block mb-2 text-sm font-medium text-gray-900 "
                  >
                    Profile Picture
                  </label>
                  <div className="flex gap-2 items-center">
                    <div className="w-20 h-20">
                      <AvatarUpload
                        value={image}
                        onChange={(value) => setCustomValue("image", value)}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 py-4">
                    Select and upload a profile picture
                  </p>
                </div>
              </>
            )}
            {STEPS.PROFILE === step && (
              <>
                <h2 className="mb-4 text-lg font-bold leading-none text-gray-900 ">
                  Profile details
                </h2>
                <div className="mb-4 flex flex-col">
                  <div className="mb-4">
                    <label
                      htmlFor=""
                      className="block mb-2 text-sm font-medium text-gray-900 "
                    >
                      What brings you to MYAO?
                    </label>
                    <UserType
                      setValue={setValue}
                      setUserType={setUserType}
                      userType={userType}
                    />
                    {errors.userType && (
                      <span className="text-red-500">
                        {errors.userType.message as string}
                      </span>
                    )}
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="bio"
                      className="block mb-2 text-sm font-medium text-gray-900 "
                    >
                      Do you have a website?
                    </label>
                    <input
                      id="website"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-orange-600 focus:border-orange-600 block w-full p-2.5 "
                      placeholder="www.yoursite.com"
                      {...register("website", { required: false })}
                    />
                    {errors.website && (
                      <span className="text-red-500">
                        {errors.website.message as string}
                      </span>
                    )}
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="bio"
                      className="block mb-2 text-sm font-medium text-gray-900 "
                    >
                      Write a short bio about yourself
                    </label>
                    <textarea
                      id="bio"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-orange-600 focus:border-orange-600 block w-full p-2.5 "
                      placeholder="I am an artist, musician, and writer. And I enjoy collecting rare vinyl records..."
                      {...register("bio", {
                        required: false,
                        maxLength: 200,
                        minLength: 10,
                      })}
                    />
                    {errors.bio && (
                      <span className="text-red-500">
                        {errors.bio.message as string}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
            {STEPS.CONNECTION === step && (
              <>
                <h2 className="mb-4 text-lg font-bold leading-none text-gray-900 ">
                  Connect with friends
                </h2>
                <div className="mb-4">
                  {currentUser?.inviter && (
                    <Inviter inviter={currentUser?.inviter} />
                  )}

                  <div className="mb-4">
                    <label
                      htmlFor="message"
                      className="block mb-2 text-sm font-medium text-gray-900 "
                    >
                      Send a message to your connection
                    </label>
                    <textarea
                      id="message"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-orange-600 focus:border-orange-600 block w-full p-2.5 "
                      placeholder="Hi, i would like to negotiate with you on.."
                      {...register("message", { required: false })}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-between mt-6">
              {STEPS.PASSWORD !== step && (
                <Button
                  onClick={onSecondaryAction}
                  className=" "
                >
                  {secondaryActionLabel}
                </Button>
              )}
              <Button
                onClick={handleSubmit(onSubmit)}
                className=" "
              >
                {actionLabel}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  
  const user = await getCurrentUser(session);
  return {
    props: {
      session,
      user,
    },
  };
};

export default wizard;
