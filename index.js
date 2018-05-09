var firebase = require('firebase-admin');
var request = require('request');
const logging = require('./lib/logging');

var config = require("./serverKey.json");
var serviceAccount = require('./serviceAccountKey.json');

var API_KEY = config.serverKey;

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://playtogether-ffdce.firebaseio.com'
});

ref = firebase.database().ref();

function listenForNotificationRequests() {
  var requests = ref.child('notifications');
  requests.on('child_added', function(requestSnapshot) {
    var request = requestSnapshot.val();
      sendNotification(request,()=>{
        requestSnapshot.ref.remove();         
      })
  }, function(error) {
    logging.error(error);
  });
  logging.info("Listening...")
};

function sendNotification(request, onSuccess) {
  var message = {};

  if(request.action && request.value){
    message.data= {
      deviceId: request.deviceId,
      action: request.action,
      value:request.value
    }
  }
  if(request.from && request.message){
    message.notification = {
      title: request.from,
      body: request.message
    }
  }

  if(request.token){
    message.token = request.token;
  }
  else{
    message.topic = request.topic;
  }
  console.log(message);
  firebase.messaging().send(message)
  .then((response) => {
      logging.info('Successfully sent message:', response);
      onSuccess();
  })
  .catch((error) => {
    logging.error('Error sending message:', error);
  });
}
// start listening
listenForNotificationRequests();