const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.register = async (req, res) => {
  const { email, password, name, role } = req.body;

  try {
    const existingUser = await prisma.usuarios.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Este email ya está registrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.usuarios.create({
      data: {
        email,
        hash_contrasena: hashedPassword,
        nombre: name,
        rol: role,
        esta_verificado: true, // Para MVP, auto-verificar
      },
    });

    const token = jwt.sign({ userId: user.id, role: user.rol }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: 'Usuario creado. Revisa tu email para verificar tu cuenta.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el usuario.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.usuarios.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.hash_contrasena))) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    if (!user.esta_verificado) {
      return res.status(403).json({ error: 'Debes verificar tu email antes de iniciar sesión.' });
    }

    const token = jwt.sign({ userId: user.id, role: user.rol }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.nombre, 
        role: user.rol 
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
};

// Controlador para manejar el callback de Google OAuth
exports.googleCallback = (req, res) => {
  // Passport nos entrega el token JWT generado en la estrategia de Google.
  const token = req.user.token;

  // Si la autenticación fue exitosa y tenemos un token, procedemos.
  if (token) {
    // Redirigimos al usuario de vuelta al frontend, enviando el token en la URL.
    // El frontend usará este token para mantener la sesión del usuario iniciada.
    res.redirect(`${process.env.FRONTEND_URL}/?token=${token}`);
  } else {
    // Si algo falló y no se generó un token, lo enviamos a la página de login con un error.
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
};