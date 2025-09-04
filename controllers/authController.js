const User = require('../models/User');
const jwt = require('jsonwebtoken');
const transporter = require('../config/emailConfig');
const crypto = require('crypto');
const SECRET = process.env.JWT_SECRET || 'tu_clave_secreta';

// Almacén temporal para códigos de verificación (en producción usar Redis)
const verificationCodes = new Map();

// Login sencillo (sin encriptar)
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password }).populate('role', 'name');
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Preparar datos del usuario para el localStorage
    const userData = {
      _id: user._id,
      document: user.document,
      full_name: user.full_name,
      name: user.full_name, // Usar full_name como name para compatibilidad
      email: user.email,
      phone: user.phone,
      locations: user.locations,
      status: user.status,
      role: {
        _id: user.role._id,
        name: user.role.name // Asegurar que el rol tenga la estructura correcta
      },
      created_at: user.created_at
    };
    
    // Generar token
    const token = jwt.sign({ _id: user._id, email: user.email }, SECRET, { expiresIn: '8h' });
    
    console.log('✅ Login exitoso para usuario:', userData.full_name);
    console.log('📋 Rol asignado:', userData.role.name);
    
    res.json({ 
      message: 'Login exitoso', 
      user: userData, 
      token 
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ error: error.message });
  }
};

// Generar y enviar código de recuperación
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    // Verificar si el usuario existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'No existe una cuenta con este correo electrónico' });
    }

    // Generar código de 6 dígitos
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Almacenar código con expiración de 15 minutos
    const expirationTime = Date.now() + 15 * 60 * 1000; // 15 minutos
    verificationCodes.set(email, {
      code: verificationCode,
      expires: expirationTime,
      attempts: 0
    });

    // Plantilla del email
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .code-box { background: #f8fafc; border: 2px solid #3b82f6; border-radius: 12px; padding: 30px; text-align: center; margin: 20px 0; }
          .code { font-size: 32px; font-weight: bold; color: #1d4ed8; letter-spacing: 8px; font-family: monospace; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; }
          .warning { background: #fef3cd; border: 1px solid #fbbf24; color: #92400e; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Recuperación de Contraseña</h1>
            <p>Ferretería Salazar</p>
          </div>
          <div class="content">
            <h2>Hola ${user.name || 'Usuario'},</h2>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta. Tu código de verificación es:</p>
            
            <div class="code-box">
              <div class="code">${verificationCode}</div>
              <p style="margin: 10px 0 0 0; color: #6b7280;">Código de verificación</p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Este código expira en <strong>15 minutos</strong></li>
                <li>Solo puedes usarlo una vez</li>
                <li>Si no solicitaste este cambio, ignora este correo</li>
              </ul>
            </div>
            
            <p>Si tienes problemas, contacta al administrador del sistema.</p>
          </div>
          <div class="footer">
            <p>Este es un correo automático, no responder.</p>
            <p>© 2025 Ferretería Salazar - Sistema de Gestión</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Enviar email
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: '🔒 Código de Recuperación de Contraseña - Ferretería Salazar',
        html: emailHTML
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Email enviado exitosamente a ${email}`);
      
      res.json({ 
        message: 'Código de verificación enviado correctamente',
        expires: expirationTime
      });

    } catch (emailError) {
      console.error('❌ Error al enviar email:', emailError);
      
      // Si falla el email, borramos el código guardado
      verificationCodes.delete(email);
      
      // Respuesta de error específica
      if (emailError.code === 'EAUTH') {
        res.status(500).json({ 
          error: 'Error de autenticación del servidor de correo. Contacta al administrador.' 
        });
      } else if (emailError.code === 'ECONNECTION') {
        res.status(500).json({ 
          error: 'No se pudo conectar al servidor de correo. Intenta más tarde.' 
        });
      } else {
        res.status(500).json({ 
          error: 'Error al enviar el código de verificación. Intenta más tarde.' 
        });
      }
    }

  } catch (error) {
    console.error('Error general en forgotPassword:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Verificar código de recuperación
exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;
  
  try {
    const storedData = verificationCodes.get(email);
    
    if (!storedData) {
      return res.status(400).json({ error: 'No hay código de verificación para este correo' });
    }

    // Verificar expiración
    if (Date.now() > storedData.expires) {
      verificationCodes.delete(email);
      return res.status(400).json({ error: 'El código ha expirado. Solicita uno nuevo.' });
    }

    // Verificar intentos máximos
    if (storedData.attempts >= 3) {
      verificationCodes.delete(email);
      return res.status(400).json({ error: 'Demasiados intentos fallidos. Solicita un nuevo código.' });
    }

    // Verificar código
    if (storedData.code !== code) {
      storedData.attempts++;
      return res.status(400).json({ error: 'Código incorrecto' });
    }

    // Código correcto - generar token de reset
    const resetToken = jwt.sign(
      { email, purpose: 'password_reset' }, 
      SECRET, 
      { expiresIn: '30m' }
    );

    // Limpiar código usado
    verificationCodes.delete(email);

    res.json({ 
      valid: true, 
      resetToken,
      message: 'Código verificado correctamente'
    });

  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ error: 'Error al verificar el código' });
  }
};

// Resetear contraseña
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  
  try {
    // Verificar token
    const decoded = jwt.verify(token, SECRET);
    
    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({ error: 'Token inválido' });
    }

    // Buscar usuario
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Actualizar contraseña (en texto plano por ahora)
    user.password = newPassword;
    await user.save();

    res.json({ 
      message: 'Contraseña actualizada correctamente',
      email: decoded.email
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }
    res.status(500).json({ error: 'Error al actualizar la contraseña' });
  }
};

// Verificar token de reset
exports.verifyResetToken = async (req, res) => {
  const { token } = req.body;
  
  try {
    const decoded = jwt.verify(token, SECRET);
    
    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({ error: 'Token inválido' });
    }

    res.json({ 
      valid: true,
      email: decoded.email
    });

  } catch (error) {
    console.error('Error verifying reset token:', error);
    res.status(400).json({ error: 'Token inválido o expirado' });
  }
};
