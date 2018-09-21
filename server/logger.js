const config = require("../config.js");
const moment = require("moment");

function Logger(label) {
  function Label(projectId, command) {
    const Command = { projectId, command, ...Label };
    Object.freeze(Command)
    return Command;
  }
  Object.assign(Label, { label, ...Logger });
  Object.freeze(Label)
  return Label;
}

const Host = 'webserver';

Logger.info = function (message) {
  this.log("info", message);
}

Logger.warning = function (message) {
  this.log("warning", message);
}

Logger.error = function (message) {
  this.log("error", message);
}

Logger.critical = function (message) {
  this.log("critical", message);
}

Logger.debug = function (message) {
  if (config.debug) this.log("debug", message);
}

Logger.log = function (level, message) {
  const obj = {
    hostname: Host,
    level: level,
    content: message,
    userId: this.getUserId(),
    peojectId: this.projectId,
    command: this.command,
    label: this.label,
    time: moment().unix()
  };
  console.log(obj, this.redis);
}

module.exports = function(getUserId, redis) {
  if (!getUserId || !redis || typeof getUserId !== 'function' || typeof redis !== 'object') {
    throw new Error("init error, params error");
  }

  Logger.getUserId = getUserId;
  Logger.redis = redis;

  Object.freeze(Logger)
  return Logger;
};