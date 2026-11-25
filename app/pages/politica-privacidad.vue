<script setup lang="ts">
/*
 * Privacy policy, the same for every instance. Spanish only for now, whatever
 * the chosen language: the page declares lang="es" so screen readers read it
 * as Spanish. The text is the legal team's, copied verbatim: don't reword it
 * here without their review.
 */
const { t } = useI18n()

const title = 'Política de privacidad'

// Long text reads best on white; the canvas follows (see main.css)
useHead({
  htmlAttrs: { lang: 'es', class: 'bg-paper' },
  bodyAttrs: { class: 'bg-paper' },
  meta: [{ name: 'theme-color', content: '#ffffff' }]
})

useSeoMeta({
  title: `${title} · ${t('app.tagline')}`,
  description: 'Quién es responsable de tus datos, qué datos recogemos, para qué y cuáles son tus derechos.',
  ogTitle: title
})

const CONTROLLERS = [
  {
    name: 'Dot S. Coop.',
    cif: 'F95743696',
    address: 'Alameda Urquijo 28, 4D, 48010 Bilbao',
    email: 'hello@feeldot.com'
  },
  {
    name: 'Fundación Salvador Soler (Political Watch)',
    cif: 'G85959666',
    address: 'Avda. Cardenal Herrera Oria 63, 3º Izda - 28034, Madrid',
    email: 'info@politicalwatch.es'
  }
]
</script>

<template>
  <div class="surface-light min-h-dvh">
    <header class="px-4 pt-4 sm:px-6">
      <AppLogo />
    </header>

    <main
      class="
        mx-auto flex max-w-3xl flex-col gap-10 px-6 py-10 leading-relaxed sm:py-16
        [&_a]:underline [&_a]:underline-offset-4
        [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:leading-tight [&_h2]:font-semibold sm:[&_h2]:text-3xl
        [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:leading-snug [&_h3]:font-semibold
        [&_li]:ms-5 [&_li]:list-disc
        [&_p+p]:mt-3 [&_p+table]:mt-3 [&_p+ul]:mt-2 [&_ul+p]:mt-3
        [&_table]:w-full [&_table]:border-collapse [&_table]:text-start
        [&_td]:border-t [&_td]:border-(--surface-line) [&_td]:py-2 [&_td]:pe-4 [&_td]:align-top
        [&_th]:py-2 [&_th]:pe-4 [&_th]:text-start [&_th]:font-semibold
      "
    >
      <h1 class="text-4xl leading-[0.95] font-semibold uppercase sm:text-6xl">
        {{ title }}
      </h1>

      <section>
        <h2>1. Quién es responsable de tus datos</h2>
        <p>El responsable del tratamiento de los datos de esta web es:</p>

        <!-- A list instead of the docx's 4-column table: it doesn't fit on phones -->
        <ul class="my-4 grid gap-4 sm:grid-cols-2">
          <li
            v-for="controller in CONTROLLERS"
            :key="controller.cif"
            class="ms-0! list-none! border-t border-(--surface-line) pt-3"
          >
            <p class="font-semibold">
              {{ controller.name }}
            </p>
            <dl class="mt-1 grid grid-cols-[auto_1fr] gap-x-3 text-sm">
              <dt class="font-semibold">
                CIF
              </dt>
              <dd>{{ controller.cif }}</dd>
              <dt class="font-semibold">
                Domicilio
              </dt>
              <dd>{{ controller.address }}</dd>
              <dt class="font-semibold">
                Contacto
              </dt>
              <dd>
                <a :href="`mailto:${controller.email}`">{{ controller.email }}</a>
              </dd>
            </dl>
          </li>
        </ul>

        <p>Dot S. Coop. será la entidad encargada de alojar los datos en su cuenta de Notion. Political Watch tendrá acceso a los mismos para tareas de análisis.</p>
      </section>

      <section>
        <h2>2. Qué datos recogemos</h2>
        <p><strong>Respuestas a la encuesta (anónimas).</strong> Algunas preguntas tratan temas sensibles. Por eso las guardamos sin nombre, sin correo, sin dirección IP y sin ningún identificador que permita saber quién respondió. Al no poder relacionarse con ninguna persona, estos datos son anónimos y quedan fuera del RGPD. Te pedimos que no escribas en los campos abiertos nada que pueda identificarte a ti o a otras personas.</p>
        <p><strong>Tu correo electrónico (opcional).</strong> Solo si marcas la casilla de consentimiento al final del formulario. Junto al correo guardamos la fecha del consentimiento para poder demostrar que lo diste y respetar tu decisión si decides retirarlo.</p>
      </section>

      <section>
        <h2>3. Para qué usamos tus datos y con qué base legal</h2>
        <div
          class="overflow-x-auto"
          role="region"
          aria-label="Finalidades y base legal"
          tabindex="0"
        >
          <table>
            <thead>
              <tr>
                <th scope="col">
                  Datos
                </th>
                <th scope="col">
                  Para qué
                </th>
                <th scope="col">
                  Base legal (RGPD)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Respuestas anónimas</td>
                <td>Investigación y publicación de resultados agregados</td>
                <td>No aplica: son datos anónimos</td>
              </tr>
              <tr>
                <td>Correo</td>
                <td>Enviarte novedades del proyecto y de actividades relacionadas</td>
                <td>Tu consentimiento (art. 6.1.a)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="mt-6 font-semibold">
          Lo que no hacemos:
        </p>
        <ul>
          <li>No deducimos tu ideología, creencias ni ningún otro dato sensible.</li>
          <li>No tomamos decisiones automatizadas que te produzcan efectos jurídicos o te afecten de forma significativa (art. 22 RGPD).</li>
          <li>No vendemos ni cedemos tus datos con fines comerciales.</li>
        </ul>
      </section>

      <section>
        <h2>4. Cuánto tiempo y quién más accede</h2>
        <p><strong>Conservación.</strong></p>
        <ul>
          <li>Respuestas anónimas: sin plazo, al no ser datos personales.</li>
          <li>Correo: hasta que te des de baja o retires el consentimiento.</li>
          <li>Mientras espera su envío a Notion, que hacemos una vez al día, el correo se guarda en Netlify y se borra de allí en cuanto se envía.</li>
          <li>Prueba del consentimiento: el tiempo necesario para atender posibles reclamaciones.</li>
        </ul>

        <p><strong>Quién accede.</strong> Solo personal autorizado de Dot y los proveedores que nos prestan servicios técnicos, como encargados del tratamiento con contrato (art. 28 RGPD):</p>
        <div
          class="overflow-x-auto"
          role="region"
          aria-label="Proveedores"
          tabindex="0"
        >
          <table>
            <thead>
              <tr>
                <th scope="col">
                  Proveedor
                </th>
                <th scope="col">
                  Servicio
                </th>
                <th scope="col">
                  Ubicación
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Notion</td>
                <td>Base de datos</td>
                <td>[EEUU]</td>
              </tr>
              <tr>
                <td>Netlify</td>
                <td>Alojamiento de la web (registra técnicamente las visitas, incluida la dirección IP) y almacenamiento temporal de los correos hasta su envío a Notion</td>
                <td>EE. UU. (los correos se guardan en la UE)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="mt-3">
          No cedemos tus datos a terceros salvo obligación legal.
        </p>

        <p><strong>Transferencias internacionales.</strong> Intentamos usar proveedores dentro de la UE. Si alguno trata datos fuera del Espacio Económico Europeo, lo hará con garantías del RGPD, como una decisión de adecuación (por ejemplo, el Marco de Privacidad de Datos UE–EE. UU.).</p>
        <p><strong>Seguridad.</strong> Aplicamos medidas técnicas y organizativas para proteger tus datos.</p>
      </section>

      <section>
        <h2>5. Tus derechos</h2>

        <h3>5.1. ¿Puedo retirar el consentimiento?</h3>
        <p>Tienes la posibilidad y el derecho a retirar el consentimiento para cualquier finalidad específica otorgada en su momento, sin que ello afecte a la licitud del tratamiento basado en el consentimiento previo a su retirada.</p>

        <h3>5.2. ¿Dónde puedo reclamar en el caso de que considere que no se tratan mis datos correctamente?</h3>
        <p>
          Si consideras que sus datos no son tratados correctamente por Dot S. Coop. o por la Fundación Salvador Soler (Political Watch), o que las solicitudes de ejercicio de derechos no han sido atendidas de forma satisfactoria, puede interponer una reclamación ante a la autoridad de protección de datos que corresponda, siendo la Agencia Española de Protección de Datos (AEPD) la indicada en el territorio nacional. Más información en su página web:
          <a
            href="https://www.aepd.es"
            target="_blank"
            rel="noopener"
          >www.aepd.es<span class="sr-only"> (se abre en una pestaña nueva)</span></a>.
        </p>

        <h3>5.3. Seguridad y actualización de sus datos personales.</h3>
        <p>Con el objetivo de salvaguardar la seguridad de sus datos personales, le informamos que ha adoptado todas las medidas de índole técnica y organizativa necesarias para garantizar la seguridad de los datos personales suministrados. Todo ello para evitar su alteración, pérdida, y/o tratamientos o accesos no autorizados, tal como exige la normativa, si bien la seguridad absoluta no existe.</p>
        <p>Es importante que, para que podamos mantener sus datos personales actualizados, nos informe siempre que se produzca una modificación de los mismos.</p>

        <h3>5.4. Confidencialidad.</h3>
        <p>Dot S. Coop. y la Fundación Salvador Soler (Political Watch) le informa que sus datos serán tratados con el máximo celo y confidencialidad por todo el personal que intervenga en cualquiera de las fases del tratamiento. No cederemos ni comunicaremos a ningún tercero sus datos, excepto en los casos legalmente previstos, o salvo que el interesado nos haya autorizado expresamente.</p>
      </section>

      <section>
        <h2>6. Menores de 14 años</h2>
        <p>Para dejar tu correo debes tener 14 años o más. Si tienes menos, necesitas que tu madre, padre o tutor dé el consentimiento por ti (art. 7 LOPDGDD).</p>
      </section>

      <section>
        <h2>7. Cambios en esta política</h2>
        <p>Si cambiamos algo importante, lo publicaremos aquí con la nueva fecha y, si nos has dado tu correo, te avisaremos.</p>
        <p class="mt-6 text-sm">
          Última actualización: <time datetime="2026-11-25">25 de noviembre de 2026</time>
        </p>
      </section>
    </main>
  </div>
</template>
