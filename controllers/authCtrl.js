const Users = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authCtrl = {
  register: async (req, res) => {
    try {
      const { fullname, username, email, password, gender } = req.body;
      console.log(req.body);
      let userName = username.toLowerCase().replace(/ /g, "");
      const user_name = await Users.findOne({ username: userName });
      if (user_name)
        return res.status(400).json({ msg: "This Username Already Exist" });

      const user_email = await Users.findOne({ email });
      if (user_email)
        return res.status(400).json({ msg: "This Email Already Exist" });

      if (password.length < 6)
        return res
          .status(400)
          .json({ msg: "Password must be at least 6 characters" });

      const passwordHash = await bcrypt.hash(password, 12);
      const newUser = new Users({
        fullname,
        username: userName,
        email,
        password: passwordHash,
        gender,
      });

      const access_token = createAccessToken({ id: newUser._id });
      const refersh_token = createRefershToken({ id: newUser._id });
      // refresh_token
      res.cookie("refershtoken", refersh_token, {
        httpOnly: true,
        path: "/refersh_token",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      // refershtoken
      await newUser.save();
      res.json({
        msg: "registered Success",
        access_token,
        user: { ...newUser._doc, password: "" },
      });
      // console.log(passwordHash);
      // console.log(newUser);
      // console.log(userName);
      // console.log({access_token, refersh_token});
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await Users.findOne({ email }).populate(
        "follewers follewing",
        "-password"
      );
      if (!user) return res.status(400).json({ msg: "This email not found" });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ msg: "Password is Incorrect" });

      const access_token = createAccessToken({ id: user._id });
      const refersh_token = createRefershToken({ id: user._id });

      res.cookie("refershtoken", refersh_token, {
        httpOnly: true,
        path: "/api/refersh_token",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      res.json({
        msg: "Login Success",
        access_token,
        user: {
          ...user._doc,
          password: "",
        },
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie("refershtoken", { path: "/api/refersh_token" });
      res.json({ msg: "Logged Out!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  generateAccessToken: async (req, res) => {
    try {
      const rf_token = req.cookies.refershtoken;
      if (!rf_token) return res.status(400).json({ msg: "Please Login Now" });
      jwt.verify(
        rf_token,
        process.env.ACCESS_REFETSH_SECRET,
        async (err, result) => {
          if (err) return res.status(400).json({ msg: "Please Login Now" });
          const user = await Users.findById(result.id)
            .select("-password")
            .populate("follewers follewing", "-password");
          if (!user)
            return res.status(400).json({ msg: "This Does Not Exist" });
          const access_token = createAccessToken({ id: result.id });
          res.json({
            access_token,
            user,
          });
        }
      );
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};
const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
};
const createRefershToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_REFETSH_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = authCtrl;
