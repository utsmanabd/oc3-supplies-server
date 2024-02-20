function ok(res, data) {

    return res.status(200).json({
        status: true,
        'data': data
    });

}

function error(res, message, code) {

    return res.status(code).json({
        'status': false,
        'data': {
            'message': message
        }
    });
}

function catchError(res, err) {
    console.error(err);
    return error(res, `${err.name}: ${err.message}`, 500)
}

module.exports = {
    ok,
    error,
    catchError
}