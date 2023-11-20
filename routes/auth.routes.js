const router = require('express').Router();
const { register, login, whoami } = require('../controllers/auth.controllers');
const { restrict } = require('../middlewares/auth.middlewares');

router.get('/register', (req, res) => {
  res.render('register');
});
router.post('/register', register);

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', login);
// router.post('/login', (req, res) => {
//   console.log(req.body.email);
// });

router.get('/whoami', restrict, whoami);

module.exports = router;
