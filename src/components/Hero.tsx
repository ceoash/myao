import Link from 'next/link'
import React from 'react'

function Hero() {
  return (
    <div className="lg:h-screen flex">
        <div className=" flex flex-col max-w-screen-xl px-4 md:grid md:grid-cols-2   mx-auto lg:gap-8 xl:gap-0 lg:py-16 items-center my-auto md:py-10">
            <div className="mb-6 md:mr-auto place-self-center order-2 md:order-1 lg:mb-0">
                <h1 className="max-w-2xl md:mb-12 text-2xl font-extrabold leading-none tracking-tight md:text-5xl xl:text-5xl  text-primary-alt md:-rotate-12"><span className=' border-primary-alt border-4 px-4 py-2 border-dashed'>Make an Offer</span></h1>
                <h1 className="max-w-2xl mb-4 text-4xl font-extrabold leading-none tracking-tight md:text-5xl xl:text-6xl  md:px-8 pt-6"><span>Negotiate & Save</span></h1>
                <p className="max-w-2xl mb-6 font-light lg:mb-8 md:text-lg lg:text-xl">Empowering Buyers & Sellers Through Fair Price<br className='hidden lg:block' /> Negotiations</p>
                <div className="space-y-4 sm:flex sm:space-y-0 sm:space-x-4">
                    <Link href="/dashboard" className="btn btn-primary">
                        Make an offer <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                    </Link> 
                </div>
            </div>
            <div className="lg:mt-0 order-1 md:order-2 ">
                <div className='mt-20 mb-10 md:mt-10 md:mb-10'><img src='/images/MYAO_buy-process.png' alt='' /></div>
            </div>                
        </div>
    </div>
  )
}

export default Hero