const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  {
    username: "mgl",
      password: "1FKsOyTn9gZdvh4G",
      database: "chatapp",
      host: "31.220.96.248",
      port: 3306,
      dialect: "mysql",
      "pool": {
       "max": 40,
       "min": 0,
       "acquire": 60000,
       "idle": 10000
     }
    }
  );

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};
connectDB();

module.exports = { sequelize, connectDB };
