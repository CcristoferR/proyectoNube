const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const config = {
    user: 'Cristofer',
    password: '2k20Cris1a2s3d4f',
    server: 'proyectonube.database.windows.net',
    database: 'proyectoNube',
    options: {
        encrypt: true,
        trustServerCertificate: false
    },
};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

sql.connect(config).then(pool => {
    console.log('Conectado a la base de datos');

    app.get('/usuarios', async (req, res) => {
        try {
            const result = await pool.request().query('SELECT * FROM usuarios');
            res.json(result.recordset);
        } catch (err) {
            console.error('Error al obtener usuarios:', err);
            res.status(500).send('Error al obtener usuarios');
        }
    });

    app.post('/usuarios', async (req, res) => {
        const { nombre, email } = req.body;
        try {
            const existingUser = await pool.request()
                .input('Email', sql.VarChar, email)
                .query('SELECT * FROM usuarios WHERE email = @Email');

            if (existingUser.recordset.length > 0) {
                return res.status(400).json({ message: 'El correo electrónico ya está en uso.' });
            }

            await pool.request()
                .input('Nombre', sql.VarChar, nombre)
                .input('Email', sql.VarChar, email)
                .query('INSERT INTO usuarios (nombre, email) VALUES (@Nombre, @Email)');

            res.status(201).json({ message: 'Usuario agregado correctamente.' });
        } catch (err) {
            console.error('Error al agregar usuario:', err);
            res.status(500).send('Error al agregar usuario');
        }
    });

    app.put('/usuarios/:id', async (req, res) => {
        const { id } = req.params;
        const { nombre, email } = req.body;
        try {
            await pool.request()
                .input('Id', sql.Int, id)
                .input('Nombre', sql.VarChar, nombre)
                .input('Email', sql.VarChar, email)
                .query('UPDATE usuarios SET nombre = @Nombre, email = @Email WHERE id = @Id');

            res.status(200).json({ message: 'Usuario actualizado correctamente.' });
        } catch (err) {
            console.error('Error al actualizar usuario:', err);
            res.status(500).send('Error al actualizar usuario');
        }
    });

    app.delete('/usuarios/:id', async (req, res) => {
        const { id } = req.params;
        try {
            await pool.request()
                .input('Id', sql.Int, id)
                .query('DELETE FROM usuarios WHERE id = @Id');

            res.status(200).json({ message: 'Usuario eliminado correctamente.' });
        } catch (err) {
            console.error('Error al eliminar usuario:', err);
            res.status(500).send('Error al eliminar usuario');
        }
    });

    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Error al conectar a la base de datos:', err);
});
