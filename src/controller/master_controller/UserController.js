const model = require('../../model/user.model');
const api = require('../../tools/common')

const getAllUsers = async (req, res) => {
    let data = await model.getAll();
    return api.ok(res, data);
}

const searchUserByPagination = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 25;
        const offset = (page - 1) * pageSize;
        const term = req.body.search
        const data = await model.searchPagination(term, offset, pageSize)
        const total = await model.getSearchLength(term)

        return res.json({ status: true, total_users: total, data: data })
    } catch (err) {
        return api.catchError(res, err)
    }
}

const getUserByNik = async (req, res) => {
    if (!isNaN(req.params.id)) {
        let data = await model.getByNik(req.params.id);
        return api.ok(res, data);
    } else {
        return api.error(res, "Bad Request", 400);
    }
}

const getUserRole = async (req, res) => {
    let data = await model.getRole();
    return api.ok(res, data);
}

const insertUser = async (req, res) => {
    let formData = req.body.form_data

    if (Array.isArray(formData)) {
        for (let data of formData) {
            const nik = await model.getByNik(data.nik)
            if (nik.length > 0) {
                return api.error(res, "NIK is already exists!", 200)
            }
        }
        let data = await model.insert(formData)
        return api.ok(res, data);
    } else {
        const userNik = await model.getByNik(req.body.form_data.nik)
        if (userNik.length > 0) {
            return api.error(res, "NIK is already exists!", 400)
        }
        let data = await model.insert(formData);
        return api.ok(res, data);
    }
}

const updateUser = async (req, res) => {
    const userId = req.params.id
    let formData = req.body.form_data
    let nik = formData.nik
    if (nik) {
        const userFound = await model.getByNik(nik)
        if (userFound.length > 0 && userFound[0].user_id != userId) {
            return api.error(res, "NIK is already exists!", 400)
        }
    }
    let data = await model.update(userId, formData);
    return api.ok(res, data);
}

const deleteUser = async (req, res) => {
    try {
        let data = await model.deleteData(req.params.id)
        return api.ok(res, data);
    } catch (err) {
        return api.catchError(res, err)
    }
}

const isNIKExists = async (req, res) => {
    const nik = await model.getByNik(req.params.nik)
    if (nik.length > 0) {
        return api.error(res, "NIK is already exists!", 200)
    } else {
        return api.ok(res, { message: "NIK is available!" })
    }
}

module.exports = {
    getAllUsers, 
    searchUserByPagination,
    getUserByNik, 
    insertUser, 
    updateUser, 
    deleteUser,
    isNIKExists, 
    getUserRole
}

