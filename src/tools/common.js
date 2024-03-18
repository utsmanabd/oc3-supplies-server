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

function getUniqueData(arr, property) {
    let uniqueData = {};
    let result = [];
  
    for (let obj of arr) {
      let value = obj[property];
      if (!uniqueData[value]) {
        uniqueData[value] = obj;
        result.push(obj);
      }
    }
  
    return result;
  }

module.exports = {
    ok,
    error,
    catchError,
    getUniqueData
}