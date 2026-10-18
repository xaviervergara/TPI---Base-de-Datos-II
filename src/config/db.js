import mongoose from "mongoose";

/**
 * Establece la conexión con MongoDB Atlas usando Mongoose.
 * La URI y el nombre de la base se leen de las variables de entorno (.env).
 */
export async function connectDB() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME || "tienda_tpi";

  if (!uri) {
    throw new Error(
      "Falta la variable MONGO_URI. Copiá .env.example a .env y completá tu connection string.",
    );
  }

  await mongoose.connect(uri, { dbName });
  console.log(`Conexión exitosa a MongoDB Atlas (base: ${dbName})`);
}

/**
 * Cierra la conexión activa con MongoDB.
 */
export async function disconnectDB() {
  await mongoose.connection.close();
  console.log("Conexión a MongoDB cerrada.");
}
