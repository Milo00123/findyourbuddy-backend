const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']; // Expecting Bearer <token>
  
  console.log("Token Received: ", authHeader);  // Log the full Authorization header for debugging

  if (!authHeader) {
    return res.status(403).send('Token is required');
  }

  // Ensure the token starts with "Bearer"
  const tokenParts = authHeader.split(' '); 
  if (tokenParts[0] !== 'Bearer' || tokenParts.length !== 2) {
    return res.status(403).send('Malformed token, expected format: Bearer <token>');
  }

  const token = tokenParts[1];  // Extract the actual token part

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT Verification Error:', err);  // Log verification error for debugging
      return res.status(403).send('Invalid token');
    }

    req.user = user;  // Attach the decoded user to the request object
    next();  // Proceed to the next middleware
  });
};

module.exports = authenticateToken;
