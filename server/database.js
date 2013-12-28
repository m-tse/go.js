var mongo = require('mongodb');
 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});

db = new Db('locationdb', server, {safe:false});
db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'locationdb' database");
        db.collection('locations', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'locations' collection doesn't exist yet.");
            }
        });
    } else {
        console.log("Error while connecting to the locationdb : " + err);
    }
});

module.exports = db;