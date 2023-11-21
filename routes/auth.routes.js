const router = require('express').Router();
const { JWT_SECRET_KEY } = process.env;
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {
  register,
  login,
  whoami,
  activate,
  resetPassword,
  changepassword,
  getUser,
  getNotif,
} = require('../controllers/auth.controllers');
const { restrict } = require('../middlewares/auth.middlewares');

router.get('/register', (req, res) => {
  res.render('register');
});
router.post('/register', register);

router.get('/login', (req, res) => {
  res.render('login');
});
router.post('/login', login);

router.get('/activation-email', (req, res) => {
  let { token } = req.query;
  res.render('activation-email', { token });
});
router.post('/activation-email', activate);

router.get('/reset-password', (req, res) => {
  res.render('reset-password');
});
router.post('/reset-password', resetPassword);

router.get('/change-password', (req, res) => {
  let { token } = req.query;
  res.render('reset-password-form', { token });
});
router.post('/change-password', changepassword);

router.get('/dashboard', getUser, async (req, res) => {
  try {
    let { token } = req.query;

    jwt.verify(token, JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(400).json({
          status: false,
          message: 'Bad Request',
          err: err.message,
          data: null,
        });
      }
      let i = await prisma.notifications.findMany({
        where: { userId: decoded.id },
      });
      res.render('dashboard', { ...req.user, i });
    });
  } catch (err) {
    console.log(err.message);
  }
});

router.get('/whoami', restrict, whoami);
module.exports = router;
