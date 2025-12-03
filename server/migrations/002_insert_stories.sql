-- SQL script to insert stories from saved_stories.json
-- Generated automatically - DO NOT EDIT MANUALLY

-- Start transaction
BEGIN;

INSERT INTO stories (id, title, content, language, image_url, source, ip_address, tag, created_at)
VALUES (
  gen_random_uuid(),
  'Orgullo y prejuicio',
  'En un pequeño bosque vivían dos grupos de criaturas mágicas: los duendes y las hadas. Los duendes eran conocidos por su gran habilidad en la jardinería, mientras que las hadas eran famosas por su destreza en la creación de pociones mágicas. A pesar de ser vecinos, los duendes y las hadas no se llevaban bien. Había un profundo orgullo y prejuicio entre ambos grupos.

Un día, una hada llamada Aurora decidió romper con esta tradición y visitar el jardín de los duendes. Los duendes, al verla acercarse, fruncieron el ceño y se prepararon para defender su territorio. Pero Aurora les sonrió amablemente y les dijo que quería aprender de su talento en la jardinería.

Los duendes, sorprendidos por la actitud de Aurora, decidieron darle una oportunidad. Le enseñaron cómo sembrar semillas, cuidar las plantas y crear hermosos arreglos florales. Aurora estaba encantada con todo lo que aprendía y agradecida por la amabilidad de los duendes.

Mientras tanto, en el bosque de las hadas, un duende llamado Mateo también decidió desafiar las normas y visitar a las hadas. Al principio, las hadas lo miraron con desconfianza, pero Mateo les demostró su interés genuino en aprender sobre las pociones mágicas.

Las hadas le enseñaron a recoger ingredientes especiales, mezclarlos con cuidado y crear pociones con propiedades mágicas. Mateo estaba fascinado por todo lo que aprendía y agradecido por la generosidad de las hadas.

Con el tiempo, los duendes y las hadas comenzaron a trabajar juntos, compartiendo sus conocimientos y habilidades. Descubrieron que, a pesar de sus diferencias, tenían mucho en común y podían aprender mucho unos de otros.

Finalmente, un día de celebración se llevó a cabo en el bosque, donde los duendes y las hadas mostraron sus creaciones conjuntas. Jardines llenos de flores mágicas y pociones con efectos sorprendentes adornaban el lugar. Todos los habitantes del bosque se maravillaron con lo que los duendes y las hadas habían logrado juntos.

Desde ese día, el orgullo y el prejuicio desaparecieron del bosque, dando paso a la colaboración y la amistad entre duendes y hadas. Aprendieron que, al trabajar juntos y respetar las diferencias de los demás, podían lograr cosas maravillosas. Y así, el bosque se llenó de magia y armonía para siempre.',
  'es',
  NULL,
  'openai',
  'migrated',
  NULL,
  '2025-06-05T13:02:49.719Z'::timestamp
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stories (id, title, content, language, image_url, source, ip_address, tag, created_at)
VALUES (
  gen_random_uuid(),
  'Little_Red_Riding_Hood',
  'Little Red Riding Hood  Once upon a time, there was a sweet little girl who lived with her mother in a cottage near the forest. Everyone who saw her loved her, but most of all her grandmother, who gave her a little red riding hood. So everyone called her Little Red Riding Hood. One day, her mother said, "Take this basket of goodies to your grandmother''s house, but don''t stray from the path!" So Little Red Riding Hood set off, but she met a wolf along the way. The wolf asked her where she was going, and she innocently told him. The   wolf   took   a   shortcut   and   arrived   at   the   grandmother''s   house   first.   He   swallowed   the grandmother whole, put on her clothes, and got into her bed. When Little Red Riding Hood arrived, she noticed her grandmother looked strange. "Oh, Grandmother, what big eyes you have!" "All the better to see you with, my dear." "Oh, Grandmother, what big ears you have!" "All the better to hear you with, my dear." "Oh, Grandmother, what big teeth you have!" "All the better to eat you with!" And with that, the wolf jumped out of bed and swallowed Little Red Riding Hood too. But just then, a hunter was passing by and heard the commotion. He rushed in and rescued both the girl and her grandmother by cutting open the wolf''s belly. They all lived happily ever after.

The End.

',
  'en',
  NULL,
  'pdf',
  'migrated',
  NULL,
  '2025-06-05T13:20:14.079Z'::timestamp
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stories (id, title, content, language, image_url, source, ip_address, tag, created_at)
VALUES (
  gen_random_uuid(),
  'Pinocho',
  'Había una vez en un pequeño pueblo, un carpintero llamado Geppetto. Geppetto era un hombre amable y solitario que soñaba con tener un hijo. Un día, decidió tallar un muñeco de madera y le dio el nombre de Pinocho.

Tan pronto como Geppetto terminó de tallar a Pinocho, algo mágico sucedió. El muñeco cobró vida y comenzó a moverse y a hablar. Geppetto estaba sorprendido y emocionado al ver a Pinocho convertirse en un niño de verdad.

Pinocho, curioso y travieso, pronto se metió en problemas. Un hada buena le advirtió que si quería convertirse en un niño de verdad, debía ser bueno, honesto y generoso. Pero Pinocho, tentado por la diversión y las travesuras, desobedecía las reglas una y otra vez.

Un día, Pinocho conoció a un zorro astuto y a un gato malicioso que lo convencieron de ir al País de los Juguetes, un lugar donde los niños podían jugar todo el día. Sin dudarlo, Pinocho los siguió y pronto descubrió que el País de los Juguetes escondía un oscuro secreto.

Los niños que jugaban allí se convertían en burros y eran vendidos como esclavos. Pinocho, asustado y arrepentido, decidió escapar y buscar a Geppetto para pedirle perdón por su comportamiento.

Después de muchas aventuras y peligros, Pinocho finalmente encontró a Geppetto atrapado en la barriga de una ballena gigante. Sin pensarlo dos veces, Pinocho se lanzó al mar y logró rescatar a su querido padre.

El hada buena, conmovida por el acto valiente y generoso de Pinocho, decidió cumplir su deseo de convertirse en un niño de verdad. Desde ese día, Pinocho se convirtió en un niño de carne y hueso, aprendiendo la importancia de la honestidad, la bondad y el amor hacia los demás.

Y así, Pinocho y Geppetto vivieron felices para siempre, recordando siempre que la verdadera magia reside en el corazón de aquellos que saben hacer el bien.',
  'es',
  NULL,
  'openai',
  'migrated',
  NULL,
  '2025-06-05T13:17:48.657Z'::timestamp
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stories (id, title, content, language, image_url, source, ip_address, tag, created_at)
VALUES (
  gen_random_uuid(),
  'Perseo',
  'Había una vez en la antigua Grecia, un valiente héroe llamado Perseo. Perseo era un joven muy valiente y decidido que vivía en la isla de Serifos con su madre Dánae. Un día, el rey Polidectes le pidió a Perseo un favor muy difícil: traerle la cabeza de Medusa, un monstruo con serpientes en lugar de cabello que convertía en piedra a quien la mirara a los ojos.

Perseo sabía que esta tarea era casi imposible, pero decidió aceptar el desafío para proteger a su madre y demostrar su valentía. Los dioses del Olimpo, viendo la determinación de Perseo, decidieron ayudarlo en su misión. Hermes le dio sandalias aladas para volar, Atenea le regaló un escudo brillante pulido como un espejo, y Hades le dio un casco que lo hacía invisible.

Armado con estos regalos divinos, Perseo partió en busca de Medusa. Tras muchas aventuras y peligros, finalmente llegó a la guarida de la Gorgona. Con mucho cuidado, Perseo usó su escudo para ver el reflejo de Medusa sin mirarla directamente a los ojos y logró cortarle la cabeza con su espada.

De regreso a Serifos, Perseo usó la cabeza de Medusa para convertir en piedra al malvado rey Polidectes, quien había tratado de hacerle daño a su madre. Perseo liberó a su madre Dánae y juntos regresaron a salvo a su hogar.

Desde ese día, Perseo fue aclamado como un verdadero héroe en Grecia. Su valentía y determinación lo convirtieron en una leyenda que sería recordada por generaciones. Perseo demostró que con coraje y la ayuda de los dioses, cualquier desafío, por más difícil que parezca, puede ser superado.

Y así, Perseo vivió feliz junto a su madre, sabiendo que siempre sería recordado como el héroe que venció a la temible Medusa y protegió a quienes amaba.',
  'es',
  NULL,
  'openai',
  'migrated',
  NULL,
  '2025-06-05T13:18:50.652Z'::timestamp
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stories (id, title, content, language, image_url, source, ip_address, tag, created_at)
VALUES (
  gen_random_uuid(),
  'Leyenda del alicanto',
  'Había una vez en las profundidades de los bosques de Chile, una criatura mágica conocida como el alicanto. Se decía que este pájaro brillante poseía un plumaje dorado que relucía con la luz del sol como si fuera un tesoro. Los lugareños contaban que el alicanto era capaz de encontrar vetas de oro y plata escondidas en las montañas.

En un pequeño pueblo rodeado de altas montañas, vivía un niño llamado Mateo. Mateo siempre había soñado con ver al alicanto y descubrir su tesoro brillante. Una noche, mientras miraba las estrellas desde su ventana, escuchó un canto suave y melodioso que lo llamaba desde lo profundo del bosque.

Intrigado, Mateo decidió seguir el canto del alicanto. Con valentía, se adentró en el bosque oscuro y frondoso, guiado por la luz dorada que brillaba entre los árboles. Finalmente, llegó a un claro donde vio al alicanto posado en una rama, con su plumaje resplandeciente como el sol.

El alicanto miró a Mateo con sus ojos brillantes y le habló con una voz suave y melodiosa. Le dijo que solo aquellos con un corazón puro y noble podían verlo y ser bendecidos con su fortuna. Mateo, emocionado y agradecido, le prometió al alicanto que protegería el bosque y a todas sus criaturas mágicas.

Desde ese día, Mateo se convirtió en el guardián del bosque, velando por la naturaleza y sus habitantes. El alicanto lo visitaba de vez en cuando, trayéndole regalos de oro y plata como agradecimiento por su bondad y dedicación. Mateo se convirtió en una leyenda en el pueblo, conocido por su valentía y generosidad.

Y así, la leyenda del alicanto y Mateo perduró a lo largo de los años, recordándonos que la verdadera riqueza se encuentra en el corazón de aquellos que protegen y cuidan la naturaleza con amor y respeto.',
  'es',
  NULL,
  'openai',
  'migrated',
  NULL,
  '2025-06-05T13:42:52.697Z'::timestamp
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stories (id, title, content, language, image_url, source, ip_address, tag, created_at)
VALUES (
  gen_random_uuid(),
  'El Ojo de Horus',
  'Hace mucho tiempo, en el antiguo Egipto, existía una leyenda sobre El Ojo de Horus, un poderoso amuleto que protegía a quienes lo llevaban consigo. Según la mitología egipcia, Horus era el dios halcón del cielo, hijo de Osiris y de Isis, y su ojo derecho representaba el sol, mientras que el izquierdo simbolizaba la luna.

La historia cuenta que un día, durante una gran batalla entre Horus y su tío Seth, el dios de la oscuridad y el caos, Seth hirió el ojo izquierdo de Horus. El ojo quedó dañado, pero Thot, el sabio dios de la escritura y la sabiduría, lo sanó y lo convirtió en un amuleto protector, conocido como El Ojo de Horus.

El amuleto tenía la forma de un ojo humano con marcas que representaban las diferentes partes del ojo, cada una con un significado especial. El símbolo del ojo completo representaba la sanación, la protección, la salud y el poder divino de Horus. Los egipcios creían que llevar El Ojo de Horus les proporcionaba fuerza y protección contra el mal.

Los padres egipcios solían regalar a sus hijos pequeños amuletos con la forma del ojo de Horus para protegerlos de cualquier peligro. Les enseñaban que, al igual que el amuleto, debían cuidar de sus seres queridos y estar siempre listos para proteger a los demás.

Así, El Ojo de Horus se convirtió en un símbolo de bondad, protección y amor en la antigua cultura egipcia, recordándonos que, incluso en los momentos más oscuros, la luz y la bondad siempre prevalecen.',
  'es',
  NULL,
  'openai',
  'migrated',
  NULL,
  '2025-06-05T14:30:51.592Z'::timestamp
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stories (id, title, content, language, image_url, source, ip_address, tag, created_at)
VALUES (
  gen_random_uuid(),
  'Título: Orfeo y Eurídice',
  'Orfeo era un músico talentoso que amaba a Eurídice. Cuando ella murió, Orfeo descendió al inframundo para rescatarla. Hizo sonar su lira tan hermosamente que conmovió a Hades, el dios del inframundo, quien le permitió llevarse a Eurídice de vuelta a la Tierra. Sin embargo, Orfeo no debía mirar atrás hasta salir completamente del inframundo, pero lo hizo y la perdió para siempre. Esta historia nos enseña el valor de la paciencia y la confianza en lo desconocido.',
  'es',
  NULL,
  'openai',
  'migrated',
  NULL,
  '2025-06-05T14:31:35.752Z'::timestamp
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stories (id, title, content, language, image_url, source, ip_address, tag, created_at)
VALUES (
  gen_random_uuid(),
  'Título: El juicio de Paris',
  'Paris, un joven pastor troyano, fue elegido para decidir quién de las diosas Hera, Atenea y Afrodita era la más hermosa. Cada diosa le ofreció un regalo, y Paris eligió a Afrodita, quien le prometió el amor de la mujer más bella, Helena. Este acto desencadenó la guerra de Troya. La historia nos recuerda que nuestras elecciones pueden tener consecuencias inesperadas.',
  'es',
  NULL,
  'openai',
  'migrated',
  NULL,
  '2025-06-05T14:31:35.771Z'::timestamp
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stories (id, title, content, language, image_url, source, ip_address, tag, created_at)
VALUES (
  gen_random_uuid(),
  'La Golondrina de Paris',
  'Hace mucho tiempo, en la hermosa ciudad de París, vivía una golondrina muy especial llamada Celestina. Celestina era conocida por su hermoso canto y sus elegantes vuelos por los cielos de la ciudad. La gente de París la amaba y la admiraba por su gracia y alegría.

Una tarde de primavera, mientras Celestina volaba sobre los tejados de la ciudad, escuchó una melodía misteriosa que la llamaba desde lo alto de la Torre Eiffel. Intrigada, decidió acercarse y descubrió que la melodía provenía de una hermosa sirena que había llegado desde el lejano océano para visitar París.

La sirena le contó a Celestina sobre la magia del mar, las criaturas marinas y los tesoros que yacían en las profundidades del océano. Celestina quedó maravillada con las historias de la sirena y juntas pasaron días explorando la ciudad y compartiendo sus experiencias.

Pero una noche, mientras volaban sobre el río Sena, la sirena se sintió triste al darse cuenta de que extrañaba su hogar en el mar. Celestina, con el corazón entristecido al ver a su amiga triste, decidió ayudarla. Recordó las palabras de la sirena sobre los tesoros ocultos en el océano y pensó en cómo podría llevar un poco de esa magia a París.

Así que, con la ayuda de sus amigos pájaros y animales de la ciudad, Celestina recolectó piedras preciosas, conchas y tesoros del río Sena. Con mucho esfuerzo, construyeron una hermosa fuente en el centro de París, decorada con los tesoros del mar. La fuente brillaba bajo el sol y el agua danzaba al son de la melodía de Celestina.

La sirena, al ver la fuente y escuchar el canto alegre de Celestina, se llenó de alegría y gratitud. Agradeció a Celestina y a los habitantes de París por su generosidad y les prometió volver a visitar la ciudad siempre que quisieran escuchar sus historias del mar.

Y así, Celestina aprendió que la verdadera amistad y la generosidad pueden traer magia a nuestras vidas, incluso en los momentos más difíciles. La golondrina de París y la sirena del mar se convirtieron en leyendas, recordadas por su amistad y por la fuente mágica que unió dos mundos tan diferentes pero tan especiales.

Y desde entonces, cada vez que escuches el canto alegre de una golondrina en París, recuerda que la amistad y la bondad pueden crear la magia más hermosa en nuestras vidas.',
  'es',
  NULL,
  'openai',
  'migrated',
  NULL,
  '2025-06-05T14:34:22.718Z'::timestamp
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stories (id, title, content, language, image_url, source, ip_address, tag, created_at)
VALUES (
  gen_random_uuid(),
  'Pandora y la Caja',
  'Pandora era una mujer curiosa creada por Zeus, el rey de los dioses. Zeus le regaló una caja misteriosa y le advirtió que nunca la abriera. Sin embargo, la curiosidad de Pandora era más fuerte y un día, tentada por la intriga, abrió la caja.

De la caja salieron males como la enfermedad, la pobreza y la guerra, que se dispersaron por el mundo. Aterrada, Pandora cerró la caja justo a tiempo para retener una última cosa: la esperanza. Aunque los males se habían liberado, la esperanza permaneció como un rayo de luz en la oscuridad.

Esta historia nos enseña que la curiosidad puede llevarnos a problemas, pero siempre hay esperanza incluso en los momentos más difíciles. Nos recuerda que, a pesar de los desafíos, siempre podemos encontrar esperanza para seguir adelante.',
  'es',
  NULL,
  'openai',
  'migrated',
  NULL,
  '2025-06-06T12:35:56.947Z'::timestamp
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stories (id, title, content, language, image_url, source, ip_address, tag, created_at)
VALUES (
  gen_random_uuid(),
  'Orfeo y Euridice',
  'Hace mucho tiempo, en la antigua Grecia, vivían dos jóvenes llamados Orfeo y Eurídice. Orfeo era un talentoso músico que tocaba la lira de manera tan hermosa que los pájaros dejaban de cantar para escucharlo. Eurídice, por otro lado, era conocida por su gracia y belleza, así como por su amor por la naturaleza.

Un día, Eurídice fue mordida por una serpiente venenosa y cayó enferma. A pesar de los esfuerzos de Orfeo por curarla con su música, Eurídice falleció y fue llevada al inframundo, el reino de Hades y Perséfone.

Orfeo, desconsolado por la pérdida de su amada, decidió emprender un peligroso viaje al inframundo para intentar traer de vuelta a Eurídice. Armado con su lira, Orfeo descendió a las profundidades de la tierra, desafiando a las criaturas y peligros que se interponían en su camino.

Al llegar ante Hades y Perséfone, Orfeo comenzó a tocar su lira y cantar con tanta tristeza que movió los corazones de los dioses del inframundo. Conmovidos por su música y su amor por Eurídice, Hades y Perséfone acordaron devolver a Eurídice a la vida con una condición: Orfeo no debía mirar hacia atrás hasta que ambos estuvieran fuera del inframundo.

Con gran esperanza, Orfeo comenzó a ascender hacia la superficie, con Eurídice siguiéndolo de cerca en las sombras. A medida que se acercaban a la salida, Orfeo empezó a dudar y, temeroso de perder a su amada nuevamente, volteó a mirarla. En ese instante, Eurídice desapareció, condenada a permanecer en el inframundo para siempre.

Orfeo, lleno de tristeza y arrepentimiento, regresó al mundo de los vivos sin su amada. A partir de ese día, su música ya no era alegre ni hermosa, sino melancólica y desgarradora. La historia de Orfeo y Eurídice se convirtió en un recordatorio de la importancia de la fe, la paciencia y la valentía, así como de las consecuencias de la desobediencia y la impaciencia.

Y así, la leyenda de Orfeo y Eurídice perduró a lo largo de los siglos como un cuento de amor, sacrificio y la eterna lucha por la redención.',
  'es',
  NULL,
  'openai',
  'migrated',
  NULL,
  '2025-06-07T18:07:39.006Z'::timestamp
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stories (id, title, content, language, image_url, source, ip_address, tag, created_at)
VALUES (
  gen_random_uuid(),
  'La Cuerda de Seshat',
  'Hace mucho tiempo, en el antiguo Egipto, existía una cuerda muy especial conocida como La Cuerda de Seshat. Seshat era la diosa de la escritura, la sabiduría y la arquitectura, y se decía que esta cuerda mágica tenía el poder de medir y construir todo lo que existía en el mundo.

La Cuerda de Seshat era larga y fina, de un color dorado brillante que relucía bajo el sol del desierto. Se decía que quien lograra dominar su poder, podría crear maravillas y aprender los secretos del universo.

Un joven llamado Amón, curioso y valiente, decidió emprender un viaje para encontrar La Cuerda de Seshat y descubrir qué secretos guardaba. Durante su travesía, Amón enfrentó desafíos y peligros, pero su determinación nunca flaqueó.

Finalmente, después de muchos días de búsqueda, Amón llegó a un antiguo templo en medio del desierto. Allí, en una habitación secreta, encontró La Cuerda de Seshat, brillando con una luz mágica y llena de promesas.

Con cuidado y respeto, Amón tomó la cuerda en sus manos y sintió una energía poderosa recorrer su ser. Entonces, decidió usarla para medir grandes distancias, trazar mapas y construir puentes que unieran a las personas.

Con el paso del tiempo, la fama de Amón y su habilidad para usar La Cuerda de Seshat se extendieron por todo el país. Muchos acudían a él en busca de ayuda y consejo, y él siempre los recibía con bondad y sabiduría.

La lección de esta historia es que el conocimiento y la sabiduría pueden ser poderosos, pero es importante usarlos con responsabilidad y generosidad. Así como Amón compartió los dones de La Cuerda de Seshat con los demás, nosotros también debemos compartir nuestros talentos y aprendizajes para construir un mundo mejor para todos.',
  'es',
  NULL,
  'openai',
  'migrated',
  NULL,
  '2025-06-07T18:47:45.233Z'::timestamp
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stories (id, title, content, language, image_url, source, ip_address, tag, created_at)
VALUES (
  gen_random_uuid(),
  'Blancanieves y los 7 enanitos',
  'Hace mucho tiempo, en un reino lejano, vivía una hermosa princesa llamada Blancanieves. Ella era conocida por su piel tan blanca como la nieve y sus cabellos tan negros como el ébano. Blancanieves vivía en un castillo con su malvada madrastra, la Reina, quien era muy vanidosa y envidiosa de la belleza de Blancanieves.

Un día, la Reina le preguntó a su espejo mágico quién era la más hermosa del reino y el espejo respondió que Blancanieves era la más bella de todas. La Reina, llena de ira y envidia, ordenó a un cazador que llevara a Blancanieves al bosque y la matara. Pero el cazador, con un corazón noble, no pudo hacerle daño a la princesa y la dejó escapar.

Blancanieves corrió asustada por el oscuro bosque hasta que llegó a una pequeña cabaña donde vivían siete enanitos. Ellos la acogieron con cariño y Blancanieves decidió quedarse con ellos y ayudarles en sus tareas diarias. Los enanitos eran muy amables y trabajaban juntos en armonía.

Mientras tanto, la malvada Reina descubrió que Blancanieves seguía viva y decidió ir personalmente a acabar con ella. La Reina disfrazada de anciana ofreció a Blancanieves una manzana envenenada. Blancanieves, sin sospechar nada, tomó un bocado y cayó en un profundo sueño.

Los enanitos, al regresar a casa, encontraron a Blancanieves inmóvil y temieron lo peor. Lucharon contra el tiempo y buscaron ayuda hasta que un apuesto príncipe llegó al bosque y, al ver a Blancanieves, la besó con amor. El hechizo se rompió y Blancanieves despertó.

La Reina, al enterarse de que había fallado en su plan, huyó avergonzada. Blancanieves y el príncipe se casaron y vivieron felices para siempre. Los enanitos, agradecidos por la valentía de Blancanieves, le regalaron un cofre lleno de piedras preciosas como muestra de su amistad.

La historia de Blancanieves y los siete enanitos nos enseña que la bondad, la valentía y la amistad siempre triunfan sobre la envidia y la maldad. Es importante ser amables con los demás y ayudarlos en los momentos difíciles, como lo hicieron Blancanieves y los enanitos. Y recuerda, la verdadera belleza radica en el corazón.',
  'es',
  NULL,
  'openai',
  'migrated',
  NULL,
  '2025-12-02T21:41:15.416Z'::timestamp
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stories (id, title, content, language, image_url, source, ip_address, tag, created_at)
VALUES (
  gen_random_uuid(),
  'a brave knight saving a magical kingdom',
  'Había una vez en un reino mágico y lejano, un valiente caballero llamado Santiago. Santiago era conocido por su coraje y bondad, y siempre estaba listo para ayudar a quienes lo necesitaban.

En aquel reino, gobernaba una reina sabia y justa llamada Isabella, quien poseía un poderoso amuleto que mantenía la paz y la prosperidad en el reino. Sin embargo, un día, un malvado hechicero llamado Malvadozar robó el amuleto y sumió al reino en la oscuridad y la desolación.

Los campos se marchitaron, los ríos se secaron y los habitantes del reino vivían con miedo y tristeza. La reina Isabella convocó a Santiago y le encomendó la misión de recuperar el amuleto y salvar al reino de la ruina.

Santiago cabalgó a través de bosques encantados y montañas nevadas, enfrentando peligros y desafíos en su camino. Finalmente, llegó al castillo de Malvadozar, donde se libró de monstruos y trampas con valentía y astucia.

Al llegar a la sala del trono, Santiago desafió a Malvadozar a un duelo. La batalla fue épica, con chispas de magia y espadas chocando. Santiago luchó con todas sus fuerzas, recordando las enseñanzas de honor y valentía de su maestro.

Finalmente, con un golpe certero, Santiago logró derrotar a Malvadozar y recuperar el amuleto. Al hacerlo, la luz y la alegría regresaron al reino, los campos reverdecieron y los habitantes celebraron con júbilo.

La reina Isabella agradeció a Santiago por su valentía y sacrificio, y le nombró el protector del reino. Santiago comprendió entonces que el verdadero poder reside en el coraje, la bondad y la determinación de hacer lo correcto, incluso frente a la adversidad.

Y así, el reino mágico prosperó una vez más, recordando siempre la lección de que la verdadera valentía no se encuentra en la fuerza bruta, sino en el corazón noble y en la voluntad de luchar por el bien común. Y Santiago, el valiente caballero, fue recordado por generaciones como el héroe que salvó el reino con su coraje y bondad.',
  'es',
  NULL,
  'openai',
  'migrated',
  NULL,
  '2025-12-02T21:52:02.615Z'::timestamp
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stories (id, title, content, language, image_url, source, ip_address, tag, created_at)
VALUES (
  gen_random_uuid(),
  'La Historia del Festival Isla Verde Bronces',
  'Hace mucho tiempo, en la hermosa Isla Verde, existía un festival conocido como el Festival Isla Verde Bronces. Este festival era una celebración anual que honraba a los dioses del sol y del mar, quienes según la creencia de los antiguos habitantes de la isla, eran los protectores de su tierra.

Cuenta la leyenda que los dioses del sol y del mar otorgaron a los isleños la habilidad de forjar bronces de una belleza incomparable. Estas piezas, hechas con gran destreza y dedicación, eran consideradas tesoros sagrados que simbolizaban la conexión entre los isleños y sus dioses.

En cada edición del festival, los artesanos de la isla competían para crear la pieza más impresionante y única, la cual sería ofrecida como ofrenda a los dioses. El ganador de la competencia sería reconocido como el más hábil entre todos y su obra se convertiría en un símbolo de prosperidad y buena fortuna para la isla.

Un año, un joven artesano llamado Mateo decidió participar en el festival. A pesar de ser un aprendiz, Mateo poseía una habilidad extraordinaria para trabajar el bronce. Con paciencia y dedicación, creó una escultura de una sirena con una belleza sin igual. Al verla, todos quedaron maravillados por la destreza y talento de Mateo.

Sin embargo, durante la competencia, el hijo del líder de la isla, un joven llamado Diego, creó una pieza aún más impresionante. Diego, al ver que la victoria estaba cerca, decidió realizar trampas para asegurarse de ganar la competencia. A pesar de sus esfuerzos deshonestos, la verdad salió a la luz y Diego fue descalificado.

La escultura de Mateo fue reconocida como la mejor del festival, ganándose el respeto y la admiración de todos. Los dioses del sol y del mar, complacidos con la honestidad y la dedicación de Mateo, bendijeron a la isla con abundancia y felicidad.

Desde ese día, el Festival Isla Verde Bronces se convirtió en un recordatorio de la importancia de la honestidad, la humildad y la dedicación en todo lo que hacemos. Y la sirena de bronce de Mateo permaneció en la plaza principal de la isla como un símbolo de la valentía y la integridad que todos debemos seguir.

Y así, cada año, los isleños se reúnen para celebrar el Festival Isla Verde Bronces, recordando la historia de Mateo y la sirena, y renovando su compromiso de vivir con honradez y respeto hacia los demás.',
  'es',
  NULL,
  'openai',
  'migrated',
  NULL,
  '2025-12-02T21:55:59.463Z'::timestamp
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stories (id, title, content, language, image_url, source, ip_address, tag, created_at)
VALUES (
  gen_random_uuid(),
  'La historia de Athila',
  'Hace mucho tiempo, en la misteriosa tierra de Hungría, vivía un valiente y poderoso guerrero llamado Athila. Athila era conocido por su destreza en la batalla y por su gran corazón que siempre estaba dispuesto a ayudar a los demás.

Athila era el líder de los hunos, un pueblo valiente y orgulloso que vivía en las vastas llanuras de Europa Central. Los hunos eran temidos por muchos, pero Athila siempre buscaba la paz antes que la guerra.

Un día, en una fría mañana de invierno, Athila recibió la noticia de que un grupo de bárbaros estaba atacando a una aldea cercana. Sin dudarlo, Athila reunió a sus guerreros y cabalgó hacia la aldea para ayudar a sus habitantes.

Al llegar, Athila se enfrentó a los bárbaros con coraje y astucia. A pesar de estar en desventaja numérica, Athila y sus guerreros lograron derrotar a los invasores y salvar a la aldea. Los habitantes agradecidos lo aclamaron como un héroe y le pidieron que se quedara con ellos como su líder.

Pero Athila, con humildad, les dijo que su deber era proteger a su propio pueblo, los hunos. Sin embargo, prometió que estaría siempre dispuesto a ayudar a quienes lo necesitaran en el futuro.

La historia de Athila se convirtió en una leyenda en toda Europa. Se decía que su coraje y su bondad eran tan grandes como las llanuras en las que vivía. Y que su espíritu valiente seguía protegiendo a los que lo necesitaban, incluso mucho después de su muerte.

La lección que Athila nos dejó es que la verdadera grandeza no se encuentra en la fuerza de los músculos, sino en la nobleza del corazón. Que siempre debemos estar dispuestos a ayudar a los demás, sin importar las dificultades que enfrentemos en el camino.

Y así, la historia de Athila, el valiente guerrero huno, sigue viva en el corazón de todos aquellos que creen en la fuerza del amor y la bondad.',
  'es',
  NULL,
  'openai',
  'migrated',
  NULL,
  '2025-12-02T22:04:13.744Z'::timestamp
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stories (id, title, content, language, image_url, source, ip_address, tag, created_at)
VALUES (
  gen_random_uuid(),
  'El Barbero de Sevilla',
  'Había una vez, en la hermosa ciudad de Sevilla, un barbero muy especial. Su nombre era Antonio y era conocido por ser el mejor barbero de toda la región. No solo era experto en cortar el cabello y afeitar la barba, sino que también era un gran contador de historias.

Antonio solía contar a sus clientes historias mágicas y mitológicas mientras los atendía en su humilde barbería. Una de sus historias favoritas era la de los dioses y diosas del Olimpo, que solían bajar a la Tierra para interactuar con los humanos.

Un día, mientras Antonio cortaba el cabello de un joven llamado Pablo, le contó la historia de cómo los dioses griegos visitaban Sevilla en la antigüedad. Pablo, fascinado por la historia, escuchaba atentamente mientras el barbero le contaba sobre las travesuras de Zeus, el poder de Atenea y la belleza de Afrodita.

Pablo estaba tan absorto en la historia que no se dio cuenta de que otro cliente, un anciano sabio llamado Don Fernando, también escuchaba con atención. Al terminar la historia, Don Fernando se acercó a Antonio y le dijo: "Gracias por compartir esa historia con nosotros, querido barbero. Recuerda siempre que las leyendas y mitos antiguos encierran grandes lecciones para nuestra vida".

Antonio asintió con agradecimiento y continuó con su trabajo, pero las palabras de Don Fernando resonaron en su mente. A partir de ese día, decidió compartir historias que no solo entretuvieran a sus clientes, sino que también les enseñaran valores y lecciones importantes.

Y así, el Barbero de Sevilla se convirtió en un narrador de historias mágicas y morales, que inspiraba a todos los que lo escuchaban con su sabiduría y bondad.

Desde entonces, en la ciudad de Sevilla, la barbería de Antonio se convirtió en un lugar especial donde la magia de las palabras y las lecciones del pasado se unían para crear un ambiente de aprendizaje y diversión para todos los que lo visitaban.

Y así, queridos niños y niñas, recuerden siempre que las historias antiguas no solo nos entretienen, sino que también nos enseñan grandes lecciones que podemos aplicar en nuestra vida diaria. Nunca subestimen el poder de una buena historia y la sabiduría que encierra en su interior. ¡Que la magia de las palabras y los mitos antiguos los acompañe siempre en su camino!',
  'es',
  NULL,
  'openai',
  'migrated',
  NULL,
  '2025-12-03T02:06:04.303Z'::timestamp
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stories (id, title, content, language, image_url, source, ip_address, tag, created_at)
VALUES (
  gen_random_uuid(),
  'El Quijote de La Mancha',
  'Había una vez en la región de La Mancha, un valiente caballero llamado Don Quijote. Don Quijote era conocido por su valentía y su deseo de justicia en un mundo lleno de desafíos. Se pasaba los días leyendo libros de caballerías y soñando con emprender aventuras épicas.

Un día, Don Quijote decidió que era hora de convertirse en un verdadero caballero andante. Se puso su armadura de cartón y montó en su fiel caballo, Rocinante. Con su escudero Sancho Panza a su lado, partieron en busca de aventuras por los campos de La Mancha.

En su camino, Don Quijote se enfrentó a gigantes que resultaron ser molinos de viento, aterradoras bestias que en realidad eran rebaños de ovejas, y nobles damiselas en apuros que eran campesinas comunes. A pesar de las burlas y peligros, Don Quijote siempre mantuvo su valentía y honor, luchando por lo que creía correcto.

Con el tiempo, Don Quijote aprendió que la verdadera valentía no se encuentra solo en las batallas contra enemigos imaginarios, sino en la bondad, la compasión y la humildad. Descubrió que la verdadera aventura era hacer el bien a los demás y proteger a los más débiles, sin importar las adversidades que enfrentara.

Así, Don Quijote se convirtió en un ejemplo de coraje y nobleza en La Mancha, inspirando a todos con su espíritu de justicia y bondad. Su historia se convirtió en un legado de honor y generosidad que perduró a lo largo de los siglos, recordándonos que la verdadera grandeza reside en el corazón de quienes luchan por un mundo mejor.

Y así, queridos niños, la historia de El Quijote de La Mancha nos enseña que la valentía y la bondad son las armas más poderosas que podemos tener, y que la verdadera aventura es seguir nuestros sueños con el corazón lleno de nobleza y amor. ¿Están listos para emprender su propia aventura? ¡Adelante, valientes exploradores del mundo!',
  'es',
  NULL,
  'openai',
  'migrated',
  NULL,
  '2025-12-03T02:25:33.418Z'::timestamp
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stories (id, title, content, language, image_url, source, ip_address, tag, created_at)
VALUES (
  gen_random_uuid(),
  'Las Aventuras del Príncipe Igor: El Dragón de Fuego',
  'Hace muchos siglos, en un reino lejano, vivía el valiente Príncipe Igor, conocido por su destreza en la batalla y su noble corazón. Un día, el rey del reino vecino envió un feroz dragón de fuego para sembrar el caos y el miedo en las tierras de Igor.

El príncipe no dudó ni un segundo en enfrentarse al temible dragón. Armado con su espada mágica y protegido por la armadura de los antiguos guerreros, partió hacia la cueva donde habitaba la bestia.

Tras una ardua batalla llena de llamas y rugidos, el príncipe logró vencer al dragón de fuego. En vez de acabar con su vida, Igor le tendió la mano y le ofreció su amistad. El dragón, conmovido por la nobleza del príncipe, aceptó y se convirtió en su fiel compañero.

Desde entonces, el reino de Igor prosperó en paz y armonía, demostrando que incluso los enemigos más temibles pueden convertirse en amigos si se les tiende la mano con bondad y compasión.

Moraleja: La valentía y la bondad son armas poderosas que pueden vencer cualquier obstáculo, incluso a los enemigos más temibles. La amistad y la compasión son poderosas herramientas para construir un mundo mejor.',
  'es',
  NULL,
  'openai',
  'migrated',
  'Las Aventuras del Principe Igor',
  '2025-12-03T13:31:16.721Z'::timestamp
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stories (id, title, content, language, image_url, source, ip_address, tag, created_at)
VALUES (
  gen_random_uuid(),
  'Las Aventuras del Príncipe Igor: El Enigma de las Esfinges',
  'En una tierra misteriosa y antigua, el Príncipe Igor se encontró con un desafío único: tres esfinges guardianas protegían la entrada a un templo sagrado donde se hallaba un valioso tesoro. Cada esfinge planteaba un enigma que debía ser resuelto para poder avanzar.

La primera esfinge preguntó al príncipe: "¿Cuál es el tesoro más preciado: la riqueza, el poder o el amor?". Igor reflexionó y respondió con sabiduría: "El amor es el verdadero tesoro que da significado a la vida y llena el corazón de alegría".

La segunda esfinge desafió al príncipe con otra pregunta: "¿Qué es lo que tiene ojos pero no puede ver, un corazón pero no puede amar?". Tras meditar, Igor respondió con certeza: "Una baraja de cartas, que observa el juego pero no siente emociones".

Finalmente, la tercera esfinge planteó un enigma más complejo: "¿Cuál es la clave para la felicidad eterna?". El príncipe sonrió y contestó: "La clave para la felicidad eterna es vivir en armonía con uno mismo y con el mundo que nos rodea, cultivando la bondad y la gratitud en cada acto".

Impresionadas por la sabiduría y la humildad del príncipe, las esfinges le permitieron el paso al templo sagrado, donde encontró el tesoro más valioso: un espejo que reflejaba la verdadera grandeza de su alma.

Moraleja: La sabiduría y la humildad son cualidades que nos ayudan a superar los desafíos más difíciles de la vida. Escuchar con atención, reflexionar con calma y actuar con bondad nos guiará hacia la verdadera riqueza interior.',
  'es',
  NULL,
  'openai',
  'migrated',
  'Las Aventuras del Principe Igor',
  '2025-12-03T13:31:16.721Z'::timestamp
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stories (id, title, content, language, image_url, source, ip_address, tag, created_at)
VALUES (
  gen_random_uuid(),
  'Las Aventuras del Príncipe Igor: El Bosque Encantado',
  'En un bosque encantado, el Príncipe Igor se adentró en busca de una cura para una extraña enfermedad que había afectado a su pueblo. El bosque estaba lleno de criaturas mágicas y peligros inesperados, pero el príncipe no vaciló en su misión.

En su camino, se encontró con un hada anciana que le dijo: "Para encontrar la cura, debes superar tres pruebas que pondrán a prueba tu coraje, tu sabiduría y tu corazón". Igor aceptó el desafío y se preparó para lo que vendría.

La primera prueba consistía en cruzar un río caudaloso sin puente ni bote. Con ingenio, el príncipe construyó una balsa con troncos y hojas, demostrando que la creatividad y la determinación son clave para superar los obstáculos.

La segunda prueba lo llevó a un laberinto oscuro y confuso, donde debía encontrar la salida antes de que el tiempo se agotara. Con paciencia y concentración, Igor logró salir del laberinto, demostrando que la calma y la perseverancia son aliadas en momentos de confusión.

Finalmente, la tercera prueba lo llevó al corazón del bosque, donde un árbol ancestral le pidió que plantara una semilla de esperanza para curar a su pueblo. El príncipe plantó la semilla con amor y gratitud, y al instante el bosque se iluminó con una luz sanadora que curó a todos los enfermos.

Moraleja: La valentía, la sabiduría y la compasión son cualidades fundamentales para superar los desafíos y ayudar a los demás. Con determinación y bondad, podemos encontrar soluciones incluso en los lugares más oscuros y misteriosos.',
  'es',
  NULL,
  'openai',
  'migrated',
  'Las Aventuras del Principe Igor',
  '2025-12-03T13:31:16.721Z'::timestamp
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stories (id, title, content, language, image_url, source, ip_address, tag, created_at)
VALUES (
  gen_random_uuid(),
  'The Lion King',
  'Long, long ago in the vast savannah of Africa, there lived a mighty lion named Simba. He was known as The Lion King, ruling over all the animals with wisdom and strength. The animals respected and admired him for his courage and fairness.

One day, a terrible drought struck the land, causing the rivers to dry up and the grass to wither. The animals grew hungry and weak, and they turned to The Lion King for help. Simba knew he had to find a solution to save his kingdom and his beloved subjects.

He called for a meeting with all the animals at Pride Rock, the tallest and grandest rock in the savannah. There, he proposed a plan to journey to the mystical Watering Hole of Wonders, where it was said that a magical spring could bring life back to the land.

Without hesitation, the animals agreed to follow their king on this perilous journey. Through scorching deserts and dense jungles, they marched on, facing challenges along the way. But through unity and determination, they overcame each obstacle together.

Finally, after many days of travel, they reached the Watering Hole of Wonders. The animals watched in awe as Simba approached the shimmering spring and called upon the spirits of the land for help. Suddenly, a powerful gush of water erupted from the ground, flowing through the land and bringing life back to the savannah.

The animals rejoiced, drinking from the rejuvenated rivers and feasting on the fresh green grass. The Lion King had saved his kingdom, proving that with courage, unity, and determination, anything is possible.

As the animals celebrated, Simba addressed them, "My dear friends, we have learned that in times of hardship, it is important to stand together and help one another. Unity and perseverance can overcome any challenge, no matter how great. Let us always remember this lesson and continue to live in harmony with one another."

And so, The Lion King''s legacy lived on, inspiring generations of animals to work together and care for the land they called home.

And that, my dear friends, is the story of The Lion King, a tale of bravery, unity, and the enduring spirit of the savannah.',
  'en',
  NULL,
  'openai',
  'migrated',
  NULL,
  '2025-12-03T13:39:14.883Z'::timestamp
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stories (id, title, content, language, image_url, source, ip_address, tag, created_at)
VALUES (
  gen_random_uuid(),
  'Los 3 Mosqueteros',
  'Hace muchos años, en la antigua España, vivían tres valientes mosqueteros. Se llamaban Pedro, Pablo y Pepe, y eran conocidos en todo el reino por su valentía y lealtad. Juntos, formaban un equipo imparable que siempre estaba listo para ayudar a quienes lo necesitaran.

Un día, el rey de España los convocó a su palacio. Había surgido un problema en el reino y necesitaba la ayuda de los mosqueteros para resolverlo. Un grupo de bandidos había estado causando problemas en los pueblos cercanos, robando a los campesinos y sembrando el miedo por doquier.

Los tres mosqueteros aceptaron de inmediato la misión y se pusieron en marcha. Cabalgando a través de los campos y bosques, siguieron las pistas de los bandidos hasta llegar a un antiguo castillo abandonado donde se escondían.

Con astucia y valentía, los mosqueteros planearon su estrategia para atrapar a los bandidos y devolver la paz al reino. Pedro, el más ágil de los tres, se encargó de escalar las murallas del castillo. Pablo, el más fuerte, se preparó para enfrentarse a los bandidos en combate. Y Pepe, el más astuto, ideó un plan para sorprender a los malhechores.

Al llegar la noche, los mosqueteros pusieron en marcha su plan. Pedro les hizo una señal desde lo alto de las murallas, Pablo irrumpió en el castillo con su espada desenvainada y Pepe apareció por sorpresa desde las sombras. Los bandidos, sorprendidos por la astucia y valentía de los mosqueteros, se rindieron sin oponer resistencia.

El rey, agradecido por la valentía de los tres mosqueteros, los recibió de nuevo en su palacio y les otorgó medallas de honor por su valentía y lealtad. Los mosqueteros, orgullosos de haber cumplido su misión, regresaron a sus hogares sabiendo que juntos podían superar cualquier desafío.

La moraleja de esta historia es que la valentía, la astucia y la lealtad son cualidades importantes que nos ayudan a superar los desafíos que se presentan en la vida. Trabajando juntos y confiando en nuestras propias habilidades, podemos lograr grandes cosas y hacer del mundo un lugar mejor para todos. Los tres mosqueteros nos enseñan que la verdadera fuerza radica en la unión y en el valor de cada uno de nosotros.',
  'es',
  'https://oaidalleapiprodscus.blob.core.windows.net/private/org-WyD5TWXcmhSoDYEID2lcJlRr/user-T0ccoMi2fVHWxGTcPZvNaHQp/img-9bcKHaZHfsgE9ph1wtmNtzZs.png?st=2025-12-03T13%3A09%3A33Z&se=2025-12-03T15%3A09%3A33Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=9346e9b9-5d29-4d37-a0a9-c6f95f09f79d&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-12-03T14%3A09%3A33Z&ske=2025-12-04T14%3A09%3A33Z&sks=b&skv=2024-08-04&sig=hkkHvyHvbMPXr3F7JrhmUM7sPaBlrZ%2Bci5/khcjUpko%3D',
  'openai',
  'migrated',
  NULL,
  '2025-12-03T14:09:35.124Z'::timestamp
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stories (id, title, content, language, image_url, source, ip_address, tag, created_at)
VALUES (
  gen_random_uuid(),
  'Pedro y El Lobo',
  'Hace mucho tiempo, en un pequeño pueblo en España, vivía un niño llamado Pedro. Pedro era un pastorcito muy valiente y amable que cuidaba de un rebaño de ovejas en las colinas cercanas al pueblo. Todos los días, Pedro llevaba a las ovejas a pastar y las protegía de los peligros del bosque.

Un día, Pedro tuvo una idea traviesa. Decidió gastarle una broma a los aldeanos del pueblo gritando: "¡Lobo, lobo, el lobo está atacando las ovejas!". Los aldeanos, asustados, corrieron hacia las colinas con sus herramientas para ayudar a Pedro y salvar las ovejas. Pero cuando llegaron, descubrieron que no había ningún lobo, solo Pedro riéndose a carcajadas.

Los aldeanos, enojados por la broma de Pedro, le advirtieron que no volviera a engañarlos de esa manera. Pedro se disculpó y prometió no hacerlo de nuevo. Sin embargo, unos días después, la travesura volvió a su mente y decidió hacer la misma broma una vez más.

Esta vez, cuando Pedro gritó "¡Lobo, lobo, el lobo está atacando las ovejas!", los aldeanos, recordando la última vez, no le creyeron y se quedaron en el pueblo. Pero, para sorpresa de todos, esta vez sí había un lobo rondando el rebaño de ovejas de Pedro.

Las ovejas empezaron a balar asustadas y el lobo se acercaba cada vez más. Pedro, arrepentido de su broma, gritaba pidiendo ayuda, pero nadie venía en su auxilio. Finalmente, con valentía, Pedro logró espantar al lobo y salvar a las ovejas.

Desde ese día, Pedro aprendió una lección muy importante: nunca debemos mentir ni engañar, porque cuando realmente necesitemos ayuda, nadie nos creerá. Los aldeanos también aprendieron a ser más comprensivos y a no juzgar sin conocer toda la verdad.

Y así, Pedro y los aldeanos del pueblo vivieron en armonía, recordando siempre la historia del niño que gritaba "¡Lobo, lobo!" y aprendieron que la honestidad y la sinceridad son valores muy importantes en la vida.',
  'es',
  'https://oaidalleapiprodscus.blob.core.windows.net/private/org-WyD5TWXcmhSoDYEID2lcJlRr/user-T0ccoMi2fVHWxGTcPZvNaHQp/img-QI8uh2n3f8u1c9WSTjGd9RIo.png?st=2025-12-03T13%3A46%3A13Z&se=2025-12-03T15%3A46%3A13Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=77e5a8ec-6bd1-4477-8afc-16703a64f029&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-12-03T14%3A46%3A13Z&ske=2025-12-04T14%3A46%3A13Z&sks=b&skv=2024-08-04&sig=dIErqFr3MkCc82OVCNwxot66VxVZNIf/pKQzZ4Jg54U%3D',
  'openai',
  'migrated',
  NULL,
  '2025-12-03T14:46:14.698Z'::timestamp
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stories (id, title, content, language, image_url, source, ip_address, tag, created_at)
VALUES (
  gen_random_uuid(),
  'La Leyenda de la Luz Mala',
  'Hace mucho tiempo, en las tierras de América del Sur, existía una leyenda muy antigua conocida como La Leyenda de la Luz Mala. Esta leyenda se transmitía de generación en generación, contando la historia de una misteriosa luz que aparecía en las noches oscuras de los campos.

Cuenta la leyenda que la Luz Mala era un destello brillante y fantasmal que podía verse danzando en la distancia. Algunos decían que era el espíritu de antiguos guerreros que buscaban venganza, mientras que otros creían que era una advertencia de peligro en las tierras salvajes.

En un pequeño pueblo vivía una niña llamada Valentina, una niña valiente y curiosa que siempre estaba lista para explorar y descubrir nuevos misterios. Un día, Valentina escuchó a los ancianos del pueblo contando historias sobre la Luz Mala y su supuesto poder maligno.

Intrigada por la leyenda, Valentina decidió emprender un viaje en busca de la Luz Mala. Armada con valentía y determinación, caminó por los campos en la oscuridad de la noche, siguiendo la débil luz que brillaba a lo lejos.

Después de recorrer un largo camino, Valentina finalmente llegó al lugar donde la Luz Mala brillaba con intensidad. Para su sorpresa, descubrió que la misteriosa luz provenía de luciérnagas que danzaban en la oscuridad, creando un espectáculo de belleza en la noche.

Valentina se sintió maravillada por la belleza de las luciérnagas y comprendió que la Luz Mala no era más que un fenómeno natural, lejos de ser maligno. Regresó al pueblo para contar su descubrimiento y desmitificar la antigua leyenda.

La historia de Valentina y la Luz Mala se convirtió en una lección para todos en el pueblo. Aprendieron que a veces, lo desconocido puede asustarnos, pero si tenemos el coraje de enfrentarlo, podemos descubrir la verdad detrás de los misterios.

Desde entonces, la Luz Mala dejó de ser temida en el pueblo y se convirtió en un recordatorio de que la valentía y la curiosidad pueden llevarnos a descubrir la belleza oculta en lo desconocido.

Y así, la Leyenda de la Luz Mala se convirtió en una historia de coraje, descubrimiento y aceptación en las tierras de América del Sur, recordando a todos que a veces, la luz más brillante puede provenir de los lugares más inesperados.',
  'es',
  'https://oaidalleapiprodscus.blob.core.windows.net/private/org-WyD5TWXcmhSoDYEID2lcJlRr/user-T0ccoMi2fVHWxGTcPZvNaHQp/img-mXrVctKZkUp5ggKu9wbgzLAb.png?st=2025-12-03T16%3A54%3A27Z&se=2025-12-03T18%3A54%3A27Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=ed3ea2f9-5e38-44be-9a1b-7c1e65e4d54f&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-12-03T17%3A45%3A14Z&ske=2025-12-04T17%3A45%3A14Z&sks=b&skv=2024-08-04&sig=PHsX/sQRRT2lbjp39WiypMZOy7BnwP0aQtmotSSfWAM%3D',
  'openai',
  'migrated',
  NULL,
  '2025-12-03T17:54:27.759Z'::timestamp
)
ON CONFLICT (id) DO NOTHING;

-- Commit transaction
COMMIT;

-- Total stories inserted: 25