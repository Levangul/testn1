const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const { artworkSchema } = require("./Artwork");
const Order = require("./Order");

// Define the schema for User
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true, // Remove whitespace from both ends
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, "Must match an email address!"], // Validate email format
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
});


userSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds); // Hash the password
  }
  next();
});

// Method to check if the password is correct
userSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Create the User model from the schema
const User = model("User", userSchema);

// Export the User model for use in other parts of the application
module.exports = User;
