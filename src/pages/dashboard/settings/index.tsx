import { useEffect, useState } from "react";
import axios from "axios";
import Button from "@/components/dashboard/Button";
import AvatarUpload from "@/components/inputs/AvatarUpload";
import getCurrentUser from "@/actions/getCurrentUser";
import { GetServerSideProps } from "next";
import { getSession, signOut } from "next-auth/react";
import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { FaCog, FaLock, FaUser } from "react-icons/fa";
import useConfirmationModal from "@/hooks/useConfirmationModal";

const Settings = ({ user }: {
  user: any
}) => {
  const [activeTab, setActiveTab] = useState("profile");

 const [currentUser, setCurrentUser] = useState<any>(null);
 const [password, setPassword] = useState("");
 const [passwordConfirm, setPasswordConfirm] = useState("");

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const {
    register,
    formState: { errors },
    watch,
    setValue,
    handleSubmit,
  } = useForm<FieldValues>({
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
      username: user.username || "",
      address: user.address || "",
      city: "",
      postcode: "",
      image: user?.profile?.image || "",
      website: user?.profile?.website || "",
      bio: user?.profile?.bio || "",
      instagram: user?.profile?.social?.instagram || "",
      facebook: user?.profile?.social?.facebook || "",
      twitter: user?.profile?.social?.twitter || "",
      reddit: user?.profile?.social?.reddit || "",
      youtube: user?.profile?.social?.youtube || "",
      twitch: user?.profile?.social?.twitch || "",
      linkedin: user?.profile?.social?.linkedin || "",
      tiktok: user?.profile?.social?.tiktok || "",
      password: "",
      passwordConfirm: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data: any) => {
    try {
      await axios.put(`/api/settings/profile/${user.id}`, data);

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating listing:", error);
    }
  };

  const confirmation = useConfirmationModal();

  const onDelete = async () => {
    let data = {
      id: user.id,
    };
    try {
      confirmation.onOpen(
        `Are you sure you want to delete your account?`,
        async () => {
          await axios
            .post(`/api/settings/deleteUser`, data)
            .then((response) => {
              signOut();
              toast.success("You have deleted your account");
              console.log("respnse", response)
            })
            .catch((error) => {
              toast.error("failed to delete your account");
            console.log("error", error)
            })
            
        }
      );
    } catch (error) {
      console.error("Error updating listing:", error);
    }
  };

  const image = watch("image");

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const onPasswordSubmit: SubmitHandler<FieldValues> = async () => {
    if (password !== passwordConfirm)
      return toast.error("Passwords do not match");
    try {
      await axios.put(`/api/settings/profile/password`, {
        id: user.id,
        password: password,
      });

      toast.success("Password updated successfully");
    } catch (error) {
      console.error("Error updating listing:", error);
    }
  };

  return (
    <Dash meta={<Meta title="Settings" description="Manage and upate your profile and settings" />}>
      <div className="container px-4 mx-auto">
        <div className="lg:flex flex-col lg:flex-wrap mt-10 gap-6 ">
          <h2 className="px-6">Settings</h2>
          <div className=" flex px-6 border-b border-gray-200 ">
            <div
              className={`pr-3.5 mr-4 pl-1 cursor-pointer flex gap-2 items-center py-1.5 pb-3 ${
                activeTab === "profile" &&
                "border-b-4 border-orange-default text-orange-default"
              }`}
              onClick={() => setActiveTab("profile")}
            >
              <FaUser />
              <span>Profile</span>
            </div>
            <div
              className={`pr-3.5 mr-4 pl-1 cursor-pointer flex gap-2 items-center py-1.5 pb-3 ${
                activeTab === "security" &&
                "border-b-4 border-orange-default text-orange-default"
              }`}
              onClick={() => setActiveTab("security")}
            >
              <FaLock />
              <span>Security</span>
            </div>
            <div
              className={`pr-3.5 mr-4 pl-1 cursor-pointer flex gap-2 items-center py-1.5 pb-3 ${
                activeTab === "preferences" &&
                "border-b-4 border-orange-default text-orange-default"
              }`}
              onClick={() => setActiveTab("preferences")}
            >
              <FaCog />
              <span>Preferences</span>
            </div>
          </div>
          {activeTab === "profile" && (
            <div className="flex-1 p-6 rounded-lg mb-6 border-b ">
              <form action="">
                <div className="lg:grid lg:grid-cols-12 pb-6 mb-6 lg:pb-6 lg:mb-12 xl:pb-8 border-b border-gray-200">
                  <div className=" px-4 mb-6 sm:mb-0 lg:col-span-3 w-full">
                    <h4 className="text-2xl font-bold tracking-wide mb-1">
                      Personal info
                    </h4>
                    <p className="text-sm mb-6">Edit Your Profile</p>
                  </div>
                  <div className="flex flex-col lg:col-span-9 ">
                    <div className="flex flex-wrap items-start   border-opacity-20">
                      <div className="w-full  px-4 mb-6 sm:mb-0">
                        <label className="text-sm font-medium mb-4">
                          Profie Picture
                        </label>
                        <div className="text-xs ">
                          Upload a avatar for your profile
                        </div>
                      </div>
                      <div className="w-full px-4 mt-6">
                        <div className="flex flex-wrap sm:flex-nowrap ">
                          <div className="flex-shrink-0 w-20 h-20 mb-4 mr-4 rounded-full"></div>
                          <AvatarUpload
                            value={image}
                            onChange={(value) => setCustomValue("image", value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className=" pb-4 mb-4  border-opacity-20">
                      <div className="w-full  px-4 mb-4 sm:mb-0">
                        <label
                          htmlFor="name"
                          className="text-sm font-medium mb-4"
                        >
                          Name
                        </label>
                      </div>
                      <div className="w-full px-4 mt-2">
                        <div className="">
                          <div className="flex flex-wrap items-center -mx-3">
                            <div className="w-full  px-3 mb-3 sm:mb-0">
                              <input
                                className="block py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-200 hover:border-orange-200 focus:border-orange-200 rounded-lg"
                                id="formInput1-1"
                                type="text"
                                placeholder="John"
                                {...register("name", { required: true })}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pb-4 mb-4  border-opacity-20">
                      <div className="w-full  px-4 mb-4 sm:mb-0">
                        <label
                          htmlFor="email"
                          className="text-sm font-medium mb-4"
                        >
                          Email address
                        </label>
                      </div>
                      <div className="w-full px-4 mt-2">
                        <div className="">
                          <input
                            className="block py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-200 hover:border-orange-200 focus:border-orange-200 rounded-lg"
                            id="formInput1-3"
                            type="email"
                            placeholder="email@website.com"
                            {...register("email", { required: true })}
                          />
                        </div>
                      </div>
                    </div>
                    <div className=" pb-4 mb-4  border-opacity-20">
                      <div className="w-full  px-4 mb-4 sm:mb-0">
                        <label
                          htmlFor="username"
                          className="text-sm font-medium mb-4"
                        >
                          Username
                        </label>
                      </div>
                      <div className="w-full px-4 mt-2">
                        <div className="">
                          <input
                            className="block py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-200 hover:border-orange-200 focus:border-orange-200 rounded-lg"
                            id="formInput1-3"
                            type="text"
                            placeholder="your username"
                            {...register("username", { required: true })}
                          />
                        </div>
                      </div>
                      <div className="mt-6 flex justify-end px-2">
                        <Button
                          onClick={handleSubmit(onSubmit)}
                          className="mt-4"
                          label="Save"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* location */}
                <div
                  className="
                  lg:grid 
                  lg:grid-cols-12 
                  lg:pb-8 
                  lg:mb-12
                  border-b 
                  border-gray-200 
                  pb-6 
                  mb-6 
                  "
                >
                  <div className="lg:col-span-3 w-full sm:w-auto px-4 mb-6 sm:mb-0">
                    <h4 className="text-2xl font-bold tracking-wide mb-1">
                      Location
                    </h4>
                    <p className="text-sm mb-6">Enter your location details</p>
                  </div>
                  <div className="flex flex-col lg:col-span-9">
                    <div className=" pb-4 mb-4  border-opacity-20">
                      <div className="w-full  px-4 mb-4 sm:mb-0">
                        <label
                          htmlFor="country"
                          className="text-sm font-medium mb-4"
                        >
                          Country
                        </label>
                      </div>
                      <div className="w-full px-4 mt-2">
                        <div className="">
                          <div className="relative block px-3 w-full text-sm placeholder-gray-50 font-medium border border-gray-200 hover:border-orange-200 focus-within:border-green-500 rounded-lg">
                            <span className="absolute top-1/2 right-0 mr-5 transform -translate-y-1/2">
                              <svg
                                width="12"
                                height="8"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M10.9999 1.16994C10.8126 0.983692 10.5591 0.87915 10.2949 0.87915C10.0308 0.87915 9.77731 0.983692 9.58995 1.16994L5.99995 4.70994L2.45995 1.16994C2.27259 0.983692 2.01913 0.87915 1.75495 0.87915C1.49076 0.87915 1.23731 0.983692 1.04995 1.16994C0.95622 1.26291 0.881826 1.37351 0.831057 1.49537C0.780288 1.61723 0.75415 1.74793 0.75415 1.87994C0.75415 2.01195 0.780288 2.14266 0.831057 2.26452C0.881826 2.38638 0.95622 2.49698 1.04995 2.58994L5.28995 6.82994C5.38291 6.92367 5.49351 6.99807 5.61537 7.04883C5.73723 7.0996 5.86794 7.12574 5.99995 7.12574C6.13196 7.12574 6.26267 7.0996 6.38453 7.04883C6.50638 6.99807 6.61699 6.92367 6.70995 6.82994L10.9999 2.58994C11.0937 2.49698 11.1681 2.38638 11.2188 2.26452C11.2696 2.14266 11.2957 2.01195 11.2957 1.87994C11.2957 1.74793 11.2696 1.61723 11.2188 1.49537C11.1681 1.37351 11.0937 1.26291 10.9999 1.16994Z"
                                  fill="#3D485B"
                                ></path>
                              </svg>
                            </span>
                            <select
                              className="w-full py-4 appearance-none bg-gray-50 cursor-not-allowed outline-none"
                              id="formInput1-6"
                              name=""
                              disabled
                            >
                              <option className="bg-gray-500" value="1">
                                United States
                              </option>
                              <option
                                selected
                                className="bg-gray-500"
                                value="1"
                              >
                                United Kingdom
                              </option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className=" pb-4 mb-4  border-opacity-20">
                      <div className="w-full  px-4 mb-4 sm:mb-0">
                        <label
                          htmlFor="timezone"
                          className="text-sm font-medium mb-4"
                        >
                          Timezone
                        </label>
                      </div>
                      <div className="w-full px-4 mt-2">
                        <div className="">
                          <div className="relative block px-3 w-full text-sm font-medium border border-gray-200 hover:border-orange-200 focus-within:border-green-500 rounded-lg">
                            <span className="absolute top-1/2 right-0 mr-5 transform -translate-y-1/2">
                              <svg
                                width="12"
                                height="8"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M10.9999 1.16994C10.8126 0.983692 10.5591 0.87915 10.2949 0.87915C10.0308 0.87915 9.77731 0.983692 9.58995 1.16994L5.99995 4.70994L2.45995 1.16994C2.27259 0.983692 2.01913 0.87915 1.75495 0.87915C1.49076 0.87915 1.23731 0.983692 1.04995 1.16994C0.95622 1.26291 0.881826 1.37351 0.831057 1.49537C0.780288 1.61723 0.75415 1.74793 0.75415 1.87994C0.75415 2.01195 0.780288 2.14266 0.831057 2.26452C0.881826 2.38638 0.95622 2.49698 1.04995 2.58994L5.28995 6.82994C5.38291 6.92367 5.49351 6.99807 5.61537 7.04883C5.73723 7.0996 5.86794 7.12574 5.99995 7.12574C6.13196 7.12574 6.26267 7.0996 6.38453 7.04883C6.50638 6.99807 6.61699 6.92367 6.70995 6.82994L10.9999 2.58994C11.0937 2.49698 11.1681 2.38638 11.2188 2.26452C11.2696 2.14266 11.2957 2.01195 11.2957 1.87994C11.2957 1.74793 11.2696 1.61723 11.2188 1.49537C11.1681 1.37351 11.0937 1.26291 10.9999 1.16994Z"
                                  fill="#3D485B"
                                ></path>
                              </svg>
                            </span>
                            <select
                              className="w-full py-4 placeholder-gray-50 appearance-none bg-gray-50 cursor-not-allowed outline-none"
                              id="formInput1-7"
                              name=""
                              disabled
                            >
                              <option
                                className="bg-gray-500"
                                value="1"
                                selected
                              >
                                Greenwich Mean Time (GMT) UTC+0
                              </option>
                              <option className="bg-gray-500" value="1">
                                Central Daylight Time (GMT-5) UTC-08:00
                              </option>
                              <option className="bg-gray-500" value="1">
                                Central Daylight Time (GMT-5) UTC-08:00
                              </option>
                            </select>
                          </div>
                        </div>
                        <div className="mt-6 flex justify-end px-2">
                          <Button
                            onClick={handleSubmit(onSubmit)}
                            className="mt-4"
                            label="Save"
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Contact Info */}
                <div className="lg:grid grid-cols-12 border-b border-gray-200 pb-6 mb-6 lg:mb-12 lg:pb-8">
                  <div className="w-full sm:w-auto px-4 mb-6 sm:mb-0 lg:col-span-3">
                    <h4 className="text-2xl font-bold tracking-wide mb-1">
                      Contact Info
                    </h4>
                    <p className="text-sm mb-6">Edit Your Profile</p>
                  </div>
                  <div className="flex flex-col lg:col-span-9">
                    <div className=" pb-4 mb-4  border-opacity-20">
                      <div className="w-full  px-4 mb-4 sm:mb-0">
                        <label
                          htmlFor="website"
                          className="text-sm font-medium mb-4"
                        >
                          Website
                        </label>
                      </div>
                      <div className="w-full px-4 mt-2">
                        <div className="">
                          <input
                            className="block py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-200 hover:border-orange-200 focus:border-orange-200 rounded-lg"
                            id="formInput1-8"
                            type="text"
                            placeholder="myao.ui/user"
                            {...register("website")}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-start  pb-4 mb-4  border-opacity-20">
                      <div className="w-full  px-4 mb-5 sm:mb-0">
                        <label
                          htmlFor="bio"
                          className="block mt-2 text-sm font-medium "
                        >
                          Bio
                        </label>
                        <span className="text-xs ">
                          Write a short bio on yourself
                        </span>
                      </div>
                      <div className="w-full px-4 mt-2">
                        <div className="">
                          <textarea
                            className="block h-56 py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-200 hover:border-orange-200 focus:border-orange-200 rounded-lg resize-none"
                            id="formInput1-9"
                            placeholder="Lorem ipsum dolor sit amet"
                            {...register("bio")}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end px-2">
                      <Button
                        onClick={handleSubmit(onSubmit)}
                        className="mt-4"
                        label="Save"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Links */}

                <div className="lg:grid lg:grid-cols-12 items-start  pb-4 mb-4  border-opacity-20 border border-gray-200">
                  <div className="lg:col-span-3 w-full px-4 mb-5 sm:mb-0">
                    <h4 className="text-2xl font-bold tracking-wide mb-1">
                      Social Links
                    </h4>
                    <p className="text-sm mb-6">Enter social links below</p>
                  </div>
                  <div className="lg:col-span-9 w-full px-4 md:grid md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="instagram">Instagram</label>
                      <input
                        id="instagram"
                        type="text"
                        className={`
                          block
                          py-4
                          px-3
                          w-full
                          text-sm
                          placeholder-gray-50
                          font-medium
                          outline-none
                          bg-white
                          border
                          border-gray-200
                          hover:border-orange-200
                          focus:border-orange-200
                          rounded-lg
                        `}
                        {...register("instagram")}
                      />
                    </div>
                    <div className="flex flex-col gap-2 mt-4 md:mt-0">
                      <label htmlFor="facebook">Facebook</label>
                      <input
                        id="facebook"
                        type="text"
                        className="block py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-200 hover:border-orange-200 focus:border-orange-200 rounded-lg"
                        {...register("facebook")}
                      />
                    </div>
                    <div className="flex flex-col gap-2 mt-4 md:mt-0">
                      <label htmlFor="twitter">Twitter</label>
                      <input
                        id="twitter"
                        type="text"
                        className="block py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-200 hover:border-orange-200 focus:border-orange-200 rounded-lg"
                        {...register("twitter")}
                      />
                    </div>
                    <div className="flex flex-col gap-2 mt-4 md:mt-0">
                      <label htmlFor="youtube">Youtube</label>
                      <input
                        id="youtube"
                        type="text"
                        className="block py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-200 hover:border-orange-200 focus:border-orange-200 rounded-lg"
                        {...register("youtube")}
                      />
                    </div>
                    <div className="flex flex-col gap-2 mt-4 md:mt-0">
                      <label htmlFor="reddit">Reddit</label>
                      <input
                        id="reddit"
                        type="text"
                        className="block py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-200 hover:border-orange-200 focus:border-orange-200 rounded-lg"
                        {...register("reddit")}
                      />
                    </div>
                    <div className="flex flex-col gap-2 mt-4 md:mt-0">
                      <label htmlFor="linkdin">Linkedin</label>
                      <input
                        id="linkdin"
                        type="text"
                        className="block py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-200 hover:border-orange-200 focus:border-orange-200 rounded-lg"
                        {...register("linkedin")}
                      />
                    </div>
                    <div className="flex flex-col gap-2 mt-4 md:mt-0">
                      <label htmlFor="tiktok">TikTok</label>
                      <input
                        id="tiktok"
                        type="text"
                        className="block py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-200 hover:border-orange-200 focus:border-orange-200 rounded-lg"
                        {...register("tiktok")}
                      />
                    </div>
                    <div className="flex flex-col gap-2 mt-4 md:mt-0">
                      <label htmlFor="snapchat">Snapchat</label>
                      <input
                        id="snapchat"
                        type="text"
                        className="block py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-200 hover:border-orange-200 focus:border-orange-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end px-2">
                  <Button
                    onClick={handleSubmit(onSubmit)}
                    className="mt-4"
                    label="Save"
                  />
                </div>
              </form>
            </div>
          )}
          {activeTab === "security" && (
            <div className="flex-1 mt-6 mb-4">
              <div className="lg:grid lg:grid-cols-12 items-start  pb-4 mb-4  lg:pb-8 lg:mb-12 border-b border-gray-200">
                <div className="col-span-3 w-full px-4 mb-5 sm:mb-0">
                  <h4 className="text-2xl font-bold tracking-wide mb-1">
                    Password
                  </h4>
                  <p className="text-sm mb-6">Update your password</p>
                </div>
                <div className="lg:col-span-9">
                  <form action="">
                    <div className=" pb-4 mb-4  border-opacity-20">
                      <div className="w-full  px-4 mb-4 sm:mb-0">
                        <label htmlFor="" className="text-sm font-medium mb-4">
                          New password
                        </label>
                      </div>
                      <div className="w-full px-4 mt-2 ">
                        <div className="">
                          <div className="flex flex-wrap items-center -mx-3">
                            <div className="w-full  px-3 mb-3 sm:mb-0">
                              <input
                                className="block py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-200 hover:border-orange-200 focus:border-orange-200 rounded-lg"
                                id="formInput1-1"
                                type="password"
                                placeholder="*********"
                                {...register("password", { required: true })}
                                onChange={(e) => {
                                  setPassword(e.target.value);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className=" pb-4 mb-4  border-opacity-20">
                      <div className="w-full  px-4 mb-4 sm:mb-0">
                        <label htmlFor="" className="text-sm font-medium mb-4">
                          Confirm password
                        </label>
                      </div>
                      <div className="w-full px-4 mt-2">
                        <div className="">
                          <div className="flex flex-wrap items-center -mx-3">
                            <div className="w-full  px-3 mb-3 sm:mb-0">
                              <input
                                className="block py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-200 hover:border-orange-200 focus:border-orange-200 rounded-lg"
                                id="formInput1-1"
                                type="password"
                                placeholder="*********"
                                onChange={(e) =>
                                  setPasswordConfirm(e.target.value)
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end px-2">
                      <Button
                        onClick={handleSubmit(onPasswordSubmit)}
                        className="mt-4"
                        label="Save"
                      />
                    </div>
                  </form>
                </div>
              </div>
              <div className="lg:grid lg:grid-cols-12 items-start  pb-4 mb-4  border-opacity-20 border border-gray-200">
                <div className="lg:col-span-3 w-full px-4 mb-5 sm:mb-0">
                  <h4 className="text-2xl font-bold tracking-wide mb-1">
                    Delete account
                  </h4>
                  <p className="text-sm mb-6">
                    Delete your account permanently
                  </p>
                </div>
                <div className="lg:col-span-9 flex justify-end items-end">
                  <Button
                    onClick={onDelete}
                    options={{ color: "bg-red-400 text-white" }}
                    label="Delete"
                  />
                </div>
              </div>
            </div>
          )}
          {activeTab === "preferences" && (
            <div className="flex-1  mb-4">
              <div className="lg:grid lg:grid-cols-12 items-start pt-4  pb-4 mb-4  lg:pb-8 lg:mb-12 border-b border-gray-200">
                <div className="col-span-3 w-full px-4 mb-5 ">
                  <h4 className="text-2xl font-bold tracking-wide mb-4">
                    Preferences
                  </h4>
                  <p className="text-sm mb-6 hidden lg:block">Offers</p>
                </div>
                <div className="lg:col-span-9 pt-4">
                  <form action="">
                    <div className="   border-opacity-20">
                    <div className="w-full  px-4 md:mb-8">
                        <label htmlFor="" className="text-sm font-medium mb-4">
                          {" "}
                        </label>
                      </div>
                   
                      
                      <div className="w-full px-4 mt-2 ">
                        <div className="">
                          <div className="flex  items-center -mx-3">
                            <div className="w-full  px-3 mb-3 sm:mb-0 flex lg:block gap-8 justify-between items-center">
                            <label className="relative inline-flex  items-center cursor-pointer">
                              Offers </label>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" value="" className="sr-only peer" checked />
                              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-orange-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-orange-400"></div>
                              <span className="ml-3 text-sm font-medium text-gray-900">On</span>
                            </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    
                  </form>
                </div>
                <div className="col-span-3 w-full px-4 mb-5 sm:mb-0">
                 
                  <p className="text-sm mb-6 hidden lg:block">Messages</p>
                </div>
                <div className="col-span-9">
                  <form action="">
                    <div className=" pb-4 mb-4  border-opacity-20">
                    <div className="w-full  px-4 mb-0">
                        <label htmlFor="" className="text-sm font-medium mb-4">
                          {" "}
                        </label>
                      </div>
                   
                      
                      <div className="w-full px-4 mt-6 ">
                        <div className="">
                          <div className="flex  items-center -mx-3 ">
                            <div className="w-full  px-3  sm:mb-0 flex lg:block gap-8 justify-between items-center">
                            <label className="relative inline-flex  items-center cursor-pointer">
                              Messages </label>
                            <label className="relative flex items-center cursor-pointer">
                              <input type="checkbox" value="" className="sr-only peer" checked />
                              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-orange-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-orange-400"></div>
                              <span className="ml-3 text-sm font-medium text-gray-900">On</span>
                            </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end px-2">
                      <Button
                        onClick={handleSubmit(onPasswordSubmit)}
                        className="mt-4"
                        label="Save"
                      />
                    </div>
                  </form>
                </div>
              </div>
  
            </div>
          )}
        </div>
      </div>
    </Dash>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {

    const session = await getSession(context);

    if(!session) {
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
        user,
      },
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      props: {
        user: null,
      },
    };
  }
};

export default Settings;
