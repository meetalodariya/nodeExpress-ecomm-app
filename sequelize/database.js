const mongodb = require("mongodb");

const MongoClient = mongodb.MongoClient;

MongoClient.connect(
  "mongodb+srv://meet:1sSJFLRoMa1ZuPsj@cluster0-nptjv.mongodb.net/test?retryWrites=true&w=majority"
)
  .then(result => console.log("connected"))
  .catch(err => console.log(err));
