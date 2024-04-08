module.exports = (fn) => {
  return (req, res, next) => {
    console.log('INSIDE THE CATCH ASYNC',next)
    fn(req, res, next).catch(next);
  };
};
