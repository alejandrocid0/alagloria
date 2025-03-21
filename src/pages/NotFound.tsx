
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Cross, Home, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useIsMobile } from "@/hooks/use-mobile";

const NotFound = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gloria-purple/95 to-gloria-deepPurple/95 text-white px-4 py-8">
      <div className="max-w-3xl w-full mx-auto">
        {/* Card con efecto de vidrio - ajustado para móvil */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 md:p-10 shadow-2xl">
          {/* Contenido principal */}
          <div className="flex flex-col items-center text-center">
            {/* Pequeño texto de error 404 */}
            <div className="flex items-center gap-1 md:gap-2 mb-3 md:mb-4">
              <span className="text-gloria-gold font-serif text-base md:text-xl">404</span>
              <Cross size={isMobile ? 16 : 20} className="text-gloria-gold" />
              <span className="text-gloria-gold font-serif text-base md:text-xl">Página no encontrada</span>
            </div>
            
            {/* Titular principal */}
            <h1 className="text-2xl md:text-5xl font-serif font-bold mb-4 md:mb-6 text-gloria-cream">
              Esta página no sale
            </h1>
            
            {/* Separador decorativo - simula un varal */}
            <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-gloria-gold to-transparent mb-4 md:mb-6"></div>
            
            {/* Subtítulo */}
            <p className="text-lg md:text-2xl font-serif text-gloria-cream/90 mb-6 md:mb-8">
              Esperamos que las Hermandades sí salgan
            </p>
            
            {/* Iconos decorativos de Semana Santa - ajustados para móvil */}
            <div className="flex justify-center gap-4 md:gap-8 mb-6 md:mb-8">
              <div className="flex flex-col items-center">
                <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} bg-gloria-gold/20 rounded-full flex items-center justify-center mb-2`}>
                  <Cross className="text-gloria-gold w-6 h-6 md:w-8 md:h-8" />
                </div>
                <span className="text-xs text-gloria-cream/70">Cruz de Guía</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} bg-gloria-gold/20 rounded-full flex items-center justify-center mb-2`}>
                  <svg className="text-gloria-gold w-6 h-6 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 5L16.24 7.83M16.24 16.17L19.07 19M4.93 19L7.76 16.17M7.76 7.83L4.93 5" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-xs text-gloria-cream/70">Palio</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} bg-gloria-gold/20 rounded-full flex items-center justify-center mb-2`}>
                  <svg className="text-gloria-gold w-6 h-6 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 8C18 4.69 15.31 2 12 2C8.69 2 6 4.69 6 8C6 12 12 18 12 18C12 18 18 12 18 8Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-xs text-gloria-cream/70">Incienso</span>
              </div>
            </div>
            
            {/* Botón para volver al inicio - optimizado para táctil en móvil */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button
                asChild
                variant="outline"
                className="bg-gloria-gold/20 text-gloria-cream border-gloria-gold/50 hover:bg-gloria-gold/30 hover:text-white py-2 px-4 h-auto"
              >
                <a href="/" className="inline-flex items-center gap-2">
                  <Home size={16} />
                  Volver a la página de inicio
                  <ChevronRight size={16} />
                </a>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Imagen decorativa en la parte inferior - silueta de nazarenos */}
        <div className="mt-6 md:mt-8 max-w-lg mx-auto opacity-70">
          <AspectRatio ratio={5 / 1} className="overflow-hidden rounded-xl">
            <div className="w-full h-full bg-gloria-deepPurple/50 flex items-end justify-center">
              <svg viewBox="0 0 500 100" className="w-full text-gloria-purple">
                <path d="M50,80 L60,30 L70,80 L80,70 L90,80 L100,30 L110,80 L120,70 L130,80 L140,30 L150,80 L160,70 L170,80 L180,30 L190,80 L200,70 L210,80 L220,30 L230,80 L240,70 L250,80 L260,30 L270,80 L280,70 L290,80 L300,30 L310,80 L320,70 L330,80 L340,30 L350,80 L360,70 L370,80 L380,30 L390,80 L400,70 L410,80 L420,30 L430,80 L440,70 L450,80" 
                  fill="none" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </AspectRatio>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
