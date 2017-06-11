const MongoClient = require('mongodb').MongoClient;
var database;
var callback;

const url = 'mongodb://bakdor:lalala01@node-training-shard-00-00-a7h2t.mongodb.net:27017,node-training-shard-00-01-a7h2t.mongodb.net:27017,node-training-shard-00-02-a7h2t.mongodb.net:27017/matcha?ssl=true&replicaSet=node-training-shard-0&authSource=admin';

MongoClient.connect(url, function(err, db) {
	if (err)
		throw err;
	database = db;
	if (callback)
		callback(database);
});

module.exports = {
	connect : function(cb) {
		if (database)
			cb(database);
		else
			callback = cb;
	},
	insert : function(name, obj, cb) {
		var collection = database.collection(name);
		collection.insert(obj, cb);
	},
	remove : function(name, obj, cb) {
		var collection = database.collection(name);
		collection.remove(obj, cb);
	},
	update: function(name, obj1, obj2, cb) {
        // Get the documents collection
        var collection = database.collection(name);
        collection.update(obj1, obj2, function(err, docs) {
            if (err)
                throw err;
            if (cb)
                cb(docs);
        });
    },
	get : function(name, cb, obj) {
	    // Get the documents collection
	    var collection = database.collection(name);
	    // Find some documents
	    collection.find(obj).toArray(function(err, docs) {
			if (err)
				throw err;
	        cb(docs);
	    });
	},
	limit : function(name, nbr, cb, obj) {
	    // Get the documents collection
	    var collection = database.collection(name);
	    // Find some documents
	    collection.find(obj).limit(nbr).toArray(function(err, docs) {
			if (err)
				throw err;
	        cb(docs);
	    });
	},
	sort : function(name, obj1, cb, obj2) {
	    // Get the documents collection
	    var collection = database.collection(name);
	    // Find some documents
	    collection.find(obj2).sort(obj1).toArray(function(err, docs) {
			if (err)
				throw err;
	        cb(docs);
	    });
	},
	sortl : function(name, nbr, obj1, cb, obj2) {
	    // Get the documents collection
	    var collection = database.collection(name);
	    // Find some documents
	    collection.find(obj2).sort(obj1).limit(nbr).toArray(function(err, docs) {
			if (err)
				throw err;
	        cb(docs);
	    });
	}
};
