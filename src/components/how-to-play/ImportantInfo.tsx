
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const ImportantInfo = () => {
  return (
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
  );
};

export default ImportantInfo;
