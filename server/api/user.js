const knex = require('../database').knex;
const bcryptjs = require('bcryptjs');
const Joi = require('joi');

exports.checkSession = function (data, socket) {
  if(socket.handshake.session.user_id) { // Check if session is set
    socket.emit('user', {type: 'checkSession', isLoggedIn: true})
  }else{
    socket.emit('user', {type: 'checkSession', isLoggedIn: false})
  }
};

exports.getMyUserData = function (data, socket) {
  if(!socket.handshake.session.user_id){return;}

  knex('users').select('*').where({id: socket.handshake.session.user_id}).then((user) => {
    socket.emit('user', {type: 'setMyUserData', myUserData: user[0]});
  })
};

exports.register = function (data, socket) {
  const schema = {
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  };
  Joi.validate(data, schema, err => {
    if(err) {
      socket.emit('status', {type: 'status', about: 'register', status: "error", error: 'Bad data'});
      return;
    }

    const { name, email, password } = data;
    knex('users').select('*').where({name: name}).then((users) => {
      // If name not exist
      if (users.length === 0) {
        return knex('users').select('*').where({email: email})
      }
      throw new Error('The username you entered have been registered. Please use another username.')
    }).then((users) => {
      // If email not exist
      if (users.length === 0) {
        // Hash the password with random salt 10 round
        return bcryptjs.hash(password, 10);
      }
      throw new Error('The email you entered have been registered. Please use another email.')
    }).then((hashedPassword) => {
      // Save to database
      return knex('users').insert({name, email, password: hashedPassword, salt: bcryptjs.getSalt(hashedPassword), is_active: 1})
    }).then(() => {
      socket.emit('status', {type: 'status', about: 'register', status: "success"});
    }).catch((error) => {
      socket.emit('status', {type: 'status', about: 'register', status: "error", error: error.toString()});
    });
  })
};

exports.login = function (data, socket) {
  const schema = {
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  };
  Joi.validate(data, schema, err => {
    if(err) {
      socket.emit('status', {type: 'status', about: 'login', status: "error", error: 'Bad data'});
      return;
    }

    const { email, password } = data;

    let userData = null;
    // Get User Data
    knex('users').select('*').where({email: email}).then((user) => {
      // If user exist
      if (user.length > 0) {
        // Store then user data
        userData = user[0];
        // Hash the inputted password
        return bcryptjs.hash(password, user[0].salt);
      }
      throw new Error('Invalid username or password');
    }).then((hashedPassword) => {
      // If password is correct
      if (userData.password === hashedPassword) {
        socket.handshake.session.user_id = userData.id;
        socket.handshake.session.save();
        socket.emit('status', {type: 'status', about: 'login', status: "success"});
        return;
      }
      throw new Error('Invalid username or password');
    }).catch((error) => {
      socket.emit('status', {type: 'status', about: 'login', status: "error", error: error.toString()});
    });
  });
};

exports.logout = function (data, socket) {
  if (socket.handshake.session.user_id) {
    delete socket.handshake.session.user_id;
    socket.handshake.session.save();
  }
  socket.emit('status', {type: 'status', about: 'logout', status: "success"});
};
