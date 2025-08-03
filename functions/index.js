/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onDocumentWritten} = require("firebase-functions/v2/firestore");
const {onCall} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({maxInstances: 10});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Inicializar admin solo si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

// Sincroniza automáticamente el perfil del conductor de 'users' a 'drivers'
exports.syncDriverProfile = onDocumentWritten("users/{userId}", async (event) => {
  const userId = event.params.userId;
  const after = event.data?.after?.data();
  const before = event.data?.before?.data();

  console.log(`[syncDriverProfile] Evento detectado para usuario: ${userId}`);
  console.log(`[syncDriverProfile] Antes:`, before);
  console.log(`[syncDriverProfile] Después:`, after);

  // Si el usuario dejó de ser conductor, eliminar de drivers
  if (!after || after.role !== 'driver') {
    if (before && before.role === 'driver') {
      console.log(
        `[syncDriverProfile] Usuario ${userId} ya no es conductor, eliminando de drivers`
      );
      await admin
        .firestore()
        .collection("drivers")
        .doc(userId)
        .delete()
        .catch((error) => {
          console.error(
            `[syncDriverProfile] Error al eliminar conductor:`,
            error
          );
        });
    }
    return null;
  }

  // Solo sincroniza si el usuario es conductor
  console.log(
    `[syncDriverProfile] Sincronizando datos del conductor: ${userId}`
  );

  // Campos a sincronizar (solo campos planos, sin objetos anidados)
  const driverData = {
    name: after.name || after.displayName || "",
    email: after.email || "",
    phone: after.phone || after.phoneNumber || "",
    carMake: after.carMake || "",
    carModel: after.carModel || "",
    carColor: after.carColor || "",
    carPlate: after.carPlate || "",
    license: after.license || "",
    driverPhoto: after.driverPhoto || after.photo || "",
    vehiclePhoto: after.vehiclePhoto || "",
    platePhoto: after.platePhoto || "",
    nick: after.nick || "",
    rating: after.rating || 5,
    location: after.location || null,
    role: "driver",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    syncedFromUsers: true,
    isAvailable: after.isAvailable !== undefined ? after.isAvailable : true,
    status: after.status || "active",
    totalRides: after.totalRides || after.trips || 0,
    earnings: after.earnings || 0,
    // Puedes agregar aquí cualquier otro campo plano relevante
  };

  console.log(`[syncDriverProfile] Datos a sincronizar:`, driverData);

  try {
    // Escribe/actualiza el documento en drivers
    await admin
      .firestore()
      .collection("drivers")
      .doc(userId)
      .set(driverData, { merge: true });
    console.log(`[syncDriverProfile] Sincronización exitosa para: ${userId}`);
  } catch (error) {
    console.error(`[syncDriverProfile] Error al sincronizar:`, error);
    throw error;
  }

  return null;
});

// Función simple para sincronizar manualmente
exports.syncAllDrivers = onCall(async (request) => {
  try {
    console.log("Iniciando sincronización manual...");

    const usersSnapshot = await admin
      .firestore()
      .collection("users")
      .where("role", "==", "driver")
      .get();

    if (usersSnapshot.empty) {
      return {
        success: true,
        message: "No se encontraron conductores",
        count: 0,
      };
    }

    const batch = admin.firestore().batch();
    let syncCount = 0;

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      const driverId = doc.id;

      const driverData = {
        name: userData.name || userData.displayName || "",
        email: userData.email || "",
        phone: userData.phone || userData.phoneNumber || "",
        driverPhoto: userData.driverPhoto || userData.photo || "",
        carMake: userData.carMake || "",
        carModel: userData.carModel || "",
        carColor: userData.carColor || "",
        carPlate: userData.carPlate || "",
        license: userData.license || "",
        vehiclePhoto: userData.vehiclePhoto || "",
        platePhoto: userData.platePhoto || "",
        nick: userData.nick || "",
        role: "driver",
        rating: userData.rating || 5,
        location: userData.location || null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        syncedFromUsers: true,
        // Mantener campos específicos de drivers si existen
        isAvailable:
          userData.isAvailable !== undefined ? userData.isAvailable : true,
        status: userData.status || "active",
        totalRides: userData.totalRides || userData.trips || 0,
        earnings: userData.earnings || 0,
      };

      const driverRef = admin.firestore().collection("drivers").doc(driverId);
      batch.set(driverRef, driverData, { merge: true });
      syncCount++;
    });

    await batch.commit();

    console.log(
      `Sincronización completada. ${syncCount} conductores sincronizados.`
    );

    return {
      success: true,
      message: "Sincronización completada exitosamente",
      count: syncCount,
    };
  } catch (error) {
    console.error("Error en sincronización manual:", error);
    throw new Error("Error al sincronizar conductores");
  }
});
