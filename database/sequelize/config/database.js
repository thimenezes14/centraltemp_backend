require('dotenv/config');
module.exports = {
  username: process.env.SQL_USER,
  password: process.env.SQL_PASS,
  database: process.env.SQL_DB,
  host: process.env.SQL_HOST,
  dialect: process.env.SQL_DIALECT,
  define: {
    timestamps: true,
    underscored: true,
  },
  logging: false,
}
