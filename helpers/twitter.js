var request = require('request');

function Twitter(url, username, password) {
  var self = this;
  
  self.count = function (query, callback) {
    request.get(
      'https://' + url + "/api/v1/messages/count?q=" + encodeURIComponent(query), {
        'auth': {
          'user': username,
          'password': password
        }
      },
      function (error, response, body) {
        callback(error, body);
      });
  };

  self.search = function (query, size, callback) {
    request.get(
      'https://' + url + "/api/v1/messages/search?size=" + size +
      "&q=" + encodeURIComponent(query), {
        'auth': {
          'user': username,
          'password': password
        }
      },
      function (error, response, body) {
        callback(error, body);
      });
  }
}

module.exports = function (url, username, password) {
  return new Twitter(url, username, password);
}
