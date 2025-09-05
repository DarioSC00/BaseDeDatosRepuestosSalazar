const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

module.exports = async () => {
  // Antes de correr tests, arrancar mongodb-memory-server y conectar mongoose
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  // After all tests, stop the server and disconnect
  const teardown = async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  };

  // Exponer teardown para que jest pueda usarlo si es necesario
  global.__MONGOD__ = { stop: teardown };
};
