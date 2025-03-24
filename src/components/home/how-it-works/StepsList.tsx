
import { motion } from 'framer-motion';
import { Users, Clock, Award } from 'lucide-react';
import StepCard from './StepCard';

const StepsList = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const steps = [
    {
      icon: Users,
      title: "Únete a una partida",
      description: "Elige una de las partidas disponibles y regístrate para participar gratuitamente."
    },
    {
      icon: Clock,
      title: "Responde preguntas",
      description: "Contesta correctamente y lo más rápido posible para acumular más puntos."
    },
    {
      icon: Award,
      title: "Consigue logros",
      description: "Demuestra tus conocimientos y compite por los primeros puestos del ranking."
    }
  ];

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-3 gap-8"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {steps.map((step, index) => (
        <StepCard 
          key={index}
          icon={step.icon}
          title={step.title}
          description={step.description}
          itemVariants={itemVariants}
          stepNumber={index + 1}
        />
      ))}
    </motion.div>
  );
};

export default StepsList;
