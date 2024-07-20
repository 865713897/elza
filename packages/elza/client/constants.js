"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_OUTPUT_PATH = exports.MESSAGE_TYPE = void 0;
var MESSAGE_TYPE;
(function (MESSAGE_TYPE) {
    MESSAGE_TYPE["ok"] = "ok";
    MESSAGE_TYPE["warnings"] = "warnings";
    MESSAGE_TYPE["errors"] = "errors";
    MESSAGE_TYPE["hash"] = "hash";
    MESSAGE_TYPE["stillOk"] = "still-ok";
    MESSAGE_TYPE["invalid"] = "invalid";
})(MESSAGE_TYPE || (exports.MESSAGE_TYPE = MESSAGE_TYPE = {}));
exports.DEFAULT_OUTPUT_PATH = 'dist';
