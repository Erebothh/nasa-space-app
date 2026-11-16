import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Language = 'es' | 'en';

const LANGUAGE_KEY = 'orbitalab-language';

const ENGLISH: Record<string, string> = {
  'Dificultades': 'Difficulty levels',
  'Dificultad': 'Difficulty',
  'Define la experiencia': 'Set the difficulty',
  'Ingeniero': 'Engineer',
  'Segmento': 'Segment',
  'Elige cómo quieres operar': 'Choose how you want to operate',
  'Continuar': 'Continue',
  'Progreso del registro': 'Registration progress',
  'Pasos del registro': 'Registration steps',
  'Modo de juego': 'Game mode',
  'Volver al inicio de OrbitaLab': 'Return to OrbitaLab home',
  'Esquema orbital de una misión con cuatro segmentos':
    'Orbital diagram of a mission with four segments',
  'Intermedio': 'Intermediate',
  'LOS 4 SEGMENTOS NASA': 'THE 4 NASA SEGMENTS',
  'Misiones': 'Missions',
  'Modelo 3D del lanzador. Arrastra para girarlo.':
    '3D model of the launch vehicle. Drag to rotate.',
  'Modelo 3D del satélite. Arrastra para girarlo.':
    '3D model of the satellite. Drag to rotate.',
  'Modelo 3D del satélite en órbita. Arrastra para girarlo.':
    '3D model of the orbiting satellite. Drag to rotate.',
  'Segmentos': 'Segments',
  '1 jugador': '1 player',
  '1–4 jugadores': '1–4 players',
  '1–4 personas': '1–4 people',
  'A favor': 'For',
  'A favor ·': 'For ·',
  'Abierta': 'Open',
  'Abortar y salir': 'Abort and exit',
  'Abortar y volver al inicio': 'Abort and return to home',
  'Abrir configuración de audio': 'Open audio settings',
  'Configuración de audio': 'Audio settings',
  'Silenciar': 'Mute',
  'Activar': 'Turn on',
  'Abrir el ayudante AlvaBot': 'Open the AlvaBot assistant',
  'Abrir mesa de diseño': 'Open design room',
  'Acción de sala': 'Room action',
  'Activa instrumentos para generar ciencia.': 'Activate instruments to generate science.',
  'Activa música y sonidos para escuchar los diálogos de AlvaBot.':
    'Turn on music and sounds to listen to AlvaBot dialogs.',
  'Activo': 'Active',
  'Acto': 'Act',
  'Actos de vuelo': 'Flight acts',
  'Al abrir la mesa empieza la selección de módulos y la votación.':
    'Opening the design room starts module selection and voting.',
  'Al acercarte al límite de masa, la nave tiene menos margen para responder a una anomalía.':
    'As you approach the mass limit, the spacecraft has less margin to respond to an anomaly.',
  'Al unirte, elegirás un segmento disponible en el lobby de la sala.':
    'After joining, you will choose an available segment in the room lobby.',
  'Alcanzar los puntos científicos objetivo de la misión.':
    'Reach the mission science-point target.',
  'Alerta de diseño': 'Design alert',
  'Alertas de auditoría': 'Audit alerts',
  'Alertas preventivas': 'Preventive alerts',
  'Alinea la órbita y el lanzador con el objetivo de la misión.':
    'Match the orbit and launch vehicle to the mission objective.',
  'Alta eficiencia para órbita baja con eclipses frecuentes.':
    'High efficiency for low orbit with frequent eclipses.',
  'Alta sincronización': 'High synchronization',
  'AlvaBot te presenta como comandante, el presupuesto inicial y el objetivo de diseñar una misión espacial.':
    'AlvaBot introduces you as commander, explains the starting budget, and outlines the goal of designing a space mission.',
  'Amenazas orbitales': 'Orbital threats',
  'Antena Banda X': 'X-band antenna',
  'Apagado prematuro': 'Premature shutdown',
  'Aprendiz': 'Apprentice',
  'Aprendiz guía cada decisión. Ingeniero exige lectura completa de telemetría.':
    'Apprentice mode guides every decision. Engineer mode requires a full telemetry readout.',
  'Aprendiz o ingeniero': 'Apprentice or engineer',
  'Aprobar': 'Approve',
  'Aprovecha el contacto para descargar datos científicos.':
    'Use this contact window to downlink science data.',
  'Ascenso e inserción': 'Ascent and insertion',
  'Ascenso nominal': 'Nominal ascent',
  'Asegura energía, datos y ventanas de enlace': 'Manage power, data, and communication windows',
  'Asesores virtuales': 'Virtual advisors',
  'Asesores virtuales: el diseño mantiene los márgenes de advertencia actuales.':
    'Virtual advisors: the design remains within the current warning margins.',
  'Asistencia orbital y márgenes amplios.': 'Orbital guidance and generous margins.',
  'Audio': 'Audio',
  'Auditoría de causa raíz': 'Root-cause audit',
  'Aumentar capacidad de enlace o reducir la generación de datos.':
    'Increase downlink capacity or reduce data generation.',
  'Añade 35 pts de perfilado atmosférico; exige revisar el enlace de datos.':
    'Adds 35 atmospheric profiling points; requires checking the data link.',
  'Añadir al diseño': 'Add to design',
  'Bajada': 'Downlink',
  'Bajada mínima': 'Minimum downlink',
  'Balance energía': 'Power balance',
  'Balance solar': 'Solar balance',
  'Batería Li-ion 3 kWh': '3 kWh Li-ion battery',
  'Bienvenida a la agencia': 'Welcome to the agency',
  'Bienvenida a la agencia ·': 'Welcome to the agency ·',
  'Bloqueo duro': 'Hard block',
  'Brief de la misión': 'Mission brief',
  'Briefing de misión': 'Mission briefing',
  'Busca margen': 'Leave some margin',
  'Cada jugador protege un recurso distinto': 'Each player protects a different resource',
  'Cada operador elige un segmento. El host inicia el diseño cuando todos estén listos.':
    'Each operator chooses a segment. The host starts the design once everyone is ready.',
  'Cada operador protege un segmento. El host comparte el código de sala.':
    'Each operator protects one segment. The host shares the room code.',
  'Cada propuesta se vota entre todos los operadores antes de aplicarse al diseño.':
    'Every proposal is voted on by all operators before it is added to the design.',
  'Cada rol ve una parte distinta del problema. Ningún segmento puede salvar la misión solo.':
    'Each role sees a different part of the problem. No single segment can save the mission alone.',
  'Calibra instrumentos y maximiza ciencia': 'Calibrate instruments and maximize science',
  'Cambiar misión': 'Change mission',
  'Cancelar': 'Cancel',
  'Capacidad de bajada de datos inferior a la requerida':
    'Data downlink capacity is below the required minimum.',
  'Capacidad media; da margen para cargas pesadas y TLI.':
    'Medium capacity; leaves room for heavy payloads and TLI.',
  'Carga Útil · Satélite': 'Payload · Satellite',
  'Cartografía hielo marino y nivel del mar a través de nubes.':
    'Maps sea ice and sea level through clouds.',
  'Centro de control en línea': 'Mission control online',
  'Centro de control no disponible: puedes jugar en solitario con la simulación local.':
    'Mission control is unavailable. You can play solo using the local simulation.',
  'Cerrada': 'Closed',
  'Cerrar configuración de audio': 'Close audio settings',
  'Cerrar AlvaBot': 'Close AlvaBot',
  'Diálogos de AlvaBot': 'AlvaBot dialogs',
  'Diálogo anterior': 'Previous dialog',
  'Diálogo siguiente': 'Next dialog',
  'Volumen general de música y sonidos': 'Overall music and sound volume',
  'La mochila de ladrillos': 'The brick backpack',
  'Recreaciones': 'Recreations',
  'Cerrar el ayudante AlvaBot': 'Close the AlvaBot assistant',
  'Ciencia': 'Science',
  'Ciencia [SCI]': 'Science [SCI]',
  'Ciencia a bordo': 'Onboard science',
  'Ciencia objetivo': 'Science target',
  'Ciencia obtenida': 'Science earned',
  'Ciencia y calibración': 'Science and calibration',
  'Ciencia y energía': 'Science and power',
  'Cierra el objetivo científico y eleva el uso del enlace del 70% al 85%.':
    'Meets the science target and raises link utilization from 70% to 85%.',
  'Comandante': 'Commander',
  'Combustible, temperatura e integridad': 'Fuel, temperature, and integrity',
  'Combínalo con una antena de banda ancha: genera más datos que un instrumento óptico.':
    'Pair it with a broadband antenna: it generates more data than an optical instrument.',
  'Comenzar': 'Start',
  'Comenzar ahora': 'Get started',
  'Comms/Energía [COM]': 'Comms/Power [COM]',
  'Compara el aporte científico de cada instrumento con su consumo eléctrico.':
    'Compare each instrument’s science contribution with its power consumption.',
  'Compara los diseños del simulador con misiones y objetivos científicos reales.':
    'Compare simulator designs with real missions and science objectives.',
  'Compara los escenarios y revisa la historia y los objetivos antes de confirmar.':
    'Compare the scenarios and review their stories and objectives before confirming.',
  'Comparativa con NASA': 'NASA comparison',
  'Comparte el código de sala con tu equipo. Cuando todos los segmentos estén asignados, el host abre la mesa de diseño concurrente. El lanzamiento se permite incluso con alertas de auditoría, pero los bloqueos duros deben resolverse.':
    'Share the room code with your team. Once all segments are assigned, the host opens the collaborative design room. Launch is allowed with audit warnings, but hard blocks must be resolved.',
  'Comparte este código para que otros operadores se unan desde su registro.':
    'Share this code so other operators can join from their mission setup.',
  'Completa tu perfil en cuatro pasos; después elige un escenario y confirma el plan antes de abrir el diseño.':
    'Complete your profile in four steps, then choose a scenario and confirm the plan before opening the design.',
  'Compromiso activo': 'Active commitment',
  'Comprueba tus elecciones. Al confirmar, entrarás al diseño de la nave.':
    'Review your choices. Confirming will take you to spacecraft design.',
  'ConOps · Órbita': 'ConOps · Orbit',
  'Configurar misión': 'Set up mission',
  'Confirmación': 'Confirmation',
  'Confirmación · 2/2': 'Confirmation · 2/2',
  'Confirmar y abrir diseño': 'Confirm and open design',
  'Confirmar y crear sala': 'Confirm and create room',
  'Confirmar y unirme': 'Confirm and join',
  'Consejo de diseño': 'Design advice',
  'Consola asignada a tu rol en esta partida cooperativa.':
    'Console assigned to your role in this co-op game.',
  'Consola científica': 'Science console',
  'Consola de comunicaciones': 'Communications console',
  'Consola de propulsión': 'Propulsion console',
  'Consola de vuelo': 'Flight console',
  'Consumo eléctrico superior a la generación disponible':
    'Power consumption exceeds available generation.',
  'Contacto con la estación terrestre.': 'Contact with the ground station.',
  'Controles técnicos': 'Technical controls',
  'Cooperativo en tiempo real': 'Real-time co-op',
  'Copiar': 'Copy',
  'Crear una sala': 'Create a room',
  'Crearás una sala nueva para invitar a tu tripulación.':
    'You will create a new room and invite your crew.',
  'Crisis controlada: la nave vuelve a estar estable.':
    'Crisis controlled: the spacecraft is stable again.',
  'Cubre los cuatro segmentos con apoyo automático y decide a tu ritmo.':
    'Cover all four segments with automatic support and make decisions at your own pace.',
  'Código de sala': 'Room code',
  'Código de sala copiado al portapapeles.': 'Room code copied to clipboard.',
  'Código fuente': 'Source code',
  'Datos generados por los sensores activos.': 'Data generated by active sensors.',
  'Datos recuperables': 'Recoverable data',
  'Datos recuperados': 'Data recovered',
  'Datos recuperados por debajo del objetivo': 'Data recovery below target',
  'Dawn exploró Vesta y Ceres; su misión inspira los escenarios de espacio profundo.':
    'Dawn explored Vesta and Ceres; its mission inspires the deep-space scenarios.',
  'Decisiones del Director': 'Director decisions',
  'Decisiones del equipo': 'Team decisions',
  'Decisión de crisis': 'Crisis decision',
  'Decisión ejecutiva disponible': 'Executive decision available',
  'Decisión ejecutiva disponible en tu consola.': 'Executive decision available at your console.',
  'Deficit de energía': 'Power deficit',
  'Define la misión': 'Define the mission',
  'Del objetivo científico al informe de auditoría': 'From science objective to audit report',
  'Demasiados aparatos pueden sobrecargar un sistema aislado, como una casa sin conexión eléctrica.':
    'Too many devices can overload an isolated system, like a house without a power connection.',
  'Desfase alto': 'High deviation',
  'Desfase moderado': 'Moderate deviation',
  'Diseña la nave': 'Design the spacecraft',
  'Diseña, Simula y Despega tu Misión Espacial en': 'Design, simulate, and launch your space mission in',
  'Diseño crítico': 'Critical design',
  'Diseño en equilibrio': 'Balanced design',
  'Disponible': 'Available',
  'Disponible solo en solitario': 'Available in solo mode only',
  'Duplica la capacidad de descarga para futuras campañas, con +55 kg y 38 M$.':
    'Doubles downlink capacity for future campaigns, at +55 kg and $38M.',
  'Duración simulada': 'Simulated duration',
  'ESTACIÓN TERRESTRE': 'GROUND STATION',
  'Ejecutar': 'Execute',
  'El acertijo estará disponible cuando se active un incidente.':
    'The puzzle will be available when an incident is triggered.',
  'El acertijo solo puede resolverlo el rol asignado.':
    'Only the assigned role can solve this puzzle.',
  'El anfitrión debe elegir la próxima misión para esta sala.':
    'The host must choose the next mission for this room.',
  'El ascenso somete a la estructura a cargas elevadas; conserva margen de masa.':
    'Ascent places high loads on the structure; keep a mass margin.',
  'El costo de los sensores': 'The cost of sensors',
  'El código de sala aparecerá en el lobby para que lo compartas.':
    'The room code will appear in the lobby for you to share.',
  'El código de sala debe tener al menos 4 caracteres.':
    'The room code must be at least 4 characters long.',
  'El diseño conserva advertencias de margen. Puedes lanzar, pero el resultado puede verse afectado.':
    'The design still has margin warnings. You may launch, but the outcome could be affected.',
  'El diseño no incluye instrumentos científicos activos.':
    'The design has no active science instruments.',
  'El diseño supera un límite operativo duro y no puede validarse para lanzamiento.':
    'The design exceeds a hard operating limit and cannot be cleared for launch.',
  'El escenario seleccionado ya no está disponible. Elige otra misión antes de continuar.':
    'The selected scenario is no longer available. Choose another mission to continue.',
  'El experimento no está activo o ya fue sacrificado.':
    'The experiment is inactive or has already been sacrificed.',
  'El host iniciará el diseño cuando el equipo esté completo.':
    'The host will start the design once the team is complete.',
  'El incidente activo ya está resuelto.': 'The active incident is already resolved.',
  'El lanzador tiene un límite de masa; superar ese margen compromete el ascenso.':
    'The launch vehicle has a mass limit; exceeding it compromises ascent.',
  'El límite físico': 'The physical limit',
  'El modo equipo necesita conexión con el centro de control. Reintenta la conexión o juega en solitario.':
    'Team mode requires a connection to mission control. Reconnect or play solo.',
  'El presupuesto restante es menor que cero.': 'The remaining budget is below zero.',
  'El sensor indicado no está instalado en esta nave.':
    'The specified sensor is not installed on this spacecraft.',
  'El éxito no está en instalar más instrumentos, sino en cerrar masa, energía y datos sin sacrificar el objetivo científico.':
    'Success is not about installing more instruments; it is about balancing mass, power, and data without sacrificing the science objective.',
  'Elegir la próxima misión': 'Choose the next mission',
  'Elegir misión': 'Choose mission',
  'Elige el objetivo': 'Choose the objective',
  'Elige una misión para ver aquí su historia, objetivos y requisitos.':
    'Choose a mission to see its story, objectives, and requirements here.',
  'Elige órbita, presupuesto y objetivo científico. Cada escenario cambia las restricciones.':
    'Choose an orbit, budget, and science objective. Each scenario changes the constraints.',
  'Empuje estable. Monitorea combustible, temperatura e integridad.':
    'Thrust is stable. Monitor fuel, temperature, and integrity.',
  'En contra': 'Against',
  'En contra ·': 'Against ·',
  'En cooperativo cada operador mantiene su segmento asignado.':
    'In co-op mode, each operator keeps their assigned segment.',
  'En espera': 'Standby',
  'En solitario': 'Solo',
  'En órbita · Asistencia activa': 'In orbit · Guidance active',
  'Energía consumida': 'Power consumed',
  'Energía en umbral': 'Power at threshold',
  'Energía y comunicaciones': 'Power and communications',
  'Energía y enlace': 'Power and communications link',
  'Energía, enlace de datos y ventanas con estaciones terrestres.':
    'Power, data links, and ground-station contact windows.',
  'Enlace abierto': 'Link open',
  'Enlace con el centro de control restablecido.': 'Link to mission control restored.',
  'Enlace de alta velocidad para descarga de datos científicos.':
    'High-speed link for science data downlink.',
  'Enlace de datos': 'Data link',
  'Enlace en espera': 'Link on standby',
  'Enlace estable': 'Stable link',
  'Enlace sobrecargado': 'Link overloaded',
  'Enlace subutilizado': 'Link underused',
  'Equilibra masa, coste y objetivos científicos': 'Balance mass, cost, and science objectives',
  'Equilibrar costes, masa y objetivos científicos.': 'Balance cost, mass, and science objectives.',
  'Equilibrar costes, masa y objetivos científicos; vota las propuestas del equipo.':
    'Balance cost, mass, and science objectives; vote on team proposals.',
  'Equipado': 'Equipped',
  'Equipados': 'Equipped',
  'Equipo · 1–4 personas': 'Team · 1–4 people',
  'Esa estación pertenece a otro segmento. En cooperativo cada operador ve solo su consola.':
    'That station belongs to another segment. In co-op mode, each operator sees only their own console.',
  'Escenario': 'Scenario',
  'Escenario didáctico': 'Educational scenario',
  'Escenario seleccionado': 'Selected scenario',
  'Escribe el nombre del comandante para registrar la misión.':
    'Enter the commander’s name to register the mission.',
  'Escribe tu nombre antes de unirte a una sala.':
    'Enter your name before joining a room.',
  'Escuchar diálogo': 'Listen to dialog',
  'Ese módulo pertenece a otro segmento: solo su responsable puede proponerlo.':
    'That module belongs to another segment; only its owner can propose it.',
  'Espacio profundo': 'Deep space',
  'Esperando a que el resto de operadores seleccione su segmento…':
    'Waiting for the other operators to select their segments…',
  'Esperando la telemetría del diseño para calcular los márgenes.':
    'Waiting for design telemetry to calculate margins.',
  'Estableciendo enlace de vuelo': 'Establishing flight link',
  'Estadísticas': 'Statistics',
  'Este catálogo pertenece a': 'This catalog belongs to',
  'Estructura y propulsión': 'Structure and propulsion',
  'Estructura, masa, combustible e integridad de la nave.':
    'Spacecraft structure, mass, fuel, and integrity.',
  'Estrés en Max-Q': 'Max-Q stress',
  'Estrés estructural en Max-Q': 'Structural stress at Max-Q',
  'Eventos que amenazan la misión.': 'Events that threaten the mission.',
  'Experimentos activos': 'Active experiments',
  'FLUJO DE MISIÓN': 'MISSION FLOW',
  'Faltan segmentos por asignar antes de abrir el diseño.':
    'Segments must be assigned before opening the design room.',
  'Fase crítica · acción requerida': 'Critical phase · action required',
  'Ficha oficial': 'Official mission page',
  'Garantiza energía, estructura y vida útil de la plataforma.':
    'Ensure the platform has enough power, structural integrity, and service life.',
  'Generación menos consumo eléctrico.': 'Power generation minus consumption.',
  'Generar suficiente energía y ancho de banda de descarga.':
    'Generate enough power and downlink bandwidth.',
  'Generar suficiente energía y capacidad de bajada de datos.':
    'Generate enough power and data downlink capacity.',
  'Hay una votación en curso: resuélvela antes de proponer otro módulo.':
    'A vote is in progress. Resolve it before proposing another module.',
  'Identifica el subsistema afectado y sigue el procedimiento de la consola asignada.':
    'Identify the affected subsystem and follow the procedure on your assigned console.',
  'Ignición · Ascenso · Inserción orbital': 'Ignition · Ascent · Orbital insertion',
  'Iluminación solar constante y cobertura polar para observación climática.':
    'Continuous sunlight and polar coverage for climate observation.',
  'Imagen:': 'Image:',
  'Incidente': 'Incident',
  'Incidentes aleatorios (': 'Random incidents (',
  'Incidentes en vuelo': 'In-flight incidents',
  'Incidentes resueltos': 'Incidents resolved',
  'Informe de auditoría post-misión listo.': 'Post-mission audit report ready.',
  'Informe no disponible': 'Report unavailable',
  'Ingeniería real': 'Real-world engineering',
  'Ingresa el código que te compartieron.': 'Enter the code you were given.',
  'Inicio': 'Home',
  'Instrumentos científicos': 'Science instruments',
  'Instrumentos que siguen aportando ciencia.': 'Instruments still contributing science.',
  'Instrumentos y energía': 'Instruments and power',
  'Instrumentos, calibración y puntos científicos.':
    'Instruments, calibration, and science points.',
  'La Mesa de Diseño se activa en fase DESIGN.': 'The Design Room is available during the DESIGN phase.',
  'La acción del sensor requiere un valor enabled booleano.':
    'The sensor action requires an enabled boolean value.',
  'La asistencia orbital marca el siguiente paso y sugiere maniobras seguras. Aun así, las decisiones finales son del equipo.':
    'Orbital guidance highlights the next step and suggests safe maneuvers. The team still makes the final decisions.',
  'La auditoría de diseño todavía no está disponible. Espera la sincronización antes de lanzar.':
    'The design audit is not ready yet. Wait for synchronization before launch.',
  'La auditoría todavía no está disponible.': 'The audit is not available yet.',
  'La bahía científica tiene tres ranuras y cada instrumento consume masa y energía.':
    'The science bay has three slots, and each instrument uses mass and power.',
  'La batería no genera energía: compra tiempo durante el eclipse y mejora la vida útil.':
    'The battery does not generate power: it buys time during an eclipse and extends service life.',
  'La capacidad de bajada puede ser insuficiente para recuperar los datos.':
    'Downlink capacity may be insufficient to recover the data.',
  'La decisión ejecutiva estará disponible cuando se active un incidente.':
    'An executive decision will be available when an incident is triggered.',
  'La decisión ejecutiva solicitada no es válida.': 'The requested executive decision is invalid.',
  'La energía está en déficit; se prevé una caída de tensión en el Acto 2.':
    'Power is in deficit; a voltage drop is expected in Act 2.',
  'La estación terrestre volverá a estar visible en el próximo contacto.':
    'The ground station will be visible again during the next contact window.',
  'La generación extra se mide contra el consumo continuo, no contra el pico de los instrumentos.':
    'Extra generation is measured against continuous consumption, not the instruments’ peak load.',
  'La masa supera el límite absoluto del lanzador.':
    'The spacecraft mass exceeds the launch vehicle’s absolute limit.',
  'La masa y el combustible están conectados: cada decisión afecta cuánto puede transportar y acelerar el cohete.':
    'Mass and fuel are connected: every decision affects how much the rocket can carry and accelerate.',
  'La misión cumplió los objetivos científicos y de recuperación de datos.':
    'The mission met its science and data recovery objectives.',
  'La misión no alcanzó los objetivos mínimos. El informe identifica las causas raíz y cómo corregirlas.':
    'The mission did not meet its minimum objectives. The report identifies the root causes and how to address them.',
  'La misión regresó con datos útiles, pero algunos objetivos científicos o de enlace quedaron incompletos.':
    'The mission returned useful data, but some science or communications objectives were incomplete.',
  'La nave completó las maniobras principales y estableció un enlace estable con la estación terrestre.':
    'The spacecraft completed its main maneuvers and established a stable link with the ground station.',
  'La nave está en la rampa. Recibirás la telemetría de tu segmento en cuanto el centro de control inicie la secuencia.':
    'The spacecraft is on the launch pad. You will receive your segment’s telemetry when mission control starts the sequence.',
  'La propuesta excede el presupuesto de la misión.':
    'The proposal exceeds the mission budget.',
  'La propuesta supera el límite de 3 espacios de bahía científica.':
    'The proposal exceeds the three-slot science bay limit.',
  'La regla de oro': 'The golden rule',
  'La relación entre empuje y peso determina si el cohete puede despegar.':
    'The thrust-to-weight ratio determines whether the rocket can lift off.',
  'La respuesta del acertijo no es correcta.': 'That is not the correct puzzle answer.',
  'La sala se abrirá primero para que la tripulación se reúna y asigne sus segmentos.':
    'The room will open first so the crew can meet and assign their segments.',
  'La sala y su código se conservarán. La tripulación volverá junta al lobby.':
    'The room and its code will be kept. The crew will return to the lobby together.',
  'La simulación no generó un informe. Vuelve al inicio y repite la misión.':
    'The simulation did not generate a report. Return home and replay the mission.',
  'Lanzador ligero; ideal para SSO de hasta 2,3 t.':
    'Light launch vehicle; ideal for SSO payloads up to 2.3 t.',
  'Lanzador no apto para órbita lunar': 'Launch vehicle is not suitable for lunar orbit',
  'Lanzar con alertas': 'Launch with warnings',
  'Las estructuras reforzadas lo reducen; acercarse al límite de masa lo aumenta.':
    'Reinforced structures reduce it; approaching the mass limit increases it.',
  'Las referencias históricas ayudan a poner en contexto la masa del vehículo.':
    'Historical references help put vehicle mass into context.',
  'Lección de ingeniería': 'Engineering lesson',
  'Libera 240 kg y 55 M$; sacrifica 40 pts científicos.':
    'Frees 240 kg and $55M; sacrifices 40 science points.',
  'Los escenarios conectan los retos del juego con decisiones de misiones reales.':
    'The scenarios connect game challenges to real mission decisions.',
  'Los incidentes sin resolver reducen el resultado': 'Unresolved incidents lower the score',
  'Los puntos científicos proyectados están por debajo del objetivo de la misión.':
    'Projected science points are below the mission target.',
  'Mantener la masa y el riesgo dentro de los límites del lanzador.':
    'Keep mass and risk within the launch vehicle’s limits.',
  'Mantén la generación por encima del consumo para evitar una caída de tensión.':
    'Keep generation above consumption to prevent a voltage drop.',
  'Manual de supervivencia': 'Survival manual',
  'Manual de vuelo': 'Flight manual',
  'Margen amplio de error': 'Generous error margin',
  'Margen de propelente para maniobras.': 'Propellant margin for maneuvers.',
  'Masa en límite': 'Mass at limit',
  'Masa máx.': 'Max. mass',
  'Masa máxima': 'Maximum mass',
  'Masa máxima y empuje': 'Maximum mass and thrust',
  'Masa sobre límite': 'Mass over limit',
  'Masa y empuje': 'Mass and thrust',
  'Maximiza los puntos científicos sin romper el enlace de datos.':
    'Maximize science points without breaking the data link.',
  'Mayor probabilidad de anomalías en vuelo': 'Higher chance of in-flight anomalies',
  'Mayor resolución, pero eclipses frecuentes y más arrastre atmosférico.':
    'Higher resolution, but with frequent eclipses and more atmospheric drag.',
  'Mayor riesgo de anomalías': 'Higher anomaly risk',
  'Menos margen operativo': 'Less operating margin',
  'Mesa de debate': 'Debate room',
  'Mide gases de efecto invernadero y temperatura superficial.':
    'Measures greenhouse gases and surface temperature.',
  'Mini-tutorial y alertas guiadas': 'Mini-tutorial and guided alerts',
  'Minijuegos orbitales': 'Orbital mini-games',
  'Minijuegos orbitales asistidos': 'Assisted orbital mini-games',
  'Misiones NASA': 'NASA missions',
  'Misiones inspiradas en NASA': 'NASA-inspired missions',
  'Misión': 'Mission',
  'Misión Completada': 'Mission completed',
  'Misión Fallida': 'Mission failed',
  'Misión OrbitaLab': 'OrbitaLab mission',
  'Misión Parcial': 'Partial mission',
  'Misión completada parcialmente': 'Mission partially completed',
  'Misión espacial': 'Space mission',
  'Misión no completada': 'Mission not completed',
  'Misión sin designar': 'Unassigned mission',
  'Modo': 'Mode',
  'Modo Aprendiz': 'Apprentice mode',
  'Modo Aprendiz · Asistido': 'Apprentice mode · Guided',
  'Modo Ingeniero': 'Engineer mode',
  'Modo Ingeniero · Manual': 'Engineer mode · Manual',
  'Modo equipo': 'Team mode',
  'Modo local: la partida se juega en este navegador con los catálogos de /data.':
    'Local mode: the game runs in this browser using the catalogs in /data.',
  'Modo solitario': 'Solo mode',
  'Monta módulos EST, SCI y COM sobre el plano y observa las seis barras de telemetría.':
    'Place EST, SCI, and COM modules on the blueprint and monitor six telemetry bars.',
  'Mostrar briefing': 'Show briefing',
  'Mostrar briefing de misión': 'Show mission briefing',
  'Más peso exige más empuje, igual que saltar llevando una mochila pesada.':
    'More weight requires more thrust, just like jumping with a heavy backpack.',
  'Nadie todavía': 'No one yet',
  'Negocia en equipo': 'Negotiate as a team',
  'Ninguno': 'None',
  'No hay avería asignada a tu segmento en este acto. Vigila la telemetría.':
    'No fault is assigned to your segment in this act. Watch the telemetry.',
  'No hay instrumentos científicos instalados en esta nave.':
    'No science instruments are installed on this spacecraft.',
  'No hay misiones disponibles en este momento.': 'No missions are available right now.',
  'No hay propuestas pendientes. Cuando alguien proponga un módulo, la votación aparecerá aquí.':
    'There are no pending proposals. A vote will appear here when someone proposes a module.',
  'No hay un acertijo de crisis activo.': 'There is no active crisis puzzle.',
  'No hay un incidente activo para resolver.': 'There is no active incident to resolve.',
  'No hay una sala cooperativa activa para preparar otra misión.':
    'There is no active co-op room to prepare another mission.',
  'No quedan experimentos activos que sacrificar.':
    'There are no active experiments left to sacrifice.',
  'No se pudieron leer los diálogos ya vistos de AlvaBot:':
    'Could not read the AlvaBot dialogs already viewed:',
  'No se pudo consultar la bienvenida de AlvaBot:':
    'Could not check whether the AlvaBot welcome was shown:',
  'No se pudo guardar el diálogo visto de AlvaBot:':
    'Could not save the AlvaBot dialog status:',
  'No se pudo guardar la preferencia de sonido:': 'Could not save the sound preference:',
  'No se pudo iniciar el audio:': 'Could not start audio:',
  'No se pudo leer el volumen configurado:': 'Could not read the configured volume:',
  'No se pudo leer la preferencia de sonido:': 'Could not read the sound preference:',
  'No se pudo reactivar el audio:': 'Could not resume audio:',
  'No se pudo reproducir este diálogo de AlvaBot.':
    'Could not play this AlvaBot dialog.',
  'No se pudo reproducir la secuencia de alerta:':
    'Could not play the alert sequence:',
  'No se pueden proponer módulos que superen el presupuesto de la misión.':
    'Modules that exceed the mission budget cannot be proposed.',
  'No se registraron causas raíz para esta misión.':
    'No root causes were recorded for this mission.',
  'Nombre del comandante': 'Commander name',
  'Nueva misión': 'New mission',
  'Nuevo despliegue': 'New deployment',
  'Objetivo ciencia': 'Science objective',
  'Objetivo científico': 'Science objective',
  'Objetivo científico incompleto': 'Science objective incomplete',
  'Objetivo científico insuficiente': 'Insufficient science',
  'Objetivo lunar': 'Lunar objective',
  'Objetivos principales alcanzados': 'Primary objectives achieved',
  'Objetivos y operaciones': 'Objectives and operations',
  'Observación climática LEO': 'LEO climate observation',
  'Ocultar briefing': 'Hide briefing',
  'Ocultar briefing de misión': 'Hide mission briefing',
  'Operaciones científicas': 'Science operations',
  'Operaciones finales': 'Final operations',
  'Operación': 'Operation',
  'Operadores conectados': 'Connected operators',
  'OrbitaLab convierte el ciclo de vida de una misión NASA en un juego de decisiones: blueprint modular, votación de recursos, vuelo asimétrico en tres actos y auditoría final comparada con misiones reales.':
    'OrbitaLab turns the lifecycle of a NASA mission into a decision-making game: modular blueprint, resource voting, three-act asymmetric flight, and a final audit compared with real missions.',
  'OrbitaLab · Pacha Team. Los costos, masas, potencias y trayectorias son valores didácticos de balance del juego; no son especificaciones ni efemérides oficiales de NASA.':
    'OrbitaLab · Pacha Team. Costs, masses, power levels, and trajectories are educational game-balancing values; they are not official NASA specifications or ephemerides.',
  'PACE monitoriza océanos y atmósfera con un bus moderado y un enlace de altas prestaciones.':
    'PACE monitors oceans and the atmosphere with moderate bus requirements and a high-performance data link.',
  'PUNCH estudia el viento solar con una constelación de satélites pequeños.':
    'PUNCH studies the solar wind using a constellation of small satellites.',
  'Para unirte a una sala necesitas conexión con el centro de control.':
    'You need a connection to mission control to join a room.',
  'Parte': 'Part',
  'Pendiente': 'Pending',
  'Por encima del 90 % hay estrés estructural; por encima del 100 % no se puede lanzar.':
    'Above 90%, structural stress rises; above 100%, launch is not allowed.',
  'Prepara tu misión espacial': 'Prepare your space mission',
  'Preparando misión…': 'Preparing mission…',
  'Presupuesto': 'Budget',
  'Presupuesto casi agotado': 'Budget nearly depleted',
  'Presupuesto excedido': 'Budget exceeded',
  'Presupuesto y decisiones': 'Budget and decisions',
  'Presupuesto, objetivos científicos y decisiones ejecutivas.':
    'Budget, science objectives, and executive decisions.',
  'Presupuestos ajustados y menos margen': 'Tighter budgets and less margin',
  'Principiante / Juvenil': 'Beginner / Youth',
  'Proponer al equipo': 'Propose to team',
  'Proponer retirada': 'Propose removal',
  'Propulsión': 'Propulsion',
  'Propulsión [EST]': 'Propulsion [EST]',
  'Propón, vota y asume los tradeoffs de masa, energía, datos y riesgo estructural.':
    'Propose, vote, and manage trade-offs in mass, power, data, and structural risk.',
  'Protege el presupuesto y libera masa o coste cuando hace falta.':
    'Protect the budget and reduce mass or cost when needed.',
  'Protege estructura, combustible e integridad': 'Protect structure, fuel, and integrity',
  'Protocolo general': 'General protocol',
  'Puedes resolver la misión por tu cuenta o cooperar con otros operadores.':
    'You can complete the mission on your own or work with other operators.',
  'Puedes sacrificar un experimento para estabilizar la nave. Perderás sus puntos científicos, pero la crisis quedará resuelta.':
    'You can sacrifice an experiment to stabilize the spacecraft. You will lose its science points, but the crisis will be resolved.',
  'Puedes sacrificar un experimento para salvar la nave.':
    'You can sacrifice an experiment to save the spacecraft.',
  'Puntos científicos en juego.': 'Science points at stake.',
  'Puntos científicos proyectados': 'Projected science points',
  'Puntos proyectados frente al objetivo.': 'Projected points versus the target.',
  'Puntuación final': 'Final score',
  'Quitar del diseño': 'Remove from design',
  'REGISTRO DE MISIÓN': 'MISSION REGISTRATION',
  'ROL ACTIVO': 'ACTIVE ROLE',
  'Rango': 'Rank',
  'Ranuras científicas completas': 'Science slots full',
  'Ranuras y recursos': 'Slots and resources',
  'Rechazar': 'Reject',
  'Recomendaciones': 'Recommendations',
  'Recomendaciones de margen en cada decisión': 'Margin recommendations at every decision',
  'Referencia NASA': 'NASA reference',
  'Referencia NASA ·': 'NASA reference ·',
  'Refuerza el margen en eclipse y eleva la vida útil por encima de 3,8 años.':
    'Improves eclipse margins and extends service life beyond 3.8 years.',
  'Registro de misión': 'Mission registration',
  'Relación empuje-peso': 'Thrust-to-weight ratio',
  'Repetir misión': 'Replay mission',
  'Requiere': 'Requires',
  'Reserva energía para eclipses y picos de carga.':
    'Reserve power for eclipses and peak loads.',
  'Resistencia estructural restante.': 'Remaining structural strength.',
  'Resuelto': 'Resolved',
  'Resuelve crisis asimétricas en tres actos y recibe un informe comparado con NASA.':
    'Resolve asymmetric crises across three acts and receive a report compared with NASA.',
  'Resultados de la Misión': 'Mission results',
  'Revisa tu plan': 'Review your plan',
  'Revisar la selección de instrumentos y sus dependencias antes del lanzamiento.':
    'Review instrument selection and dependencies before launch.',
  'Revisar y confirmar': 'Review and confirm',
  'Riesgo estructural': 'Structural risk',
  'Ruta didáctica de la órbita.': 'Educational orbital path.',
  'Sacrificar': 'Sacrifice',
  'Sacrificar y resolver': 'Sacrifice and resolve',
  'Sala': 'Room',
  'Sala de espera': 'Waiting room',
  'Salir': 'Leave',
  'Saturn V y SLS': 'Saturn V and SLS',
  'Se perdió el enlace con el centro de control y la sala se cerró. Registra la misión de nuevo.':
    'The link to mission control was lost and the room closed. Register the mission again.',
  'Se perdió el enlace con el centro de control.': 'The link to mission control was lost.',
  'Secuencia de lanzamiento': 'Launch sequence',
  'Segmento asignado': 'Assigned segment',
  'Segmento libre': 'Available segment',
  'Segmento sin asignar': 'Unassigned segment',
  'Seguimiento Orbital': 'Orbital tracking',
  'Selecciona un rol en el lobby para ver tu objetivo.':
    'Select a role in the lobby to view your objective.',
  'Selecciona una misión disponible.': 'Select an available mission.',
  'Sensores activos': 'Active sensors',
  'Sensores en operación': 'Sensors operating',
  'Sensores, muestras y datos': 'Sensors, samples, and data',
  'Serás anfitrión y podrás compartir el código.':
    'You will be the host and can share the room code.',
  'Sesión en solitario: puedes cambiar de segmento para cubrir todas las tareas de la misión.':
    'Solo session: you can switch segments to cover every mission task.',
  'Sesión local': 'Local session',
  'Severidad': 'Severity',
  'Si el combustible se agota antes de tiempo, protege la nave y prioriza el retorno.':
    'If fuel runs out early, protect the spacecraft and prioritize the return.',
  'Si el consumo supera la generación habrá una caída de tensión en pleno vuelo.':
    'If consumption exceeds generation, a voltage drop will occur in flight.',
  'Si sube demasiado, reduce la carga térmica.': 'If it rises too high, reduce the thermal load.',
  'Siguiente': 'Next',
  'Simular Lanzamiento': 'Simulate launch',
  'Sin alertas activas.': 'No active alerts.',
  'Sin amenazas activas.': 'No active threats.',
  'Sin asistencia: interpreta la telemetría, ajusta los controles y documenta cada maniobra. El margen de error es menor.':
    'No assistance: interpret telemetry, adjust controls, and document each maneuver. The margin for error is smaller.',
  'Sin carga útil científica': 'No science payload',
  'Sin centro de control: la misión se simula en este navegador.':
    'No mission control: the mission is simulated in this browser.',
  'Sin conexión · modo local': 'Offline · local mode',
  'Sin decisiones ejecutivas pendientes. Supervisa el objetivo científico del equipo.':
    'No pending executive decisions. Monitor the team’s science objective.',
  'Sin nombre': 'No name',
  'Sin objetivo científico definido': 'No science objective defined',
  'Sin pendientes': 'Nothing pending',
  'Sincronización estable': 'Stable synchronization',
  'Sincronizando telemetría': 'Synchronizing telemetry',
  'Sobrecarga eléctrica': 'Electrical overload',
  'Solitario: cambia de consola para resolver todas las tareas.':
    'Solo mode: switch consoles to handle every task.',
  'Solo el Director de Misión puede tomar decisiones ejecutivas.':
    'Only the Mission Director can make executive decisions.',
  'Solo el anfitrión puede elegir la próxima misión.':
    'Only the host can choose the next mission.',
  'Solo el host puede abrir la mesa. Mantén esta pestaña abierta.':
    'Only the host can open the design room. Keep this tab open.',
  'Solo el rol de Ciencia puede cambiar el estado de los sensores.':
    'Only the Science role can change sensor status.',
  'Solo o en equipo': 'Solo or team',
  'Su gran ventaja es observar de noche y bajo nubes; su precio es masa y consumo continuo.':
    'Its key advantage is observing at night and through clouds; the trade-off is mass and continuous power use.',
  'Suma instrumentos hasta alcanzar los puntos que pide la misión.':
    'Add instruments until you reach the mission’s science-point target.',
  'Tarea crítica asignada a tu consola: resuelve el acertijo.':
    'Critical task assigned to your console: solve the puzzle.',
  'Tasa de datos': 'Data rate',
  'Telemetría': 'Telemetry',
  'Telemetría completa y controles manuales': 'Full telemetry and manual controls',
  'Telemetría en vivo': 'Live telemetry',
  'Telemetría manual y presupuesto ajustado.': 'Manual telemetry and a tight budget.',
  'Tiempo Real.': 'Real time.',
  'Tipo de jugador': 'Player type',
  'Todos los incidentes fueron controlados': 'All incidents were controlled',
  'Todos resueltos': 'All resolved',
  'Tripulación en sala de espera': 'Crew in the waiting room',
  'Tripulación y segmentos': 'Crew and segments',
  'Tu ayudante de misión': 'Your mission assistant',
  'Tu identificación': 'Your identification',
  'Tu misión': 'Your mission',
  'Tu segmento': 'Your segment',
  'Tu sesión individual abrirá el diseño de la nave al confirmar.':
    'Your solo session will open spacecraft design when you confirm.',
  'Tu voto está registrado. Se aprueba con': 'Your vote is recorded. Approval requires',
  'Tu área de mando': 'Your area of responsibility',
  'Tutorial de vuelo': 'Flight tutorial',
  'Umbral de misión no disponible': 'Mission threshold unavailable',
  'Un diseño equilibrado conserva capacidad de carga sin comprometer el despegue.':
    'A balanced design preserves payload capacity without compromising liftoff.',
  'Una antena sobredimensionada encarece la misión; infrautilizarla también deja margen sobre la mesa.':
    'An oversized antenna raises mission costs; underusing it also leaves capacity on the table.',
  'Una casa sin red': 'An off-grid home',
  'Unirme a una sala': 'Join a room',
  'Uno o más recursos se aproximan al límite operativo.':
    'One or more resources are approaching their operating limits.',
  'Usaremos este nombre para identificarte en el diseño y en la sala de equipo.':
    'We will use this name to identify you in the design room and team lobby.',
  'VAB · Lanzamiento': 'VAB · Launch',
  'Ventana cerrada': 'Window closed',
  'Ventana de bajada': 'Downlink window',
  'Ventana de bajada abierta': 'Downlink window open',
  'Ventana de bajada y amenazas orbitales': 'Downlink window and orbital threats',
  'Ver cómo funciona': 'See how it works',
  'Ver ficha oficial': 'View official mission page',
  'Vigila el ozono estratosférico y la radiación ultravioleta.':
    'Monitors stratospheric ozone and ultraviolet radiation.',
  'Vigila la integridad': 'Monitor integrity',
  'Vigilar hielo marino, nubes y ozono desde una órbita heliosíncrona.':
    'Monitor sea ice, clouds, and ozone from a sun-synchronous orbit.',
  'Volumen general': 'Master volume',
  'Volver': 'Back',
  'Volver al inicio': 'Return home',
  'Volver al lobby': 'Return to lobby',
  'Vuela y audita': 'Fly and review',
  'Ya elegiste': 'Your selections',
  'Zona crítica': 'Critical zone',
  'añadir': 'add',
  'diseño de misión': 'mission design',
  'piezas': 'modules',
  'propone': 'proposes',
  'pts': 'pts',
  'pts ciencia': 'science pts',
  'ranuras': 'slots',
  'rutas': 'routes',
  'satélite': 'satellite',
  'satélite en órbita': 'satellite in orbit',
  'votos a favor.': 'votes in favor.',
  '¡Misión completada con éxito!': 'Mission completed successfully!',
  '¿Listo para liderar la próxima expedición espacial?':
    'Ready to lead the next space expedition?',
  '¿Qué quieres hacer?': 'What would you like to do?',
  'Órbita': 'Orbit',
  'Órbita Baja 400 km': 'Low orbit 400 km',
  'Órbita Heliosíncrona 650 km': 'Sun-synchronous orbit 650 km',
  'Órbita baja terrestre': 'Low Earth orbit',
  'Órbita compatible': 'Compatible orbit',
  'Órbita fuera de objetivo': 'Orbit outside target',
  'Órbita heliosíncrona': 'Sun-synchronous orbit',
  'Órbita incompatible': 'Incompatible orbit',
  'Órbita lunar': 'Lunar orbit',
  'Órbita parcial': 'Partial orbit',
  'Únete al puente de mando con tu equipo. Diseña tu lanzador, supera las auditorías técnicas del MDL y realiza tu primer despegue con éxito. Cada decisión cuenta: ¿podrás cumplir la misión?':
    'Join the mission control bridge with your team. Design your launch vehicle, pass the MDL technical audits, and complete your first successful launch. Every decision counts: can you complete the mission?',
  '⛶ Full': '⛶ Full screen',
  'Subtítulos en español': 'Spanish subtitles',
  'Director de Misión': 'Mission Director',
  'Ing. de Propulsión y Nave': 'Propulsion and Spacecraft Engineer',
  'Especialista de Ciencia': 'Science Specialist',
  'Ing. de Comunicaciones': 'Communications Engineer',
  'Director': 'Director',
  'Comms': 'Communications',
  'Estructura compacta': 'Compact structure',
  'Estructura reforzada': 'Reinforced structure',
  'Etapa de transferencia': 'Transfer stage',
  'Cámara multiespectral': 'Multispectral camera',
  'Magnetómetro': 'Magnetometer',
  'Espectrómetro': 'Spectrometer',
  'Sismómetro': 'Seismometer',
  'Telescopio infrarrojo': 'Infrared telescope',
  'Panel solar desplegable': 'Deployable solar array',
  'Antena de alta ganancia': 'High-gain antenna',
  'Transmisor de banda profunda': 'Deep-space transmitter',
  'Estación terrestre LEO (modelo de juego)': 'LEO ground station (game model)',
  'Estación terrestre de espacio profundo (modelo de juego)':
    'Deep-space ground station (game model)',
  'Una estructura ligera deja más margen de masa para los instrumentos.':
    'A lightweight structure leaves more mass margin for instruments.',
  'La estructura reforzada reduce el riesgo, pero usa más masa.':
    'The reinforced structure reduces risk, but uses more mass.',
  'Esta etapa ayuda a completar maniobras de transferencia, con consumo y masa adicionales.':
    'This stage helps complete transfer maneuvers, at the cost of additional mass and power.',
  'La cámara obtiene imágenes en varias bandas para comparar regiones.':
    'The camera captures images in multiple bands for regional comparison.',
  'El magnetómetro mide el entorno magnético con bajo consumo de datos.':
    'The magnetometer measures the magnetic environment while generating little data.',
  'El espectrómetro revela la composición de materiales y genera más datos.':
    'The spectrometer reveals material composition and generates more data.',
  'El sismómetro estudia vibraciones y requiere una estructura estable.':
    'The seismometer studies vibrations and requires a stable structure.',
  'El telescopio aporta muchos puntos científicos y ocupa dos espacios.':
    'The telescope earns many science points and uses two slots.',
  'Los paneles generan energía; su potencia aparece como un valor negativo.':
    'Solar arrays generate power; their output is shown as a negative value.',
  'La antena aumenta la capacidad para enviar datos a las estaciones terrestres.':
    'The antenna increases the capacity to send data to ground stations.',
  'El transmisor aumenta la capacidad de bajada en misiones lejanas.':
    'The transmitter increases downlink capacity on distant missions.',
  'Observación de la Tierra': 'Earth observation',
  'Cartografía Lunar': 'Lunar mapping',
  'Exploración del Espacio Profundo': 'Deep-space exploration',
  'Una constelación de pequeños satélites observará el entorno que rodea la Tierra desde una órbita baja. Para convertir mediciones dispersas en una imagen útil, la tripulación tendrá que coordinar sus instrumentos, conservar energía y enviar los datos a tiempo. Este escenario didáctico toma como referencia la coordinación orbital de misiones como PUNCH.':
    'A constellation of small satellites will observe Earth’s surroundings from low orbit. To turn scattered measurements into a useful picture, the crew must coordinate instruments, conserve power, and send data on time. This educational scenario is inspired by the orbital coordination of missions such as PUNCH.',
  'Coordinar observaciones en órbita baja': 'Coordinate observations in low orbit',
  'Alcanzar 45 puntos científicos': 'Earn 45 science points',
  'Descargar al menos el 75% de los datos': 'Downlink at least 75% of the data',
  'Misión de heliofísica que observa el viento solar desde una constelación en órbita terrestre baja.':
    'A heliophysics mission that observes the solar wind from a constellation in low Earth orbit.',
  'Coordinar múltiples plataformas y combinar observaciones para estudiar un fenómeno a gran escala.':
    'Coordinate multiple platforms and combine observations to study a large-scale phenomenon.',
  'Tu sonda cartografiará una región de la Luna para reconocer cráteres, variaciones del terreno y zonas de interés para futuras exploraciones. Cada pasada orbital es una oportunidad limitada: diseña una nave que mida con precisión y mantenga el enlace con la Tierra mientras recorre el objetivo.':
    'Your probe will map a region of the Moon, identifying craters, terrain variations, and areas of interest for future exploration. Each orbital pass is a limited opportunity: design a spacecraft that measures accurately and keeps its link to Earth while surveying the target.',
  'Cartografiar la región lunar durante varias pasadas': 'Map the lunar region over multiple passes',
  'Alcanzar 70 puntos científicos': 'Earn 70 science points',
  'Recuperar al menos el 65% de los datos': 'Recover at least 65% of the data',
  'Orbitador de NASA que caracteriza la Luna y produce datos para ciencia y exploración.':
    'A NASA orbiter that characterizes the Moon and provides data for science and exploration.',
  'El diseño orbital, los instrumentos y las comunicaciones deben responder conjuntamente a los objetivos de la misión.':
    'Orbital design, instruments, and communications must work together to meet mission objectives.',
  'Una nave de largo recorrido viajará hasta cuerpos pequeños del sistema solar para estudiar cómo se formaron. Lejos de la Tierra, cada unidad de energía y cada ventana de comunicación cuentan: prioriza instrumentos, protege la propulsión y decide qué datos vale la pena transmitir.':
    'A long-range spacecraft will travel to small bodies in the solar system to study how they formed. Far from Earth, every unit of power and every communication window matters: prioritize instruments, protect propulsion, and choose which data to transmit.',
  'Planificar una exploración de larga duración': 'Plan a long-duration exploration',
  'Alcanzar 85 puntos científicos': 'Earn 85 science points',
  'Transmitir al menos el 50% de los datos': 'Transmit at least 50% of the data',
  'Misión interplanetaria de NASA que exploró Vesta y Ceres usando propulsión iónica.':
    'A NASA interplanetary mission that explored Vesta and Ceres using ion propulsion.',
  'El uso eficiente de propulsión y energía hace posibles trayectorias prolongadas y objetivos múltiples.':
    'Efficient use of propulsion and power enables long trajectories and multiple targets.',
  'Caída de tensión': 'Voltage drop',
  'Ventana de bajada limitada': 'Limited downlink window',
  'Ajuste de navegación': 'Navigation adjustment',
  'Tormenta de radiación espacial': 'Space radiation storm',
  'Desplazamiento de fluidos y presión ocular': 'Fluid shift and ocular pressure',
  'Desorientación espacial en transición': 'Spatial disorientation during transition',
  'Proliferación microbiana en cabina': 'Microbial growth in the cabin',
  'Contingencia médica con latencia': 'Medical emergency with communication latency',
  'La demanda eléctrica supera la generación disponible durante la fase crítica.':
    'Electrical demand exceeds available generation during the critical phase.',
  'La masa de la nave supera el 90% del límite del lanzador y aumenta el riesgo estructural.':
    'Spacecraft mass exceeds 90% of the launch vehicle limit, increasing structural risk.',
  'La capacidad de enlace puede dejar parte de los datos científicos sin recuperar.':
    'Link capacity may leave some science data unrecovered.',
  'La nave requiere una corrección menor antes de iniciar las operaciones científicas.':
    'The spacecraft needs a small correction before science operations begin.',
  'Los sensores detectan un aumento crítico de rayos cósmicos y partículas solares fuera del campo magnético terrestre.':
    'Sensors detect a critical increase in cosmic rays and solar particles outside Earth’s magnetic field.',
  'La microgravedad desplaza los fluidos hacia la cabeza, provocando presión ocular y dificultad visual para operar consolas.':
    'Microgravity shifts fluids toward the head, causing ocular pressure and visual difficulty when operating consoles.',
  'El cambio entre campos de gravedad afecta el sistema vestibular de la tripulación y reduce la precisión en maniobras.':
    'Changes between gravity fields affect the crew’s vestibular system and reduce maneuvering accuracy.',
  'Los cultivos de monitoreo muestran crecimiento acelerado de microorganismos mientras baja la respuesta inmune de la tripulación.':
    'Monitoring cultures show rapid microorganism growth as the crew’s immune response declines.',
  'El retraso en las comunicaciones con la Tierra impide recibir asistencia médica en tiempo real ante un síntoma agudo.':
    'Communication delays with Earth prevent real-time medical assistance during an acute symptom.',
  'La arquitectura consumía más potencia de la que generaba.':
    'The architecture consumed more power than it generated.',
  'El diseño dejó poco margen de masa para el ascenso.':
    'The design left too little mass margin for ascent.',
  'La capacidad de bajada era baja frente al volumen de datos generado.':
    'Downlink capacity was low compared with the amount of data generated.',
  'No se detectó una debilidad crítica en la telemetría de diseño.':
    'No critical weakness was detected in the design telemetry.',
  'Desactivar temporalmente un instrumento o mejorar el margen de generación antes de otra misión.':
    'Temporarily disable an instrument or improve generation margin before the next mission.',
  'Reducir masa o elegir una configuración con más margen estructural.':
    'Reduce mass or choose a configuration with more structural margin.',
  'Aumentar capacidad de antena o reducir la generación de datos.':
    'Increase antenna capacity or reduce data generation.',
  'Mantener el seguimiento de trayectoria y conservar el margen operativo.':
    'Continue tracking the trajectory and preserve operating margin.',
  'Restaura el bus eléctrico: ingresa RESET-POWER.':
    'Restore the electrical bus: enter RESET-POWER.',
  'Confirma la inspección de la estructura: ingresa STRUCTURE-OK.':
    'Confirm the structural inspection: enter STRUCTURE-OK.',
  'Calibra el enlace científico: ingresa LINK-LOCK.':
    'Calibrate the science link: enter LINK-LOCK.',
  'Confirma el ajuste de navegación: ingresa NAV-OK.':
    'Confirm the navigation adjustment: enter NAV-OK.',
  'Ocurrió un error interno al procesar el evento.':
    'An internal error occurred while processing the event.',
  'No se encontró el escenario solicitado.': 'The requested scenario was not found.',
  'La categoría debe ser EST, SCI o COM.': 'The category must be EST, SCI, or COM.',
  'Los costos, masas, potencias y trayectorias son valores didácticos de balance del juego; no son especificaciones ni efemérides oficiales de NASA.':
    'Costs, masses, power levels, and trajectories are educational game-balancing values; they are not official NASA specifications or ephemerides.',
  '1/4': '1/4',
  'Incidente {number} · {percent}% del vuelo · Severidad {severity}':
    'Incident {number} · {percent}% of flight · Severity {severity}',
  'Perfil {number}/4': 'Profile {number}/4',
  'Misión · 1/2': 'Mission · 1/2',
  'Parte {number} de {total}': 'Part {number} of {total}',
  'Expira en ~{seconds} s': 'Expires in ~{seconds} s',
  'Acto {act}': 'Act {act}',
  'Incidente {number}/{total}': 'Incident {number}/{total}',
  'Rango {rank}': 'Rank {rank}',
  'Te unirás a la sala {room}.': 'You will join room {room}.',
  'Consola de {role}': '{role} console',
  'Ver consola de {role}': 'View {role} console',
  'Quitar {module}': 'Remove {module}',
  'Requiere {module} ({id}).': 'Requires {module} ({id}).',
  'Solo {role} puede proponerlo.': 'Only {role} can propose it.',
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readLanguage(): Language {
  try {
    return window.localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'es';
  } catch (error) {
    console.warn('Could not read the language preference:', error);
    return 'es';
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(readLanguage);
  const value = useMemo(() => ({ language, setLanguage }), [language]);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      window.localStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.warn('Could not save the language preference:', error);
    }
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within I18nProvider.');
  return context;
}

export function translateText(text: string, language: Language): string {
  if (language === 'es') return text;
  const trimmed = text.trim();
  const direct = ENGLISH[trimmed];
  if (direct) return text.replace(trimmed, direct);

  const patterns: Array<[RegExp, string]> = [
    [/^Perfil (\d+)\/4$/, 'Profile $1/4'],
    [/^Misión · 1\/2$/, 'Mission · 1/2'],
    [/^Confirmación · 2\/2$/, 'Confirmation · 2/2'],
    [/^Parte (\d+) de (\d+)$/, 'Part $1 of $2'],
    [/^Expira en ~(\d+) s$/, 'Expires in ~$1 s'],
    [/^Acto (.+)$/, 'Act $1'],
    [/^Severidad (.+)$/, 'Severity $1'],
    [/^Incidente (\d+)\/(\d+)$/, 'Incident $1/$2'],
    [/^Rango (.+)$/, 'Rank $1'],
    [/^Te unirás a la sala (.+)\.$/, 'You will join room $1.'],
    [/^Consola de (.+)$/, '$1 console'],
    [/^Ver consola de (.+)$/, 'View $1 console'],
    [/^Quitar (.+)$/, 'Remove $1'],
    [/^Requiere (.+) \((.+)\)\.$/, 'Requires $1 ($2).'],
    [/^Solo (.+) puede proponerlo\.$/, 'Only $1 can propose it.'],
  ];
  for (const [pattern, replacement] of patterns) {
    if (pattern.test(trimmed)) return text.replace(trimmed, trimmed.replace(pattern, replacement));
  }
  return text;
}

function localizeNode(node: unknown, language: Language): unknown {
  if (language === 'es' || node === null || node === undefined || typeof node === 'boolean') {
    return node;
  }
  if (typeof node === 'string') return translateText(node, language);
  if (typeof node === 'number') return node;
  if (Array.isArray(node)) {
    return Children.map(node, (item) => localizeNode(item, language));
  }
  if (isValidElement<Record<string, unknown>>(node)) {
    const subtreeLanguage = node.props.lang === 'es' ? 'es' : language;
    const props = Object.fromEntries(
      Object.entries(node.props).map(([key, value]) => [
        key,
        key === 'children'
          ? localizeNode(value, subtreeLanguage)
          : localizeValue(value, subtreeLanguage),
      ]),
    );
    return cloneElement(node, props);
  }
  return localizeValue(node, language);
}

function localizeValue(value: unknown, language: Language): unknown {
  if (typeof value === 'string') return translateText(value, language);
  if (Array.isArray(value)) return value.map((item) => localizeValue(item, language));
  if (value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, localizeValue(item, language)]),
    );
  }
  return value;
}

export function LocalizedOutput({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  return <>{localizeNode(children, language) as ReactNode}</>;
}

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const nextLanguage = language === 'es' ? 'en' : 'es';
  return (
    <button
      type="button"
      aria-label={language === 'es' ? 'Switch to English' : 'Switch to Spanish'}
      title={language === 'es' ? 'Switch to English' : 'Switch to Spanish'}
      onClick={() => setLanguage(nextLanguage)}
      className="fixed right-14 top-3 z-[80] inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-outline bg-surface-container-low/95 px-2 font-mono text-mono-xs text-primary shadow-console backdrop-blur transition-colors hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
    >
      {nextLanguage.toUpperCase()}
    </button>
  );
}
