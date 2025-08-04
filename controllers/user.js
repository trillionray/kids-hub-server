const User = require("../models/User");
const { errorHandler } = require("../auth");
const auth = require("../auth");

module.exports.registerUser = async (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    suffix,
    email,
    username,
    password,
    role
  } = req.body;

  // Validate role
  if (!["user", "teacher", "cashier"].includes(role)) {
    return res.status(400).send({ message: "Invalid role provided" });
  }

  try {
    // Check for duplicate email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).send({ message: "Email already registered" });
    }

    // Check for duplicate username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).send({ message: "Username already taken" });
    }

    // Create new user
    const newAdmin = new User({
      firstName,
      middleName,
      lastName,
      suffix,
      email,
      username,
      password, // ⚠️ still plain text (hash later in production)
      role
    });

    const result = await newAdmin.save();

    return res.status(201).send({
      message: "User registered successfully",
      user: result
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

    User.findOne({ username: req.body.username })
      .then(user => {
        if (!user) return res.status(404).send({ message: "No username found" });

        if (req.body.password === user.password) {
            console.log("Admin found:", user);
            console.log("Admin role before creating token:", user.role); // must be defined

            const token = auth.createAccessToken(user);

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
  return User.findById(req.user.id)
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: 'invalid signature' });
      } else {
        user.password = "";
        return res.status(200).send(user);
      }
    })
    .catch(error => {
      console.error(error); // <--- THIS helps
      res.status(500).send({ message: "Internal Server Error" });
    });
};


module.exports.getAllUsers = async (req, res) => {
  try {
    // You can also add filters (e.g. exclude passwords)
    const users = await User.find({}, "-password").sort({ createdAt: -1 }); 

    if (!users || users.length === 0) {
      return res.status(404).send({ message: "No users found" });
    }

    res.status(200).send(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    errorHandler(error, req, res);
  }
};