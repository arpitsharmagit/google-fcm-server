const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);

function sendNotification(request) {
  const payload = {};

  if (request.action && request.value) {
    payload.data = {
      deviceId: request.deviceId,
      action: request.action,
      value: request.value
    };
  }
  if (request.from && request.message) {
    payload.notification = {
      title: request.from,
      body: request.message
    };
  }

  if (request.token) {
    payload.token = request.token;
  } else {
    payload.topic = request.topic;
  }
  return admin.messaging().send(payload);
}
exports.newNotification = functions.database
  .ref("/notifications")
  .onWrite((change, context) => {   
    console.log(change.after); 
    const promises = [];
    const nRef = change.after.ref;    
    const notifications = change.after._data;        
    Object.keys(notifications).forEach(key => {
      const notification = notifications[key];
      sendNotification(notification)
        .then(result => {
          const error = result.error;
          if (error) {
            console.error("Failure sending notification", error);
          } else {
            promises.push(nRef.child(key).remove());
          }
        })
        .catch(e => console.error(e));
    });
    return promises.length? Promise.all(promises): Promise.resolve("");
  });

//Test
/*
newNotification({before:{},after:{}})

  newNotification({before:{},after:{"-LIRdy46SaWaA6RO6Wcf": {
      "action": "chat",
      "deviceId": "PhyfAExHGuRomx480BB66CM9gSq1",
      "from": "",
      "message": "abcasd",
      "token":
        "etbURD5IGSQ:APA91bGGrGRsNxF9zysooJ_uVTo6CW_L4OfoNlGuEMeXrBnWJg_AwWo5RrtncgElc-3ve6jsMqTcnyV8uSo3cbwORBJLhFZ3BrVdvyx0imMv7xE7oxceoNowFgrZ8Q9i55bS00cQjAZ_JX8SZ1RXt8Adgkssw4jd0w",
      "value": "Arpit Sharma##bhejo jasmine"
    }}})
  */
