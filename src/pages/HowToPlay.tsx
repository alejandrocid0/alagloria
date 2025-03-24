
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/how-to-play/PageHeader';
import StepsSection from '@/components/how-to-play/StepsSection';
import FaqSection from '@/components/how-to-play/FaqSection';
import CtaSection from '@/components/how-to-play/CtaSection';

const HowToPlay = () => {
  return (
    <>
      <Navbar />
      
      <div className="pt-24 pb-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <PageHeader />
          
          <div className="space-y-16 md:space-y-24">
            <StepsSection />
            <FaqSection />
            <CtaSection />
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default HowToPlay;
