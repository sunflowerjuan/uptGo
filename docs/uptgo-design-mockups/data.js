// data.js — UPTGO mock academic data. Assigned to window.UPTGO_DATA.
window.UPTGO_DATA = {
  user: {
    name: 'María Sofía Mora',
    short: 'María Sofía',
    initials: 'MS',
    program: 'Ingeniería de Sistemas',
    semester: 'Semestre I · 2026',
    email: 'maria.mora@uptc.edu.co',
    streak: 12,
  },

  // color = category hue token index (1..6)
  subjects: [
    { id: 'bd',  name: 'Bases de Datos',      code: 'SIS-401', color: 1, teacher: 'Ing. Laura Gómez',   room: 'Aula 204 · Bloque C', grade: 4.1, progress: 82 },
    { id: 'cal', name: 'Cálculo III',         code: 'MAT-303', color: 2, teacher: 'Dr. Andrés Peña',    room: 'Aula 110 · Bloque A', grade: 3.5, progress: 70 },
    { id: 'fis', name: 'Física II',           code: 'FIS-202', color: 3, teacher: 'Dra. Carmen Ruiz',   room: 'Lab. Electrónica · F', grade: 3.8, progress: 76 },
    { id: 'so',  name: 'Sistemas Operativos', code: 'SIS-405', color: 4, teacher: 'Ing. Diego Salas',   room: 'Aula 302 · Bloque B', grade: 4.4, progress: 88 },
    { id: 'ing', name: 'Inglés IV',           code: 'IDM-104', color: 5, teacher: 'Lic. Sara Toro',     room: 'Aula 015 · Bloque A', grade: 3.2, progress: 64 },
    { id: 'red', name: 'Redes de Datos',      code: 'SIS-410', color: 6, teacher: 'Ing. Pablo Mejía',   room: 'Lab. Redes · Bloque C', grade: 3.9, progress: 78 },
  ],

  tasks: [
    { id: 't1', title: 'Proyecto Bases de Datos — Modelo E/R', subject: 'bd', due: 'Hoy · 11:59 p.m.', dueShort: 'Hoy', priority: 'alta', status: 'progreso', done: false, soon: true,
      desc: 'Entregar el modelo entidad-relación normalizado hasta 3FN con diccionario de datos y el script SQL de creación.', attachments: 2, notesCount: 3 },
    { id: 't2', title: 'Informe de laboratorio — Circuitos RC', subject: 'fis', due: '10 may · 6:00 p.m.', dueShort: '10 may', priority: 'alta', status: 'pendiente', done: false,
      desc: 'Análisis de la respuesta transitoria del circuito RC. Incluir gráficas de carga/descarga y cálculo de la constante de tiempo.', attachments: 1, notesCount: 1 },
    { id: 't3', title: 'Ensayo comparativo — Planificadores de CPU', subject: 'so', due: '12 may', dueShort: '12 may', priority: 'media', status: 'pendiente', done: false,
      desc: 'Comparar Round Robin, SJF y planificación por prioridades con ejemplos de cálculo de tiempos de espera.', attachments: 0, notesCount: 0 },
    { id: 't4', title: 'Parcial Cálculo III — Cap. 5 y 6', subject: 'cal', due: '14 may', dueShort: '14 may', priority: 'media', status: 'pendiente', done: false,
      desc: 'Integrales múltiples y de superficie. Repasar el teorema de Green y la guía de ejercicios resueltos.', attachments: 1, notesCount: 2 },
    { id: 't5', title: 'Taller de subredes y VLSM', subject: 'red', due: '15 may', dueShort: '15 may', priority: 'baja', status: 'pendiente', done: false,
      desc: 'Resolver el taller de segmentación de redes con máscaras de longitud variable.', attachments: 0, notesCount: 0 },
    { id: 't6', title: 'Quiz Cálculo III — Cap. 4', subject: 'cal', due: 'Entregada · 6 may', dueShort: '6 may', priority: 'media', status: 'entregada', done: true,
      desc: 'Quiz corto sobre derivadas direccionales y gradiente.', attachments: 0, notesCount: 0 },
    { id: 't7', title: 'Lectura — RFC 791 (IP)', subject: 'red', due: 'Entregada · 4 may', dueShort: '4 may', priority: 'baja', status: 'entregada', done: true,
      desc: 'Resumen de la especificación del protocolo IP.', attachments: 0, notesCount: 1 },
  ],

  // today's events
  events: [
    { id: 'e1', time: '08:00', dur: '2 h', title: 'Bases de Datos — Clase magistral', loc: 'Aula 204 · Bloque C', subject: 'bd', type: 'clase' },
    { id: 'e2', time: '10:00', dur: '2 h', title: 'Cálculo III — Integración', loc: 'Aula 110 · Bloque A', subject: 'cal', type: 'clase' },
    { id: 'e3', time: '14:00', dur: '2 h', title: 'Física II — Lab. de circuitos', loc: 'Lab. Electrónica · Bloque F', subject: 'fis', type: 'clase' },
    { id: 'e4', time: '17:00', dur: '30 min', title: 'Asesoría proyecto final', loc: 'Enlace virtual · Teams', subject: 'so', type: 'asesoria' },
  ],

  // weekly schedule blocks. day 0=Lun..5=Sáb. start/end in 24h decimal
  schedule: [
    { day: 0, start: 8,  end: 10, subject: 'bd' },
    { day: 0, start: 10, end: 12, subject: 'cal' },
    { day: 0, start: 14, end: 16, subject: 'ing' },
    { day: 1, start: 7,  end: 9,  subject: 'so' },
    { day: 1, start: 10, end: 12, subject: 'red' },
    { day: 2, start: 8,  end: 10, subject: 'cal' },
    { day: 2, start: 14, end: 16, subject: 'fis' },
    { day: 3, start: 8,  end: 10, subject: 'ing' },
    { day: 3, start: 10, end: 12, subject: 'bd' },
    { day: 3, start: 15, end: 17, subject: 'red' },
    { day: 4, start: 7,  end: 9,  subject: 'so' },
    { day: 4, start: 9,  end: 11, subject: 'fis' },
  ],

  notes: [
    { id: 'n1', title: 'Normalización — 1FN a 3FN', subject: 'bd', type: 'texto', date: '7 may', tags: ['parcial', 'resumen'],
      preview: 'Una relación está en 3FN si está en 2FN y no existen dependencias transitivas entre atributos no clave…' },
    { id: 'n2', title: 'Explicación del profe — deadlocks', subject: 'so', type: 'audio', date: '6 may', tags: ['clase'], duration: '4:12',
      preview: 'Nota de voz · condiciones de Coffman y estrategias de prevención.' },
    { id: 'n3', title: 'Tablero — circuito RC', subject: 'fis', type: 'foto', date: '6 may', tags: ['laboratorio'],
      preview: 'Foto del tablero con el desarrollo de la ecuación diferencial.' },
    { id: 'n4', title: 'Vocabulario unidad 4', subject: 'ing', type: 'texto', date: '5 may', tags: ['vocabulario'],
      preview: 'Phrasal verbs: look up, carry out, figure out, point out…' },
    { id: 'n5', title: 'Teorema de Green — pasos', subject: 'cal', type: 'texto', date: '4 may', tags: ['parcial'],
      preview: 'Relaciona una integral de línea sobre una curva cerrada con una integral doble…' },
    { id: 'n6', title: 'Subneteo — ejemplo en clase', subject: 'red', type: 'foto', date: '3 may', tags: ['taller'],
      preview: 'Captura del ejercicio de VLSM resuelto paso a paso.' },
  ],

  reminders: [
    { id: 'r1', title: 'Repasar para el parcial de Cálculo', time: 'Hoy · 8:00 p.m.', repeat: 'Única', lead: '30 min antes', status: 'activo' },
    { id: 'r2', title: 'Enviar correo al tutor de proyecto', time: 'Mañana · 9:00 a.m.', repeat: 'Única', lead: '15 min antes', status: 'activo' },
    { id: 'r3', title: 'Sesión de estudio — Redes', time: 'Diario · 6:00 p.m.', repeat: 'Diaria', lead: '10 min antes', status: 'activo' },
    { id: 'r4', title: 'Pagar matrícula de laboratorio', time: '9 may · 12:00 p.m.', repeat: 'Única', lead: '1 día antes', status: 'completado' },
    { id: 'r5', title: 'Tomar agua / pausa activa', time: 'Cada 2 horas', repeat: 'Personalizada', lead: 'En el momento', status: 'descartado' },
  ],

  notifications: [
    { id: 'no1', kind: 'vencimiento', icon: 'flag', title: 'Entrega hoy', body: 'Proyecto Bases de Datos vence a las 11:59 p.m.', time: 'hace 1 h', unread: true, color: 1 },
    { id: 'no2', kind: 'clase', icon: 'clock', title: 'Clase próxima', body: 'Física II — Lab. de circuitos inicia en 20 min.', time: 'hace 20 min', unread: true, color: 3 },
    { id: 'no3', kind: 'sync', icon: 'cloudCheck', title: 'Sincronización completada', body: '3 cambios offline se guardaron en la nube.', time: 'hace 2 h', unread: false, color: 2 },
    { id: 'no4', kind: 'recordatorio', icon: 'bell', title: 'Recordatorio', body: 'Repasar para el parcial de Cálculo esta noche.', time: 'hace 3 h', unread: false, color: 5 },
  ],

  campus: [
    { id: 'p1', name: 'Aula 204 · Bloque C', kind: 'Bases de Datos', x: 62, y: 38, color: 1 },
    { id: 'p2', name: 'Aula 110 · Bloque A', kind: 'Cálculo III', x: 28, y: 30, color: 2 },
    { id: 'p3', name: 'Lab. Electrónica · F', kind: 'Física II', x: 78, y: 64, color: 3 },
    { id: 'p4', name: 'Biblioteca Central', kind: 'Estudio · favorito', x: 46, y: 56, color: 5, fav: true },
    { id: 'p5', name: 'Cafetería Central', kind: 'Punto de encuentro', x: 38, y: 74, color: 3 },
  ],

  // performance over the term (avg per cut)
  performance: {
    cuts: [
      { label: 'Corte 1', value: 3.6 },
      { label: 'Corte 2', value: 3.8 },
      { label: 'Corte 3', value: 4.0 },
    ],
    average: 3.8,
    credits: 18,
    attendance: 94,
  },
};
