"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
function validate(validator) {
    return (req, res, next) => {
        const error = validator(req);
        if (error) {
            res.status(400).json({ success: false, error });
            return;
        }
        next();
    };
}
//# sourceMappingURL=validate.js.map