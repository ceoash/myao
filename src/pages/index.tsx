'use client';

import { usePathname } from 'next/navigation';
import { Meta } from '../layouts/meta';
import { Main } from '../templates/main';
import Hero from '../components/Hero';
import Intro from '../components/Intro';
import Partners from '../components/Partners';
import About from '../components/About';
import Newsletter from '../components/Newsletter';

const Index = () => {
  const path = usePathname();

  return (
    <Main
      meta={
        <Meta
          title="Make You An Offer You Can't Refuse"
          description="This is the Make You An Offer Web App"
        />
      }
    >
      <Hero />
      <Intro />
      <Partners />
      <About />
      <Newsletter />
    </Main>
  );
};

export default Index;