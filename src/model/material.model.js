const db = require("../database/supplies.config")

const getAll = async () => await db.select("*").from("mst_material_supplies").where("is_removed", 0)
const getById = async (id) => await db.select("*").from("mst_material_supplies").where("id", id).where("is_removed", 0)
const insert = async (data) => await db("mst_material_supplies").insert(data)
const update = async (id, data) => await db("mst_material_supplies").where("id", id).update(data)

const getInjectAvg = async () => await db.select("*").from("inject_avg_price")
const getByCode = async (materialCode) => await db.select("*").from("mst_material_supplies").where("material_code", materialCode).where("is_removed", 0)
const updateByCode = async (code, data) => await db("mst_material_supplies").where("material_code", code).update(data)

module.exports = {
    getAll,
    getById,
    insert,
    update,
    getInjectAvg,
    getByCode,
    updateByCode
}
