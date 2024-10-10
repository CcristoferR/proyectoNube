const express = require('express');
const cors = require('cors');
const sql = require('mssql'); // Módulo correcto para Azure SQL
const path = require('path');

const app = express();

// Configuración de la conexión a la base de datos
const config = {
    user: 'Cristofer',
    password: '2k20Cris1a2s3d4f',
    server: 'proyectonube.database.windows.net',
    database: 'proyectoNube',
    options: {
        encrypt: true, // Azure requiere conexiones encriptadas
        trustServerCertificate: false
    },
};

// Establecer el puerto (puedes cambiarlo según sea necesario)
const PORT = process.env.PORT || 3000; // Usa el puerto del entorno o 3000 por defecto
app.set("port", PORT);

app.use(cors());
app.use(express.json()); // para analizar application/json
app.use(express.urlencoded({ extended: true })); // para analizar application/x-www-form-urlencoded

// Ruta para servir el archivo HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Asegúrate de que el archivo index.html está en la misma carpeta
});

// Conectar a la base de datos
sql.connect(config).then(pool => {
    console.log('Conectado a la base de datos');

    // Ruta para obtener todos los usuarios
    app.get('/usuarios', async (req, res) => {
        try {
            const result = await pool.request().query('SELECT * FROM usuarios'); // Asegúrate de que la tabla se llama "usuarios"
            res.json(result.recordset); // Enviar los datos como respuesta
        } catch (err) {
            console.error('Error al obtener usuarios:', err);
            res.status(500).send('Error al obtener usuarios');
        }
    });

    // Ruta para agregar un nuevo usuario
    app.post('/usuarios', async (req, res) => {
        const { nombre, email } = req.body; // Obtener datos del cuerpo de la solicitud
        try {
            await pool.request()
                .input('nombre', sql.VarChar, nombre)
                .input('email', sql.VarChar, email)
                .query('INSERT INTO usuarios (nombre, email) VALUES (@nombre, @email)');
            res.send('Usuario agregado correctamente');
        } catch (err) {
            console.error('Error al agregar usuario:', err);
            res.status(500).send('Error al agregar usuario');
        }
    });

    // Ruta para editar un usuario
    app.put('/usuarios/:id', async (req, res) => {
        const { id } = req.params;
        const { nombre, email } = req.body;
        try {
            await pool.request()
                .input('id', sql.Int, id)
                .input('nombre', sql.VarChar, nombre)
                .input('email', sql.VarChar, email)
                .query('UPDATE usuarios SET nombre = @nombre, email = @email WHERE id = @id');
            res.send('Usuario editado correctamente');
        } catch (err) {
            console.error('Error al editar usuario:', err);
            res.status(500).send('Error al editar usuario');
        }
    });

    // Ruta para eliminar un usuario
    app.delete('/usuarios/:id', async (req, res) => {
        const { id } = req.params;
        try {
            await pool.request()
                .input('id', sql.Int, id)
                .query('DELETE FROM usuarios WHERE id = @id');
            res.send('Usuario eliminado correctamente');
        } catch (err) {
            console.error('Error al eliminar usuario:', err);
            res.status(500).send('Error al eliminar usuario');
        }
    });

    // Iniciar el servidor
    app.listen(PORT, () => {
        console.log(`Servidor en funcionamiento en el puerto ${PORT}`);
    });
}).catch(err => {
    console.error('Error al conectar a la base de datos:', err);
});
