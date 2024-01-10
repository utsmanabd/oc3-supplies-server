const db = require("../database/supplies.config")

const login = async (nik) => await db.select('*').from('users').where('nik', nik).groupBy('nik')

module.exports = {
    login
}