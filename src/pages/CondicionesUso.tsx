import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '@/components/Footer';
import logoAmarillo from '@/assets/logo-amarillo.png';

const CondicionesUso = () => {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Link to="/" className="inline-block mb-8">
            <img src={logoAmarillo} alt="A la Gloria" className="h-12 w-auto" />
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-purple-900 mb-8">
            Condiciones de Uso
          </h1>
          
          <div className="prose prose-purple max-w-none text-gray-700 space-y-6">
            <p className="text-sm text-gray-500">
              Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section>
              <h2 className="text-xl font-bold text-purple-900 mt-8 mb-4">1. Objeto</h2>
              <p>
                Las presentes Condiciones de Uso regulan el acceso y uso de este sitio web de registro 
                para la lista de espera de <strong>A la Gloria</strong>, una aplicación de trivia sobre 
                la Semana Santa de Sevilla.
              </p>
              <p>
                Al registrarse en nuestra lista de espera, usted acepta estas condiciones en su totalidad.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-purple-900 mt-8 mb-4">2. Descripción del Servicio</h2>
              <p>
                Este sitio web tiene como única finalidad permitir a los usuarios interesados registrarse 
                en nuestra lista de espera proporcionando su nombre y correo electrónico. Una vez registrado:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Recibirá información sobre el lanzamiento de la aplicación.</li>
                <li>Podrá recibir campañas de email con novedades y contenido relacionado.</li>
                <li>Será redirigido a nuestra aplicación principal en <a href="https://alagloria.es" className="text-purple-600 underline">alagloria.es</a>.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-purple-900 mt-8 mb-4">3. Requisitos de Registro</h2>
              <p>Para registrarse en nuestra lista de espera, usted debe:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Proporcionar información veraz y actualizada.</li>
                <li>Utilizar una dirección de correo electrónico válida de la que sea titular.</li>
                <li>Aceptar expresamente la Política de Privacidad y estas Condiciones de Uso.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-purple-900 mt-8 mb-4">4. Comunicaciones Comerciales</h2>
              <p>
                Al registrarse, usted consiente expresamente recibir comunicaciones comerciales por correo 
                electrónico relacionadas con A la Gloria, incluyendo:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Notificaciones sobre el lanzamiento de la aplicación.</li>
                <li>Newsletters con contenido sobre la Semana Santa de Sevilla.</li>
                <li>Información sobre nuevas funcionalidades y actualizaciones.</li>
                <li>Promociones y ofertas especiales.</li>
              </ul>
              <p className="mt-4">
                Podrá darse de baja de estas comunicaciones en cualquier momento utilizando el enlace 
                de cancelación de suscripción incluido en cada email o contactándonos en {' '}
                <a href="mailto:info@alagloria.es" className="text-purple-600 underline">info@alagloria.es</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-purple-900 mt-8 mb-4">5. Propiedad Intelectual</h2>
              <p>
                Todos los contenidos de este sitio web, incluyendo textos, imágenes, logotipos, diseño 
                y código fuente, son propiedad de A la Gloria o de sus licenciantes y están protegidos 
                por las leyes de propiedad intelectual e industrial.
              </p>
              <p>
                Queda prohibida la reproducción, distribución, comunicación pública o transformación 
                de estos contenidos sin autorización expresa.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-purple-900 mt-8 mb-4">6. Limitación de Responsabilidad</h2>
              <p>A la Gloria no será responsable de:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Interrupciones o fallos técnicos del sitio web.</li>
                <li>Daños derivados del uso incorrecto del servicio por parte del usuario.</li>
                <li>Contenidos de sitios web de terceros enlazados desde este sitio.</li>
                <li>Pérdida de datos por causas ajenas a nuestro control.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-purple-900 mt-8 mb-4">7. Modificaciones</h2>
              <p>
                Nos reservamos el derecho a modificar estas Condiciones de Uso en cualquier momento. 
                Las modificaciones entrarán en vigor desde su publicación en este sitio web.
              </p>
              <p>
                El uso continuado del servicio tras la publicación de cambios implica la aceptación 
                de las nuevas condiciones.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-purple-900 mt-8 mb-4">8. Legislación Aplicable</h2>
              <p>
                Estas Condiciones de Uso se rigen por la legislación española. Para cualquier controversia 
                derivada del uso de este sitio web, las partes se someten a los juzgados y tribunales 
                de Sevilla, España.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-purple-900 mt-8 mb-4">9. Contacto</h2>
              <p>
                Para cualquier consulta sobre estas Condiciones de Uso, puede contactarnos a través 
                del correo electrónico: <a href="mailto:info@alagloria.es" className="text-purple-600 underline">info@alagloria.es</a>.
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

export default CondicionesUso;
