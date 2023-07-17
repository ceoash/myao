import React, { useEffect, useState } from "react";
import AvatarUpload from "@/components/inputs/AvatarUpload";
import getCurrentUser from "@/actions/getCurrentUser";
import getListingsByUserId from "@/actions/getListingsByUserId";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { Meta } from "@/layouts/meta";
import { Dash } from "@/templates/dash";
import { BiUser } from "react-icons/bi";
import { IoCog, IoLockClosed } from "react-icons/io5";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import axios from "axios";
import { set } from "date-fns";
import Button from "@/components/dashboard/Button";
import { FaCog, FaLock, FaUser } from "react-icons/fa";
import { color } from "html2canvas/dist/types/css/types/color";

const Settings = ({ user, listings }: any) => {
  const [activeTab, setActiveTab] = useState("profile");

  // user modal
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  // profile modal
  const [username, setUsername] = useState(user?.username || "");
  const [address, setAddress] = useState(user?.profile?.address || "");
  const [city, setCity] = useState(user?.profile?.city || "");
  const [postcode, setPostcode] = useState(user?.profile?.postcode || "");
  const [img, setImg] = useState(user?.profile?.image || "");
  const [website, setWebsite] = useState(user?.profile?.website || "");
  const [bio, setBio] = useState(user?.profile?.bio || "");

  // social modal
  const [instagram, setInstagram] = useState(
    user?.profile?.social?.instagram || ""
  );
  const [facebook, setFacebook] = useState(
    user?.profile?.social?.facebook || ""
  );
  const [twitter, setTwitter] = useState(user?.profile?.social?.twitter || "");
  const [youtube, setYoutube] = useState(user?.profile?.social?.youtube || "");
  const [twitch, setTwitch] = useState(user?.profile?.social?.twitch || "");
  const [reddit, setReddit] = useState(user?.profile?.social?.reddit || "");
  const [linkedin, setLinkedin] = useState(
    user?.profile?.social?.linkedin || ""
  );
  const [tiktok, setTiktok] = useState(user?.profile?.social?.tiktok || "");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  console.log(password, passwordConfirm);
  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setUsername(user.username);
    setAddress(user.profile?.address);
    setCity(user.profile?.city);
    setPostcode(user.profile?.postcode);
    setImg(user.profile?.image);
    setWebsite(user.profile?.website);
    setBio(user.profile?.bio);
    setInstagram(user.profile?.social?.instagram);
    setFacebook(user.profile?.social?.facebook);
    setTwitter(user.profile?.social?.twitter);
    setYoutube(user.profile?.social?.youtube);
    setTwitch(user.profile?.social?.twitch);
    setReddit(user.profile?.social?.reddit);
    setLinkedin(user.profile?.social?.linkedin);
    setTiktok(user.profile?.social?.tiktok);
  }, [user]);

  const {
    register,
    formState: { errors },
    watch,
    setValue,
    handleSubmit,
  } = useForm<FieldValues>({
    defaultValues: {
      name: name,
      email: email,
      username: username,
      address: address,
      city: city,
      postcode: postcode,
      image: img,
      website: website,
      bio: bio,
      instagram: instagram,
      facebook: facebook,
      twitter: twitter,
      reddit: reddit,
      youtube: youtube,
      twitch: twitch,
      linkedin: linkedin,
      tiktok: tiktok,
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
    <Dash meta={<Meta title="" description="" />}>
      <div className="container px-4 mx-auto">
        <div className="lg:flex flex-col lg:flex-wrap mt-10 gap-6">
          <h2 className="px-6">
            Settings
          </h2>
          <div className=" flex px-6 border-b border-gray-200 pb-6">
            <div
              className={`px-3.5 cursor-pointer flex gap-2 items-center rounded-full py-1.5 ${
                activeTab === "profile" && "bg-orange-100 text-orange-400"
              }`}
              onClick={() => setActiveTab("profile")}
            >
              <FaUser />
              <span>Profile</span>
            </div>
            <div
              className={`px-3.5 cursor-pointer flex gap-2 items-center rounded-full py-1.5 ${
                activeTab === "security" && "bg-orange-100 text-orange-400"
              }`}
              onClick={() => setActiveTab("security")}
            >
              <FaLock />
              <span>Security</span>
            </div>
            <div
              className={`px-3.5 cursor-pointer flex gap-2 items-center rounded-full py-1.5 ${
                activeTab === "preferences" && "bg-orange-100 text-orange-400"
              }`}
              onClick={() => setActiveTab("preferences")}
            >
              <FaCog />
              <span>Preferences</span>
            </div>
          </div>
          {activeTab === "profile" && (
            <div className="flex-1 bg-white p-6 rounded-lg mb-6 border-b ">
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
                        <Button onClick={handleSubmit(onSubmit)} className="mt-4" label="Save" />
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
                              className="w-full py-4 appearance-none bg-white outline-none"
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
                              className="w-full py-4 placeholder-gray-50 appearance-none bg-white outline-none"
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
                          <Button onClick={handleSubmit(onSubmit)} className="mt-4" label="Save" />
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
                      <Button onClick={handleSubmit(onSubmit)} className="mt-4" label="Save" />
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
                  <Button onClick={handleSubmit(onSubmit)} className="mt-4" label="Save" />
                </div>
              </form>
            </div>
          )}
          {activeTab === "security" && (
            <div className="flex-1 bg-white p-6 rounded-lg mb-4">
              
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
                      <Button onClick={handleSubmit(onPasswordSubmit)} className="mt-4" label="Save" />
                    </div>
                  </form>
                </div>
              </div>
              <div className="lg:grid lg:grid-cols-12 items-start  pb-4 mb-4  border-opacity-20 border border-gray-200">
                <div className="lg:col-span-3 w-full px-4 mb-5 sm:mb-0">
                  <h4 className="text-2xl font-bold tracking-wide mb-1">
                    Delete account
                  </h4>
                  <p className="text-sm mb-6">Delete your account permanently</p>
                </div>
                <div className="lg:col-span-9 flex justify-end items-end">
                  <Button options={{color: 'bg-red-400 text-white'}} label="Delete" />
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

    if (!session) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    const user = await getCurrentUser(session);
    const listings = await getListingsByUserId(session.user.id);

    return {
      props: {
        user,
        listings,
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
