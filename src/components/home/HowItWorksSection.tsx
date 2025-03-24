
import SectionTitle from './how-it-works/SectionTitle';
import StepsList from './how-it-works/StepsList';

const HowItWorksSection = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <SectionTitle 
          title="¿Cómo funciona?" 
          subtitle="Una experiencia de juego única sobre la Semana Santa de Sevilla"
        />
        <StepsList />
      </div>
    </section>
  );
};

export default HowItWorksSection;
