import type { Activity, ActivityLevel, ActivityStatus, Day } from "@/domain/models";

export const es = {
  app: {
    title: "Electric London · 2026",
    description: "Un compañero editorial para ocho días en Londres.",
  },
  nav: {
    label: "Navegación principal",
    journey: "Días",
    saved: "Guardados",
    trip: "Viaje",
  },
  journey: {
    label: "Días del viaje a Londres",
    masthead: "Ocho días\nUna ciudad eléctrica",
    previous: "Día anterior",
    next: "Día siguiente",
    controls: "Controles del carrusel de días",
    coverAria: (day: string, number: string, title: string) => `${day} ${number} de agosto: ${title}`,
    anchors: (count: number) => `${count} ${count === 1 ? "plan confirmado" : "planes confirmados"}`,
    open: "Por definir",
    day: "Día",
    month: "AGO · 26",
    currentAnnouncement: (day: string, number: string) => `${day} ${number} de agosto seleccionado`,
  },
  coverTitles: {
    "2026-08-06": "Primera tarde en Londres. De Gatwick a Ealing. Londres al anochecer.",
    "2026-08-07": "La City desde las alturas. Canary Wharf al anochecer.",
    "2026-08-08": "Notting Hill a todo color",
    "2026-08-09": "El centro de Londres se vuelve verde",
    "2026-08-10": "De Camden a Whitechapel",
    "2026-08-11": "Londres todavía por escribir",
    "2026-08-12": "Construye este día en Londres",
    "2026-08-13": "Londres → Sevilla",
  } as Record<string, string>,
  coverNotes: {
    "orange-night": "Luces / trayecto / primer paseo",
    "pink-orange": "Notting Hill / museo",
    "violet-lime": "Centro / Wicked",
    "orange-black": "Camden / Whitechapel",
    "blue-pink": "Elige el ritmo",
    "illustrated-open-day": "Una página abierta",
    "sky-white": "Regreso a casa",
  } as Record<string, string>,
  weekdays: {
    Thursday: "jueves",
    Friday: "viernes",
    Saturday: "sábado",
    Sunday: "domingo",
    Monday: "lunes",
    Tuesday: "martes",
    Wednesday: "miércoles",
  } as Record<string, string>,
  status: {
    confirmed: "Confirmado",
    planned: "Plan flexible",
    unplanned: "Por decidir",
    flexible: "Plan flexible",
    saved: "Guardado",
    researching: "Por decidir",
    evaluating: "Por decidir",
    timeVerify: "Hora por confirmar",
  } satisfies Record<ActivityStatus, string> & { timeVerify: string },
  levels: {
    anchor: "Confirmado",
    intention: "Plan flexible",
    "nearby-option": "Opción cercana",
  } satisfies Record<ActivityLevel, string>,
  day: {
    itineraryAria: (day: string, number: string) => `Itinerario del ${day} ${number} de agosto`,
    closeAria: "Cerrar el itinerario y volver a la portada",
    fridayChapter: "Viernes / Día 02",
    chapter: "Londres / Capítulo dos",
    title: "La City desde las alturas.\nCanary Wharf al anochecer.",
    backCover: "Volver a portada",
    intro: "Una ruta con puntos clave y espacio para decidir sobre la marcha.",
    legend: "Claves del itinerario",
    sections: ["Mañana", "Mediodía / tarde", "Noche"] as const,
    moments: (count: number) => `${count} ${count === 1 ? "momento" : "momentos"}`,
    ending: "Deja espacio\npara Londres.",
    closeChapter: "Cerrar este capítulo",
    nearby: "Opciones cercanas",
    assigned: "Añadido desde Guardados",
    remove: "Quitar del día",
    addPlan: "Añadir plan",
    chooseMeal: "Elegir restaurante",
    changeMeal: "Cambiar restaurante",
    removeMeal: "Quitar restaurante",
    editPlan: "Editar plan",
  },
  activity: {
    flexible: "Flexible",
    beforeTour: "Antes del tour por la City",
    details: "Ver detalles",
    maps: "Abrir en Google Maps",
    chooseAround: "Elige según avance el día",
    people: (count: number) => `${count} personas`,
    titles: {
      "Flight Seville to London Gatwick": "Vuelo Sevilla → Londres Gatwick",
      "Transfer to Ealing": "Traslado a Ealing",
      "Hotel check-in": "Entrada al hotel",
      Lunch: "Comida",
      Dinner: "Cena",
      "Canary Wharf": "Canary Wharf",
      "The Hunger Games": "The Hunger Games",
      "Hotel check-out": "Salida del hotel",
      "Transfer to Heathrow": "Traslado a Heathrow",
      "Flight London Heathrow to Seville": "Vuelo Londres Heathrow → Sevilla",
      "One Direction locations": "Localizaciones de One Direction",
      "Unusual London houses": "Casas y lugares inusuales de Londres",
      "Soho at night": "Soho de noche",
      "Day trip outside London": "Excursión fuera de Londres",
    } as Record<string, string>,
    meta: {
      "After landing": "Después de aterrizar",
      "From 14:00": "Desde las 14:00",
      "After the tour": "Después del tour",
      "Around the City tour": "Alrededor del tour por la City",
      Afternoon: "Por la tarde",
      "Before or after the musical": "Antes o después del musical",
      "After arrival in Ealing": "Al llegar a Ealing",
      "After the night tour": "Después del paseo nocturno",
      "Before Wicked": "Antes de Wicked",
      "After Wicked": "Después de Wicked",
      "After the museum": "Después del museo",
      "In Camden": "En Camden",
      Flexible: "Flexible",
    } as Record<string, string>,
    types: {
      travel: "Vuelo",
      transport: "Traslado",
      stay: "Alojamiento",
      tour: "Tour",
      meal: "Comida flexible",
      attraction: "Atracción",
      neighbourhood: "Barrio",
      entertainment: "Espectáculo",
      museum: "Museo",
      excursion: "Excursión",
      food: "Comida",
      culture: "Cultura",
      "theme-route": "Ruta temática",
      "transport-experience": "Experiencia",
    } as Record<string, string>,
  },
  detail: {
    back: "Volver al día",
    backAria: "Volver al itinerario",
    timeVerify: "Duración estimada: una hora",
    about: "Sobre el lugar",
    aboutCopy: "Londres desde las alturas: un jardín interior que envuelve las vistas panorámicas de la City.",
    plan: "Plan",
    planTitle: "Visitar antes\ndel tour por la City.",
    arrive: "Llegada / acceso",
    leave: "Bajar del skyline",
    tour: "Tour por la City",
    location: "Ubicación",
    city: "City de\nLondres",
    booking: "Reserva",
    bookingTitle: "Entrada confirmada a las 08:30.",
    bookingNote: "Plan previsto para dos viajeros. Las referencias privadas permanecen ocultas.",
    nearby: "Cerca,\nsi la ciudad lo permite.",
    savedCount: (count: number) => `${count} guardados`,
    ending: "Una vista.\nDespués, vuelta a la calle.",
    return: "Volver al itinerario",
  },
  saved: {
    kicker: "Londres / Posibilidades",
    title: "Guardados para\ndespués.",
    subtitle: (count: number) => `${count} lugares esperando su momento.`,
    filtersLabel: "Filtrar lugares guardados",
    filters: { all: "Todos", "food-drink": "Comer y beber", "museum-culture": "Cultura", attraction: "Lugares" } as Record<string, string>,
    add: "Añadir a un día",
    assignAria: (name: string) => `Añadir ${name} a un día`,
    assigned: (date: string) => `Añadido al ${date}`,
    empty: "Todavía no hay lugares destacados en este filtro.",
    showAll: "Ver todos",
    addPlace: "Añadir lugar",
    edit: "Editar",
    delete: "Eliminar",
    deleteConfirm: "¿Eliminar este lugar de Guardados?",
    reset: "Restaurar datos iniciales",
    resetConfirm: "¿Restaurar Guardados, planes y asignaciones a su estado inicial?",
    graphicAria: (name: string) => `Composición gráfica para ${name}`,
    categories: {
      "food-drink": "Comer y beber",
      "museum-culture": "Museos y cultura",
      attraction: "Lugar",
      shopping: "Compras",
      neighbourhood: "Barrio",
    } as Record<string, string>,
  },
  assignment: {
    kicker: "Guardados → Días",
    title: "¿En qué día encaja?",
    description: "Se añadirá como opción cercana, sin convertirlo en un plan fijo.",
    close: "Cerrar selector de día",
    daysLabel: "Selecciona un día",
    current: "Día actual",
    remove: "Quitar de este día",
    success: (place: string, date: string) => `${place} se ha añadido al ${date}`,
  },
  forms: {
    addPlace: "Añadir lugar",
    editPlace: "Editar lugar",
    addPlan: "Añadir plan",
    editPlan: "Editar plan",
    chooseSaved: "Elegir de Guardados",
    createPlan: "Crear un plan",
    chooseRestaurant: "Elegir restaurante",
    suggested: "Cerca de este momento",
    allRestaurants: "Ver todos",
    name: "Nombre",
    category: "Categoría",
    area: "Zona",
    note: "Nota",
    maps: "Google Maps",
    tags: "Etiquetas separadas por comas",
    date: "Fecha",
    section: "Bloque",
    time: "Hora opcional",
    status: "Estado",
    save: "Guardar",
    cancel: "Cancelar",
    close: "Cerrar",
    delete: "Eliminar",
    required: "El nombre es obligatorio.",
    saved: "Cambios guardados",
    removed: "Elemento eliminado",
    undo: "Deshacer",
    sections: { morning: "Mañana", afternoon: "Mediodía / tarde", evening: "Noche", anytime: "Cualquier momento" },
  },
  trip: {
    document: "Documento de viaje / 001",
    title: "Londres\n2026",
    days: "días",
    travellers: "viajeros",
    city: "ciudad",
    flights: "Vuelos",
    roundTrip: "Ida y\nvuelta.",
    stay: "Alojamiento",
    area: "Ealing / Oeste de Londres",
    checkIn: "Entrada",
    checkOut: "Salida",
    maps: "Abrir hotel en Google Maps",
    bookings: "Reservas",
    anchors: "planes confirmados\nen ocho días",
    fixed: "Los puntos\nclave.",
    timeOpen: "Hora abierta",
    privacy: "Las referencias privadas y los códigos de confirmación permanecen ocultos.",
    transfers: "Traslados",
    transferTitle: "Llegar y\nvolver.",
    arrival: "Llegada",
    return: "Regreso",
    methodPending: "Método pendiente",
    edit: "Editar traslados",
    save: "Guardar traslados",
    anchorsOpen: "Consultar todos los puntos clave",
    anchorsClose: "Ocultar puntos clave",
  },
} as const;

export const dayEditorial: Record<string, {
  meta: string;
  eyebrow: string;
  intro: string;
  ending: string;
}> = {
  "2026-08-06": { meta: "JUE 06 · CAPÍTULO 01", eyebrow: "Gatwick → Ealing → Londres", intro: "Primer contacto con Londres: aterrizar, llegar a Ealing y salir a descubrir la ciudad cuando se encienden sus luces.", ending: "La llegada ya es parte del viaje." },
  "2026-08-07": { meta: "VIE 07 · CAPÍTULO 02", eyebrow: "Sky Garden → City → Canary Wharf", intro: "Altura, piedra y cristal: la City abre el día y Canary Wharf lo lleva hasta el teatro.", ending: "De la azotea al escenario." },
  "2026-08-08": { meta: "SÁB 08 · CAPÍTULO 03", eyebrow: "Notting Hill → South Kensington", intro: "Color por la mañana y arquitectura victoriana por la tarde, con tiempo para elegir dónde sentarse a comer.", ending: "Fachadas, fósiles y una mesa por encontrar." },
  "2026-08-09": { meta: "DOM 09 · CAPÍTULO 04", eyebrow: "Londres monumental → West End", intro: "El Londres monumental conduce al West End: paseo por la mañana y telón a media tarde.", ending: "La ciudad cambia cuando se enciende el teatro." },
  "2026-08-10": { meta: "LUN 10 · CAPÍTULO 05", eyebrow: "Bloomsbury → Camden → Whitechapel", intro: "Del museo a Camden y, al caer la tarde, hacia las historias oscuras de Whitechapel.", ending: "Tres barrios, tres ritmos." },
  "2026-08-11": { meta: "MAR 11 · CAPÍTULO 06", eyebrow: "Música / cultura / rutas abiertas", intro: "Un día abierto para cruzar música, museos, transporte y rincones que todavía no tienen orden definitivo.", ending: "Deja que una elección lleve a la siguiente." },
  "2026-08-12": { meta: "MIÉ 12 · CAPÍTULO 07", eyebrow: "Posibilidades / una ruta por elegir", intro: "La página más abierta del viaje: estudio, excursión o una combinación que aún está por construir.", ending: "Elegir también forma parte del viaje." },
  "2026-08-13": { meta: "JUE 13 · CAPÍTULO 08", eyebrow: "Ealing → Heathrow → Sevilla", intro: "Última logística: cerrar la habitación, llegar a Heathrow y guardar Londres para el próximo viaje.", ending: "Londres queda detrás; el viaje continúa." },
};

const areasEs: Record<string, string> = {
  "City of London": "City de Londres",
  "Central London": "Centro de Londres",
  "East London": "Este de Londres",
  London: "Londres",
  "West London": "Oeste de Londres",
};

export function areaEs(area?: string): string | undefined {
  return area ? (areasEs[area] ?? area) : undefined;
}

export function weekdayEs(day: Day): string {
  return es.weekdays[day.weekday] ?? day.weekday;
}

export function coverTitleEs(day: Day): string {
  return es.coverTitles[day.date] ?? day.coverTitle;
}

export function planningLabel(activity: Activity): string {
  if (activity.timeNeedsVerification) return es.status.timeVerify;
  if (activity.status === "confirmed") return es.status.confirmed;
  if (activity.level === "nearby-option") return activity.status === "unplanned" ? es.status.unplanned : es.levels[activity.level];
  return es.levels[activity.level];
}

export function activityTitleEs(activity: Activity): string {
  return activity.displayTitle ?? titleEs(activity.title);
}

export function titleEs(title: string): string {
  return es.activity.titles[title] ?? title;
}

export function activityTimeLabelEs(value?: string): string | undefined {
  return value ? (es.activity.meta[value] ?? value) : undefined;
}
