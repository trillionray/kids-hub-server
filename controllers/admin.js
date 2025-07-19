const Admin = require("../models/Admin");
const { errorHandler } = require("../auth");
const auth = require("../auth");

module.exports.registerUser = async (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    suffix,
    username,
    password,
    role
  } = req.body;

  // Validate inputs
  if (!["admin", "teacher", "cashier"].includes(role)) {
    return res.status(400).send({ message: "Invalid role provided" });
  }

  try {
    // Check for duplicate username
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(409).send({ message: "Username already taken" });
    }

    const newAdmin = new Admin({
      firstName,
      middleName,
      lastName,
      suffix,
      username,
      password, // plain text (⚠️ for learning/demo use only)
      role
    });

    const result = await newAdmin.save();

    return res.status(201).send({
      message: "Admin registered successfully",
      admin: result
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

module.exports.loginUser = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send({ message: "Username and password are required" });
    }

    Admin.findOne({ username: req.body.username })
      .then(admin => {
        if (!admin) return res.status(404).send({ message: "No username found" });

        if (req.body.password === admin.password) {
            console.log("Admin found:", admin);
            console.log("Admin role before creating token:", admin.role); // must be defined

            const token = auth.createAccessToken(admin);

            return res.status(200).send({
                message: 'User logged in successfully',
                access: token
            });
        } else {
            return res.status(401).send({ message: 'Incorrect password' });
        }
      })
      .catch(error => {
        console.error("Login error:", error);
        errorHandler(error, req, res);
      });

};

module.exports.getProfile = (req, res) => {
  // console.log(req.user.id);
  return Admin.findById(req.user.id)
    .then(admin => {
      if (!admin) {
        return res.status(404).send({ message: 'invalid signature' });
      } else {
        admin.password = "";
        return res.status(200).send(admin);
      }
    })
    .catch(error => {
      console.error(error); // <--- THIS helps
      res.status(500).send({ message: "Internal Server Error" });
    });
};
