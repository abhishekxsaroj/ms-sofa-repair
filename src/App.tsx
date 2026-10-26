import { EnquiryProvider } from "./context/EnquiryContext";
import { Enquiry } from "./components/Enquiry";
import { FinalCta } from "./components/FinalCta";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Nav } from "./components/Nav";
import { Seo } from "./components/Seo";
import { Services } from "./components/Services";
import { Transformation } from "./components/Transformation";
import { TypographySection } from "./components/TypographySection";
import { WhatsAppButton } from "./components/WhatsAppButton";
import { WhyUs } from "./components/WhyUs";

export default function App() {
  return (
    <EnquiryProvider>
      <Seo />
      <div className="grain" aria-hidden="true" />
      <Nav />
      <main className="relative">
        <Hero />
        <Transformation />
        <Services />
        <TypographySection />
        <WhyUs />
        <Enquiry />
        <FinalCta />
      </main>
      <Footer />
      <WhatsAppButton />
    </EnquiryProvider>
  );
}
