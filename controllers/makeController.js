const { ALLOWED_MAKES } = require('../config/make_constants');

exports.getMakes = (req, res) => {
  res.status(200).json({ makes: ALLOWED_MAKES });
};
