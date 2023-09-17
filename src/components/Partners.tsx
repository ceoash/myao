function Partners() {
  return (
    <section className="bg-partners bg-cover">
    <div className='mb-10 text-center max-w-screen-md mx-auto'>
        <p className="text-lg font-medium text-primary-default">Our Partners</p>
        <h2>Trusted by the top eCommerce companies</h2>
        <p className='font-light sm:text-xl'>MYAO  has partnered with top eCommerce companies including Uniregistry, GoDaddy, ClassicCars.com and Shopify Exchange. Talk to us about signing up today.</p>
        </div>
        <div className='grid grid-cols-4 auto-rows-fr gap-6 max-w-screen-xl mx-auto items-center justify-center'>
           <div className="partner"><img src="/images/partners/ebay-logo.png" alt="" /></div>
           <div className="partner"><img src="/images/partners/gumtree-logo.png" alt="" /></div>
           <div className="partner"><img src="/images/partners/shopify-logo.png" alt="" /></div>
           <div className="partner"><img src="/images/partners/uniregistry-logo.png" alt="" /></div>

        </div>
       
        </section>
    
  )
}

export default Partners