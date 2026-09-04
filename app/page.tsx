import Hero from "@/components/sections/Hero";
import Trust from "@/components/sections/Trust";
import Services from "@/components/sections/Services";
import Work from "@/components/sections/Work";
import Process from "@/components/sections/Process";
import WhyCraftWare from "@/components/sections/WhyCraftWare";
import About from "@/components/sections/About";
import Testimonials from "@/components/sections/Testimonials";
import FinalCta from "@/components/sections/FinalCta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Trust />
      <Services />
      <Work />
      <Process />
      <WhyCraftWare />
      <About />
      <Testimonials />
      <FinalCta />
    </>
  );
}
