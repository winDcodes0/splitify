const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

// Hash the password before saving the user to the database
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
})

// Compare the provided password with the hashed password in the database
userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
}

// Exclude the password field when converting the user document to JSON
userSchema.methods.toJSON = function toJSON() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
}


module.exports = mongoose.models.User || mongoose.model("User", userSchema);