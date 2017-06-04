const knex = require('../database').knex;

exports.checkSession = function (data, socket) {
  if(socket.handshake.session.user_id) { // Check if session is set
    socket.emit('user', {type: 'checkSession', isLoggedIn: true})
  }else{
    socket.emit('user', {type: 'checkSession', isLoggedIn: false})
  }
};

exports.getMyUserData = function (data, socket) {
  if(!socket.handshake.session.user_id){return;}

  knex('users').select('id', 'name', 'email', 'created_at').where({id: socket.handshake.session.user_id}).then((user) => {
    socket.emit('user', {type: 'setMyUserData', myUserData: user[0]});
  })
};
