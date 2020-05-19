const MongoClient = require("mongodb").MongoClient;

let _db;
exports.connect = callback => {
  MongoClient.connect(
    "mongodb://meet:1sSJFLRoMa1ZuPsj@cluster0-shard-00-00-nptjv.mongodb.net:27017,cluster0-shard-00-01-nptjv.mongodb.net:27017,cluster0-shard-00-02-nptjv.mongodb.net:27017/shop?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority",
    {
      useUnifiedTopology: true,
      useNewUrlParser: true
    }
  )
    .then(client => {
      _db = client.db();
      callback(client.isConnected());
      return;
    })
    .catch(err => console.log(err));
};

exports.getDB = () => {
  if (_db) {
    return _db;
  } else {
    throw "No database found";
  }
};
