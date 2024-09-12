// const jwt = require('jsonwebtoken');

// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
  
//   console.log("Token Received: ", authHeader);  

//   if (!authHeader) {
//     return res.status(403).send('Token is required');
//   }

//   const tokenParts = authHeader.split(' '); 
//   if (tokenParts[0] !== 'Bearer' || tokenParts.length !== 2) {
//     return res.status(403).send('Malformed token, expected format: Bearer <token>');
//   }

//   const token = tokenParts[1]; 

//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) {
//       console.error('JWT Verification Error:', err);  
      
//       // Handle token expiration explicitly
//       if (err.name === 'TokenExpiredError') {
//         return res.status(401).send('Token expired');
//       }

//       return res.status(403).send('Invalid token');
//     }

//     req.user = user;  // Attach the decoded user object to the request
//     next();  // Continue to the next middleware or route
//   });
// };

// module.exports = authenticateToken;
