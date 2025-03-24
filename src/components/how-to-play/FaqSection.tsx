
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

interface Faq {
  question: string;
  answer: string;
}

const FaqSection = () => {
  const faqs: Faq[] = [
    {
      question: "¿Es necesario pagar para participar en las partidas?",
      answer: "No, la participación en todas las partidas es completamente gratuita. Solo necesitas registrarte en la plataforma."
    },
    {
      question: "¿Qué pasa si no puedo conectarme a la hora de la partida?",
      answer: "No te preocupes, siempre habrá más partidas disponibles. Si no puedes conectarte, simplemente inscríbete en otra partida que se ajuste mejor a tu horario."
    },
    {
      question: "¿Cómo se determina el ganador?",
      answer: "El ganador es el participante que acumula más puntos durante la partida. Los puntos se otorgan por respuestas correctas y la velocidad con la que respondes."
    },
    {
      question: "¿Cuántas preguntas tiene cada partida?",
      answer: "Cada partida tiene aproximadamente 20 preguntas relacionadas con la Semana Santa de Sevilla, con diferentes niveles de dificultad."
    },
    {
      question: "¿Puedo jugar desde mi teléfono móvil?",
      answer: "¡Sí! La plataforma está optimizada para dispositivos móviles, tablets y ordenadores. Puedes jugar desde cualquier dispositivo con conexión a internet."
    }
  ];

  return (
    <motion.div
      className="py-10"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-gloria-purple mb-8 text-center">
        Preguntas Frecuentes
      </h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        {faqs.map((faq, index) => (
          <motion.div 
            key={index}
            className="glass-panel p-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <h3 className="text-lg font-semibold text-gloria-purple mb-3 flex items-start">
              <HelpCircle className="w-5 h-5 text-gloria-gold mr-2 flex-shrink-0 mt-0.5" />
              <span>{faq.question}</span>
            </h3>
            <p className="text-gray-600 pl-7">
              {faq.answer}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default FaqSection;
