const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 8080; // Puerto en el que escuchará el servidor
const PASSWORD = process.env.PASSWORD; // Contraseña de la base de datos MongoDB

// Conexión a la base de datos MongoDB
mongoose.connect(`mongodb+srv://denis:${PASSWORD}@cluster0.kzcrusy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
  .then(() => console.log('Conexión a MongoDB establecida'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// Definir el esquema de los datos
const dataSchema = new mongoose.Schema({
  temperatureIn: Number,
  humidityIntoIncubator: Number,
  lightLevel: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Definir el modelo de datos
const Data = mongoose.model('Data', dataSchema);

// Middleware para parsear el cuerpo de las solicitudes
app.use(bodyParser.json());

// Ruta para manejar las solicitudes PUT
app.put('/data', async (req, res) => {
  console.log(req.body);
  // Recibir datos del cuerpo de la solicitud
  const { temperatureIn, humidityIntoIncubator, lightLevel } = req.body;

  // Guardar los datos en la base de datos
  try {
    const newData = new Data({ temperatureIn, humidityIntoIncubator, lightLevel });
    await newData.save();
    res.send('Datos guardados correctamente en MongoDB');
  } catch (err) {
    console.error('Error al guardar los datos en MongoDB:', err);
    res.status(500).send('Error interno del servidor');
  }
});

// Ruta para manejar las solicitudes POST
app.get('/data', async (req, res) => {
  try {
    const sectionNumber = req.body.page || 1; // Por defecto, obtén la sección 1 si no se proporciona ningún parámetro
    const pageSize = 10; // Tamaño de cada página de datos

    // Calcular el índice de inicio y fin de la sección de datos
    const startIndex = (sectionNumber - 1) * pageSize;
    const endIndex = sectionNumber * pageSize;

    // Obtener los datos de la base de datos según el índice de inicio y fin
    const data = await Data.find();
    console.log(data);
    res.json(data);
  } catch (err) {
    console.error('Error al consultar los datos en MongoDB:', err);
    res.status(500).send('Error interno del servidor');
  }
});


// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
