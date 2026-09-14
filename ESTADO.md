# Escolta Pro — dónde quedó

Última revisión: 14 de septiembre de 2026.

## Listo y verificado

- 0 errores de TypeScript en la app y en las Cloud Functions.
- 65 de 77 pruebas pasan. Las 12 que fallan son de AuthContext, por Firebase
  bajo Jest, no por lógica de negocio.
- Build web correcto (`npx expo export --platform web`).
- Fuera de la plataforma Rork: el proyecto se compila y se desarrolla solo.
- Una sola base de código, Expo, para web, iOS y Android. El proyecto iOS
  nativo quedó archivado en el tag `ios-nativo-archivado`.
- Reglas de Firestore: 27 bloques, desplegadas y comprobadas contra el
  proyecto vivo. Se cerró la fuga del padrón (cualquier usuario registrado
  podía listar los 8 usuarios completos) y se escribieron las once
  colecciones que el cliente usaba y que estaban denegadas por defecto:
  payouts, ledger, reviews, incidentReports, deletion_requests,
  kyc_audit_log, refunds, typing, usage_metrics, cost_alerts,
  rateLimitViolations.
- Rol unificado en `guard`. El sembrador escribía `bodyguard` mientras el tipo
  y diez pantallas esperaban `guard`; por eso un escolta entraba y la app no
  lo reconocía en ninguna pantalla. Los 5 documentos ya están migrados.
- Cinco atajos de los endpoints de pago que devolvían éxito falso pasan por
  una sola función que exige no estar en la nube.
- `resetDemoPasswords` exige interruptor de entorno y rol de administrador.
  Antes bastaba con estar autenticado: cualquiera que se registrara podía
  devolver admin@demo.com a su contraseña pública.
- Contraseñas demo fuera del código: 256 apariciones en 71 archivos. Ahora
  salen del entorno (`EXPO_PUBLIC_DEMO_*`, `DEMO_PASS_*`).
- Avisos push escritos y sin desplegar: tres disparadores en
  `functions/src/notificaciones.ts`. Ver `NOTIFICACIONES.md`.

## Lo que falta, y de quién depende

**De Abraham, y cierra la publicación:**
1. Cambiar las 4 contraseñas demo en la consola de Firebase. Las viejas están
   en el historial público de git y hay que darlas por quemadas.
2. `git push origin main`.
3. Conectar Vercel: raíz `expo`, build `npx expo export --platform web`,
   salida `dist`, y las variables `EXPO_PUBLIC_*` cargadas en el proyecto.
   El push va primero: si no, se publica la versión que muestra las
   credenciales en pantalla.
4. Limpiar en la consola los 4 documentos de escolta huérfanos (guard1 y
   guard2, duplicados, sin cuenta de acceso), o crearles su cuenta. Hoy el
   único escolta que entra es bodyguard@demo.com.

**Aplazado a propósito, hasta tener carros y escoltas registrados:**
5. Subir Firebase a Blaze. Sin eso las Cloud Functions no se despliegan, así
   que los avisos push y los tres disparadores quedan escritos sin correr.
   El arreglo de `resetDemoPasswords` se despliega en el mismo movimiento,
   nunca después: ese hueco se vuelve real el día que haya Blaze.

**Para tomar trabajo real:**
6. `guardMatchingService` no lo importa ninguna pantalla. El motor que empareja
   cliente con escolta existe y no está conectado, así que un cliente todavía
   no puede encontrar a nadie. Ojo: con las reglas nuevas un cliente ya no
   puede listar `users`, así que el camino correcto es una colección `guards`
   con solo el perfil público del escolta, alimentada desde el servidor.
7. Braintree está en `sandbox`. No puede cobrar dinero real.
8. REPSE y licencia de seguridad privada. No dependen del código.

## Datos de la operación al 14 de septiembre de 2026

8 usuarios, 0 reservas en toda la historia, 2 pagos, 1 registro de payout.
El ciclo reserva → pago → seguimiento → liquidación nunca ha corrido completo.

## Cómo comprobar el estado en cualquier momento

    node ~/repos/prueba-escolta.mjs

Entra con los cuatro roles, verifica rol y KYC, prueba las reglas de
seguridad y comprueba las once reglas nuevas contra el proyecto vivo.
Un 403 no siempre es fallo: en una regla por documento lo correcto es negar
la lista sin filtro y permitir la consulta filtrada. El script trae la tabla
de lo que debe salir en cada caso.
