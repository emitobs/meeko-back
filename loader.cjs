/**
 * Loader para Plesk Passenger
 * Este archivo es el punto de entrada que Passenger ejecutará
 */

const app = require('./dist/server.js').default;
module.exports = app;
