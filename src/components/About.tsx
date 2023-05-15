import React from 'react'

function About() {
  return (
    <section className="bg-white">
        
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 lg:gap-16 xl:gap-24 items-center max-w-screen-xl mx-auto">
            <div className="">
                <p className="text-lg font-medium text-primary-default">Trusted Worldwide</p>
                <h2 className="mt-3 mb-4 text-3xl font-extrabold tracking-tight text-gray-900 md:text-3xl">Make your offers anywhere</h2>
                <p className="font-light sm:text-xl">MYAO allows buyers and sellers to negotiate a price for domain names, cars, boats, aircraft, fine art or any high-value item on any they desire. Simply create an account and click the Make Offer button - protected by the security of escrow payments by myao.life.</p>
                <div className="pt-6 mt-6 space-y-4 border-t border-gray-200">
                    <div>
                      <a href="#" className="inline-flex items-center text-base font-medium text-primary-default hover:text-purple-800 dark:hover:text-purple-700">
                        Explore Legality Guide
                        <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                      </a>
                    </div>
                    <div>
                      <a href="#" className="inline-flex items-center text-base font-medium text-primary-default hover:text-purple-800 dark:hover:text-purple-700">
                          Visit the Trust Center
                          <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                      </a>
                      </div>
                </div>
            </div>
            <div className="mb-6 lg:mb-0">
                <img src='/images/myao-process.jpg' width={"100%"} height={"100%"} />
            </div>
      </div>
      </section>
  )
}

export default About