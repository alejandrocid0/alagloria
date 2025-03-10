
import { Quiz, QuizQuestion } from "../types/quiz";

// Base de datos de cuestionarios por categoría
const quizzes: Quiz[] = [
  {
    id: "semana-santa-sevilla",
    title: "Semana Santa de Sevilla",
    description: "Pon a prueba tus conocimientos sobre la Semana Santa sevillana",
    category: "Tradiciones",
    questions: [
      {
        id: 1,
        question: "¿En qué año se fundó la Hermandad de La Macarena?",
        options: [
          { id: "a", text: "1595" },
          { id: "b", text: "1640" },
          { id: "c", text: "1750" },
          { id: "d", text: "1824" },
          { id: "e", text: "1875" }
        ],
        correctOption: "b"
      },
      {
        id: 2,
        question: "¿Qué día de la Semana Santa realiza su estación de penitencia la Hermandad de El Gran Poder?",
        options: [
          { id: "a", text: "Lunes Santo" },
          { id: "b", text: "Martes Santo" },
          { id: "c", text: "Miércoles Santo" },
          { id: "d", text: "Jueves Santo" },
          { id: "e", text: "Madrugada" }
        ],
        correctOption: "e"
      },
      {
        id: 3,
        question: "¿Quién es el autor de la Virgen de la Esperanza Macarena?",
        options: [
          { id: "a", text: "Juan de Mesa" },
          { id: "b", text: "Pedro Roldán" },
          { id: "c", text: "Anónimo" },
          { id: "d", text: "Martínez Montañés" },
          { id: "e", text: "Luis Álvarez Duarte" }
        ],
        correctOption: "c"
      },
      {
        id: 4,
        question: "¿Cuál es la Hermandad con más nazarenos de la Semana Santa de Sevilla?",
        options: [
          { id: "a", text: "El Gran Poder" },
          { id: "b", text: "La Macarena" },
          { id: "c", text: "El Silencio" },
          { id: "d", text: "La Esperanza de Triana" },
          { id: "e", text: "El Calvario" }
        ],
        correctOption: "b"
      },
      {
        id: 5,
        question: "¿Qué Hermandad tiene el paso por la Catedral de Sevilla más largo?",
        options: [
          { id: "a", text: "La Estrella" },
          { id: "b", text: "El Silencio" },
          { id: "c", text: "La Macarena" },
          { id: "d", text: "La Amargura" },
          { id: "e", text: "La Pasión" }
        ],
        correctOption: "b"
      }
    ]
  },
  {
    id: "historia-espana",
    title: "Historia de España",
    description: "Preguntas sobre la historia de España",
    category: "Historia",
    questions: [
      {
        id: 1,
        question: "¿En qué año llegó Cristóbal Colón a América?",
        options: [
          { id: "a", text: "1492" },
          { id: "b", text: "1498" },
          { id: "c", text: "1502" },
          { id: "d", text: "1510" },
          { id: "e", text: "1520" }
        ],
        correctOption: "a"
      },
      {
        id: 2,
        question: "¿Qué rey español fue conocido como 'El Prudente'?",
        options: [
          { id: "a", text: "Carlos I" },
          { id: "b", text: "Felipe II" },
          { id: "c", text: "Felipe V" },
          { id: "d", text: "Carlos III" },
          { id: "e", text: "Alfonso X" }
        ],
        correctOption: "b"
      },
      {
        id: 3,
        question: "¿En qué año comenzó la Guerra Civil Española?",
        options: [
          { id: "a", text: "1931" },
          { id: "b", text: "1934" },
          { id: "c", text: "1936" },
          { id: "d", text: "1939" },
          { id: "e", text: "1942" }
        ],
        correctOption: "c"
      },
      {
        id: 4,
        question: "¿Quién fue el primer presidente de la democracia española tras la dictadura?",
        options: [
          { id: "a", text: "Felipe González" },
          { id: "b", text: "Adolfo Suárez" },
          { id: "c", text: "Leopoldo Calvo-Sotelo" },
          { id: "d", text: "Manuel Fraga" },
          { id: "e", text: "Santiago Carrillo" }
        ],
        correctOption: "b"
      },
      {
        id: 5,
        question: "¿En qué año entró España en la Unión Europea?",
        options: [
          { id: "a", text: "1975" },
          { id: "b", text: "1978" },
          { id: "c", text: "1982" },
          { id: "d", text: "1986" },
          { id: "e", text: "1992" }
        ],
        correctOption: "d"
      }
    ]
  },
  {
    id: "geografia-espana",
    title: "Geografía de España",
    description: "Pon a prueba tus conocimientos sobre la geografía española",
    category: "Geografía",
    questions: [
      {
        id: 1,
        question: "¿Cuál es el río más largo de España?",
        options: [
          { id: "a", text: "Ebro" },
          { id: "b", text: "Tajo" },
          { id: "c", text: "Duero" },
          { id: "d", text: "Guadalquivir" },
          { id: "e", text: "Guadiana" }
        ],
        correctOption: "b"
      },
      {
        id: 2,
        question: "¿Cuál es el pico más alto de la península ibérica?",
        options: [
          { id: "a", text: "Aneto" },
          { id: "b", text: "Teide" },
          { id: "c", text: "Mulhacén" },
          { id: "d", text: "Veleta" },
          { id: "e", text: "Peñalara" }
        ],
        correctOption: "c"
      },
      {
        id: 3,
        question: "¿Cuántas comunidades autónomas tiene España?",
        options: [
          { id: "a", text: "15" },
          { id: "b", text: "17" },
          { id: "c", text: "19" },
          { id: "d", text: "21" },
          { id: "e", text: "23" }
        ],
        correctOption: "b"
      },
      {
        id: 4,
        question: "¿Qué mar baña las costas de Valencia?",
        options: [
          { id: "a", text: "Mar Cantábrico" },
          { id: "b", text: "Mar Mediterráneo" },
          { id: "c", text: "Océano Atlántico" },
          { id: "d", text: "Mar de Alborán" },
          { id: "e", text: "Mar Balear" }
        ],
        correctOption: "b"
      },
      {
        id: 5,
        question: "¿Cuál es la provincia más poblada de España?",
        options: [
          { id: "a", text: "Barcelona" },
          { id: "b", text: "Madrid" },
          { id: "c", text: "Valencia" },
          { id: "d", text: "Sevilla" },
          { id: "e", text: "Málaga" }
        ],
        correctOption: "b"
      }
    ]
  },
  {
    id: "demo-123",
    title: "Semana Santa de Sevilla - Demo",
    description: "Prueba una partida sobre Semana Santa de Sevilla",
    category: "Semana Santa",
    questions: [
      {
        id: 1,
        question: "¿En qué año se fundó la Hermandad de La Macarena?",
        options: [
          { id: "a", text: "1595" },
          { id: "b", text: "1640" },
          { id: "c", text: "1750" },
          { id: "d", text: "1824" },
          { id: "e", text: "1875" }
        ],
        correctOption: "b"
      },
      {
        id: 2,
        question: "¿Qué día de la Semana Santa realiza su estación de penitencia la Hermandad de El Gran Poder?",
        options: [
          { id: "a", text: "Lunes Santo" },
          { id: "b", text: "Martes Santo" },
          { id: "c", text: "Miércoles Santo" },
          { id: "d", text: "Jueves Santo" },
          { id: "e", text: "Madrugada" }
        ],
        correctOption: "e"
      },
      {
        id: 3,
        question: "¿Qué hermandad es conocida como 'La Estrella'?",
        options: [
          { id: "a", text: "Nuestro Padre Jesús de la Salud y María Santísima de las Angustias" },
          { id: "b", text: "Nuestro Padre Jesús de las Penas y María Santísima de la Estrella" },
          { id: "c", text: "Nuestro Padre Jesús del Gran Poder y María Santísima del Mayor Dolor y Traspaso" },
          { id: "d", text: "Nuestro Padre Jesús del Silencio y María Santísima de la Amargura" },
          { id: "e", text: "Nuestro Padre Jesús Cautivo y María Santísima de la Esperanza" }
        ],
        correctOption: "b"
      },
      {
        id: 4,
        question: "¿Qué flor se utiliza tradicionalmente en los pasos de la Virgen?",
        options: [
          { id: "a", text: "Rosas" },
          { id: "b", text: "Lirios" },
          { id: "c", text: "Claveles" },
          { id: "d", text: "Girasoles" },
          { id: "e", text: "Margaritas" }
        ],
        correctOption: "c"
      },
      {
        id: 5,
        question: "¿Cuál es la primera hermandad en hacer estación de penitencia en la Semana Santa de Sevilla?",
        options: [
          { id: "a", text: "La Paz" },
          { id: "b", text: "La Borriquita" },
          { id: "c", text: "El Amor" },
          { id: "d", text: "La Hiniesta" },
          { id: "e", text: "La Amargura" }
        ],
        correctOption: "b"
      }
    ]
  }
];

// Obtener todos los cuestionarios
export const getAllQuizzes = (): Quiz[] => {
  return quizzes;
};

// Obtener un cuestionario por su ID
export const getQuizById = (quizId: string): Quiz | undefined => {
  return quizzes.find(quiz => quiz.id === quizId);
};

// Obtener cuestionarios por categoría
export const getQuizzesByCategory = (category: string): Quiz[] => {
  return quizzes.filter(quiz => quiz.category === category);
};
