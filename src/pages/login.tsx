"use client";
import Button from "@/components/dashboard/Button";
import React from "react";
import { useState } from "react";
import { FieldValues, useForm, SubmitHandler } from "react-hook-form";
import { Toaster, toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getProviders, getSession, signIn } from "next-auth/react";
import Input from "@/components/inputs/Input";
import Link from "next/link";
import Spinner from "@/components/Spinner";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [invalidCredentials, setInvalidCredentials] = useState(false);
  const router = useRouter();

  const {
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

  console.log("errs", errors);


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
        throw new Error(res.error);
      } else {
      }
      setIsLoading(false);
      setDisabled(false);
      router.push("/dashboard");
    }).catch((err) => {
      setDisabled(false);
      setIsLoading(false);
      throw err;
    });
    
    toast.promise(
      login,
      {
        loading: 'Signing in...',
        success: () => {
          return 'Logging in';
        },
        error: (err) => {
          return `email or password is incorrect`;
        },
      },
      {
        style: {
          minWidth: '250px',
        },
        success: {
          duration: 6000,
          icon: <Spinner noMargin />,
          
        },
        error: {
          duration: 5000,
          icon: '🚫',
        },
      }
    );

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
            <img src="/images/cat.png" className="h-[30px] mr-2" />{" "}
            <span className="self-center text-xl font-semibold whitespace-nowrap">
              MYAO 
            </span>
          </Link>
          <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 ">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Sign in to your account
              </h1>
              <form className="space-y-4 md:space-y-6">
                
                

                <div>
                  <Input
                    id="email"
                    type="email"
                    label="Email"
                    register={register}
                    required
                    errors={errors}
                    onChange={() => clearErrors("email")}
                    disabled={disabled}
                  />
                </div>

                <div>
                  <Input
                    id="password"
                    label="Password"
                    type="password"
                    register={register}
                    required
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
                      <label
                        htmlFor="remember"
                        className="text-gray-500 "
                      >
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
                <Button
                  label={`Sign in`}
                  disabled={disabled}
                  isLoading={isLoading}
                  onClick={handleSubmit(onSubmit)}
                />

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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

export async function getServerSideProps(context: any) {
  const { req } = context;
  const session = await getSession({ req });
  const providers = await getProviders();
  if (session) {
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
