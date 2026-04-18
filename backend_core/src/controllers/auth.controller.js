const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenziali non valide' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Credenziali non valide' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret_fallback_123',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    // Solo SUPER_ADMIN può creare utenti
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Non autorizzato' });
    }

    const { email, password, firstName, lastName, role, commissionRate } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Utente già esistente' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'ADMIN',
        commissionRate: commissionRate ? parseFloat(commissionRate) : 0
      }
    });

    res.json({ success: true, data: { email: newUser.email, role: newUser.role, commissionRate: newUser.commissionRate } });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, commissionRate: true }
    });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Non autorizzato' });
    }
    const users = await prisma.user.findMany({
      select: { id: true, email: true, firstName: true, lastName: true, role: true, commissionRate: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Non autorizzato' });
    }
    const { id } = req.params;
    
    // Non cancellare se stesso
    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Non puoi cancellare il tuo stesso account' });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: 'Utente eliminato' });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, createUser, getMe, getUsers, deleteUser };
