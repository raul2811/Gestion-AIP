# Gestión Integral para Asociaciones de Interés Público (AIP) en Panamá

Este repositorio contiene el diseño lógico y conceptual de una base de datos relacional unificada destinada a optimizar la gestión operativa, financiera y de cumplimiento de las Asociaciones de Interés Público (AIP) en Panamá. El proyecto aborda los desafíos inherentes al modelo híbrido de las AIP, que combinan la agilidad del sector privado con la rendición de cuentas del sector público, buscando mitigar riesgos y fomentar la transparencia.

---

## 🎯 Objetivos del Proyecto

El objetivo principal es diseñar una base de datos unificada que fortalezca la capacidad institucional de las AIP, asegurando el cumplimiento normativo integral y habilitando una gestión operativa de alta eficiencia y transparencia.

### Objetivos específicos:

- **Fortalecer la Gobernanza y el Cumplimiento:**  
  Modelar una base de datos que refleje fielmente el modelo operativo híbrido de las AIP, permitiendo una segregación y trazabilidad inequívoca de fondos, personal y proyectos. Esto incluye satisfacer los requerimientos de auditoría de la Contraloría General de la República, el Ministerio de Gobierno y las obligaciones de protección de datos (Ley 81 de 2019) y documentos electrónicos (Ley 51 de 2008).

- **Optimizar la Eficiencia Operativa:**  
  Diseñar un modelo relacional normalizado hasta la tercera forma normal (3NF) para eliminar la redundancia de datos, integrar la información y automatizar flujos de trabajo clave (finanzas, recursos humanos, proyectos, legal).

- **Garantizar la Integridad y Seguridad de la Información:**  
  Incorporar principios de seguridad desde el diseño, incluyendo un Control de Acceso Basado en Roles (RBAC) granular y mecanismos de protección de datos sensibles.

- **Habilitar la Transparencia y la Rendición de Cuentas:**  
  Estructurar la base de datos para facilitar la generación automática y precisa de informes de cumplimiento normativo y reportes de gestión.

- **Establecer las Bases para la Escalabilidad y la Interoperabilidad Futura:**  
  Concebir una arquitectura de datos modular y escalable, preparada para entornos de computación en la nube y su integración con el ecosistema digital del Estado panameño.

---

## 💡 Descripción del Problema

Las AIP en Panamá enfrentan un paradigma de gobernanza complejo debido a su modelo operativo híbrido. La ausencia de una base de datos integrada genera riesgos críticos de cumplimiento financiero y administrativo, protección de datos y supervisión interna. Además, crea fricción operativa, silos de información e ineficiencia, desviando recursos de su misión principal y limitando la escalabilidad y la alineación con la agenda de transformación digital nacional.

---

## 🚀 Módulos Principales de la Base de Datos

El diseño de la base de datos se estructura en módulos interconectados, cada uno respondiendo a una necesidad fundamentada en la legislación panameña:

- **Gestión Financiera y Contable:** Registro segregado y trazabilidad de fondos públicos y privados/autogestión.
- **Gestión de Capital Humano:** Administración independiente del personal conforme al Código de Trabajo.
- **Cumplimiento y Gestión Documental:** Almacenamiento, versionamiento y control de acceso a documentos (Ley 51 de 2008).
- **Proyectos y Rendición de Cuentas:** Asociación de gastos, donaciones y documentos a proyectos específicos.
- **Gestión de Activos:** Control de activos físicos y programación de mantenimientos.
- **Notificaciones:** Gestión de alertas automáticas, como asignaciones de tareas.
- **Auditoría y Trazabilidad:** Registro automático de cambios y generación de pistas de auditoría.
- **Seguridad y Control de Acceso:** Esquema RBAC y cifrado de datos sensibles (Ley 81 de 2019).

---

## ⚙️ Tecnologías

- **PostgreSQL:** Base de datos relacional principal (Alta Disponibilidad con 4 nodos maestros).
- **podman:** Orquestación de contenedores para el despliegue de aplicaciones.
- **Next.js y Strapi:** Frameworks para el desarrollo del front-end y back-end
- **Prometheus y Grafana:** Monitoreo y alertas del sistema.

---

## 📊 Estructura de la Base de Datos

El archivo `db_schema.sql` contiene la definición completa de las tablas, relaciones, índices, vistas, funciones y triggers.

### Entidades Clave:

- `Roles`, `Puestos`, `Departamentos`, `Usuarios`
- `Tipos_Documento`, `Documentos`, `Documento_Versiones`, `Archivos`
- `Paises`, `Provincias`, `Distritos`, `Corregimientos`
- `Estados_Proyecto`, `Fases_Proyecto`, `Proyectos`, `Tareas`, `Hitos`
- `Cuentas_Contables`, `Tipos_Cuenta_Contable`, `Transacciones_Financieras`, `Presupuestos`, `Partidas_Presupuestarias`
- `Terceros`, `Beneficiarios`, `Donaciones`
- `AIPs_Colaboradoras`, `Acuerdos_Servicio`
- `Tipos_Activo`, `Activos`, `Mantenimientos_Activo`
- `Permisos`, `Rol_Permisos`, `Notificaciones`
- `Sesiones_Usuario` (con Row Level Security - RLS)

---

## 🔄 Triggers y Funciones Destacadas

- `fn_auditar_usuarios()`: Auditoría de cambios en la tabla `Usuarios`.
- `fn_control_versiones_documento()`: Versionado automático de documentos.
- `fn_notificar_asignacion_tarea()`: Notificaciones al asignar tareas.
- `fn_programar_proximo_mantenimiento()`: Programación automática de mantenimientos.
- `fn_limpiar_sesiones_expiradas()`: Limpieza automática de sesiones.

---

## 🔐 Políticas de Seguridad (RLS)

- `polit_sesiones_propias`: Visualización de sesiones propias únicamente.
- `polit_archivos_propios`: Gestión de archivos subidos por el usuario.
- Políticas de administración por roles (`Usuarios`, `Permisos`, `Roles`, etc.).

---

## 🛠️ Instalación y Configuración

### Requisitos Previos:

- Tener PostgreSQL instalado y configurado.

### Clonar el Repositorio:

```bash
git clone https://github.com/tu_usuario/nombre_del_repositorio.git
cd nombre_del_repositorio
```

## Crear la Base de Datos:
```SQL
CREATE DATABASE aip_gestion;
```
## Ejecutar el Esquema SQL:
```bash
psql -U tu_usuario -d aip_gestion -f db_schema.sql
```
