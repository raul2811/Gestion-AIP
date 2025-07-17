-- Crear el esquema
CREATE SCHEMA IF NOT EXISTS aip;

-- Seleccionar el esquema como predeterminado
SET search_path TO aip;

-- Crear la extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE Roles (
    id_rol UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_rol VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT
);

CREATE TABLE Puestos (
    id_puesto UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_puesto VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT
);

CREATE TABLE Departamentos (
    id_departamento UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_departamento VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE Usuarios (
    id_usuario UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_completo VARCHAR(255) NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    cedula VARCHAR(50) UNIQUE NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    estado VARCHAR(50) DEFAULT 'Activo' NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE Tipos_Documento (
    id_tipo_documento UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_tipo VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE Paises (
    id_pais CHAR(2) PRIMARY KEY, -- Usando código ISO 3166-1 alfa-2
    nombre_pais VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE Estados_Proyecto (
    id_estado_proyecto UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_estado VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE Fases_Proyecto (
    id_fase UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_fase VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT
);

CREATE TABLE Estados_Tarea (
    id_estado_tarea UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_estado VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE Prioridades_Tarea (
    id_prioridad_tarea UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_prioridad VARCHAR(100) UNIQUE NOT NULL,
    nivel INTEGER UNIQUE NOT NULL
);

CREATE TABLE Tipos_Cuenta_Contable (
    id_tipo_cuenta UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_tipo_cuenta VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE Tipos_Transaccion_Financiera (
    id_tipo_transaccion UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_tipo VARCHAR(100) UNIQUE NOT NULL,
    naturaleza VARCHAR(50) NOT NULL -- 'Ingreso', 'Gasto', 'Transferencia'
);

CREATE TABLE Terceros (
    id_tercero UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_tercero VARCHAR(255) NOT NULL,
    identificador_fiscal VARCHAR(50) UNIQUE,
    tipo_tercero VARCHAR(50) NOT NULL, -- 'Donante', 'Proveedor', 'Cliente'
    es_persona_natural BOOLEAN NOT NULL,
    contacto_principal VARCHAR(255),
    telefono VARCHAR(50),
    correo VARCHAR(255)
);

CREATE TABLE AIPs_Colaboradoras (
    id_aip_colaboradora UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_aip VARCHAR(255) UNIQUE NOT NULL,
    ruc VARCHAR(50) UNIQUE,
    direccion TEXT,
    telefono VARCHAR(50),
    correo_contacto VARCHAR(255),
    persona_contacto VARCHAR(255),
    fecha_registro TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE Tipos_Activo (
    id_tipo_activo UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_tipo VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE Permisos (
    id_permiso VARCHAR(100) PRIMARY KEY,
    descripcion TEXT NOT NULL,
    modulo VARCHAR(100) NOT NULL
);

CREATE TABLE Tipos_Campana (
    id_tipo_campana UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_tipo VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE Listas_Distribucion (
    id_lista UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_lista VARCHAR(255) UNIQUE NOT NULL,
    descripcion TEXT
);

CREATE TABLE Parametros_Sistema (
    clave VARCHAR(100) PRIMARY KEY,
    valor TEXT NOT NULL,
    descripcion TEXT,
    es_editable_ui BOOLEAN DEFAULT TRUE NOT NULL
);


CREATE TABLE Usuario_Roles (
    id_usuario UUID NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    id_rol UUID NOT NULL REFERENCES Roles(id_rol) ON DELETE CASCADE,
    fecha_asignacion TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (id_usuario, id_rol)
);

CREATE TABLE Usuario_Departamento_Puesto (
    id_asignacion UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario UUID NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    id_departamento UUID NOT NULL REFERENCES Departamentos(id_departamento) ON DELETE CASCADE,
    id_puesto UUID NOT NULL REFERENCES Puestos(id_puesto),
    fecha_inicio TIMESTAMPTZ DEFAULT now(),
    fecha_fin TIMESTAMPTZ,
    es_jefe_departamento BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT uq_usuario_departamento UNIQUE (id_usuario, id_departamento),
    CONSTRAINT chk_udp_fechas CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
);

CREATE TABLE Sesiones_Usuario (
    id_sesion UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario UUID NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    fecha_inicio TIMESTAMPTZ DEFAULT now(),
    fecha_fin TIMESTAMPTZ,
    direccion_ip INET,
    user_agent TEXT,
    exito_login BOOLEAN NOT NULL
);

CREATE TABLE Archivos (
    id_archivo UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_original_archivo VARCHAR(255) NOT NULL,
    tipo_mime VARCHAR(100),
    url_almacenamiento TEXT NOT NULL,
    tamano_bytes BIGINT,
    hash_contenido BYTEA,
    fecha_subida TIMESTAMPTZ DEFAULT now(),
    id_usuario_subio UUID NOT NULL REFERENCES Usuarios(id_usuario)
);

CREATE TABLE Documentos (
    id_documento UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(255) NOT NULL,
    id_tipo_documento UUID NOT NULL REFERENCES Tipos_Documento(id_tipo_documento),
    estado VARCHAR(50) DEFAULT 'Activo' NOT NULL,
    id_usuario_creador UUID NOT NULL REFERENCES Usuarios(id_usuario),
    fecha_creacion TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE Provincias (
    id_provincia UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_provincia VARCHAR(100) NOT NULL,
    id_pais CHAR(2) NOT NULL REFERENCES Paises(id_pais),
    CONSTRAINT uq_provincia_pais UNIQUE (nombre_provincia, id_pais)
);

CREATE TABLE Cuentas_Contables (
    id_cuenta_contable UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_cuenta VARCHAR(50) UNIQUE NOT NULL,
    nombre_cuenta VARCHAR(255) NOT NULL,
    descripcion TEXT,
    id_tipo_cuenta UUID NOT NULL REFERENCES Tipos_Cuenta_Contable(id_tipo_cuenta),
    permite_transacciones BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE Acuerdos_Servicio (
    id_acuerdo UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_acuerdo VARCHAR(255) NOT NULL,
    tipo_servicio VARCHAR(100),
    fecha_inicio DATE,
    fecha_fin DATE,
    estado VARCHAR(50),
    monto_acordado NUMERIC(18, 2),
    id_aip_colaboradora UUID NOT NULL REFERENCES AIPs_Colaboradoras(id_aip_colaboradora),
    CONSTRAINT chk_acuerdos_fechas CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
);

CREATE TABLE Activos (
    id_activo UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_activo VARCHAR(255) NOT NULL,
    id_tipo_activo UUID NOT NULL REFERENCES Tipos_Activo(id_tipo_activo),
    descripcion TEXT,
    fecha_adquisicion DATE,
    valor_adquisicion NUMERIC(18, 2),
    estado_activo VARCHAR(50),
    ubicacion_fisica TEXT,
    id_departamento_asignado UUID REFERENCES Departamentos(id_departamento)
);

CREATE TABLE Rol_Permisos (
    id_rol UUID NOT NULL REFERENCES Roles(id_rol) ON DELETE CASCADE,
    id_permiso VARCHAR(100) NOT NULL REFERENCES Permisos(id_permiso) ON DELETE CASCADE,
    PRIMARY KEY (id_rol, id_permiso)
);

CREATE TABLE Campanas (
    id_campana UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_campana VARCHAR(255) NOT NULL,
    objetivo TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    presupuesto NUMERIC(18, 2),
    id_tipo_campana UUID NOT NULL REFERENCES Tipos_Campana(id_tipo_campana),
    id_usuario_responsable UUID NOT NULL REFERENCES Usuarios(id_usuario),
    CONSTRAINT chk_camp_fechas CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
);

CREATE TABLE Auditoria_Eventos (
    id_evento UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario UUID REFERENCES Usuarios(id_usuario),
    tipo_evento VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_evento TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE Notificaciones (
    id_notificacion UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario_destino UUID NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    mensaje TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    url_relacionada TEXT
);

CREATE TABLE Beneficiarios (
    id_beneficiario UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_completo VARCHAR(255) NOT NULL,
    cedula VARCHAR(50) UNIQUE,
    telefono VARCHAR(50),
    correo VARCHAR(255),
    direccion TEXT,
    fecha_nacimiento DATE,
    genero VARCHAR(50),
    fecha_registro TIMESTAMPTZ DEFAULT now(),
    id_usuario_registra UUID NOT NULL REFERENCES Usuarios(id_usuario)
);


CREATE TABLE Documento_Versiones (
    id_version UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_documento UUID NOT NULL REFERENCES Documentos(id_documento) ON DELETE CASCADE,
    id_archivo UUID NOT NULL REFERENCES Archivos(id_archivo),
    numero_version VARCHAR(50) NOT NULL,
    descripcion_cambios TEXT,
    fecha_version TIMESTAMPTZ DEFAULT now(),
    id_usuario_version UUID NOT NULL REFERENCES Usuarios(id_usuario),
    CONSTRAINT uq_doc_version UNIQUE (id_documento, numero_version)
);

CREATE TABLE Documento_Firmas (
    id_firma UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_archivo UUID NOT NULL REFERENCES Archivos(id_archivo),
    id_usuario_firmante UUID NOT NULL REFERENCES Usuarios(id_usuario),
    fecha_firma TIMESTAMPTZ DEFAULT now(),
    tipo_firma VARCHAR(100) NOT NULL,
    proveedor_certificacion VARCHAR(255),
    hash_firma TEXT NOT NULL
);

CREATE TABLE Distritos (
    id_distrito UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_distrito VARCHAR(100) NOT NULL,
    id_provincia UUID NOT NULL REFERENCES Provincias(id_provincia),
    CONSTRAINT uq_distrito_provincia UNIQUE (nombre_distrito, id_provincia)
);

CREATE TABLE Mantenimientos_Activo (
    id_mantenimiento UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_activo UUID NOT NULL REFERENCES Activos(id_activo),
    fecha_mantenimiento DATE DEFAULT now(),
    descripcion TEXT,
    costo NUMERIC(18, 2),
    id_tercero_proveedor UUID REFERENCES Terceros(id_tercero)
);

CREATE TABLE Auditoria_Cambios (
    id_cambio UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_evento_auditoria UUID NOT NULL REFERENCES Auditoria_Eventos(id_evento),
    tabla_afectada VARCHAR(100) NOT NULL,
    id_registro_afectado TEXT NOT NULL,
    campo_modificado VARCHAR(100) NOT NULL,
    valor_anterior JSONB,
    valor_nuevo JSONB
);

CREATE TABLE Lista_Distribucion_Contactos (
    id_lista UUID NOT NULL REFERENCES Listas_Distribucion(id_lista) ON DELETE CASCADE,
    id_tercero UUID REFERENCES Terceros(id_tercero) ON DELETE CASCADE,
    id_beneficiario UUID REFERENCES Beneficiarios(id_beneficiario) ON DELETE CASCADE,
    PRIMARY KEY (id_lista, id_tercero, id_beneficiario),
    CONSTRAINT chk_contacto_origen CHECK ((id_tercero IS NOT NULL AND id_beneficiario IS NULL) OR (id_tercero IS NULL AND id_beneficiario IS NOT NULL))
);

CREATE TABLE Envios_Comunicacion (
    id_envio UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_campana UUID NOT NULL REFERENCES Campanas(id_campana),
    id_lista_distribucion UUID REFERENCES Listas_Distribucion(id_lista),
    asunto VARCHAR(255),
    cuerpo_mensaje TEXT,
    canal_envio VARCHAR(50) NOT NULL,
    fecha_envio TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE Corregimientos (
    id_corregimiento UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_corregimiento VARCHAR(100) NOT NULL,
    id_distrito UUID NOT NULL REFERENCES Distritos(id_distrito),
    CONSTRAINT uq_corregimiento_distrito UNIQUE (nombre_corregimiento, id_distrito)
);

CREATE TABLE Proyectos (
    id_proyecto UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_proyecto VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_inicio_plan DATE,
    fecha_fin_plan DATE,
    fecha_inicio_real DATE,
    fecha_fin_real DATE,
    id_estado_proyecto UUID NOT NULL REFERENCES Estados_Proyecto(id_estado_proyecto),
    id_usuario_creador UUID NOT NULL REFERENCES Usuarios(id_usuario),
    id_corregimiento_principal UUID REFERENCES Corregimientos(id_corregimiento),
    CONSTRAINT chk_proy_fechas_plan CHECK (fecha_fin_plan IS NULL OR fecha_fin_plan >= fecha_inicio_plan),
    CONSTRAINT chk_proy_fechas_real CHECK (fecha_fin_real IS NULL OR fecha_fin_real >= fecha_inicio_real)
);


CREATE TABLE Proyecto_Ubicaciones (
    id_proyecto UUID NOT NULL REFERENCES Proyectos(id_proyecto) ON DELETE CASCADE,
    id_corregimiento UUID NOT NULL REFERENCES Corregimientos(id_corregimiento) ON DELETE CASCADE,
    PRIMARY KEY (id_proyecto, id_corregimiento)
);

CREATE TABLE Proyecto_Equipo (
    id_proyecto UUID NOT NULL REFERENCES Proyectos(id_proyecto) ON DELETE CASCADE,
    id_usuario UUID NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    rol_en_proyecto VARCHAR(100),
    PRIMARY KEY (id_proyecto, id_usuario)
);

CREATE TABLE Tareas (
    id_tarea UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_tarea VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    fecha_vencimiento DATE,
    id_proyecto UUID NOT NULL REFERENCES Proyectos(id_proyecto) ON DELETE CASCADE,
    id_fase UUID REFERENCES Fases_Proyecto(id_fase),
    id_estado_tarea UUID NOT NULL REFERENCES Estados_Tarea(id_estado_tarea),
    id_prioridad_tarea UUID NOT NULL REFERENCES Prioridades_Tarea(id_prioridad_tarea),
    id_tarea_padre UUID REFERENCES Tareas(id_tarea),
    CONSTRAINT chk_tareas_fechas CHECK (fecha_vencimiento IS NULL OR fecha_vencimiento >= fecha_creacion::DATE)
);

CREATE TABLE Tarea_Asignados (
    id_tarea UUID NOT NULL REFERENCES Tareas(id_tarea) ON DELETE CASCADE,
    id_usuario UUID NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    PRIMARY KEY (id_tarea, id_usuario)
);

CREATE TABLE Hitos_Proyecto (
    id_hito UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_hito VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_prevista DATE,
    fecha_real_completado DATE,
    estado VARCHAR(50) NOT NULL,
    id_proyecto UUID NOT NULL REFERENCES Proyectos(id_proyecto) ON DELETE CASCADE,
    CONSTRAINT chk_hitos_fechas CHECK (fecha_real_completado IS NULL OR fecha_real_completado >= fecha_prevista)
);

CREATE TABLE Proyecto_Beneficiario (
    id_proyecto UUID NOT NULL REFERENCES Proyectos(id_proyecto) ON DELETE CASCADE,
    id_beneficiario UUID NOT NULL REFERENCES Beneficiarios(id_beneficiario) ON DELETE CASCADE,
    fecha_vinculacion TIMESTAMPTZ DEFAULT now(),
    estado VARCHAR(50) DEFAULT 'Activo' NOT NULL,
    PRIMARY KEY (id_proyecto, id_beneficiario)
);

CREATE TABLE Transacciones_Financieras (
    id_transaccion UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    monto NUMERIC(18, 2) NOT NULL,
    fecha_transaccion DATE DEFAULT now(),
    descripcion TEXT NOT NULL,
    id_tipo_transaccion UUID NOT NULL REFERENCES Tipos_Transaccion_Financiera(id_tipo_transaccion),
    id_proyecto UUID REFERENCES Proyectos(id_proyecto),
    id_tercero UUID REFERENCES Terceros(id_tercero),
    id_usuario_registro UUID NOT NULL REFERENCES Usuarios(id_usuario),
    estado VARCHAR(50) DEFAULT 'Completada' NOT NULL
);

CREATE TABLE Asientos_Contables (
    id_asiento UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_transaccion UUID NOT NULL REFERENCES Transacciones_Financieras(id_transaccion) ON DELETE CASCADE,
    id_cuenta_contable UUID NOT NULL REFERENCES Cuentas_Contables(id_cuenta_contable),
    debito NUMERIC(18, 2) DEFAULT 0 NOT NULL,
    credito NUMERIC(18, 2) DEFAULT 0 NOT NULL,
    fecha_asiento DATE DEFAULT now(),
    CONSTRAINT chk_asiento_monto CHECK (debito >= 0 AND credito >= 0 AND (debito > 0 OR credito > 0))
);

CREATE TABLE Presupuestos (
    id_presupuesto UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_presupuesto VARCHAR(255) NOT NULL,
    monto_total_asignado NUMERIC(18, 2) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    id_proyecto UUID REFERENCES Proyectos(id_proyecto),
    id_departamento UUID REFERENCES Departamentos(id_departamento),
    CONSTRAINT chk_presupuesto_entidad CHECK ((id_proyecto IS NOT NULL AND id_departamento IS NULL) OR (id_proyecto IS NULL AND id_departamento IS NOT NULL)),
    CONSTRAINT chk_presup_fechas CHECK (fecha_fin >= fecha_inicio)
);

CREATE TABLE Partidas_Presupuestarias (
    id_partida UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_presupuesto UUID NOT NULL REFERENCES Presupuestos(id_presupuesto) ON DELETE CASCADE,
    nombre_partida VARCHAR(255) NOT NULL,
    monto_asignado NUMERIC(18, 2) NOT NULL
);

CREATE TABLE Transaccion_Partida (
    id_transaccion UUID NOT NULL REFERENCES Transacciones_Financieras(id_transaccion),
    id_partida UUID NOT NULL REFERENCES Partidas_Presupuestarias(id_partida),
    monto_afectado NUMERIC(18, 2) NOT NULL,
    PRIMARY KEY (id_transaccion, id_partida)
);

CREATE TABLE Acuerdo_Proyecto (
    id_acuerdo UUID NOT NULL REFERENCES Acuerdos_Servicio(id_acuerdo) ON DELETE CASCADE,
    id_proyecto UUID NOT NULL REFERENCES Proyectos(id_proyecto) ON DELETE CASCADE,
    PRIMARY KEY (id_acuerdo, id_proyecto)
);

CREATE TABLE Proyecto_Archivos (
    id_proyecto UUID NOT NULL REFERENCES Proyectos(id_proyecto) ON DELETE CASCADE,
    id_archivo UUID NOT NULL REFERENCES Archivos(id_archivo) ON DELETE CASCADE,
    descripcion_archivo TEXT,
    PRIMARY KEY (id_proyecto, id_archivo)
);

CREATE TABLE Tarea_Archivos (
    id_tarea UUID NOT NULL REFERENCES Tareas(id_tarea) ON DELETE CASCADE,
    id_archivo UUID NOT NULL REFERENCES Archivos(id_archivo) ON DELETE CASCADE,
    descripcion_archivo TEXT,
    PRIMARY KEY (id_tarea, id_archivo)
);

CREATE TABLE Transaccion_Archivos (
    id_transaccion UUID NOT NULL REFERENCES Transacciones_Financieras(id_transaccion) ON DELETE CASCADE,
    id_archivo UUID NOT NULL REFERENCES Archivos(id_archivo) ON DELETE CASCADE,
    descripcion_archivo TEXT,
    PRIMARY KEY (id_transaccion, id_archivo)
);





CREATE INDEX idx_usuarios_correo ON Usuarios(correo);
CREATE INDEX idx_usurol_id_rol ON Usuario_Roles(id_rol);
CREATE INDEX idx_udp_id_depto ON Usuario_Departamento_Puesto(id_departamento);
CREATE INDEX idx_udp_id_puesto ON Usuario_Departamento_Puesto(id_puesto);
CREATE INDEX idx_archivos_id_usuario ON Archivos(id_usuario_subio);
CREATE INDEX idx_doc_id_tipodoc ON Documentos(id_tipo_documento);
CREATE INDEX idx_doc_id_usuario ON Documentos(id_usuario_creador);
CREATE INDEX idx_docver_id_archivo ON Documento_Versiones(id_archivo);
CREATE INDEX idx_provincias_id_pais ON Provincias(id_pais);
CREATE INDEX idx_distritos_id_provincia ON Distritos(id_provincia);
CREATE INDEX idx_corregimientos_id_distrito ON Corregimientos(id_distrito);
CREATE INDEX idx_proyectos_id_estado ON Proyectos(id_estado_proyecto);
CREATE INDEX idx_proyectos_id_creador ON Proyectos(id_usuario_creador);
CREATE INDEX idx_tareas_id_proyecto ON Tareas(id_proyecto);
CREATE INDEX idx_tareas_id_estado ON Tareas(id_estado_tarea);
CREATE INDEX idx_hitos_id_proyecto ON Hitos_Proyecto(id_proyecto);
CREATE INDEX idx_benef_id_usuario ON Beneficiarios(id_usuario_registra);
CREATE INDEX idx_trans_id_proyecto ON Transacciones_Financieras(id_proyecto);
CREATE INDEX idx_trans_id_tercero ON Transacciones_Financieras(id_tercero);
CREATE INDEX idx_trans_fecha ON Transacciones_Financieras(fecha_transaccion);
CREATE INDEX idx_asiento_id_trans ON Asientos_Contables(id_transaccion);
CREATE INDEX idx_asiento_id_cuenta ON Asientos_Contables(id_cuenta_contable);
CREATE INDEX idx_presup_id_proyecto ON Presupuestos(id_proyecto);
CREATE INDEX idx_presup_id_depto ON Presupuestos(id_departamento);
CREATE INDEX idx_activos_id_tipo ON Activos(id_tipo_activo);
CREATE INDEX idx_activos_id_depto ON Activos(id_departamento_asignado);
CREATE INDEX idx_mant_id_activo ON Mantenimientos_Activo(id_activo);
CREATE INDEX idx_audev_id_usuario ON Auditoria_Eventos(id_usuario);
CREATE INDEX idx_audcam_id_evento ON Auditoria_Cambios(id_evento_auditoria);
CREATE INDEX idx_notif_id_usuario ON Notificaciones(id_usuario_destino);






ALTER TABLE Beneficiarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE Beneficiarios FORCE ROW LEVEL SECURITY; -- Asegura que se aplique a los dueños de la tabla también.



CREATE POLICY polit_benef_propios ON Beneficiarios
    FOR ALL -- Se aplica a SELECT, INSERT, UPDATE, DELETE
    USING (id_usuario_registra = current_setting('app.current_user_id', true)::UUID)
    WITH CHECK (id_usuario_registra = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY polit_benef_admin ON Beneficiarios
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );


ALTER TABLE Usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE Usuarios FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_usuarios_propios ON Usuarios
    FOR ALL
    USING (id_usuario = current_setting('app.current_user_id', true)::UUID)
    WITH CHECK (id_usuario = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY polit_usuarios_admin ON Usuarios
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Sesiones_Usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE Sesiones_Usuario FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_sesiones_propias ON Sesiones_Usuario
    FOR SELECT
    USING (id_usuario = current_setting('app.current_user_id', true)::UUID);

ALTER TABLE Archivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE Archivos FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_archivos_propios ON Archivos
    FOR ALL
    USING (id_usuario_subio = current_setting('app.current_user_id', true)::UUID)
    WITH CHECK (id_usuario_subio = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY polit_archivos_admin ON Archivos
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE Documentos FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_documentos_propios ON Documentos
    FOR ALL
    USING (id_usuario_creador = current_setting('app.current_user_id', true)::UUID)
    WITH CHECK (id_usuario_creador = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY polit_documentos_admin ON Documentos
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE Notificaciones FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_notificaciones_propias ON Notificaciones
    FOR ALL
    USING (id_usuario_destino = current_setting('app.current_user_id', true)::UUID)
    WITH CHECK (id_usuario_destino = current_setting('app.current_user_id', true)::UUID);


ALTER TABLE Proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE Proyectos FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_proyectos_equipo ON Proyectos
    FOR SELECT
    USING (
        id_usuario_creador = current_setting('app.current_user_id', true)::UUID OR
        EXISTS (
            SELECT 1
            FROM Proyecto_Equipo pe
            WHERE pe.id_proyecto = Proyectos.id_proyecto
              AND pe.id_usuario = current_setting('app.current_user_id', true)::UUID
        )
    );

CREATE POLICY polit_proyectos_gestion ON Proyectos
    FOR ALL
    TO PUBLIC -- Aplica a todos los roles, la lógica de permisos está en el USING/WITH CHECK
    USING (
        id_usuario_creador = current_setting('app.current_user_id', true)::UUID OR
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        id_usuario_creador = current_setting('app.current_user_id', true)::UUID OR
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );


ALTER TABLE Tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE Tareas FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_tareas_visibilidad ON Tareas
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM Proyecto_Equipo pe
            WHERE pe.id_proyecto = Tareas.id_proyecto
              AND pe.id_usuario = current_setting('app.current_user_id', true)::UUID
        ) OR
        EXISTS (
            SELECT 1
            FROM Tarea_Asignados ta
            WHERE ta.id_tarea = Tareas.id_tarea
              AND ta.id_usuario = current_setting('app.current_user_id', true)::UUID
        )
    );

CREATE POLICY polit_tareas_gestion ON Tareas
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Proyecto_Equipo pe
            WHERE pe.id_proyecto = Tareas.id_proyecto
              AND pe.id_usuario = current_setting('app.current_user_id', true)::UUID
        ) OR
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Proyecto_Equipo pe
            WHERE pe.id_proyecto = Tareas.id_proyecto
              AND pe.id_usuario = current_setting('app.current_user_id', true)::UUID
        ) OR
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Hitos_Proyecto ENABLE ROW LEVEL SECURITY;
ALTER TABLE Hitos_Proyecto FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_hitos_visibilidad ON Hitos_Proyecto
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM Proyecto_Equipo pe
            WHERE pe.id_proyecto = Hitos_Proyecto.id_proyecto
              AND pe.id_usuario = current_setting('app.current_user_id', true)::UUID
        )
    );

CREATE POLICY polit_hitos_gestion ON Hitos_Proyecto
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Proyecto_Equipo pe
            WHERE pe.id_proyecto = Hitos_Proyecto.id_proyecto
              AND pe.id_usuario = current_setting('app.current_user_id', true)::UUID
        ) OR
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Proyecto_Equipo pe
            WHERE pe.id_proyecto = Hitos_Proyecto.id_proyecto
              AND pe.id_usuario = current_setting('app.current_user_id', true)::UUID
        ) OR
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );


ALTER TABLE Transacciones_Financieras ENABLE ROW LEVEL SECURITY;
ALTER TABLE Transacciones_Financieras FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_transacciones_visibilidad ON Transacciones_Financieras
    FOR SELECT
    USING (
        id_usuario_registro = current_setting('app.current_user_id', true)::UUID OR
        EXISTS (
            SELECT 1
            FROM Proyecto_Equipo pe
            WHERE pe.id_proyecto = Transacciones_Financieras.id_proyecto
              AND pe.id_usuario = current_setting('app.current_user_id', true)::UUID
        )
    );

CREATE POLICY polit_transacciones_gestion ON Transacciones_Financieras
    FOR ALL
    TO PUBLIC
    USING (
        id_usuario_registro = current_setting('app.current_user_id', true)::UUID OR
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        id_usuario_registro = current_setting('app.current_user_id', true)::UUID OR
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );


ALTER TABLE Presupuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE Presupuestos FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_presupuestos_visibilidad ON Presupuestos
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM Proyecto_Equipo pe
            WHERE pe.id_proyecto = Presupuestos.id_proyecto
              AND pe.id_usuario = current_setting('app.current_user_id', true)::UUID
        ) OR
        EXISTS (
            SELECT 1
            FROM Usuario_Departamento_Puesto udp
            WHERE udp.id_departamento = Presupuestos.id_departamento
              AND udp.id_usuario = current_setting('app.current_user_id', true)::UUID
        )
    );

CREATE POLICY polit_presupuestos_gestion ON Presupuestos
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador' -- O un rol como 'Gestor de Presupuestos'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );


ALTER TABLE Activos ENABLE ROW LEVEL SECURITY;
ALTER TABLE Activos FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_activos_visibilidad ON Activos
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Departamento_Puesto udp
            WHERE udp.id_departamento = Activos.id_departamento_asignado
              AND udp.id_usuario = current_setting('app.current_user_id', true)::UUID
        ) OR
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

CREATE POLICY polit_activos_gestion ON Activos
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador' -- O 'Gestor de Activos'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Auditoria_Eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE Auditoria_Eventos FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_auditoria_admin ON Auditoria_Eventos
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Auditoria_Cambios ENABLE ROW LEVEL SECURITY;
ALTER TABLE Auditoria_Cambios FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_auditoria_cambios_admin ON Auditoria_Cambios
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Campanas ENABLE ROW LEVEL SECURITY;
ALTER TABLE Campanas FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_campanas_gestion ON Campanas
    FOR ALL
    TO PUBLIC
    USING (
        id_usuario_responsable = current_setting('app.current_user_id', true)::UUID OR
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        id_usuario_responsable = current_setting('app.current_user_id', true)::UUID OR
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Listas_Distribucion ENABLE ROW LEVEL SECURITY;
ALTER TABLE Listas_Distribucion FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_listas_gestion ON Listas_Distribucion
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador' -- O 'Gestor de Comunicación'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Envios_Comunicacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE Envios_Comunicacion FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_envios_gestion ON Envios_Comunicacion
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador' -- O 'Gestor de Comunicación'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );


ALTER TABLE Roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE Roles FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_roles_read_all ON Roles FOR SELECT USING (true);
CREATE POLICY polit_roles_admin_write ON Roles
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Puestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE Puestos FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_puestos_read_all ON Puestos FOR SELECT USING (true);
CREATE POLICY polit_puestos_admin_write ON Puestos
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE Departamentos FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_departamentos_read_all ON Departamentos FOR SELECT USING (true);
CREATE POLICY polit_departamentos_admin_write ON Departamentos
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Tipos_Documento ENABLE ROW LEVEL SECURITY;
ALTER TABLE Tipos_Documento FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_tipos_documento_read_all ON Tipos_Documento FOR SELECT USING (true);
CREATE POLICY polit_tipos_documento_admin_write ON Tipos_Documento
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Paises ENABLE ROW LEVEL SECURITY;
ALTER TABLE Paises FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_paises_read_all ON Paises FOR SELECT USING (true);
CREATE POLICY polit_paises_admin_write ON Paises
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Estados_Proyecto ENABLE ROW LEVEL SECURITY;
ALTER TABLE Estados_Proyecto FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_estados_proyecto_read_all ON Estados_Proyecto FOR SELECT USING (true);
CREATE POLICY polit_estados_proyecto_admin_write ON Estados_Proyecto
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Fases_Proyecto ENABLE ROW LEVEL SECURITY;
ALTER TABLE Fases_Proyecto FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_fases_proyecto_read_all ON Fases_Proyecto FOR SELECT USING (true);
CREATE POLICY polit_fases_proyecto_admin_write ON Fases_Proyecto
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Estados_Tarea ENABLE ROW LEVEL SECURITY;
ALTER TABLE Estados_Tarea FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_estados_tarea_read_all ON Estados_Tarea FOR SELECT USING (true);
CREATE POLICY polit_estados_tarea_admin_write ON Estados_Tarea
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Prioridades_Tarea ENABLE ROW LEVEL SECURITY;
ALTER TABLE Prioridades_Tarea FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_prioridades_tarea_read_all ON Prioridades_Tarea FOR SELECT USING (true);
CREATE POLICY polit_prioridades_tarea_admin_write ON Prioridades_Tarea
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Tipos_Cuenta_Contable ENABLE ROW LEVEL SECURITY;
ALTER TABLE Tipos_Cuenta_Contable FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_tipos_cuenta_contable_read_all ON Tipos_Cuenta_Contable FOR SELECT USING (true);
CREATE POLICY polit_tipos_cuenta_contable_admin_write ON Tipos_Cuenta_Contable
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Tipos_Transaccion_Financiera ENABLE ROW LEVEL SECURITY;
ALTER TABLE Tipos_Transaccion_Financiera FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_tipos_transaccion_financiera_read_all ON Tipos_Transaccion_Financiera FOR SELECT USING (true);
CREATE POLICY polit_tipos_transaccion_financiera_admin_write ON Tipos_Transaccion_Financiera
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Tipos_Activo ENABLE ROW LEVEL SECURITY;
ALTER TABLE Tipos_Activo FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_tipos_activo_read_all ON Tipos_Activo FOR SELECT USING (true);
CREATE POLICY polit_tipos_activo_admin_write ON Tipos_Activo
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE Permisos FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_permisos_read_all ON Permisos FOR SELECT USING (true);
CREATE POLICY polit_permisos_admin_write ON Permisos
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Tipos_Campana ENABLE ROW LEVEL SECURITY;
ALTER TABLE Tipos_Campana FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_tipos_campana_read_all ON Tipos_Campana FOR SELECT USING (true);
CREATE POLICY polit_tipos_campana_admin_write ON Tipos_Campana
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Parametros_Sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE Parametros_Sistema FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_parametros_sistema_read_all ON Parametros_Sistema FOR SELECT USING (true);
CREATE POLICY polit_parametros_sistema_admin_write ON Parametros_Sistema
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Cuentas_Contables ENABLE ROW LEVEL SECURITY;
ALTER TABLE Cuentas_Contables FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_cuentas_contables_read_all ON Cuentas_Contables FOR SELECT USING (true);
CREATE POLICY polit_cuentas_contables_admin_write ON Cuentas_Contables
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Acuerdos_Servicio ENABLE ROW LEVEL SECURITY;
ALTER TABLE Acuerdos_Servicio FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_acuerdos_servicio_read_all ON Acuerdos_Servicio FOR SELECT USING (true);
CREATE POLICY polit_acuerdos_servicio_admin_write ON Acuerdos_Servicio
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE AIPs_Colaboradoras ENABLE ROW LEVEL SECURITY;
ALTER TABLE AIPs_Colaboradoras FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_aips_colaboradoras_read_all ON AIPs_Colaboradoras FOR SELECT USING (true);
CREATE POLICY polit_aips_colaboradoras_admin_write ON AIPs_Colaboradoras
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Provincias ENABLE ROW LEVEL SECURITY;
ALTER TABLE Provincias FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_provincias_read_all ON Provincias FOR SELECT USING (true);
CREATE POLICY polit_provincias_admin_write ON Provincias
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Distritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE Distritos FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_distritos_read_all ON Distritos FOR SELECT USING (true);
CREATE POLICY polit_distritos_admin_write ON Distritos
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Corregimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE Corregimientos FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_corregimientos_read_all ON Corregimientos FOR SELECT USING (true);
CREATE POLICY polit_corregimientos_admin_write ON Corregimientos
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Usuario_Roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE Usuario_Roles FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_usuario_roles_read_all ON Usuario_Roles FOR SELECT USING (true);
CREATE POLICY polit_usuario_roles_admin_write ON Usuario_Roles
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur_admin
            JOIN Roles r_admin ON ur_admin.id_rol = r_admin.id_rol
            WHERE ur_admin.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r_admin.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur_admin
            JOIN Roles r_admin ON ur_admin.id_rol = r_admin.id_rol
            WHERE ur_admin.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r_admin.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Rol_Permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE Rol_Permisos FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_rol_permisos_read_all ON Rol_Permisos FOR SELECT USING (true);
CREATE POLICY polit_rol_permisos_admin_write ON Rol_Permisos
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Proyecto_Ubicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE Proyecto_Ubicaciones FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_proyecto_ubicaciones_read_all ON Proyecto_Ubicaciones FOR SELECT USING (true);
CREATE POLICY polit_proyecto_ubicaciones_admin_write ON Proyecto_Ubicaciones
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Proyecto_Equipo ENABLE ROW LEVEL SECURITY;
ALTER TABLE Proyecto_Equipo FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_proyecto_equipo_read_all ON Proyecto_Equipo FOR SELECT USING (true);
CREATE POLICY polit_proyecto_equipo_admin_write ON Proyecto_Equipo
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Tarea_Asignados ENABLE ROW LEVEL SECURITY;
ALTER TABLE Tarea_Asignados FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_tarea_asignados_read_all ON Tarea_Asignados FOR SELECT USING (true);
CREATE POLICY polit_tarea_asignados_admin_write ON Tarea_Asignados
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Proyecto_Beneficiario ENABLE ROW LEVEL SECURITY;
ALTER TABLE Proyecto_Beneficiario FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_proyecto_beneficiario_read_all ON Proyecto_Beneficiario FOR SELECT USING (true);
CREATE POLICY polit_proyecto_beneficiario_admin_write ON Proyecto_Beneficiario
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Asientos_Contables ENABLE ROW LEVEL SECURITY;
ALTER TABLE Asientos_Contables FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_asientos_contables_read_all ON Asientos_Contables FOR SELECT USING (true);
CREATE POLICY polit_asientos_contables_admin_write ON Asientos_Contables
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Partidas_Presupuestarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE Partidas_Presupuestarias FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_partidas_presupuestarias_read_all ON Partidas_Presupuestarias FOR SELECT USING (true);
CREATE POLICY polit_partidas_presupuestarias_admin_write ON Partidas_Presupuestarias
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Transaccion_Partida ENABLE ROW LEVEL SECURITY;
ALTER TABLE Transaccion_Partida FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_transaccion_partida_read_all ON Transaccion_Partida FOR SELECT USING (true);
CREATE POLICY polit_transaccion_partida_admin_write ON Transaccion_Partida
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Acuerdo_Proyecto ENABLE ROW LEVEL SECURITY;
ALTER TABLE Acuerdo_Proyecto FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_acuerdo_proyecto_read_all ON Acuerdo_Proyecto FOR SELECT USING (true);
CREATE POLICY polit_acuerdo_proyecto_admin_write ON Acuerdo_Proyecto
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Proyecto_Archivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE Proyecto_Archivos FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_proyecto_archivos_read_all ON Proyecto_Archivos FOR SELECT USING (true);
CREATE POLICY polit_proyecto_archivos_admin_write ON Proyecto_Archivos
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Tarea_Archivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE Tarea_Archivos FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_tarea_archivos_read_all ON Tarea_Archivos FOR SELECT USING (true);
CREATE POLICY polit_tarea_archivos_admin_write ON Tarea_Archivos
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Transaccion_Archivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE Transaccion_Archivos FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_transaccion_archivos_read_all ON Transaccion_Archivos FOR SELECT USING (true);
CREATE POLICY polit_transaccion_archivos_admin_write ON Transaccion_Archivos
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Documento_Versiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE Documento_Versiones FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_documento_versiones_read_all ON Documento_Versiones FOR SELECT USING (true);
CREATE POLICY polit_documento_versiones_admin_write ON Documento_Versiones
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Documento_Firmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE Documento_Firmas FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_documento_firmas_read_all ON Documento_Firmas FOR SELECT USING (true);
CREATE POLICY polit_documento_firmas_admin_write ON Documento_Firmas
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Mantenimientos_Activo ENABLE ROW LEVEL SECURITY;
ALTER TABLE Mantenimientos_Activo FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_mantenimientos_activo_read_all ON Mantenimientos_Activo FOR SELECT USING (true);
CREATE POLICY polit_mantenimientos_activo_admin_write ON Mantenimientos_Activo
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Lista_Distribucion_Contactos ENABLE ROW LEVEL SECURITY;
ALTER TABLE Lista_Distribucion_Contactos FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_lista_distribucion_contactos_read_all ON Lista_Distribucion_Contactos FOR SELECT USING (true);
CREATE POLICY polit_lista_distribucion_contactos_admin_write ON Lista_Distribucion_Contactos
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );


ALTER TABLE Terceros ENABLE ROW LEVEL SECURITY;
ALTER TABLE Terceros FORCE ROW LEVEL SECURITY;
CREATE POLICY polit_terceros_read_all ON Terceros FOR SELECT USING (true);
CREATE POLICY polit_terceros_admin_write ON Terceros
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

ALTER TABLE Usuario_Departamento_Puesto ENABLE ROW LEVEL SECURITY;
ALTER TABLE Usuario_Departamento_Puesto FORCE ROW LEVEL SECURITY;

CREATE POLICY polit_udp_propios ON Usuario_Departamento_Puesto
    FOR SELECT
    USING (id_usuario = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY polit_udp_admin_write ON Usuario_Departamento_Puesto
    FOR ALL
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM Usuario_Roles ur
            JOIN Roles r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = current_setting('app.current_user_id', true)::UUID
              AND r.nombre_rol = 'Administrador'
        )
    );

CREATE OR REPLACE FUNCTION fn_auditar_usuarios()
RETURNS TRIGGER AS $$
DECLARE
    v_id_evento UUID;
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO Auditoria_Eventos (id_usuario, tipo_evento, descripcion)
        VALUES (NEW.id_usuario, 'CREACIÓN USUARIO', 'Se creó un nuevo usuario: ' || NEW.nombre_completo)
        RETURNING id_evento INTO v_id_evento;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO Auditoria_Eventos (id_usuario, tipo_evento, descripcion)
        VALUES (NEW.id_usuario, 'ACTUALIZACIÓN USUARIO', 'Se actualizó el usuario: ' || NEW.nombre_completo)
        RETURNING id_evento INTO v_id_evento;

        IF OLD.nombre_completo IS DISTINCT FROM NEW.nombre_completo THEN
            INSERT INTO Auditoria_Cambios (id_evento_auditoria, tabla_afectada, id_registro_afectado, campo_modificado, valor_anterior, valor_nuevo)
            VALUES (v_id_evento, 'Usuarios', NEW.id_usuario::TEXT, 'nombre_completo',
                    to_json(OLD.nombre_completo), to_json(NEW.nombre_completo));
        END IF;

        IF OLD.estado IS DISTINCT FROM NEW.estado THEN
            INSERT INTO Auditoria_Cambios (id_evento_auditoria, tabla_afectada, id_registro_afectado, campo_modificado, valor_anterior, valor_nuevo)
            VALUES (v_id_evento, 'Usuarios', NEW.id_usuario::TEXT, 'estado',
                    to_json(OLD.estado), to_json(NEW.estado));
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO Auditoria_Eventos (id_usuario, tipo_evento, descripcion)
        VALUES (OLD.id_usuario, 'ELIMINACIÓN USUARIO', 'Se eliminó el usuario: ' || OLD.nombre_completo);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_auditar_usuarios
AFTER INSERT OR UPDATE OR DELETE ON Usuarios
FOR EACH ROW EXECUTE FUNCTION fn_auditar_usuarios();

CREATE OR REPLACE FUNCTION fn_validar_fechas_proyecto()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.fecha_inicio_real IS NOT NULL AND NEW.fecha_inicio_plan IS NOT NULL AND 
       NEW.fecha_inicio_real < NEW.fecha_inicio_plan THEN
        RAISE EXCEPTION 'La fecha real de inicio no puede ser anterior a la fecha planificada';
    END IF;

    IF NEW.fecha_fin_real IS NOT NULL AND NEW.fecha_inicio_real IS NOT NULL AND 
       NEW.fecha_fin_real < NEW.fecha_inicio_real THEN
        RAISE EXCEPTION 'La fecha real de fin no puede ser anterior a la fecha de inicio real';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_validar_fechas_proyecto
BEFORE INSERT OR UPDATE ON Proyectos
FOR EACH ROW EXECUTE FUNCTION fn_validar_fechas_proyecto();

CREATE OR REPLACE FUNCTION fn_actualizar_estado_proyecto()
RETURNS TRIGGER AS $$
DECLARE
    v_proyecto_id UUID;
    v_pendientes INT;
    v_completadas INT;
    v_total INT;
BEGIN
    v_proyecto_id := COALESCE(NEW.id_proyecto, OLD.id_proyecto);

    SELECT COUNT(*) FILTER (WHERE e.nombre_estado = 'Pendiente') AS pendientes,
           COUNT(*) FILTER (WHERE e.nombre_estado = 'Completada') AS completadas,
           COUNT(*) AS total
    INTO v_pendientes, v_completadas, v_total
    FROM Tareas t JOIN Estados_Tarea e ON t.id_estado_tarea = e.id_estado_tarea
    WHERE t.id_proyecto = v_proyecto_id;

    IF v_total = 0 THEN
        RETURN NULL;
    ELSIF v_completadas = v_total THEN
        UPDATE Proyectos SET id_estado_proyecto = (SELECT id_estado_proyecto FROM Estados_Proyecto WHERE nombre_estado = 'Completado')
        WHERE id_proyecto = v_proyecto_id;
    ELSIF v_pendientes = v_total THEN
        UPDATE Proyectos SET id_estado_proyecto = (SELECT id_estado_proyecto FROM Estados_Proyecto WHERE nombre_estado = 'En Planificación')
        WHERE id_proyecto = v_proyecto_id;
    ELSE
        UPDATE Proyectos SET id_estado_proyecto = (SELECT id_estado_proyecto FROM Estados_Proyecto WHERE nombre_estado = 'En Progreso')
        WHERE id_proyecto = v_proyecto_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_actualizar_estado_proyecto
AFTER INSERT OR UPDATE OR DELETE ON Tareas
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_estado_proyecto();

CREATE OR REPLACE FUNCTION fn_actualizar_saldo_partida()
RETURNS TRIGGER AS $$
DECLARE
    v_partida UUID := COALESCE(NEW.id_partida, OLD.id_partida);
    v_monto NUMERIC(18,2) := COALESCE(NEW.monto_afectado, 0) - COALESCE(OLD.monto_afectado, 0);
    v_saldo NUMERIC(18,2);
BEGIN
    SELECT p.monto_asignado - COALESCE(SUM(t.monto_afectado),0)
    INTO v_saldo
    FROM Partidas_Presupuestarias p
    LEFT JOIN Transaccion_Partida t ON p.id_partida = t.id_partida
    WHERE p.id_partida = v_partida
    GROUP BY p.monto_asignado;

    IF v_saldo - v_monto < 0 THEN
        RAISE EXCEPTION 'No hay suficiente saldo en la partida presupuestaria';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_actualizar_saldo_partida
BEFORE INSERT OR DELETE ON Transaccion_Partida
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_saldo_partida();

CREATE OR REPLACE FUNCTION fn_control_versiones_documento()
RETURNS TRIGGER AS $$
DECLARE
    v_ultima TEXT;
BEGIN
    SELECT numero_version INTO v_ultima
    FROM Documento_Versiones
    WHERE id_documento = NEW.id_documento
    ORDER BY fecha_version DESC LIMIT 1;

    NEW.numero_version := COALESCE(v_ultima, '1.0');
    IF v_ultima IS NOT NULL THEN
        NEW.numero_version := SPLIT_PART(v_ultima, '.', 1) || '.' || (SPLIT_PART(v_ultima, '.', 2)::INT + 1)::TEXT;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_control_versiones_documento
BEFORE INSERT ON Documento_Versiones
FOR EACH ROW EXECUTE FUNCTION fn_control_versiones_documento();

CREATE OR REPLACE FUNCTION fn_notificar_asignacion_tarea()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO Notificaciones (id_usuario_destino, mensaje, url_relacionada)
    VALUES (
        NEW.id_usuario,
        'Has sido asignado a una nueva tarea: ' || NEW.nombre_tarea,
        '/tareas/' || NEW.id_tarea::TEXT
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_notificar_asignacion_tarea
AFTER INSERT ON Tarea_Asignados
FOR EACH ROW EXECUTE FUNCTION fn_notificar_asignacion_tarea();

CREATE OR REPLACE FUNCTION fn_programar_proximo_mantenimiento()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.fecha_mantenimiento IS NOT NULL AND OLD.fecha_mantenimiento IS NULL THEN
        INSERT INTO Mantenimientos_Activo (id_activo, fecha_mantenimiento, descripcion)
        VALUES (
            NEW.id_activo,
            NEW.fecha_mantenimiento + INTERVAL '6 months',
            'Mantenimiento periódico programado automáticamente'
        );
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_programar_proximo_mantenimiento
AFTER UPDATE ON Mantenimientos_Activo
FOR EACH ROW EXECUTE FUNCTION fn_programar_proximo_mantenimiento();

CREATE OR REPLACE FUNCTION fn_limpiar_sesiones_expiradas()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM Sesiones_Usuario
    WHERE fecha_fin IS NULL
    AND fecha_inicio < (NOW() - INTERVAL '30 days');
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_limpiar_sesiones_expiradas
AFTER INSERT ON Sesiones_Usuario
FOR EACH STATEMENT EXECUTE FUNCTION fn_limpiar_sesiones_expiradas();