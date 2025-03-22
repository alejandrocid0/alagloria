
import { Question } from '@/types/game';

export const mockQuestions: Question[] = [
  {
    id: '1',
    text: '¿Qué hermandad realiza su estación de penitencia el Lunes Santo con un paso de misterio que representa el Beso de Judas?',
    options: [
      'Hermandad de Santa Genoveva',
      'Hermandad de San Gonzalo',
      'Hermandad de la Redención',
      'Hermandad de Santa Marta',
      'Hermandad del Museo'
    ],
    correctOption: '2', // Changed from number to string
    timeLimit: 20
  },
  {
    id: '2',
    text: '¿Qué advocación mariana es conocida como "La Macarena"?',
    options: [
      'Nuestra Señora de la Esperanza',
      'Nuestra Señora de los Dolores',
      'Nuestra Señora de la Estrella',
      'Nuestra Señora de la Amargura',
      'Nuestra Señora de la Soledad'
    ],
    correctOption: '0', // Changed from number to string
    timeLimit: 15
  },
  {
    id: '3',
    text: '¿Qué día de la Semana Santa realiza su estación de penitencia la Hermandad de El Silencio?',
    options: [
      'Domingo de Ramos',
      'Lunes Santo',
      'Martes Santo',
      'Miércoles Santo',
      'Madrugá del Jueves al Viernes Santo'
    ],
    correctOption: '4', // Changed from number to string
    timeLimit: 15
  },
  {
    id: '4',
    text: '¿Cuál de estas hermandades realiza su estación de penitencia el Viernes Santo?',
    options: [
      'La Lanzada',
      'La Carretería',
      'La Soledad de San Buenaventura',
      'El Cachorro',
      'La Mortaja'
    ],
    correctOption: '3', // Changed from number to string
    timeLimit: 15
  },
  {
    id: '5',
    text: '¿En qué año fue coronada canónicamente la Esperanza Macarena?',
    options: [
      '1946',
      '1964',
      '1972',
      '1987',
      '2000'
    ],
    correctOption: '1', // Changed from number to string
    timeLimit: 15
  }
];
