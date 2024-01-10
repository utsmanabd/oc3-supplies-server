const supplies = require('knex')({
    client: 'mysql2',
    connection: {
      host : process.env.DB_HOST,
      port : process.env.DB_PORT,
      user : process.env.DB_USER,
      password : process.env.DB_PASSWORD,
      database : process.env.DB_DATABASE
    },
    useNullAsDefault: false,
    log: {
      warn(message) {
        console.log(message)
      },
      error(message) {
        console.log(message)
      },
      deprecate(message) {
        console.log(message)
      },
      debug(message) {
        console.log(message)
      }
    }
});

supplies.client.config.connectionOptions = { multipleStatements: false };

module.exports = supplies;
