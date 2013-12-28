var db = require('./database.js');
var BSON = require('mongodb').BSONPure;


exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving game with _id = [ ' + id + ']');
    
    db.collection('games', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.json({game:item});
        });
    });
};
 
exports.findAll = function(req, res) {

    console.log('Retrieving all games');

    db.collection('games', function(err, collection) {
        collection.find().toArray(function(err, items) {
            // Wrap the array in a root element called games.
            var allGames = {
                games:items
            };
            res.send(allGames);
        });
    });
};
 
exports.addGame = function(req, res) {
    
    var game = req.body.game;
    
    console.log('Adding game: ' + JSON.stringify(game));

    db.collection('games', function(err, collection) {
        collection.insert(game, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred ' + err});
            } else {
                var record = result[0];
                res.json({game:record});
            }
        });
    });
}
 
exports.updateGame = function(req, res) {
    
    var id = req.params.id;
    var game = req.body.game;
    
    console.log('Updating game with id [' + id + ']');
    console.log('Game payload = ' + JSON.stringify(game));
    
    db.collection('games', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, game, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating game: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                game._id = id;
                res.json({game:game});
            }
        });
    });
}
 
exports.deleteGame = function(req, res) {
    var id = req.params.id;
    console.log('Deleting game: ' + id);
    db.collection('games', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.json({});
            }
        });
    });
}
