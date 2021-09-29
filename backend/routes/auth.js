const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator"); // express-validator is use for validate incomming string
const bcrypt = require("bcryptjs"); // bcrypt is uses for password hashing and adding salt to that password
const jwt = require("jsonwebtoken"); // json web token to authenticate user to every where in website is like sessoin
const fetchuser = require("../middleware/fetchuser");

const JWT_SECERET = "jainishisnice@guy";

//Route-1 :  Create a User using POST "/api/auth/createuser". No Login required
router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password Must Be at least 5 character").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    let success = false;
    // If there are errors return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: success, errors: errors.array() });
    }

    // Check whether the user with this email exists already
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ success: success, errors: "Sorry a user with this email already exists" });
      }
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      // Create a new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      success = true;
      const authToken = jwt.sign(data, JWT_SECERET);
      res.json({ success, authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send({ success: success, error: "Internal Server Error" });
    }
  }
);

//Route-2 : Authenticate a user using: /api/auth/login No login required
router.post("/login", [body("email", "Enter a valid email").isEmail(), body("password", "Password Can not be blank").exists()], async (req, res) => {
  // If there are errors return bad request and the errors
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: success, errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    // Find the user first
    let user = await User.findOne({ email: email });

    // If user not exist send bad request
    if (!user) {
      return res.status(400).json({ success: success, error: "Please Try to login with correct credentials" });
    }
    const passwordCompare = await bcrypt.compare(password, user.password);

    // is password is not matching send bad request
    if (!passwordCompare) {
      return res.status(400).json({ success: success, error: "Please Try to login with correct credentials" });
    }

    // if password is correct
    const data = {
      user: {
        id: user.id,
      },
    };
    const authToken = jwt.sign(data, JWT_SECERET);
    success = true;
    res.json({ success, authToken });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ success: success, error: "Internal Server Error" });
  }
});

//Route 3 : Get Loggedin User Details using : POST "api/auth/getuser". Login Required
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});
module.exports = router;
