const AutherizeRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).send("not autherized");
    }
    next();
  };
};

export default AutherizeRole;
