
import { motion } from 'framer-motion';
import { CheckCircle, Clock, HelpCircle, Award, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';

const HowToPlay = () => {
  const steps = [
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

  const faqs = [
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

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <>
      <Navbar />
      
      <div className="pt-24 pb-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gloria-purple mb-4">
              Cómo Jugar
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Sigue estos simples pasos para participar en nuestras partidas y demostrar tus conocimientos
            </p>
          </motion.div>
          
          <div className="space-y-16 md:space-y-24">
            {/* How to Play Steps */}
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
            
            {/* FAQs */}
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
            
            {/* Terms Warning */}
            <motion.div 
              className="bg-yellow-50 border border-yellow-100 rounded-lg p-6 md:p-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-yellow-500 mr-4 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Información importante
                  </h3>
                  <p className="text-gray-600 mb-4">
                    A la Gloria es un juego de preguntas y respuestas sobre conocimientos de la Semana Santa. 
                    La finalidad principal es divertirse y demostrar tus conocimientos sobre la Semana Santa de Sevilla.
                  </p>
                  <p className="text-sm text-gray-500">
                    Al participar en las partidas, aceptas nuestros términos y condiciones. 
                    Debes ser mayor de 18 años para participar.
                  </p>
                </div>
              </div>
            </motion.div>
            
            {/* CTA */}
            <motion.div 
              className="text-center py-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-gloria-purple mb-6">
                ¿Listo para demostrar tus conocimientos?
              </h2>
              <Button 
                variant="secondary"
                size="lg"
                href="/games"
              >
                Ver Partidas Disponibles
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default HowToPlay;
