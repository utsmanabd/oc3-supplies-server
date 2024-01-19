const db = require("../database/supplies.config")

const getAll = async () => await db.select("*").from("tr_prodplan").where("is_removed", 0)
const getById = async (id) => await db.select("*").from("tr_prodplan").where("id", id).where("is_removed", 0)
const insert = async (data) => await db("tr_prodplan").insert(data)
const update = async (id, data) => await db("tr_prodplan").where("id", id).update(data)

module.exports = {
    getAll,
    getById,
    insert,
    update
}
