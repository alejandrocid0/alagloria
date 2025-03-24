
import { motion } from 'framer-motion';
import { CheckCircle, Clock, HelpCircle, Award } from 'lucide-react';

interface Step {
  title: string;
  description: string;
  icon: JSX.Element;
  details: string[];
}

const StepsSection = () => {
  const steps: Step[] = [
    {
      title: "Únete a una partida",
      description: "Elige entre las partidas disponibles y regístrate para participar de forma gratuita.",
      icon: <CheckCircle className="w-10 h-10 text-gloria-gold" />,
      details: [
        "Las partidas tienen un número limitado de participantes.",
        "Puedes ver detalles como la fecha, hora y número actual de participantes.",
        "La participación es totalmente gratuita."
      ]
    },
    {
      title: "Conéctate a la hora indicada",
      description: "Asegúrate de estar listo para jugar a la hora de inicio de la partida.",
      icon: <Clock className="w-10 h-10 text-gloria-gold" />,
      details: [
        "Recibirás un recordatorio por correo electrónico 30 minutos antes.",
        "La partida comenzará exactamente a la hora programada.",
        "Si llegas tarde, podrás unirte pero habrás perdido las preguntas ya realizadas."
      ]
    },
    {
      title: "Responde preguntas",
      description: "Contesta correctamente y lo más rápido posible para acumular más puntos.",
      icon: <HelpCircle className="w-10 h-10 text-gloria-gold" />,
      details: [
        "Cada partida contiene aproximadamente 20 preguntas sobre la Semana Santa de Sevilla.",
        "Tienes 20 segundos para contestar cada pregunta.",
        "Las respuestas más rápidas reciben más puntos.",
        "No hay penalización por respuestas incorrectas, pero no sumarás puntos."
      ]
    },
    {
      title: "Compite por la gloria",
      description: "Demuestra tus conocimientos y compite por los primeros puestos del ranking.",
      icon: <Award className="w-10 h-10 text-gloria-gold" />,
      details: [
        "Gana puntos de experiencia con cada partida.",
        "Desbloquea logros especiales por tus conocimientos.",
        "Sube de nivel y compite por ser el mejor.",
        "Comparte tus resultados y presume de tus conocimientos."
      ]
    }
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="relative">
      <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200 hidden md:block"></div>
      
      <div className="space-y-16 md:space-y-0">
        {steps.map((step, index) => (
          <motion.div 
            key={index}
            className="relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className={`flex flex-col md:flex-row items-center gap-8 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
              <div className="md:w-1/2 relative z-10">
                <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg border border-gray-100">
                  <div className="mb-4 md:hidden flex justify-center">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-gloria-purple mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {step.description}
                  </p>
                  <ul className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start text-sm">
                        <span className="text-gloria-purple mr-2">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="hidden md:flex items-center justify-center relative z-20 bg-white rounded-full p-4 border-4 border-gloria-cream shadow-md">
                {step.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StepsSection;
