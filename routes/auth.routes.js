const router = require('express').Router();
const { register, login, whoami,activate } = require('../controllers/auth.controllers');
const { restrict } = require('../middlewares/auth.middlewares');

router.get('/register', (req, res) => {
  res.render('register');
});
router.post('/register', register);

router.get('/login', (req, res) => {
  res.render('login');
});
router.post('/login', login);

router.get('/activation-email',(req,res)=>{
  let {token} = req.query
  res.render('activation-email',{token})
})
router.post('/activation-email',activate)

router.get('/whoami', restrict, whoami);

module.exports = router;
