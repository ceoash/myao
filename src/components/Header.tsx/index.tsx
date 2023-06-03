'use client';

import Link from 'next/link'
import React from 'react'
import { useSession, signIn, signOut } from "next-auth/react";

const Header = () => {
    const handleSignin = (e:any) => {
        e.preventDefault();
        signIn();
      };
      const handleSignout = (e:any) => {
        e.preventDefault();
        signOut();
      };
      const { data: session, status } = useSession()
  return (
    <header className={`${!session && 'fixed'} w-full z-50`}>
        <nav className="bg-white border-gray-200 py-2.5 shadow border-b">
          <div className="flex flex-wrap items-center justify-between max-w-screen-xl px-4 mx-auto">
            <Link href="#" className="flex items-center">
              <img src="/images/cat.png" className="h-[30px] mr-2" />
              <span className="self-center text-xl font-semibold whitespace-nowrap">
                MYAO
              </span>
            </Link>
            <div className="flex items-center lg:order-2">
            {!session && (
                <>
            <Link
                href="#"
                onClick={handleSignin}
                className="text-gray-800 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 sm:mr-2 "
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="text-white border border-primary-default bg-primary-default hover:bg-transparent hover:text-primary-default focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 sm:mr-2 lg:mr-0 "
              >
                Sign Up
              </Link>
              </>
            )}
             {session && (
                  <Link
                  href="#"
                  onClick={handleSignout}
                  className="text-gray-800 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 sm:mr-2 "
                >
                  Log out
                </Link>
             )}
            </div>
          </div>
        </nav>
      </header>
  )
}

export default Header