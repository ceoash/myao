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

const Settings = ({ user, listings }: any) => {
  const [activeTab, setActiveTab] = useState(
    "profile"
  );

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
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data: any) => {
    try {
      await axios.put(`/api/settings/profile/${user.id}`, data);

      toast.success("Profile updated successfully");
      console.log("Profile updated successfully");
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

  return (
    <Dash meta={<Meta title="" description="" />}>
      <div className="container px-4 mx-auto">
        <div className="lg:flex lg:flex-wrap mt-10 gap-6">
          <div className="lg:w-1/4 flex lg:block mb-4">
            <div
              className="border border-gray-200 p-4 bg-white flex gap-2 items-center"
              onClick={() => setActiveTab("profile")}
            >
              <BiUser />
              <span>Profile</span>
            </div>
            <div
              className="border border-gray-200 p-4 bg-white flex gap-2 items-center"
              onClick={() => setActiveTab("security")}
            >
              <IoLockClosed />
              <span>Security</span>
            </div>
            <div
              className="border border-gray-200 p-4 bg-white flex gap-2 items-center"
              onClick={() => setActiveTab("preferences")}
            >
              <IoCog />
              <span>Preferences</span>
            </div>
          </div>
          {activeTab === "profile" && (
            <div className="flex-1 bg-white border-2 border-gray-200 p-8">
              <div className="flex flex-wrap items-center justify-between -mx-4 mb-8 pb-6 border-b border-gray-400 border-opacity-20">
                <div className="w-full sm:w-auto px-4 mb-6 sm:mb-0">
                  <h4 className="text-2xl font-bold tracking-wide mb-1">
                    Personal info
                  </h4>
                  <p className="text-sm">Edit Your Profile</p>
                </div>
                <div className="w-full sm:w-auto px-4">
                  <div>
                    <a
                      className="inline-block py-2 px-4 mr-3 text-xs text-center font-semibold leading-normal  bg-gray-200 hover:bg-gray-700 rounded-lg transition duration-200"
                      href="#"
                    >
                      Cancel
                    </a>
                    <button
                      className="inline-block py-2 px-4 text-xs text-center font-semibold leading-normal text-orange-50 bg-orange-500 hover:bg-orange-600 rounded-lg transition duration-200"
                      onClick={handleSubmit(onSubmit)}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
              <form action="">
                <div className="flex flex-wrap items-center -mx-4 pb-8 mb-8 border-b border-gray-400 border-opacity-20">
                  <div className="w-full sm:w-1/3 px-4 mb-4 sm:mb-0">
                    <span className="text-sm font-medium ">Name</span>
                  </div>
                  <div className="w-full sm:w-2/3 px-4">
                    <div className="">
                      <div className="flex flex-wrap items-center -mx-3">
                        <div className="w-full  px-3 mb-3 sm:mb-0">
                          <input
                            className="block py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-400 hover:border-gray-600 focus:border-green-500 rounded-lg"
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
                <div className="flex flex-wrap items-center -mx-4 pb-8 mb-8 border-b border-gray-400 border-opacity-20">
                  <div className="w-full sm:w-1/3 px-4 mb-4 sm:mb-0">
                    <span className="text-sm font-medium ">Email address</span>
                  </div>
                  <div className="w-full sm:w-2/3 px-4">
                    <div className="">
                      <input
                        className="block py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-400 hover:border-gray-600 focus:border-green-500 rounded-lg"
                        id="formInput1-3"
                        type="email"
                        placeholder="email@website.com"
                        {...register("email", { required: true })}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center -mx-4 pb-8 mb-8 border-b border-gray-400 border-opacity-20">
                  <div className="w-full sm:w-1/3 px-4 mb-4 sm:mb-0">
                    <span className="text-sm font-medium ">Username</span>
                  </div>
                  <div className="w-full sm:w-2/3 px-4">
                    <div className="">
                      <input
                        className="block py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-400 hover:border-gray-600 focus:border-green-500 rounded-lg"
                        id="formInput1-3"
                        type="text"
                        placeholder="your username"
                        {...register("username", { required: true })}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-start -mx-4 pb-8 mb-8 border-b border-gray-400 border-opacity-20">
                  <div className="w-full sm:w-1/3 px-4 mb-6 sm:mb-0">
                    <span className="block text-sm font-medium ">Photo</span>
                    <span className="text-xs ">
                      Upload a avatar for your profile
                    </span>
                  </div>
                  <div className="w-full sm:w-2/3 px-4">
                    <div className="flex flex-wrap sm:flex-nowrap ">
                      <div className="flex-shrink-0 w-20 h-20 mb-4 mr-4 rounded-full"></div>
                      <AvatarUpload
                        value={image}
                        onChange={(value) => setCustomValue("image", value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center -mx-4 pb-8 mb-8 border-b border-gray-400 border-opacity-20">
                  <div className="w-full sm:w-1/3 px-4 mb-4 sm:mb-0">
                    <span className="text-sm font-medium ">Country</span>
                  </div>
                  <div className="w-full sm:w-2/3 px-4">
                    <div className="">
                      <div className="relative block px-3 w-full text-sm placeholder-gray-50 font-medium border border-gray-400 hover:border-gray-600 focus-within:border-green-500 rounded-lg">
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
                          <option selected className="bg-gray-500" value="1">
                            United Kingdom
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center -mx-4 pb-8 mb-8 border-b border-gray-400 border-opacity-20">
                  <div className="w-full sm:w-1/3 px-4 mb-4 sm:mb-0">
                    <span className="text-sm font-medium ">Timezone</span>
                  </div>
                  <div className="w-full sm:w-2/3 px-4">
                    <div className="">
                      <div className="relative block px-3 w-full text-sm font-medium border border-gray-400 hover:border-gray-600 focus-within:border-green-500 rounded-lg">
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
                          <option className="bg-gray-500" value="1" selected>
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
                  </div>
                </div>
                <div className="flex flex-wrap items-center -mx-4 pb-8 mb-8 border-b border-gray-400 border-opacity-20">
                  <div className="w-full sm:w-1/3 px-4 mb-4 sm:mb-0">
                    <span className="text-sm font-medium ">Website</span>
                  </div>
                  <div className="w-full sm:w-2/3 px-4">
                    <div className="">
                      <input
                        className="block py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-400 hover:border-gray-600 focus:border-green-500 rounded-lg"
                        id="formInput1-8"
                        type="text"
                        placeholder="myao.ui/user"
                        {...register("website")}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-start -mx-4 pb-8 mb-8 border-b border-gray-400 border-opacity-20">
                  <div className="w-full sm:w-1/3 px-4 mb-5 sm:mb-0">
                    <span className="block mt-2 text-sm font-medium ">Bio</span>
                    <span className="text-xs ">
                      Write a short bio on yourself
                    </span>
                  </div>
                  <div className="w-full sm:w-2/3 px-4">
                    <div className="">
                      <textarea
                        className="block h-56 py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-400 hover:border-gray-600 focus:border-green-500 rounded-lg resize-none"
                        id="formInput1-9"
                        placeholder="Lorem ipsum dolor sit amet"
                        {...register("bio")}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-start -mx-4 pb-8 mb-8 border-b border-gray-400 border-opacity-20">
                  <div className="w-full md:w-1/3 sm:w-full px-4 mb-5 sm:mb-0">
                    <span className="block mt-2 text-sm font-medium ">
                      Social Links
                    </span>
                    <span className="text-xs ">
                      Add your social media handles
                    </span>
                  </div>
                  <div className="w-full md:w-2/3 sm:w-full px-4 md:grid md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="instagram">Instagram</label>
                      <input
                        id="instagram"
                        type="text"
                        className="block py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-400 hover:border-gray-600 focus:border-green-500 rounded-lg"
                        {...register("instagram")}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="facebook">Facebook</label>
                      <input
                        id="facebook"
                        type="text"
                        className="block py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-400 hover:border-gray-600 focus:border-green-500 rounded-lg"
                        {...register("facebook")}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="twitter">Twitter</label>
                      <input
                        id="twitter"
                        type="text"
                        className="block py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-400 hover:border-gray-600 focus:border-green-500 rounded-lg"
                        {...register("twitter")}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="youtube">Youtube</label>
                      <input
                        id="youtube"
                        type="text"
                        className="block py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-400 hover:border-gray-600 focus:border-green-500 rounded-lg"
                        {...register("youtube")}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="reddit">Reddit</label>
                      <input
                        id="reddit"
                        type="text"
                        className="block py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-400 hover:border-gray-600 focus:border-green-500 rounded-lg"
                        {...register("reddit")}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="linkdin">Linkdin</label>
                      <input
                        id="linkdin"
                        type="text"
                        className="block py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-400 hover:border-gray-600 focus:border-green-500 rounded-lg"
                        {...register("linkedin")}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="tiktok">TikTok</label>
                      <input
                        id="tiktok"
                        type="text"
                        className="block py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-400 hover:border-gray-600 focus:border-green-500 rounded-lg"
                        {...register("tiktok")}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="snapchat">Snapchat</label>
                      <input
                        id="snapchat"
                        type="text"
                        className="block py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-400 hover:border-gray-600 focus:border-green-500 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}
          {activeTab === "security" && (
            <div className="flex-1 bg-white border-2 border-gray-200 p-8">
            <div className="flex flex-wrap items-center justify-between -mx-4 mb-8 pb-6 border-b border-gray-400 border-opacity-20">
              <div className="w-full sm:w-auto px-4 mb-6 sm:mb-0">
                <h4 className="text-2xl font-bold tracking-wide mb-1">
                  Security
                </h4>
                <p className="text-sm">Change your password</p>
              </div>
              <div className="w-full sm:w-auto px-4">
                <div>
                  <a
                    className="inline-block py-2 px-4 mr-3 text-xs text-center font-semibold leading-normal  bg-gray-200 hover:bg-gray-700 rounded-lg transition duration-200"
                    href="#"
                  >
                    Cancel
                  </a>
                  <button
                    className="inline-block py-2 px-4 text-xs text-center font-semibold leading-normal text-orange-50 bg-orange-500 hover:bg-orange-600 rounded-lg transition duration-200"
                    onClick={handleSubmit(onSubmit)}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
            <form action="">
              <div className="flex flex-wrap items-center -mx-4 pb-8 mb-8 border-b border-gray-400 border-opacity-20">
                <div className="w-full sm:w-1/3 px-4 mb-4 sm:mb-0">
                  <span className="text-sm font-medium ">New password</span>
                </div>
                <div className="w-full sm:w-2/3 px-4">
                  <div className="">
                    <div className="flex flex-wrap items-center -mx-3">
                      <div className="w-full  px-3 mb-3 sm:mb-0">
                        <input
                          className="block py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-400 hover:border-gray-600 focus:border-green-500 rounded-lg"
                          id="formInput1-1"
                          type="text"
                          placeholder="*********"
                          {...register("password", { required: true })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center -mx-4 pb-8 mb-8 border-b border-gray-400 border-opacity-20">
                <div className="w-full sm:w-1/3 px-4 mb-4 sm:mb-0">
                  <span className="text-sm font-medium ">Confirm password</span>
                </div>
                <div className="w-full sm:w-2/3 px-4">
                  <div className="">
                    <div className="flex flex-wrap items-center -mx-3">
                      <div className="w-full  px-3 mb-3 sm:mb-0">
                        <input
                          className="block py-4 px-3 w-full text-sm placeholder-gray-50 font-medium outline-none bg-white border border-gray-400 hover:border-gray-600 focus:border-green-500 rounded-lg"
                          id="formInput1-1"
                          type="text"
                          placeholder="*********"
                          {...register("passwordConfirm", { required: true })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </form>
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
          destination: "/login", // redirect to login if no session found
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
