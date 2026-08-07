"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.heroBus = exports.HERO_CHANGED = void 0;
const events_1 = require("events");
exports.HERO_CHANGED = 'hero-changed';
exports.heroBus = new events_1.EventEmitter();
exports.heroBus.setMaxListeners(0);
