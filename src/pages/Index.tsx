
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/home/HeroSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import StatsSection from '@/components/home/StatsSection';
import UpcomingGamesSection from '@/components/home/UpcomingGamesSection';
import CtaSection from '@/components/home/CtaSection';
import { useHomePageData } from '@/hooks/useHomePageData';

const Index = () => {
  const { upcomingGames, loading, stats } = useHomePageData();

  return (
    <>
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <StatsSection stats={stats} />
      <UpcomingGamesSection upcomingGames={upcomingGames} loading={loading} />
      <CtaSection />
      <Footer />
    </>
  );
};

export default Index;
