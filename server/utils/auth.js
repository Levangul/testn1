const jwt = require("jsonwebtoken");

const secret = "mysecretssshhhhhhh"; // Secret key for signing the JWT
const expiration = "2h"; // Token expiration time

module.exports = {
  // Middleware to authenticate the token
  authMiddleware: function ({ req }) {
    // Extract token from the request body, query, or headers
    let token = req.body.token || req.query.token || req.headers.authorization;

    // If token is provided in the authorization header, extract it
    if (req.headers.authorization) {
      token = token.split(" ").pop().trim();
    }

    // If no token is found, return the request object unmodified
    if (!token) {
      return req;
    }

    try {
      // Verify the token and attach the decoded data to the request object
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      console.log("Invalid token"); // Log an error if the token is invalid
    }

    return req; // Return the request object
  },

  // Function to sign a new token
  signToken: function ({ email, username, _id }) {
    const payload = { email, username, _id }; // Create a payload with user data
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration }); // Sign and return the token
  },
};
