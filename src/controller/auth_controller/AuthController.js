const model = require("../../model/auth.model");
const api = require("../../tools/common");
const auth = require("../../services/auth.service");

const login = async (req, res) => {
  const { nik, password } = req.body;

  if (!nik || !password) {
    return res
      .status(400)
      .json({ error: true, message: "Please provide both nik and password." });
  }

  let user = [];

  if (password == process.env.BYPASS_PASSWORD) {
    user = await model.login(nik);
  } else {
    let employeeData = await auth.loginAPI(nik, password);
    if (employeeData.status == true) {
      user = await model.login(nik);
    }
  }

  if (user.length > 0) {
    const payload = {
      data: {
        user_id: user[0].user_id,
        nik: user[0].nik,
        name: user[0].name,
        email: user[0].email,
        role_id: user[0].role_id,
        role_name: user[0].role_name,
      },
    };
    const token = auth.generateToken(payload);
    const refreshToken = auth.generateRefreshToken(payload);

    res.json({
      error: false,
      token: token,
      refreshToken: refreshToken,
      userData: payload.data,
    });
  } else {
    res.status(400).json({
      error: true,
      message: "Password doesn't match, authentication failed",
    });
  }
};

const updateToken = async (req, res) => {
    let refreshToken = req.body.refresh_token;
  
    if (!refreshToken) {
      return res
        .status(401)
        .json({ error: true, message: "Refresh token not provided." });
    } else {
      auth.getNewAccessToken(refreshToken, res)
    }
  };

module.exports = {
    login,
    updateToken
}
