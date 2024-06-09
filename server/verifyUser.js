 // middleware/verifyUser.js
  import jwt from 'jsonwebtoken'

  const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
      jwt.verify(token, "jwt_secret_key", (err, decoded) => {
        if (err) return res.json({ Status: false, Error: "Wrong Token" });
        req.id = decoded.id;
        req.role = decoded.role;
        req.petownerId = decoded.petownerId;
        req.doctorId = decoded.doctorId;
        next();
      });
    } else {
      return res.json({ Status: false, Error: "Not Authenticated" });
    }
  };

  export { verifyUser}
