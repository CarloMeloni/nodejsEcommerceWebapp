const { check } = require("express-validator");
const usersRepo = require("../../repositories/users");
const productsRepo = require("../../repositories/products");


module.exports = {
  requireTitle: check("title")
    .trim()
    .isLength({ min: 5, max: 40 })
    .withMessage('Must be between 5 and 40 characters.'),
  requirePrice: check('price')
    .trim()
    .toFloat()
    .isFloat({ min: 1 })
    .withMessage('Must be a number greater than 1'),
  requireEmail: check("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("It must be a valid e-mail.")
    .custom(async (email) => {
      const existingUser = await usersRepo.getOneBy({ email: email });
      if (existingUser) {
        throw new Error("Email already in use.");
      }
    }),

  requirePassword: check("password")
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage("It must be between 4 and 20 characters."),

  requirepasswordConfirmation: check("passwordConfirmation")
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage("It must be between 4 and characters.")
    .custom((passwordConfirmation, { req }) => {
      if (passwordConfirmation !== req.body.password) {
        throw new Error("Password doesn't match, sorry.");
      }
      return true;
    }),

  requireExistsEmail: check("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Must provide a valid email")
    .custom(async (email) => {
      const user = await usersRepo.getOneBy({ email: email });
      if (!user) {
        throw new Error("Email not found!");
      }
    }),

  requireExistsPassword: check("password")
    .trim()
    .custom(async (password, { req }) => {
      const user = await usersRepo.getOneBy({ email: req.body.email });

      if (!user) {
        throw new Error("Invalid password");
      }

      const validPassword = await usersRepo.comparePassword(
        user.password,
        password
      );

      if (!validPassword) {
        throw new Error("Invalid password");
      }
    }),
};
