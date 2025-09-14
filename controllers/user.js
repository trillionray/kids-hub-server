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
    password,
    role
  } = req.body;

  if (!["admin", "teacher", "cashier"].includes(role)) {
    return res.status(400).send({ message: "Invalid role provided" });
  }

  try {
    // Check duplicates
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(409).send({ message: "Email already registered" });

    // Validate password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).send({
        message: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
      });
    }

    // Generate custom ID
    const year = new Date().getFullYear();
    const lastUser = await User.findOne({ _id: new RegExp(`^EN${year}`) })
      .sort({ _id: -1 })
      .exec();

    let newIncrement = 1;
    if (lastUser) {
      const lastNumber = parseInt(lastUser._id.slice(-5));
      newIncrement = lastNumber + 1;
    }

    const newId = `EN${year}${String(newIncrement).padStart(5, "0")}`;
    console.log("newId: " + newId);

    // Create user with custom _id
    const newUser = new User({
      _id: newId,
      firstName,
      middleName,
      lastName,
      suffix,
      email,
      password,
      role
    });

    const result = await newUser.save();

    res.status(201).send({
      message: "User registered successfully",
      user: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: {
        message: error.message,
        errorCode: "SERVER_ERROR",
        details: null
      }
    });
  }
};




module.exports.loginUser = (req, res) => {
  const { _id, password } = req.body;

  if (!_id || !password) {
    return res.status(400).send({ message: "Employee ID and password are required" });
  }

  User.findOne({ _id })
    
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "No employee found with this ID" });
      }
      
      if (!user.isActive) {
        return res.status(403).send({ message: "This account is deactivated, please contact the admin" });
      }

      if (password === user.password) {
        console.log("User found:", user);
        console.log("Role before creating token:", user.role);

        const token = auth.createAccessToken(user);

        return res.status(200).send({
          message: "User logged in successfully",
          access: token
        });
      } else {
        return res.status(401).send({ message: "Incorrect password" });
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

// Get all teachers
module.exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" }, "-password").sort({ createdAt: -1 });

    if (!teachers || teachers.length === 0) {
      return res.status(404).send({ message: "No teachers found" });
    }

    res.status(200).send(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    errorHandler(error, req, res);
  }
};

module.exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).send({ message: "Old and new password are required" });
    }

    // Find user by ID from token
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Verify old password
    if (user.password !== oldPassword) {
      return res.status(401).send({ message: "Old password is incorrect" });
    }

    // Update with new password (⚠️ plain text, hash in production)
    user.password = newPassword;
    user.status = "active";
    await user.save();

    // intial - new account (need a prompt to change password)
    // active - changed password already
    // inactive - deactivated account



    return res.status(200).send({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    errorHandler(error, req, res);
  }
};
