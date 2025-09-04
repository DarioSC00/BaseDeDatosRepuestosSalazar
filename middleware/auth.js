const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'tu_clave_secreta';

module.exports = (req, res, next) => {
  console.log('🔐 Middleware de autenticación ejecutándose...');
  console.log('📋 Headers recibidos:', req.headers.authorization ? 'Bearer token presente' : 'No Authorization header');
  
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    console.log('❌ No se encontró token en la petición');
    return res.status(401).json({ msg: 'No token, autorización denegada' });
  }

  try {
    console.log('🔍 Verificando token...');
    const decoded = jwt.verify(token, SECRET);
    console.log('✅ Token válido, usuario ID:', decoded._id);
    req.userId = decoded._id;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    console.log('❌ Token inválido:', error.message);
    res.status(401).json({ msg: 'Token no válido' });
  }
};
