const AutherizeRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    next();
  };
};

export default AutherizeRole;
