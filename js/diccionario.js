/**
 * diccionario.js — Librería de ejercicios (255+)
 */
const EJS=[
  {n:"Press de Banca con Barra",g:"Pecho",e:"Barra",m:"Pectoral mayor, tríceps, hombro anterior",t:"c",err:"Rebotar la barra en el pecho.",pasos:["Escápulas retraídas y hombros abajo", "Arco lumbar natural, glúteos en el banco", "Agarre un poco más ancho que los hombros", "Baja controlado hasta rozar el pecho", "Codos a ~45°, no abiertos a 90°", "Empuja explosivo sin rebotar"]},
  {n:"Press de Banca Inclinado con Barra",g:"Pecho",e:"Barra",m:"Pectoral superior, hombro anterior, tríceps",t:"c",err:"Inclinar el banco demasiado (pasa a ser press de hombro).",pasos:["Banco entre 30 y 45 grados", "Escápulas retraídas y firmes", "Baja la barra a la parte alta del pecho", "Codos a ~45 grados del torso", "Empuja hacia arriba y ligeramente atrás", "Control total en la bajada"]},
  {n:"Press de Banca Declinado con Barra",g:"Pecho",e:"Barra",m:"Pectoral inferior, tríceps",t:"c"},
  {n:"Press de Banca con Mancuernas",g:"Pecho",e:"Mancuernas",m:"Pectoral mayor, tríceps, estabilizadores",t:"c",err:"Bajar demasiado y forzar el hombro.",pasos:["Siéntate y lleva las mancuernas con las rodillas", "Escápulas retraídas", "Baja hasta la línea del pecho", "Muñecas firmes, no dejes que caigan atrás", "Empuja juntando ligeramente arriba", "No choques las mancuernas"]},
  {n:"Press Inclinado con Mancuernas",g:"Pecho",e:"Mancuernas",m:"Pectoral superior, hombro anterior",t:"c"},
  {n:"Press Declinado con Mancuernas",g:"Pecho",e:"Mancuernas",m:"Pectoral inferior, tríceps",t:"c"},
  {n:"Press de Pecho en Máquina",g:"Pecho",e:"Máquina",m:"Pectoral mayor, tríceps",t:"c"},
  {n:"Press Inclinado en Máquina",g:"Pecho",e:"Máquina",m:"Pectoral superior, tríceps",t:"c"},
  {n:"Press de Pecho en Smith",g:"Pecho",e:"Smith",m:"Pectoral mayor, tríceps",t:"c"},
  {n:"Press Inclinado en Smith",g:"Pecho",e:"Smith",m:"Pectoral superior, tríceps",t:"c"},
  {n:"Aperturas con Mancuernas",g:"Pecho",e:"Mancuernas",m:"Pectoral mayor (estiramiento)",t:"a",err:"Bajar demasiado o doblar mucho los codos.",pasos:["Acuéstate con las mancuernas sobre el pecho", "Codos ligeramente flexionados y fijos", "Abre en arco amplio y controlado", "Baja hasta sentir estiramiento, sin dolor", "Junta arriba como si abrazaras un árbol", "No choques las mancuernas"]},
  {n:"Aperturas Inclinadas con Mancuernas",g:"Pecho",e:"Mancuernas",m:"Pectoral superior",t:"a"},
  {n:"Aperturas Declinadas con Mancuernas",g:"Pecho",e:"Mancuernas",m:"Pectoral inferior",t:"a"},
  {n:"Pec-Fly (Peck Deck)",g:"Pecho",e:"Máquina",m:"Pectoral mayor",t:"a"},
  {n:"Aperturas en Polea (Cruces)",g:"Pecho",e:"Polea",m:"Pectoral mayor",t:"a",err:"Usar impulso del cuerpo en vez del pecho.",pasos:["Poleas a la altura de los hombros o más arriba", "Un pie adelante, torso ligeramente inclinado", "Codos con flexión ligera y constante", "Junta las manos al frente y abajo", "Aprieta el pecho 1 segundo", "Regresa controlado sintiendo el estiramiento"]},
  {n:"Cruces en Polea Alta",g:"Pecho",e:"Polea",m:"Pectoral inferior",t:"a"},
  {n:"Cruces en Polea Baja",g:"Pecho",e:"Polea",m:"Pectoral superior",t:"a"},
  {n:"Fondos en Paralelas (Pecho)",g:"Pecho",e:"Peso corporal",m:"Pectoral inferior, tríceps, hombro",t:"c",err:"Mantener el torso vertical (eso trabaja más tríceps).",pasos:["Inclina el torso hacia adelante", "Codos ligeramente abiertos", "Baja hasta que el hombro quede a la altura del codo", "No bajes más de lo cómodo", "Empuja con el pecho", "Controla la bajada"]},
  {n:"Flexiones",g:"Pecho",e:"Peso corporal",m:"Pectoral, tríceps, core",t:"c",err:"Dejar caer la cadera.",pasos:["Manos al ancho de hombros", "Cuerpo en línea recta de la cabeza a los talones", "Codos a ~45 grados", "Baja hasta que el pecho casi toque el suelo", "Aprieta glúteos y core", "Empuja con fuerza"]},
  {n:"Flexiones Diamante",g:"Pecho",e:"Peso corporal",m:"Tríceps, pectoral interno",t:"c"},
  {n:"Flexiones Declinadas",g:"Pecho",e:"Peso corporal",m:"Pectoral superior, hombro",t:"c"},
  {n:"Flexiones Inclinadas",g:"Pecho",e:"Peso corporal",m:"Pectoral inferior",t:"c"},
  {n:"Flexiones Archer",g:"Pecho",e:"Peso corporal",m:"Pectoral, tríceps (unilateral)",t:"c"},
  {n:"Pullover con Mancuerna",g:"Pecho",e:"Mancuernas",m:"Pectoral, dorsal, serrato",t:"c"},
  {n:"Press Svend",g:"Pecho",e:"Disco",m:"Pectoral interno",t:"a"},
  {n:"Press de Pecho con Banda",g:"Pecho",e:"Banda",m:"Pectoral, tríceps",t:"c"},
  {n:"Aperturas con Banda",g:"Pecho",e:"Banda",m:"Pectoral",t:"a"},
  {n:"Press Guillotina",g:"Pecho",e:"Barra",m:"Pectoral superior",t:"c"},
  {n:"Press con Agarre Cerrado",g:"Pecho",e:"Barra",m:"Tríceps, pectoral interno",t:"c"},
  {n:"Flexiones con Peso",g:"Pecho",e:"Disco",m:"Pectoral, tríceps",t:"c"},
  {n:"Press Hammer (Máquina)",g:"Pecho",e:"Máquina",m:"Pectoral mayor",t:"c"},
  {n:"Peso Muerto Convencional",g:"Espalda",e:"Barra",m:"Cadena posterior, glúteo, espalda, trapecio",t:"c",err:"Redondear la zona lumbar.",pasos:["Barra pegada a las espinillas", "Espalda recta, pecho arriba", "Toma la barra fuera de las piernas", "Empuja el piso con los talones", "Cadera y hombros suben a la vez", "Bloquea apretando glúteos, sin hiperextender"]},
  {n:"Peso Muerto Sumo",g:"Espalda",e:"Barra",m:"Glúteo, cuádriceps, aductores, espalda",t:"c"},
  {n:"Dominadas (Pronación)",g:"Espalda",e:"Peso corporal",m:"Dorsal ancho, bíceps, romboides",t:"c",err:"Balancearse o no completar el rango.",pasos:["Agarre un poco más ancho que los hombros", "Cuelga con los brazos extendidos", "Inicia bajando las escápulas", "Tira con los codos hacia las costillas", "Barbilla sobre la barra", "Baja controlado hasta extender"]},
  {n:"Dominadas Supinas (Chin-ups)",g:"Espalda",e:"Peso corporal",m:"Dorsal, bíceps",t:"c"},
  {n:"Dominadas Neutras",g:"Espalda",e:"Peso corporal",m:"Dorsal, bíceps, braquial",t:"c"},
  {n:"Dominadas Asistidas (Máquina)",g:"Espalda",e:"Máquina",m:"Dorsal, bíceps",t:"c"},
  {n:"Jalón al Pecho (Agarre Abierto)",g:"Espalda",e:"Polea",m:"Dorsal ancho, romboides, bíceps",t:"c",err:"Tirar de la barra detrás de la nuca.",pasos:["Agarre más ancho que los hombros", "Pecho arriba, ligera inclinación atrás", "Baja los hombros antes de tirar", "Lleva la barra al pecho, no a la nuca", "Aprieta la espalda abajo", "Sube controlado sin soltar la tensión"]},
  {n:"Jalón al Pecho Agarre Cerrado",g:"Espalda",e:"Polea",m:"Dorsal, bíceps",t:"c"},
  {n:"Jalón al Pecho Agarre Neutro",g:"Espalda",e:"Polea",m:"Dorsal, braquial",t:"c"},
  {n:"Jalón al Pecho Supino",g:"Espalda",e:"Polea",m:"Dorsal inferior, bíceps",t:"c"},
  {n:"Jalón Unilateral en Polea",g:"Espalda",e:"Polea",m:"Dorsal (unilateral)",t:"c"},
  {n:"Remo con Barra",g:"Espalda",e:"Barra",m:"Dorsal, romboides, trapecio medio",t:"c",err:"Usar impulso de la cadera y redondear la espalda.",pasos:["Torso inclinado ~45 grados", "Espalda neutra, core activo", "Tira la barra hacia el ombligo", "Codos pegados al cuerpo", "Aprieta las escápulas arriba", "Baja controlado sin redondear"]},
  {n:"Remo con Barra Supino (Pendlay)",g:"Espalda",e:"Barra",m:"Dorsal, bíceps",t:"c"},
  {n:"Remo con Mancuerna a una Mano",g:"Espalda",e:"Mancuernas",m:"Dorsal, romboides",t:"c",err:"Rotar el torso para levantar más peso.",pasos:["Apoya rodilla y mano en el banco", "Espalda paralela al suelo", "Deja colgar el brazo con la mancuerna", "Tira hacia la cadera, codo pegado", "Aprieta arriba sin girar el torso", "Baja estirando el dorsal"]},
  {n:"Remo con Mancuernas (Ambos Brazos)",g:"Espalda",e:"Mancuernas",m:"Dorsal, trapecio medio",t:"c"},
  {n:"Remo en Polea Baja (Sentado)",g:"Espalda",e:"Polea",m:"Dorsal, romboides, trapecio",t:"c",err:"Mecerse hacia adelante y atrás con impulso.",pasos:["Pies firmes, rodillas ligeramente flexionadas", "Espalda recta, pecho arriba", "Tira hacia el abdomen bajo", "Codos pegados al cuerpo", "Aprieta las escápulas", "Regresa controlado sin dejar caer el peso"]},
  {n:"Remo en Máquina",g:"Espalda",e:"Máquina",m:"Dorsal, romboides",t:"c"},
  {n:"Remo en T (T-Bar)",g:"Espalda",e:"Barra",m:"Dorsal, trapecio medio",t:"c"},
  {n:"Remo Pendlay",g:"Espalda",e:"Barra",m:"Dorsal, trapecio",t:"c"},
  {n:"Remo Invertido",g:"Espalda",e:"Peso corporal",m:"Dorsal, romboides, core",t:"c"},
  {n:"Remo en Punta de Barra (Landmine)",g:"Espalda",e:"Barra",m:"Dorsal, trapecio",t:"c"},
  {n:"Remo Renegado",g:"Espalda",e:"Mancuernas",m:"Dorsal, core",t:"c"},
  {n:"Remo con Kettlebell",g:"Espalda",e:"Kettlebell",m:"Dorsal, romboides",t:"c"},
  {n:"Pullover en Polea Alta",g:"Espalda",e:"Polea",m:"Dorsal ancho",t:"a"},
  {n:"Pullover en Máquina",g:"Espalda",e:"Máquina",m:"Dorsal ancho",t:"a"},
  {n:"Face Pull",g:"Espalda",e:"Polea",m:"Deltoide posterior, trapecio, romboides",t:"a",err:"Usar demasiado peso y convertirlo en remo.",pasos:["Polea a la altura de la cara", "Agarre con cuerda, palmas enfrentadas", "Tira hacia la frente separando la cuerda", "Codos altos, a la altura de los hombros", "Aprieta 1 segundo atrás", "Peso ligero, movimiento limpio"]},
  {n:"Encogimientos con Barra",g:"Espalda",e:"Barra",m:"Trapecio superior",t:"a"},
  {n:"Encogimientos con Mancuernas",g:"Espalda",e:"Mancuernas",m:"Trapecio superior",t:"a"},
  {n:"Encogimientos en Máquina",g:"Espalda",e:"Máquina",m:"Trapecio superior",t:"a"},
  {n:"Hiperextensiones (Espalda Baja)",g:"Espalda",e:"Peso corporal",m:"Erectores, glúteo, femoral",t:"c"},
  {n:"Buenos Días",g:"Espalda",e:"Barra",m:"Femoral, glúteo, erectores",t:"c"},
  {n:"Peso Muerto con Mancuernas",g:"Espalda",e:"Mancuernas",m:"Cadena posterior",t:"c"},
  {n:"Rack Pull",g:"Espalda",e:"Barra",m:"Trapecio, erectores, dorsal",t:"c"},
  {n:"Remo Gorila",g:"Espalda",e:"Kettlebell",m:"Dorsal, core",t:"c"},
  {n:"Jalón con Brazo Recto",g:"Espalda",e:"Polea",m:"Dorsal ancho",t:"a"},
  {n:"Superman",g:"Espalda",e:"Peso corporal",m:"Erectores, glúteo",t:"a"},
  {n:"Press Militar con Barra (De Pie)",g:"Hombro",e:"Barra",m:"Deltoide anterior/medio, tríceps",t:"c",err:"Arquear demasiado la espalda baja.",pasos:["Barra a la altura de las clavículas", "Pies al ancho de cadera, core apretado", "Aprieta glúteos para proteger la lumbar", "Empuja la barra en línea recta", "Mete la cabeza cuando la barra pase", "Bloquea arriba con los codos extendidos"]},
  {n:"Press Militar Sentado con Barra",g:"Hombro",e:"Barra",m:"Deltoide anterior, tríceps",t:"c"},
  {n:"Press de Hombro con Mancuernas",g:"Hombro",e:"Mancuernas",m:"Deltoide anterior/medio, tríceps",t:"c",err:"Bajar demasiado y forzar la articulación.",pasos:["Siéntate con respaldo, espalda apoyada", "Mancuernas a la altura de las orejas", "Codos ligeramente adelante, no abiertos del todo", "Empuja arriba sin chocar", "Baja hasta la línea del mentón", "Control en toda la bajada"]},
  {n:"Press Arnold",g:"Hombro",e:"Mancuernas",m:"Deltoide anterior/medio, rotadores",t:"c"},
  {n:"Press de Hombro en Máquina",g:"Hombro",e:"Máquina",m:"Deltoide anterior",t:"c"},
  {n:"Press de Hombro en Smith",g:"Hombro",e:"Smith",m:"Deltoide anterior, tríceps",t:"c"},
  {n:"Push Press",g:"Hombro",e:"Barra",m:"Deltoide, tríceps, pierna (impulso)",t:"c"},
  {n:"Elevaciones Laterales con Mancuernas",g:"Hombro",e:"Mancuernas",m:"Deltoide medio",t:"a",err:"Usar impulso y subir por encima de los hombros.",pasos:["De pie, mancuernas a los costados", "Codos con flexión ligera y fija", "Sube hasta la altura de los hombros", "Meñique ligeramente más alto que el pulgar", "Sin balanceo del torso", "Baja lento, 2 segundos"]},
  {n:"Elevaciones Laterales en Polea",g:"Hombro",e:"Polea",m:"Deltoide medio",t:"a"},
  {n:"Elevaciones Laterales en Máquina",g:"Hombro",e:"Máquina",m:"Deltoide medio",t:"a"},
  {n:"Elevaciones Laterales Inclinado",g:"Hombro",e:"Mancuernas",m:"Deltoide medio/posterior",t:"a"},
  {n:"Elevaciones Frontales con Mancuernas",g:"Hombro",e:"Mancuernas",m:"Deltoide anterior",t:"a"},
  {n:"Elevaciones Frontales con Barra",g:"Hombro",e:"Barra",m:"Deltoide anterior",t:"a"},
  {n:"Elevaciones Frontales con Disco",g:"Hombro",e:"Disco",m:"Deltoide anterior",t:"a"},
  {n:"Elevaciones Frontales en Polea",g:"Hombro",e:"Polea",m:"Deltoide anterior",t:"a"},
  {n:"Pájaros con Mancuernas",g:"Hombro",e:"Mancuernas",m:"Deltoide posterior, romboides",t:"a",err:"Encoger los hombros en vez de abrir.",pasos:["Torso inclinado casi paralelo al suelo", "Mancuernas colgando bajo el pecho", "Codos ligeramente flexionados", "Abre en arco hacia los lados", "Aprieta la espalda alta arriba", "Baja controlado sin balancear"]},
  {n:"Pájaros en Máquina (Reverse Pec-Deck)",g:"Hombro",e:"Máquina",m:"Deltoide posterior",t:"a"},
  {n:"Pájaros en Polea",g:"Hombro",e:"Polea",m:"Deltoide posterior",t:"a"},
  {n:"Remo al Mentón",g:"Hombro",e:"Barra",m:"Deltoide medio, trapecio",t:"c"},
  {n:"Remo al Mentón con Mancuernas",g:"Hombro",e:"Mancuernas",m:"Deltoide medio, trapecio",t:"c"},
  {n:"Remo al Mentón en Polea",g:"Hombro",e:"Polea",m:"Deltoide medio, trapecio",t:"c"},
  {n:"Rotación Externa con Banda",g:"Hombro",e:"Banda",m:"Manguito rotador",t:"a"},
  {n:"Rotación Externa en Polea",g:"Hombro",e:"Polea",m:"Manguito rotador",t:"a"},
  {n:"Rotación Interna en Polea",g:"Hombro",e:"Polea",m:"Manguito rotador",t:"a"},
  {n:"Press Landmine",g:"Hombro",e:"Barra",m:"Deltoide anterior, core",t:"c"},
  {n:"Elevaciones en Y",g:"Hombro",e:"Mancuernas",m:"Trapecio inferior, deltoide",t:"a"},
  {n:"Press de Hombro con Kettlebell",g:"Hombro",e:"Kettlebell",m:"Deltoide, tríceps",t:"c"},
  {n:"Flexiones en Pica",g:"Hombro",e:"Peso corporal",m:"Deltoide anterior, tríceps",t:"c"},
  {n:"Handstand Push-Up",g:"Hombro",e:"Peso corporal",m:"Deltoide, tríceps",t:"c"},
  {n:"Elevaciones Laterales con Banda",g:"Hombro",e:"Banda",m:"Deltoide medio",t:"a"},
  {n:"Face Pull con Banda",g:"Hombro",e:"Banda",m:"Deltoide posterior",t:"a"},
  {n:"Curl con Barra",g:"Bíceps",e:"Barra",m:"Bíceps braquial",t:"a",err:"Balancear el cuerpo para subir el peso.",pasos:["De pie, agarre al ancho de hombros", "Codos pegados al torso y fijos", "Sube contrayendo el bíceps", "No muevas los codos hacia adelante", "Aprieta arriba 1 segundo", "Baja lento y controlado"]},
  {n:"Curl con Barra Z",g:"Bíceps",e:"Barra",m:"Bíceps, braquial",t:"a"},
  {n:"Curl con Mancuernas",g:"Bíceps",e:"Mancuernas",m:"Bíceps braquial",t:"a"},
  {n:"Curl Alterno con Mancuernas",g:"Bíceps",e:"Mancuernas",m:"Bíceps braquial",t:"a"},
  {n:"Curl Martillo",g:"Bíceps",e:"Mancuernas",m:"Braquial, braquiorradial, bíceps",t:"a",err:"Balancear las mancuernas con impulso.",pasos:["Agarre neutro, palmas enfrentadas", "Codos pegados al cuerpo", "Sube sin girar la muñeca", "Contrae arriba", "Baja controlado", "Alterna o sube ambos a la vez"]},
  {n:"Curl Martillo en Polea (Cuerda)",g:"Bíceps",e:"Polea",m:"Braquial, bíceps",t:"a"},
  {n:"Curl Concentrado",g:"Bíceps",e:"Mancuernas",m:"Bíceps (pico)",t:"a"},
  {n:"Curl Predicador (Scott) con Barra",g:"Bíceps",e:"Barra",m:"Bíceps (porción baja)",t:"a"},
  {n:"Curl Predicador con Mancuerna",g:"Bíceps",e:"Mancuernas",m:"Bíceps",t:"a"},
  {n:"Curl Predicador en Máquina",g:"Bíceps",e:"Máquina",m:"Bíceps",t:"a"},
  {n:"Curl en Polea Baja",g:"Bíceps",e:"Polea",m:"Bíceps",t:"a"},
  {n:"Curl en Polea Alta (Doble Bíceps)",g:"Bíceps",e:"Polea",m:"Bíceps (pico)",t:"a"},
  {n:"Curl Inclinado con Mancuernas",g:"Bíceps",e:"Mancuernas",m:"Bíceps (cabeza larga)",t:"a"},
  {n:"Curl Araña (Spider Curl)",g:"Bíceps",e:"Mancuernas",m:"Bíceps",t:"a"},
  {n:"Curl 21s",g:"Bíceps",e:"Barra",m:"Bíceps",t:"a"},
  {n:"Curl Zottman",g:"Bíceps",e:"Mancuernas",m:"Bíceps, antebrazo",t:"a"},
  {n:"Curl Invertido (Pronado)",g:"Bíceps",e:"Barra",m:"Braquiorradial, antebrazo",t:"a"},
  {n:"Curl con Banda",g:"Bíceps",e:"Banda",m:"Bíceps",t:"a"},
  {n:"Curl en Máquina",g:"Bíceps",e:"Máquina",m:"Bíceps",t:"a"},
  {n:"Curl con Kettlebell",g:"Bíceps",e:"Kettlebell",m:"Bíceps",t:"a"},
  {n:"Curl Bayesian (Polea Atrás)",g:"Bíceps",e:"Polea",m:"Bíceps (cabeza larga)",t:"a"},
  {n:"Extensión de Tríceps en Polea (Cuerda)",g:"Tríceps",e:"Polea",m:"Tríceps (3 cabezas)",t:"a",err:"Mover los codos hacia adelante y atrás.",pasos:["Codos pegados a los costados", "Torso ligeramente inclinado", "Extiende separando la cuerda abajo", "Aprieta el tríceps al final", "Sube solo hasta 90 grados", "No uses impulso del hombro"]},
  {n:"Extensión de Tríceps en Polea (Barra)",g:"Tríceps",e:"Polea",m:"Tríceps lateral y medial",t:"a"},
  {n:"Extensión de Tríceps en Polea (Agarre Inverso)",g:"Tríceps",e:"Polea",m:"Tríceps medial",t:"a"},
  {n:"Press Francés con Barra",g:"Tríceps",e:"Barra",m:"Tríceps (cabeza larga)",t:"a",err:"Abrir los codos hacia los lados.",pasos:["Acostado, barra sobre la frente", "Codos apuntando al techo, fijos", "Baja la barra hacia la frente o detrás", "Solo se mueve el antebrazo", "Extiende sin bloquear de golpe", "Control absoluto en la bajada"]},
  {n:"Press Francés con Mancuernas",g:"Tríceps",e:"Mancuernas",m:"Tríceps",t:"a"},
  {n:"Extensión Tras Nuca con Mancuerna",g:"Tríceps",e:"Mancuernas",m:"Tríceps (cabeza larga)",t:"a"},
  {n:"Extensión Tras Nuca en Polea",g:"Tríceps",e:"Polea",m:"Tríceps (cabeza larga)",t:"a"},
  {n:"Fondos en Paralelas (Tríceps)",g:"Tríceps",e:"Peso corporal",m:"Tríceps, pectoral inferior",t:"c",err:"Bajar demasiado y lesionar el hombro.",pasos:["Torso lo más vertical posible", "Codos pegados al cuerpo", "Baja hasta 90 grados de codo", "No bajes más de lo cómodo", "Empuja con el tríceps", "Bloquea suave arriba"]},
  {n:"Fondos en Banco",g:"Tríceps",e:"Peso corporal",m:"Tríceps",t:"c"},
  {n:"Fondos en Máquina Asistida",g:"Tríceps",e:"Máquina",m:"Tríceps, pecho",t:"c"},
  {n:"Press Cerrado en Banca",g:"Tríceps",e:"Barra",m:"Tríceps, pectoral interno",t:"c"},
  {n:"Patada de Tríceps con Mancuerna",g:"Tríceps",e:"Mancuernas",m:"Tríceps",t:"a"},
  {n:"Patada de Tríceps en Polea",g:"Tríceps",e:"Polea",m:"Tríceps",t:"a"},
  {n:"Extensión de Tríceps en Máquina",g:"Tríceps",e:"Máquina",m:"Tríceps",t:"a"},
  {n:"Flexiones Diamante (Tríceps)",g:"Tríceps",e:"Peso corporal",m:"Tríceps",t:"c"},
  {n:"Extensión con Banda",g:"Tríceps",e:"Banda",m:"Tríceps",t:"a"},
  {n:"JM Press",g:"Tríceps",e:"Barra",m:"Tríceps",t:"c"},
  {n:"Skull Crusher con Barra Z",g:"Tríceps",e:"Barra",m:"Tríceps",t:"a"},
  {n:"Press Tate",g:"Tríceps",e:"Mancuernas",m:"Tríceps",t:"a"},
  {n:"Extensión Unilateral en Polea",g:"Tríceps",e:"Polea",m:"Tríceps",t:"a"},
  {n:"Sentadilla con Barra (Trasera)",g:"Cuádriceps",e:"Barra",m:"Cuádriceps, glúteo, core",t:"c",err:"Que las rodillas se colapsen hacia adentro.",pasos:["Barra sobre el trapecio, no sobre el cuello", "Pies al ancho de hombros, puntas ligeramente afuera", "Inicia llevando la cadera atrás", "Baja hasta que el muslo quede paralelo o más", "Rodillas alineadas con las puntas de los pies", "Sube empujando el piso, pecho firme"]},
  {n:"Sentadilla Frontal",g:"Cuádriceps",e:"Barra",m:"Cuádriceps, core",t:"c",err:"Dejar caer los codos y perder la barra.",pasos:["Barra sobre los deltoides frontales", "Codos bien altos, paralelos al suelo", "Torso lo más vertical posible", "Baja controlado manteniendo los codos arriba", "Rodillas hacia afuera", "Sube empujando con los talones"]},
  {n:"Sentadilla Goblet",g:"Cuádriceps",e:"Mancuernas",m:"Cuádriceps, glúteo, core",t:"c"},
  {n:"Sentadilla Búlgara",g:"Cuádriceps",e:"Mancuernas",m:"Cuádriceps, glúteo (unilateral)",t:"c",err:"Dar un paso demasiado corto y forzar la rodilla.",pasos:["Pie trasero sobre el banco", "Pie delantero suficientemente adelante", "Torso ligeramente inclinado", "Baja recto, rodilla trasera al suelo", "El peso en el talón delantero", "Sube empujando con la pierna de adelante"]},
  {n:"Sentadilla en Smith",g:"Cuádriceps",e:"Smith",m:"Cuádriceps, glúteo",t:"c"},
  {n:"Sentadilla Hack",g:"Cuádriceps",e:"Máquina",m:"Cuádriceps",t:"c"},
  {n:"Sentadilla Sumo",g:"Cuádriceps",e:"Barra",m:"Cuádriceps, aductores, glúteo",t:"c"},
  {n:"Sentadilla con Salto",g:"Cuádriceps",e:"Peso corporal",m:"Cuádriceps, glúteo (potencia)",t:"c"},
  {n:"Sentadilla Pistol",g:"Cuádriceps",e:"Peso corporal",m:"Cuádriceps, glúteo (unilateral)",t:"c"},
  {n:"Sentadilla Sissy",g:"Cuádriceps",e:"Peso corporal",m:"Cuádriceps (recto femoral)",t:"a"},
  {n:"Prensa de Piernas (45°)",g:"Cuádriceps",e:"Máquina",m:"Cuádriceps, glúteo",t:"c",err:"Bloquear las rodillas de golpe al extender.",pasos:["Pies al ancho de hombros en la plataforma", "Espalda y glúteos pegados al respaldo", "Baja hasta 90 grados de rodilla", "No dejes que la cadera se despegue", "Empuja con los talones", "No bloquees las rodillas arriba"]},
  {n:"Prensa Horizontal",g:"Cuádriceps",e:"Máquina",m:"Cuádriceps, glúteo",t:"c"},
  {n:"Prensa a una Pierna",g:"Cuádriceps",e:"Máquina",m:"Cuádriceps (unilateral)",t:"c"},
  {n:"Extensión de Rodilla (Cuádriceps)",g:"Cuádriceps",e:"Máquina",m:"Cuádriceps",t:"a",err:"Usar impulso y soltar el peso de golpe.",pasos:["Ajusta el respaldo a tu altura", "Rodillas alineadas con el eje de giro", "Extiende completamente arriba", "Aprieta el cuádriceps 1 segundo", "Baja lento, 2-3 segundos", "No dejes caer el peso"]},
  {n:"Extensión Unilateral de Rodilla",g:"Cuádriceps",e:"Máquina",m:"Cuádriceps",t:"a"},
  {n:"Zancadas con Mancuernas",g:"Cuádriceps",e:"Mancuernas",m:"Cuádriceps, glúteo",t:"c"},
  {n:"Zancadas con Barra",g:"Cuádriceps",e:"Barra",m:"Cuádriceps, glúteo",t:"c"},
  {n:"Zancadas Caminando",g:"Cuádriceps",e:"Mancuernas",m:"Cuádriceps, glúteo",t:"c"},
  {n:"Zancadas Inversas",g:"Cuádriceps",e:"Mancuernas",m:"Glúteo, cuádriceps",t:"c"},
  {n:"Zancadas Laterales",g:"Cuádriceps",e:"Mancuernas",m:"Cuádriceps, aductores",t:"c"},
  {n:"Step-Up (Subida al Cajón)",g:"Cuádriceps",e:"Mancuernas",m:"Cuádriceps, glúteo",t:"c"},
  {n:"Sentadilla en Pared (Wall Sit)",g:"Cuádriceps",e:"Peso corporal",m:"Cuádriceps (isométrico)",t:"a"},
  {n:"Sentadilla Cíclope",g:"Cuádriceps",e:"Máquina",m:"Cuádriceps",t:"c"},
  {n:"Zancada Búlgara con Barra",g:"Cuádriceps",e:"Barra",m:"Cuádriceps, glúteo",t:"c"},
  {n:"Curl Femoral Tumbado",g:"Femoral",e:"Máquina",m:"Isquiotibiales",t:"a",err:"Levantar la cadera del banco.",pasos:["Acostado boca abajo, rodillas fuera del banco", "Cadera pegada al banco", "Flexiona llevando los talones al glúteo", "Aprieta arriba 1 segundo", "Baja lento, controlado", "No arquees la espalda"]},
  {n:"Curl Femoral Sentado",g:"Femoral",e:"Máquina",m:"Isquiotibiales",t:"a"},
  {n:"Curl Femoral de Pie",g:"Femoral",e:"Máquina",m:"Isquiotibiales (unilateral)",t:"a"},
  {n:"Peso Muerto Rumano con Barra",g:"Femoral",e:"Barra",m:"Femoral, glúteo",t:"c",err:"Doblar mucho las rodillas (se vuelve peso muerto normal).",pasos:["Rodillas ligeramente flexionadas y fijas", "Lleva la cadera hacia atrás", "Barra pegada a las piernas al bajar", "Baja hasta sentir estiramiento en el femoral", "Espalda neutra en todo el recorrido", "Sube empujando la cadera al frente"]},
  {n:"Peso Muerto Rumano con Mancuernas",g:"Femoral",e:"Mancuernas",m:"Femoral, glúteo",t:"c"},
  {n:"Peso Muerto a una Pierna",g:"Femoral",e:"Mancuernas",m:"Femoral, glúteo, equilibrio",t:"c"},
  {n:"Peso Muerto Piernas Rígidas",g:"Femoral",e:"Barra",m:"Femoral, erectores",t:"c"},
  {n:"Curl Nórdico",g:"Femoral",e:"Peso corporal",m:"Isquiotibiales (excéntrico)",t:"c"},
  {n:"Buenos Días con Barra",g:"Femoral",e:"Barra",m:"Femoral, glúteo, erectores",t:"c"},
  {n:"Curl Femoral con Banda",g:"Femoral",e:"Banda",m:"Isquiotibiales",t:"a"},
  {n:"Swing con Kettlebell",g:"Femoral",e:"Kettlebell",m:"Femoral, glúteo, core",t:"c"},
  {n:"Hip Thrust con Barra",g:"Glúteo",e:"Barra",m:"Glúteo mayor",t:"c",err:"Hiperextender la espalda en vez de apretar el glúteo.",pasos:["Espalda alta apoyada en el banco", "Barra sobre la cadera con almohadilla", "Pies firmes, rodillas a 90 grados arriba", "Empuja con los talones", "Aprieta el glúteo arriba 1 segundo", "Mentón metido, mirada al frente"]},
  {n:"Puente de Glúteo",g:"Glúteo",e:"Peso corporal",m:"Glúteo mayor",t:"a"},
  {n:"Hip Thrust en Máquina",g:"Glúteo",e:"Máquina",m:"Glúteo mayor",t:"c"},
  {n:"Patada de Glúteo en Polea",g:"Glúteo",e:"Polea",m:"Glúteo mayor",t:"a"},
  {n:"Patada de Glúteo en Máquina",g:"Glúteo",e:"Máquina",m:"Glúteo mayor",t:"a"},
  {n:"Abductores en Máquina",g:"Glúteo",e:"Máquina",m:"Glúteo medio",t:"a"},
  {n:"Aductores en Máquina",g:"Glúteo",e:"Máquina",m:"Aductores",t:"a"},
  {n:"Abducción de Cadera en Polea",g:"Glúteo",e:"Polea",m:"Glúteo medio",t:"a"},
  {n:"Patada de Burro",g:"Glúteo",e:"Peso corporal",m:"Glúteo mayor",t:"a"},
  {n:"Fire Hydrant",g:"Glúteo",e:"Peso corporal",m:"Glúteo medio",t:"a"},
  {n:"Caminata Lateral con Banda",g:"Glúteo",e:"Banda",m:"Glúteo medio",t:"a"},
  {n:"Puente a una Pierna",g:"Glúteo",e:"Peso corporal",m:"Glúteo (unilateral)",t:"a"},
  {n:"Frog Pump",g:"Glúteo",e:"Peso corporal",m:"Glúteo mayor",t:"a"},
  {n:"Step-Up Alto",g:"Glúteo",e:"Mancuernas",m:"Glúteo, cuádriceps",t:"c"},
  {n:"Elevación de Talones de Pie",g:"Gemelo",e:"Máquina",m:"Gastrocnemio",t:"a",err:"Hacer rebotes rápidos sin rango completo.",pasos:["Puntas de los pies en la plataforma", "Talones colgando por debajo", "Baja lento estirando al máximo", "Sube hasta la punta de los pies", "Aprieta arriba 1-2 segundos", "Rodillas extendidas (no flexionadas)"]},
  {n:"Elevación de Talones Sentado",g:"Gemelo",e:"Máquina",m:"Sóleo",t:"a"},
  {n:"Elevación de Talones en Prensa",g:"Gemelo",e:"Máquina",m:"Gastrocnemio",t:"a"},
  {n:"Elevación de Talones con Mancuerna",g:"Gemelo",e:"Mancuernas",m:"Gastrocnemio",t:"a"},
  {n:"Elevación de Talones con Barra",g:"Gemelo",e:"Barra",m:"Gastrocnemio",t:"a"},
  {n:"Elevación de Talones en Smith",g:"Gemelo",e:"Smith",m:"Gastrocnemio",t:"a"},
  {n:"Elevación de Talones a una Pierna",g:"Gemelo",e:"Peso corporal",m:"Gastrocnemio (unilateral)",t:"a"},
  {n:"Salto a la Comba",g:"Gemelo",e:"Cardio",m:"Gemelo, cardiovascular",t:"cardio"},
  {n:"Plancha",g:"Core",e:"Peso corporal",m:"Transverso, recto abdominal, core",t:"a",err:"Levantar o hundir la cadera.",pasos:["Codos bajo los hombros", "Cuerpo en línea recta", "Aprieta glúteos y abdomen", "No subas la cadera", "Respira normal", "Mantén el tiempo objetivo"]},
  {n:"Plancha Lateral",g:"Core",e:"Peso corporal",m:"Oblicuos",t:"a"},
  {n:"Crunch Abdominal",g:"Core",e:"Peso corporal",m:"Recto abdominal (superior)",t:"a"},
  {n:"Crunch en Polea (Arrodillado)",g:"Core",e:"Polea",m:"Recto abdominal",t:"a"},
  {n:"Crunch en Máquina",g:"Core",e:"Máquina",m:"Recto abdominal",t:"a"},
  {n:"Elevación de Piernas Colgado",g:"Core",e:"Peso corporal",m:"Recto abdominal (inferior), flexores",t:"a",err:"Balancearse con impulso.",pasos:["Cuelga de la barra, brazos extendidos", "Hombros activos, no relajados", "Sube las piernas rectas o con rodillas dobladas", "Enrolla la pelvis arriba", "Sin balanceo del cuerpo", "Baja lento y controlado"]},
  {n:"Elevación de Piernas en Paralelas",g:"Core",e:"Peso corporal",m:"Abdomen inferior",t:"a"},
  {n:"Elevación de Piernas Tumbado",g:"Core",e:"Peso corporal",m:"Abdomen inferior",t:"a"},
  {n:"Russian Twist",g:"Core",e:"Disco",m:"Oblicuos",t:"a"},
  {n:"Rueda Abdominal (Ab Wheel)",g:"Core",e:"Peso corporal",m:"Core completo, recto abdominal",t:"c"},
  {n:"Mountain Climbers",g:"Core",e:"Peso corporal",m:"Core, cardiovascular",t:"c"},
  {n:"Bicycle Crunch",g:"Core",e:"Peso corporal",m:"Oblicuos, recto abdominal",t:"a"},
  {n:"Hollow Hold",g:"Core",e:"Peso corporal",m:"Core completo",t:"a"},
  {n:"Dead Bug",g:"Core",e:"Peso corporal",m:"Core profundo",t:"a"},
  {n:"Bird Dog",g:"Core",e:"Peso corporal",m:"Core, erectores",t:"a"},
  {n:"Pallof Press",g:"Core",e:"Polea",m:"Core antirrotación, oblicuos",t:"a"},
  {n:"Leñador en Polea (Wood Chop)",g:"Core",e:"Polea",m:"Oblicuos",t:"a"},
  {n:"Sit-Up",g:"Core",e:"Peso corporal",m:"Recto abdominal, flexores",t:"a"},
  {n:"Crunch Inverso",g:"Core",e:"Peso corporal",m:"Abdomen inferior",t:"a"},
  {n:"V-Up",g:"Core",e:"Peso corporal",m:"Recto abdominal completo",t:"a"},
  {n:"Toes to Bar",g:"Core",e:"Peso corporal",m:"Abdomen, dorsal",t:"c"},
  {n:"Dragon Flag",g:"Core",e:"Peso corporal",m:"Core completo",t:"c"},
  {n:"Plancha con Rotación",g:"Core",e:"Peso corporal",m:"Core, oblicuos",t:"a"},
  {n:"Side Bend con Mancuerna",g:"Core",e:"Mancuernas",m:"Oblicuos",t:"a"},
  {n:"Farmer's Walk",g:"Core",e:"Mancuernas",m:"Core, trapecio, agarre",t:"c"},
  {n:"Ab Rollout con Barra",g:"Core",e:"Barra",m:"Core completo",t:"c"},
  {n:"Copenhagen Plank",g:"Core",e:"Peso corporal",m:"Aductores, core",t:"a"},
  {n:"Curl de Muñeca con Barra",g:"Antebrazo",e:"Barra",m:"Flexores del antebrazo",t:"a"},
  {n:"Curl de Muñeca Inverso",g:"Antebrazo",e:"Barra",m:"Extensores del antebrazo",t:"a"},
  {n:"Curl de Muñeca con Mancuernas",g:"Antebrazo",e:"Mancuernas",m:"Flexores",t:"a"},
  {n:"Rodillo de Muñeca",g:"Antebrazo",e:"Barra",m:"Antebrazo completo",t:"a"},
  {n:"Agarre con Pinza (Grip)",g:"Antebrazo",e:"Mancuernas",m:"Fuerza de agarre",t:"a"},
  {n:"Dead Hang (Colgado)",g:"Antebrazo",e:"Peso corporal",m:"Agarre, dorsal",t:"a"},
  {n:"Paseo del Granjero",g:"Antebrazo",e:"Mancuernas",m:"Agarre, trapecio, core",t:"c"},
  {n:"Caminata en Cinta",g:"Cardio",e:"Cardio",m:"Cardiovascular",t:"cardio"},
  {n:"Caminata Inclinada",g:"Cardio",e:"Cardio",m:"Cardiovascular, glúteo",t:"cardio"},
  {n:"Carrera en Cinta",g:"Cardio",e:"Cardio",m:"Cardiovascular",t:"cardio"},
  {n:"Bicicleta Estática",g:"Cardio",e:"Cardio",m:"Cardiovascular, cuádriceps",t:"cardio"},
  {n:"Bicicleta de Aire (Assault Bike)",g:"Cardio",e:"Cardio",m:"Cardiovascular, cuerpo completo",t:"cardio"},
  {n:"Elíptica",g:"Cardio",e:"Cardio",m:"Cardiovascular",t:"cardio"},
  {n:"Remo (Máquina de Remo)",g:"Cardio",e:"Cardio",m:"Cardiovascular, espalda, pierna",t:"cardio"},
  {n:"Escaladora (StairMaster)",g:"Cardio",e:"Cardio",m:"Cardiovascular, glúteo",t:"cardio"},
  {n:"Cuerda de Batalla",g:"Cardio",e:"Cardio",m:"Cardiovascular, hombro, core",t:"cardio"},
  {n:"Burpees",g:"Cardio",e:"Peso corporal",m:"Cuerpo completo, cardiovascular",t:"cardio"},
  {n:"Salto al Cajón",g:"Cardio",e:"Peso corporal",m:"Pierna, potencia",t:"cardio"},
  {n:"Sprint",g:"Cardio",e:"Cardio",m:"Cardiovascular, pierna",t:"cardio"},
  {n:"Trineo (Sled Push)",g:"Cardio",e:"Cardio",m:"Pierna, cardiovascular",t:"cardio"},
  {n:"Jumping Jacks",g:"Cardio",e:"Peso corporal",m:"Cardiovascular",t:"cardio"},
  {n:"Comba (Cuerda de Saltar)",g:"Cardio",e:"Cardio",m:"Cardiovascular, gemelo",t:"cardio"},
  {n:"Clean (Cargada)",g:"Cuerpo completo",e:"Barra",m:"Cuerpo completo, potencia",t:"c"},
  {n:"Power Clean",g:"Cuerpo completo",e:"Barra",m:"Cadena posterior, potencia",t:"c"},
  {n:"Clean and Jerk",g:"Cuerpo completo",e:"Barra",m:"Cuerpo completo",t:"c"},
  {n:"Snatch (Arrancada)",g:"Cuerpo completo",e:"Barra",m:"Cuerpo completo, potencia",t:"c"},
  {n:"Thruster",g:"Cuerpo completo",e:"Barra",m:"Pierna, hombro",t:"c"},
  {n:"Turkish Get-Up",g:"Cuerpo completo",e:"Kettlebell",m:"Cuerpo completo, core",t:"c"},
  {n:"Man Maker",g:"Cuerpo completo",e:"Mancuernas",m:"Cuerpo completo",t:"c"},
  {n:"Clean con Mancuernas",g:"Cuerpo completo",e:"Mancuernas",m:"Cuerpo completo",t:"c"},
  {n:"Snatch con Kettlebell",g:"Cuerpo completo",e:"Kettlebell",m:"Cuerpo completo",t:"c"},
  {n:"Wall Ball",g:"Cuerpo completo",e:"Cardio",m:"Pierna, hombro, cardiovascular",t:"c"},
  /* ---- Añadidos ---- */
  {n:"Press de Banca con Barra (Pausa)",g:"Pecho",e:"Barra",m:"Pectoral mayor, tríceps",t:"c"},
  {n:"Aperturas en Máquina de Pie",g:"Pecho",e:"Máquina",m:"Pectoral mayor",t:"a"},
  {n:"Press Inclinado en Polea",g:"Pecho",e:"Polea",m:"Pectoral superior",t:"c"},
  {n:"Remo con Barra T con Apoyo",g:"Espalda",e:"Máquina",m:"Dorsal, trapecio medio",t:"c"},
  {n:"Jalón al Pecho en Máquina",g:"Espalda",e:"Máquina",m:"Dorsal ancho, bíceps",t:"c"},
  {n:"Remo Sentado en Máquina (Agarre Neutro)",g:"Espalda",e:"Máquina",m:"Dorsal, romboides",t:"c"},
  {n:"Pull-Over con Barra",g:"Espalda",e:"Barra",m:"Dorsal ancho, serrato",t:"a"},
  {n:"Press Militar en Máquina Hammer",g:"Hombro",e:"Máquina",m:"Deltoide anterior, tríceps",t:"c"},
  {n:"Elevación Lateral en Polea Baja Unilateral",g:"Hombro",e:"Polea",m:"Deltoide medio",t:"a"},
  {n:"Curl de Bíceps en Banco Inclinado (Cabeza Larga)",g:"Bíceps",e:"Mancuernas",m:"Bíceps cabeza larga",t:"a"},
  {n:"Curl Predicador en Polea",g:"Bíceps",e:"Polea",m:"Bíceps",t:"a"},
  {n:"Extensión de Tríceps a una Mano (Cuerda)",g:"Tríceps",e:"Polea",m:"Tríceps",t:"a"},
  {n:"Sentadilla Búlgara con Barra en Smith",g:"Cuádriceps",e:"Smith",m:"Cuádriceps, glúteo",t:"c"},
  {n:"Extensión de Cuádriceps Unilateral",g:"Cuádriceps",e:"Máquina",m:"Cuádriceps",t:"a"},
  {n:"Peso Muerto Rumano en Smith",g:"Femoral",e:"Smith",m:"Femoral, glúteo",t:"c"},
  {n:"Patada de Glúteo con Banda",g:"Glúteo",e:"Banda",m:"Glúteo mayor",t:"a"},
  {n:"Elevación de Talones en Máquina Sentado (Sóleo)",g:"Gemelo",e:"Máquina",m:"Sóleo",t:"a"},
  {n:"Crunch con Peso en Máquina",g:"Core",e:"Máquina",m:"Recto abdominal",t:"a"},
  {n:"Plancha con Peso",g:"Core",e:"Disco",m:"Core completo",t:"a"}
];
const GRUPOS=["Pecho","Espalda","Hombro","Bíceps","Tríceps","Cuádriceps","Femoral","Glúteo","Gemelo","Core","Antebrazo","Cardio","Cuerpo completo"];
const EQUIPOS=["Barra","Mancuernas","Máquina","Polea","Peso corporal","Kettlebell","Banda","Smith","Disco","Cardio"];

/* ============================================================
 *  BÚSQUEDA TOLERANTE + VARIANTES DE NOMBRES
 * ============================================================
 *  Un mismo ejercicio se conoce con distintos nombres. Aquí
 *  mapeamos apodos/sinónimos → nombre canónico para que el
 *  buscador entienda aunque no escribas el nombre exacto.
 */
const ALIAS_EJ={
  "Press de Banca con Barra":["press banca","bench","bench press","press pecho barra","press de pecho"],
  "Press de Banca Inclinado con Barra":["press inclinado barra","incline bench","inclinado barra"],
  "Press de Banca con Mancuernas":["press banca mancuernas","press pecho mancuernas","db bench","aperturas no"],
  "Press Inclinado con Mancuernas":["press inclinado mancuernas","incline db","inclinado con mancuernas"],
  "Aperturas con Mancuernas":["fly","flyes","aperturas","aberturas","volador"],
  "Pec-Fly (Peck Deck)":["pec deck","peck deck","pecdeck","contractor","mariposa","fly maquina","pec fly"],
  "Aperturas en Polea (Cruces)":["cruces","crossover","cruce de poleas","cables cruzados","aperturas polea"],
  "Fondos en Paralelas (Pecho)":["fondos","dips","paralelas"],
  "Flexiones":["push up","push-ups","lagartijas","planchas de brazos","pushups"],
  "Peso Muerto Convencional":["deadlift","peso muerto","pm","muerto"],
  "Peso Muerto Sumo":["sumo deadlift","muerto sumo"],
  "Dominadas (Pronación)":["dominadas","pull up","pull-ups","pullups","dominada pronada"],
  "Dominadas Supinas (Chin-ups)":["chin up","chin-ups","dominadas supinas","dominada supina"],
  "Jalón al Pecho (Agarre Abierto)":["jalon","jalón","jalon al pecho","lat pulldown","pulldown","polea al pecho","jalon abierto"],
  "Remo con Barra":["remo barra","barbell row","remo pendlay no","remo t no"],
  "Remo con Mancuerna a una Mano":["remo mancuerna","remo unilateral","one arm row","serrucho"],
  "Remo en Polea Baja (Sentado)":["remo polea","remo sentado","seated row","remo bajo","remo en polea"],
  "Remo en T (T-Bar)":["remo t","t-bar","tbar row","remo en t"],
  "Face Pull":["facepull","face-pull","jalon a la cara","tiron a la cara"],
  "Encogimientos con Mancuernas":["encogimientos","shrugs","trapecios","encogimiento hombros"],
  "Press Militar con Barra (De Pie)":["press militar","military press","ohp","overhead press","press hombro barra"],
  "Press de Hombro con Mancuernas":["press hombro mancuernas","shoulder press","press hombros","press militar mancuernas"],
  "Press Arnold":["arnold","press arnold"],
  "Elevaciones Laterales con Mancuernas":["elevaciones laterales","laterales","lateral raise","vuelos laterales","elevacion lateral"],
  "Elevaciones Frontales con Mancuernas":["elevaciones frontales","front raise","frontales"],
  "Pájaros con Mancuernas":["pajaros","pájaros","reverse fly","vuelos posteriores","deltoide posterior"],
  "Remo al Mentón":["remo menton","remo al menton","upright row","jalon al menton"],
  "Curl con Barra":["curl barra","barbell curl","curl biceps barra","biceps barra"],
  "Curl con Mancuernas":["curl mancuernas","curl biceps","db curl","biceps mancuernas"],
  "Curl Martillo":["martillo","hammer curl","curl martillo","hammer"],
  "Curl Predicador (Scott) con Barra":["predicador","scott curl","banco scott","curl predicador","preacher curl"],
  "Curl Concentrado":["concentrado","concentration curl"],
  "Extensión de Tríceps en Polea (Cuerda)":["extension triceps","triceps polea","pushdown","jalon triceps","triceps cuerda","extension de triceps"],
  "Press Francés con Barra":["press frances","frances","skull crusher","rompecraneos","skullcrusher"],
  "Extensión Tras Nuca con Mancuerna":["tras nuca","extension tras nuca","triceps tras nuca","overhead triceps","frances tras nuca"],
  "Press Cerrado en Banca":["press cerrado","close grip","agarre cerrado banca"],
  "Patada de Tríceps con Mancuerna":["patada triceps","kickback","patadas de triceps"],
  "Sentadilla con Barra (Trasera)":["sentadilla","squat","back squat","sentadilla trasera","sentadillas"],
  "Sentadilla Frontal":["front squat","sentadilla frontal","frontal"],
  "Sentadilla Goblet":["goblet","goblet squat","sentadilla copa"],
  "Sentadilla Búlgara":["bulgara","búlgara","bulgarian","split squat","zancada bulgara","sentadilla bulgara"],
  "Sentadilla Hack":["hack squat","hack","sentadilla hack"],
  "Prensa de Piernas (45°)":["prensa","leg press","prensa de piernas","prensa 45"],
  "Extensión de Rodilla (Cuádriceps)":["extension de rodilla","leg extension","cuadriceps maquina","extensiones de cuadriceps","extension cuadriceps","silla de cuadriceps"],
  "Zancadas con Mancuernas":["zancadas","lunges","desplantes","estocadas","zancada"],
  "Curl Femoral Tumbado":["curl femoral","femoral","leg curl","curl de femoral","isquios maquina","femoral tumbado"],
  "Curl Femoral Sentado":["femoral sentado","seated leg curl","curl femoral sentado"],
  "Peso Muerto Rumano con Barra":["peso muerto rumano","rumano","rdl","romanian deadlift","muerto rumano"],
  "Hip Thrust con Barra":["hip thrust","empuje de cadera","puente de cadera con barra"],
  "Abductores en Máquina":["abductores","abductor","abduccion","hip abduction"],
  "Aductores en Máquina":["aductores","aductor","aduccion","hip adduction"],
  "Elevación de Talones de Pie":["gemelos","pantorrillas","calf raise","elevacion de talones","talones","calves"],
  "Plancha":["plank","plancha abdominal","plancha isometrica"],
  "Crunch Abdominal":["crunch","abdominales","crunches","encogimiento abdominal"],
  "Elevación de Piernas Colgado":["elevacion de piernas","hanging leg raise","leg raise","piernas colgado"],
  "Russian Twist":["russian twist","giro ruso","twist ruso","oblicuos giro"],
  "Rueda Abdominal (Ab Wheel)":["ab wheel","rueda abdominal","ab roller","rueda"],
  "Elíptica":["eliptica","elliptical"],
  "Bicicleta Estática":["bici","bicicleta","spinning","bicicleta estatica"],
  "Caminata en Cinta":["caminadora","cinta","treadmill","caminar","trotadora"],
};
/* Índice inverso: término normalizado (sin acentos) → nombre canónico */
const ALIAS_INDEX=(function(){
  const idx={};
  Object.entries(ALIAS_EJ).forEach(([canon,arr])=>{
    arr.forEach(a=>{idx[stripAcc(a)]=canon});
  });
  return idx;
})();

/* Quita acentos y baja a minúsculas: "Jalón" → "jalon" */
function stripAcc(s){
  return (s||"").toString().toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g,"")
    .replace(/\s+/g," ").trim();
}
/* Texto buscable de un ejercicio: nombre + músculos + grupo + equipo + alias */
function textoBuscable(e){
  const alias=(ALIAS_EJ[e.n]||[]).join(" ");
  return stripAcc([e.n,e.m,e.g,e.e,alias].join(" "));
}
/* ¿Coincide el ejercicio con la consulta? Tolerante: sin acentos y por tokens.
   "jalon", "press incl", "pec deck" o "curl biceps" encuentran el ejercicio
   aunque no escribas el nombre exacto. */
function coincideEj(e,nq){
  if(!nq)return true;
  const hay=textoBuscable(e);
  if(hay.includes(nq))return true;
  // por tokens: todas las palabras de la consulta deben aparecer
  const toks=nq.split(" ").filter(Boolean);
  return toks.length>1 && toks.every(t=>hay.includes(t));
}
/* Búsqueda de ejercicios en la librería */
function buscarEjs(q,grupo,equipo){
  const nq=stripAcc(q);
  // ¿la consulta apunta a un alias directo? (ej. "sentadilla" → Sentadilla con Barra)
  const aliasCanon=nq&&ALIAS_INDEX[nq];
  const res=EJS.filter(e=>{
    if(grupo&&e.g!==grupo)return false;
    if(equipo&&e.e!==equipo)return false;
    return coincideEj(e,nq);
  });
  // si el término es un apodo exacto, prioriza el ejercicio canónico
  if(aliasCanon){
    res.sort((a,b)=>(a.n===aliasCanon?-1:0)-(b.n===aliasCanon?-1:0));
  }
  return res;
}
function ejPorNombre(n){
  const nn=normEx(n);
  const exacto=EJS.find(e=>normEx(e.n)===nn);
  if(exacto)return exacto;
  // ¿es un apodo/sinónimo conocido?
  const canon=ALIAS_INDEX[stripAcc(n)];
  if(canon)return EJS.find(e=>e.n===canon)||null;
  return null;
}
/* El diccionario ahora usa la librería completa */
const DICC=EJS;

let dicFilter="Todos",dicSearch="",dicEquipo="Todo";
function renderDiccionario(){
  const wrap=document.getElementById("tab-diccionario");
  wrap.innerHTML=`<div class="sec-title">Diccionario técnico</div>
    <div class="dic-count" id="dicCount"></div>
    <input class="search" id="dicSearch" placeholder="Buscar entre ${EJS.length} ejercicios..." value="${dicSearch}">
    <div class="chips" id="chips">${["Todos",...GRUPOS].map(g=>`<button class="chip${g===dicFilter?" active":""}" data-g="${g}">${g}</button>`).join("")}</div>
    <div class="chips eq" id="chipsEq">${["Todo",...EQUIPOS].map(g=>`<button class="chip sm${g===dicEquipo?" active":""}" data-e="${g}">${g}</button>`).join("")}</div>
    <div id="dicList"></div>`;
  const si=wrap.querySelector("#dicSearch");
  si.oninput=e=>{dicSearch=e.target.value;paintDic();si.focus()};
  wrap.querySelectorAll("#chips .chip").forEach(c=>c.onclick=()=>{dicFilter=c.dataset.g;renderDiccionario()});
  wrap.querySelectorAll("#chipsEq .chip").forEach(c=>c.onclick=()=>{dicEquipo=c.dataset.e;renderDiccionario()});
  paintDic();
}
function paintDic(){
  const list=document.getElementById("dicList");if(!list)return;
  const q=stripAcc(dicSearch);
  const res=EJS.filter(d=>{
    if(dicFilter!=="Todos"&&d.g!==dicFilter)return false;
    if(dicEquipo!=="Todo"&&d.e!==dicEquipo)return false;
    return coincideEj(d,q);
  });
  const cnt=document.getElementById("dicCount");
  if(cnt)cnt.textContent=res.length+(res.length===1?" ejercicio":" ejercicios");
  if(!res.length){
    list.innerHTML=`<div class="dic-empty">${ICON('book',24)}<div>Sin resultados</div>
      <small>Prueba con otro nombre, grupo o equipo.</small></div>`;
    return;
  }
  list.innerHTML="";
  res.forEach(d=>{
    const card=document.createElement("div");card.className="dic-card";
    const tipo=d.t==="c"?"Compuesto":d.t==="cardio"?"Cardio":"Aislamiento";
    const pasos=d.pasos?d.pasos.map((p,i)=>`<div class="check" data-i="${i}"><div class="box">${ICON('check',14)}</div><div class="txt">${p}</div></div>`).join(""):"";
    const q=encodeURIComponent(d.n+" técnica correcta");
    card.innerHTML=`<div class="dic-head">
        <span class="dn">${d.n}</span>
        <span class="dg">${d.g}</span>
        <span class="chev">${ICON('chevron',18)}</span>
      </div>
      <div class="dic-body">
        <div class="dic-tags">
          <span class="dtag eq">${ICON('dumbbell',11)} ${d.e}</span>
          <span class="dtag ${d.t}">${tipo}</span>
        </div>
        <div class="dic-meta"><span class="dm-lbl">Músculos</span> ${d.m||"—"}</div>
        <div class="videobox"><a href="https://www.youtube.com/results?search_query=${q}" target="_blank" rel="noopener">
          <span class="play">${ICON('play',18)}</span>Ver demostración en video</a></div>
        ${pasos?`<h4 class="dic-h">Técnica paso a paso</h4>${pasos}`:""}
        ${d.err?`<div class="dic-err">${ICON('warn',15)}<div><b>Error común:</b> ${d.err}</div></div>`:""}
      </div>`;
    card.querySelector(".dic-head").onclick=()=>{
      const abierto=card.classList.contains("open");
      list.querySelectorAll(".dic-card").forEach(c=>c.classList.remove("open"));
      if(!abierto)card.classList.add("open");
    };
    card.querySelectorAll(".check").forEach(c=>c.onclick=()=>c.classList.toggle("on"));
    list.appendChild(card);
  });
}

function detectFatiga(){
  const alerts=[];
  Object.keys(DB).forEach(id=>{
    const hist=DB[id];if(Array.isArray(hist)){
      const last=hist[hist.length-1];if(!last)return;
      const rpe10=last.sets.filter(s=>parseFloat(s.rpe)>=10).length;
      if(rpe10>=3){
        const name=id.startsWith("ex:")?id.slice(3):"ejercicio";
        alerts.push(name);
      }
    }
  });
  return alerts;
}
function renderPrevencion(){
  const wrap=document.getElementById("tab-prevencion");
  const fatiga=detectFatiga();
  let html=`<div class="sec-title">Prevención de lesiones</div>`;
  if(fatiga.length){
    html+=`<div class="alert warn"><div class="at">${ICON('warn',16)} Alerta de fatiga</div>
      <p>Registraste 3 o más series al fallo (RPE 10) en <b>${fatiga.join(", ")}</b>. Considera bajar el volumen o el peso en la próxima sesión para evitar sobreentrenamiento y riesgo de lesión. El fallo constante no acelera el progreso; la recuperación sí.</p></div>`;
  }else{
    html+=`<div class="alert warn" style="border-color:var(--ok);background:linear-gradient(135deg,rgba(0,208,156,.1),rgba(43,92,255,.08))">
      <div class="at" style="color:var(--ok)">${ICON('check',16)} Carga bajo control</div>
      <p>No se detectan señales de fatiga excesiva en tu último registro. Sigue registrando el RPE para vigilar tu esfuerzo automáticamente.</p></div>`;
  }
  const tips=[
    ["Codos en los presses","Mantén los codos a ~45° del torso, no abiertos a 90°. Protege el hombro y distribuye mejor la carga al pecho y tríceps."],
    ["Guiño de glúteo (butt wink)","En la sentadilla, evita que la pelvis se retroverse al fondo. Baja solo hasta donde mantengas la lumbar neutra; mejora movilidad de tobillo y cadera."],
    ["Escápulas en el jalón","Inicia cada repetición deprimiendo y retrayendo las escápulas, no tirando solo con los brazos. Protege el manguito rotador."],
    ["Rodilla en la prensa","No bloquees las rodillas de golpe arriba ni dejes que se hundan hacia adentro. Alinea rodilla con la punta del pie."],
    ["Lumbar en el peso muerto","Espalda neutra siempre. Si se redondea, baja el peso. Empuja el piso y lleva cadera y pecho a la vez."],
  ];
  tips.forEach(t=>html+=`<div class="tip"><h6>${t[0]}</h6><p>${t[1]}</p></div>`);
  wrap.innerHTML=html;
}

