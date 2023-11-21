const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = process.env;
const nodemailer = require('../libs/nodemailer');
const ejs = require('ejs');

module.exports = {
  register: async (req, res, next) => {
    try {
      let { name, email, password, password_confirmation } = req.body;
      if (password != password_confirmation) {
        return res.status(400).json({
          status: false,
          message: 'Bad Request',
          err: 'please ensure that the password and password confirmation match!',
          data: null,
        });
      }

      let userExist = await prisma.user.findUnique({ where: { email } });
      if (userExist) {
        return res.status(400).json({
          status: false,
          message: 'Bad Request',
          err: 'user has already been used!',
          data: null,
        });
      }

      let encryptedPassword = await bcrypt.hash(password, 10);
      let user = await prisma.user.create({
        data: {
          name,
          email,
          password: encryptedPassword,
        },
      });
      // kirim email
      let token = jwt.sign({ email: user.email }, JWT_SECRET_KEY);
      let url = `http://localhost:3000/api/v1/user/activation-email?token=${token}`;

      const html = await nodemailer.getHtml('email-activation.ejs', {
        name,
        url,
      });
      nodemailer.sendEmail(email, 'Email activation', html);

      return res.status(201).json({
        status: true,
        message: 'Created',
        err: null,
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      let { email, password } = req.body;

      let user = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (!user) {
        return res.status(400).json({
          status: false,
          message: 'Bad Request',
          err: 'invalid email or password!',
          data: null,
        });
      }

      let isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({
          status: false,
          message: 'Bad Request',
          err: 'invalid email or password!',
          data: null,
        });
      }

      let token = jwt.sign(
        { name: user.name, email: user.email, id: user.id },
        JWT_SECRET_KEY
      );
      res.redirect(`/api/v1/user/dashboard?token=${token}`);
      // return res.status(200).json({
      //   status: true,
      //   message: 'OK',
      //   err: null,
      //   data: { user, token },
      // });
    } catch (err) {
      next(err);
    }
  },

  activate: (req, res, next) => {
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

      let updated = await prisma.user.update({
        where: { email: decoded.email },
        data: { is_verified: true },
      });

      res.json({
        status: true,
        message: 'success',
        err: null,
        data: updated,
      });
    });
  },
  resetPassword: async (req, res, next) => {
    try {
      let { email } = req.body;
      let emailExist = await prisma.user.findUnique({
        where: { email },
      });
      if (!emailExist) {
        return res.status(400).json({
          status: false,
          message: 'Email Not Found',
          err: 'Enter Regisreted Email!',
          data: null,
        });
      }
      let token = jwt.sign({ email: emailExist.email }, JWT_SECRET_KEY);
      let url = `http://localhost:3000/api/v1/user/change-password?token=${token}`;

      const html = await nodemailer.getHtml('reset-password-valid.ejs', {
        email,
        url,
      });
      nodemailer.sendEmail(email, 'Reset Password', html);
      return res.status(200).json({
        status: true,
        message: 'Send',
        err: null,
        data: { email },
      });
    } catch (err) {
      next(err);
    }
  },
  changepassword: (req, res) => {
    let { token } = req.query;
    let { password } = req.body;

    jwt.verify(token, JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(400).json({
          status: false,
          message: 'Bad Request',
          err: err.message,
          data: null,
        });
      }
      let encryptedPassword = await bcrypt.hash(password, 10);
      let updated = await prisma.user.update({
        where: { email: decoded.email },
        data: { password: encryptedPassword },
      });

      res.json({
        status: true,
        message: 'success',
        err: null,
        data: updated,
      });
    });
  },
  getUser: async (req, res, next) => {
    const { token } = req.query;
    try {
      const decoded = jwt.verify(token, JWT_SECRET_KEY);
      req.user = decoded;

      next();
    } catch (err) {
      console.log(err.message);
      // res.redirect('/wrong');
    }
  },
  getNotif: async (req, res) => {
    const { token } = req.query;
    try {
      const decoded = jwt.verify(token, JWT_SECRET_KEY);
      req.user = decoded;
      const notifications = await prisma.notifications.findMany({
        where: {
          userId: req.user.id,
        },
      });
      console.log(notifications);
      // return notifications;
    } catch (err) {
      console.log(err.message);
    }
  },

  whoami: (req, res, next) => {
    return res.status(200).json({
      status: true,
      message: 'OK',
      err: null,
      data: { user: req.user },
    });
  },
};
