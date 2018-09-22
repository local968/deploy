import config from "./config.js";
import moment from "moment";

const Host = 'browser';

function Logger(label) {
  function Label(projectId, command) {
    const Command = { projectId, command, ...Label };
    Object.freeze(Command)
    return Command;
  }
  Object.assign(Label, { label, ...Logger });
  Object.freeze(Label);
  return Label;
}

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
  console.log(obj, this.ws);
}

export default Logger = (getUserId, ws) => {
  if (!getUserId || !ws || typeof getUserId !== 'function' || typeof ws !== 'object') {
    throw new Error("init error, params error");
  }

  Logger.getUserId = getUserId;
  Logger.ws = ws;

  Object.freeze(Logger);
  return Logger;
}