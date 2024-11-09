"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const message = (0, core_1.getInput)("message");
console.log(message);
