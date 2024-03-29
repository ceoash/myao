"use client";
import Button from "@/components/dashboard/Button";
import React from "react";
import Input from "@/components/inputs/Input";
import Link from "next/link";
import Spinner from "@/components/Spinner";
import { useState } from "react";
import { FieldValues, useForm, SubmitHandler } from "react-hook-form";
import { Toaster, toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getProviders, getSession, signIn } from "next-auth/react";
import { FaGoogle } from "react-icons/fa";
import getCurrentUser from "@/actions/getCurrentUser";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const router = useRouter();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    setError,
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const validateForm = (data: any) => {
    const validation = {
      isValid: true,
      errors: {} as Record<string, { message: string }>,
    };
    if (!data.email) {
      validation.isValid = false;
      setError("email", {
        message: "Enter your email",
      });
    }
    if (!data.password) {
      validation.isValid = false;
      setError("password", {
        message: "Enter your password",
      });
    }
    return validation;
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);
    setDisabled(true);

    const validate = validateForm(data);
    if (!validate.isValid) {
      reset();
      setIsLoading(false);
      setDisabled(false);
      return;
    }

    data.email = data.email.toLowerCase();


    const login = signIn("credentials", {
      ...data,
      redirect: false,
      callbackUrl: "/dashboard",
    }).then((res) => {
        if (res?.error) {
          toast.error(res.error);
          setIsLoading(false);
          setDisabled(false);
          return;
        }
        toast.success("Logged in successfully");
        router.refresh();
        setIsLoading(false);
        setDisabled(false);
      })
      .catch((err) => {
        setDisabled(false);
        setIsLoading(false);
        toast.error(err.message);
      });
  };




  return (
    <div className="flex flex-col h-screen justify-center">
      <Toaster />
      <div className="bg-gray-50 flex-grow ">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <Link
            href="/"
            className="flex items-center mb-6 text-2xl font-semibold text-gray-900 "
          >
            <img src="/images/cat.png" className="h-[40px] mr-2" />{" "}
            <span className="self-center text-xl font-semibold whitespace-nowrap">
              MYAO
            </span>
          </Link>
          <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 ">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h2 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl text-center">
                Sign in to your account
              </h2>
              <form
                className="space-y-4 md:space-y-6"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="-mb-4">
                  <Input
                    control={control}
                    id="email"
                    name="email"
                    type="email"
                    label="Email"
                    register={register}
                    errors={errors}
                    onChange={() => clearErrors("email")}
                    disabled={disabled}
                  />
                </div>

                <div>
                  <Input
                    control={control}
                    id="password"
                    label="Password"
                    name="password"
                    type="password"
                    register={register}
                    errors={errors}
                    onChange={() => clearErrors("password")}
                    disabled={disabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="remember"
                        aria-describedby="remember"
                        type="checkbox"
                        className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="remember" className="text-gray-500 ">
                        Remember me
                      </label>
                    </div>
                  </div>
                  <Link
                    href="#"
                    className="text-sm font-medium text-orange-600 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <button className="flex border bg-orange-400 text-white border-gray-200 rounded-lg p-3 px-3 items-center w-full justify-center hover:opacity-90">
                  <div className="mx-auto flex gap-2 items-center">
                    <span>Login</span>
                  </div>
                </button>

                <p className="text-sm font-light text-gray-500">
                  Don’t have an account yet?{" "}
                  <Link
                    href="/register"
                    className="font-medium text-primary-600 hover:underline text-orange-600"
                  >
                    Sign up
                  </Link>
                </p>
              </form>
              <div className="flex items-center">
                <div className="border-b border flex-grow w-full"></div>
                <div className="text-gray-500 text-sm mx-4 font-bold text-center">
                  OR
                </div>
                <div className="border-b border flex-grow w-full"></div>
              </div>
              <div>
                <button
                  onClick={() => signIn("google")}
                  className="flex border border-gray-200 rounded-lg p-3 px-3 items-center w-full justify-center"
                >
                  <div className="mx-auto flex gap-2 items-center">
                    <FaGoogle className="w-3 h-3" />
                    <span>Continue with Google</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default Login;

export async function getServerSideProps(context: any) {
  const { req } = context;
  const session = await getSession({ req });

  const currentUser = session ? await getCurrentUser(session) : null;

  const providers = await getProviders();

  if (currentUser && currentUser?.role === "admin") {
    return { 
      redirect: { destination: "/admin" },
    };
  }

  if (currentUser && currentUser?.role !== "admin") {
    return {
      redirect: { destination: "/dashboard" },
    };
  }
  return {
    props: {
      providers,
    },
  };
}
