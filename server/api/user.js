const knex = require('../database').knex;
const bcryptjs = require('bcryptjs');

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

exports.login = function (data, socket) {
  let userData = null;
  // Get User Data
  knex('users').select('*').where({email: data.email}).then((user) => {
    // If user exist
    if (user.length > 0) {
      // Store then user data
      userData = user[0];
      // Hash the inputted password
      return bcryptjs.hash(data.password, user[0].salt);
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
};

exports.logout = function (data, socket) {
  if (socket.handshake.session.user_id) {
    delete socket.handshake.session.user_id;
    socket.handshake.session.save();
  }
  socket.emit('status', {type: 'status', about: 'logout', status: "success"});
};
