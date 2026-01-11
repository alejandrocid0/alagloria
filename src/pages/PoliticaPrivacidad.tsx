import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '@/components/Footer';
import logoAmarillo from '@/assets/logo-amarillo.png';

const PoliticaPrivacidad = () => {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Link to="/" className="inline-block mb-8">
            <img src={logoAmarillo} alt="A la Gloria" className="h-12 w-auto" />
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-purple-900 mb-8">
            Política de Privacidad
          </h1>
          
          <div className="prose prose-purple max-w-none text-gray-700 space-y-6">
            <p className="text-sm text-gray-500">
              Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section>
              <h2 className="text-xl font-bold text-purple-900 mt-8 mb-4">1. Responsable del Tratamiento</h2>
              <p>
                El responsable del tratamiento de los datos personales recogidos a través de este sitio web es 
                <strong> A la Gloria</strong>, con dominio principal en <a href="https://alagloria.es" className="text-purple-600 underline">alagloria.es</a>.
              </p>
              <p>
                Para cualquier consulta relacionada con el tratamiento de sus datos personales, puede contactarnos 
                a través de nuestro correo electrónico de contacto disponible en la aplicación principal.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-purple-900 mt-8 mb-4">2. Datos que Recopilamos</h2>
              <p>A través de este formulario de registro, recopilamos únicamente:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Nombre:</strong> Para poder dirigirnos a usted de forma personalizada.</li>
                <li><strong>Correo electrónico:</strong> Para poder contactarle, enviarle información sobre el lanzamiento y acceso a la aplicación.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-purple-900 mt-8 mb-4">3. Finalidad del Tratamiento</h2>
              <p>Los datos personales que nos proporcione serán utilizados para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Gestionar su inscripción en nuestra lista de espera.</li>
                <li>Enviarle comunicaciones comerciales y campañas de email relacionadas con A la Gloria.</li>
                <li>Informarle sobre el lanzamiento de la aplicación y nuevas funcionalidades.</li>
                <li>Redirigirle a nuestra aplicación principal en alagloria.es.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-purple-900 mt-8 mb-4">4. Base Legal del Tratamiento</h2>
              <p>
                La base legal para el tratamiento de sus datos es el <strong>consentimiento expreso</strong> que 
                usted otorga al marcar la casilla de aceptación de esta Política de Privacidad y las Condiciones 
                de Uso antes de enviar el formulario de registro.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-purple-900 mt-8 mb-4">5. Conservación de los Datos</h2>
              <p>
                Sus datos personales serán conservados mientras mantenga su interés en recibir información sobre 
                A la Gloria y no solicite su supresión. Una vez que solicite la baja o el borrado de sus datos, 
                estos serán eliminados de nuestros sistemas.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-purple-900 mt-8 mb-4">6. Destinatarios de los Datos</h2>
              <p>
                Sus datos no serán cedidos a terceros, salvo obligación legal. Utilizamos servicios de terceros 
                para el almacenamiento seguro de datos (Supabase) y para el envío de comunicaciones por email, 
                los cuales actúan como encargados del tratamiento bajo las debidas garantías de seguridad.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-purple-900 mt-8 mb-4">7. Derechos del Usuario</h2>
              <p>Usted tiene derecho a:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Acceso:</strong> Conocer qué datos personales tenemos sobre usted.</li>
                <li><strong>Rectificación:</strong> Solicitar la corrección de datos inexactos.</li>
                <li><strong>Supresión:</strong> Solicitar el borrado de sus datos cuando ya no sean necesarios.</li>
                <li><strong>Oposición:</strong> Oponerse al tratamiento de sus datos para fines de marketing.</li>
                <li><strong>Portabilidad:</strong> Recibir sus datos en un formato estructurado.</li>
                <li><strong>Limitación:</strong> Solicitar la limitación del tratamiento en determinadas circunstancias.</li>
              </ul>
              <p className="mt-4">
                Para ejercer cualquiera de estos derechos, puede contactarnos a través del correo electrónico 
                disponible en nuestra aplicación principal.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-purple-900 mt-8 mb-4">8. Seguridad de los Datos</h2>
              <p>
                Implementamos medidas técnicas y organizativas apropiadas para proteger sus datos personales 
                contra el acceso no autorizado, la alteración, divulgación o destrucción. Utilizamos conexiones 
                seguras (HTTPS) y almacenamiento cifrado para garantizar la seguridad de su información.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-purple-900 mt-8 mb-4">9. Modificaciones</h2>
              <p>
                Nos reservamos el derecho a modificar esta Política de Privacidad en cualquier momento. 
                Cualquier cambio será publicado en esta página con la fecha de actualización correspondiente.
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <Link 
                to="/" 
                className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium"
              >
                ← Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PoliticaPrivacidad;
