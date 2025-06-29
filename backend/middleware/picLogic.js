const multer = require('multer');

const parseMultipartJsonFields = (req, res, next) => {
    try {
      if (req.body.ingredients && typeof req.body.ingredients === 'string') {
        req.body.ingredients = JSON.parse(req.body.ingredients);
      }
      if (req.body.steps && typeof req.body.steps === 'string') {
        req.body.steps = JSON.parse(req.body.steps);
      }
    } catch (e) {
      return res.status(400).json({ message: 'Invalid JSON format in ingredients or steps' });
    }
    next();
  };

module.exports = parseMultipartJsonFields;