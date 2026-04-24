# **App Name**: Botanical

## Core Features:

- Creación de Solicitudes de Compra: Los usuarios de distintas áreas pueden ingresar y enviar solicitudes de compra detallando ítems, cantidades y costos estimados.
- Panel de Control de Compras: El equipo de compras accede a un panel centralizado para visualizar todas las solicitudes pendientes y gestionarlas eficientemente.
- Revisión y Aprobación/Rechazo de Solicitudes: Los miembros del equipo de compras pueden revisar cada solicitud, modificar su estado (aprobada, rechazada) y añadir comentarios.
- Generación Automática de Órdenes de Compra (OC): Cuando una solicitud es aprobada, el sistema automáticamente genera un registro en la colección 'ordenes_compra' en Firestore. Incorporar una 'tool' de asistencia inteligente basada en datos históricos para pre-rellenar ciertos campos.
- Acceso Basado en Roles (Solicitantes y Compras): Implementación de reglas de seguridad en Firebase para diferenciar permisos: 'Solicitantes' ven solo sus pedidos, 'Compras' accede y edita todas las solicitudes y OC.
- Visualización Histórica de Órdenes: Funcionalidad para buscar y visualizar todas las solicitudes y Órdenes de Compra históricas, incluyendo las finalizadas.
- Funcionalidad de Importación de Datos Masivos: Herramienta para la carga masiva de registros históricos de Excel a Firestore, facilitando la migración inicial.

## Style Guidelines:

- Esquema de color claro. Color primario (para encabezados, botones principales): Un azul profesional que representa fiabilidad y eficiencia (#2966A3). Su tonalidad deriva de un HSL(210, 60%, 40%).
- Color de fondo: Un gris azulado muy claro para un lienzo limpio y minimalista (#ECF1F5). Su tonalidad deriva de un HSL(210, 20%, 95%).
- Color de acento (para elementos interactivos y destacados): Un amarillo-naranja vibrante y energético que capta la atención (#F2C43D). Su tonalidad deriva de un HSL(45, 80%, 60%).
- Fuentes 'Inter' (sans-serif) para titulares y cuerpo de texto, aportando un estilo moderno, limpio y de alta legibilidad, ideal para aplicaciones empresariales.
- Iconografía sencilla y clara con contornos finos que complementen el diseño moderno y centrado en la productividad. Usar íconos estándar de Material Design o de bibliotecas similares.
- Diseño con espaciado amplio y márgenes generosos para mejorar la legibilidad y facilitar la interacción. Las tablas y listas de datos deben tener una estructura clara y un formato de cuadrícula intuitivo.
- Transiciones suaves y sutiles al navegar entre vistas o al cambiar el estado de los elementos, como la confirmación de una aprobación, para una experiencia de usuario fluida.