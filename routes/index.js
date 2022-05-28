const router = require('express').Router();
const { celebrate, Joi, errors } = require('celebrate');
const validator = require('validator');

const { createUser, login } = require('../controllers/users');
const auth = require('../middlewares/auth');
const { NotFoundError } = require('../errors/not-found-err');
const cenralErrors = require('../middlewares/central-err');

const allowedCors = [
  'https://movies.moskaleva.nomoreparties.sbs',
  'http://movies.moskaleva.nomoreparties.sbs',
  'https://localhost:3000',
  'http://localhost:3000',
];

router.use((req, res, next) => {
  const { origin } = req.headers;
  if (allowedCors.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  next();
});

router.use((req, res, next) => {
  const { method } = req;
  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';
  const requestHeaders = req.headers['access-control-request-headers'];
  if (method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
    res.header('Access-Control-Allow-Headers', requestHeaders);
    return res.end();
  }
  return next();
});

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().custom((value, helpers) => {
      if (validator.isEmail(value)) {
        return value;
      }
      return helpers.message('Некорректный email');
    }),
    password: Joi.string().required(),
  }),
}), login);

router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().custom((value, helpers) => {
      if (validator.isEmail(value)) {
        return value;
      }
      return helpers.message('Некорректный email');
    }),
    password: Joi.string().required(),
  }),
}), createUser);

router.use(auth);

router.use('/users', require('./users'));
router.use('/movies', require('./movies'));

router.use('/', (req, res, next) => {
  next(new NotFoundError('Неправильный путь.'));
});

// router.use(errorLogger);

router.use(errors());

router.use(cenralErrors);

module.exports = router;
