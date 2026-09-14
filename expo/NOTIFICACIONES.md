# Avisos push — que falta para encenderlos

El codigo esta completo. Faltan tres cosas que no se pueden escribir desde el
repositorio porque las genera Google, Apple o dependen del plan de Firebase.

## Estado

| Pieza | Estado |
|---|---|
| Registro del aparato y token de Expo (`pushNotificationService.ts`) | listo, ya existia |
| Disparador por cambio de estado de reserva (`avisarCambioDeReserva`) | listo |
| Vaciado de la cola `notifications` (`enviarAvisoEncolado`) | listo |
| Aviso de emergencia a administradores (`avisarEmergencia`) | listo |
| Reglas de Firestore de `deviceTokens` y `notifications` | listas y desplegadas |
| Configuracion de la app (`app.config.js`) | lista |
| `google-services.json` (Android) | **falta descargarlo** |
| `GoogleService-Info.plist` (iOS) | **falta descargarlo** |
| Llave APNs subida a Expo (iOS) | **falta** |
| Plan Blaze en Firebase | **falta** (decision aplazada a proposito) |

## 1. `google-services.json` — Android

No se puede inventar: lo genera Firebase con los identificadores reales del
proyecto. Se descarga asi:

1. Consola de Firebase, proyecto **escolta-pro-fe90e**.
2. Engrane, **Project settings**, pestaña **General**.
3. En **Your apps**, boton **Add app**, icono de **Android**.
4. Package name, exactamente: `com.escolta.pro`
   (tiene que coincidir con `android.package` de `app.config.js`; si no
   coincide, el archivo no sirve).
5. Apodo: Escolta Pro Android. El SHA-1 se puede dejar vacio por ahora;
   hace falta despues, para Google Sign-In y App Links.
6. **Download google-services.json** y guardarlo en `expo/google-services.json`.

Para comprobar que es el correcto, debe contener el numero de proyecto de
`escolta-pro-fe90e` y un `package_name` igual a `com.escolta.pro`:

```
project_info.project_number      -> el numero del proyecto
project_info.project_id          -> escolta-pro-fe90e
client[].client_info.android_client_info.package_name -> com.escolta.pro
```

## 2. `GoogleService-Info.plist` — iOS

Mismo camino, pero eligiendo **iOS** en el paso 3, con bundle ID
`com.escolta.pro`. Se guarda en `expo/GoogleService-Info.plist`.

## 3. Llave APNs — iOS

Apple no deja que un servidor mande avisos a un iPhone sin una llave de
notificaciones. Se crea en la cuenta de Apple Developer
(Certificates, Identifiers & Profiles, **Keys**, marcando Apple Push
Notifications service) y se sube a Expo con `eas credentials`. Sin esto los
avisos llegan a Android y no a iOS.

## 4. Plan Blaze

Las tres funciones de aviso son Cloud Functions v2 y salen a `exp.host` para
entregar. Las dos cosas requieren Blaze; en Spark no se despliegan. Mientras
tanto el codigo queda en el repositorio sin desplegarse y no estorba: nada en
la app depende de que existan.

## Los dos archivos NO se suben al repositorio

Estan en `.gitignore` porque este repositorio es publico. Para compilar con
EAS hay que cargarlos como archivos secretos del proyecto:

```
eas secret:create --scope project --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json
```

`app.config.js` los declara solo si existen en local, asi que la compilacion
web y el arranque en desarrollo funcionan igual sin ellos.
