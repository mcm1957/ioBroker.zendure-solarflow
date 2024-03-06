"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var main_exports = {};
__export(main_exports, {
  ZendureSolarflow: () => ZendureSolarflow
});
module.exports = __toCommonJS(main_exports);
var utils = __toESM(require("@iobroker/adapter-core"));
var import_mqttService = require("./services/mqttService");
var import_webService = require("./services/webService");
var import_paths = require("./constants/paths");
var import_jobSchedule = require("./services/jobSchedule");
var import_calculationService = require("./services/calculationService");
class ZendureSolarflow extends utils.Adapter {
  constructor(options = {}) {
    super({
      ...options,
      name: "zendure-solarflow"
    });
    this.accessToken = void 0;
    // Access Token for Zendure Rest API
    this.deviceList = [];
    this.paths = void 0;
    this.interval = void 0;
    this.lastLogin = void 0;
    this.mqttClient = void 0;
    this.resetValuesJob = void 0;
    this.checkStatesJob = void 0;
    this.on("ready", this.onReady.bind(this));
    this.on("stateChange", this.onStateChange.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  /**
   * Is called when databases are connected and adapter received configuration.
   */
  async onReady() {
    var _a;
    this.paths = import_paths.pathsGlobal;
    if (this.config.userName && this.config.password) {
      (_a = (0, import_webService.login)(this)) == null ? void 0 : _a.then((_accessToken) => {
        this.accessToken = _accessToken;
        this.connected = true;
        this.lastLogin = /* @__PURE__ */ new Date();
        (0, import_webService.getDeviceList)(this).then((result) => {
          if (result) {
            this.deviceList = result;
            (0, import_mqttService.connectMqttClient)(this);
            (0, import_jobSchedule.startReloginAndResetValuesJob)(this);
            (0, import_jobSchedule.startCheckStatesJob)(this);
          }
        }).catch(() => {
          var _a2;
          this.connected = false;
          (_a2 = this.log) == null ? void 0 : _a2.error("[onReady] Retrieving device failed!");
        });
      }).catch((error) => {
        this.connected = false;
        this.log.error(
          "[onReady] Logon error at Zendure cloud service! Error: " + error.toString()
        );
      });
    } else {
      this.connected = false;
      this.log.error("[onReady] No Login Information provided!");
    }
  }
  /**
   * Is called when adapter shuts down - callback has to be called under any circumstances!
   */
  onUnload(callback) {
    var _a;
    try {
      if (this.interval) {
        this.clearInterval(this.interval);
      }
      if (this.resetValuesJob) {
        this.resetValuesJob.cancel();
        this.resetValuesJob = void 0;
      }
      if (this.checkStatesJob) {
        (_a = this.checkStatesJob) == null ? void 0 : _a.cancel();
        this.checkStatesJob = void 0;
      }
      callback();
    } catch (e) {
      callback();
    }
  }
  /**
   * Is called if a subscribed state changes
   */
  onStateChange(id, state) {
    if (state) {
      const splitted = id.split(".");
      const productKey = splitted[2];
      const deviceKey = splitted[3];
      const stateName1 = splitted[4];
      const stateName2 = splitted[5];
      if (state.val != void 0 && state.val != null) {
        switch (stateName1) {
          case "control":
            if (stateName2 == "setOutputLimit") {
              (0, import_mqttService.setOutputLimit)(this, productKey, deviceKey, Number(state.val));
            } else if (stateName2 == "dischargeLimit") {
              (0, import_mqttService.setDischargeLimit)(this, productKey, deviceKey, Number(state.val));
            } else if (stateName2 == "chargeLimit") {
              (0, import_mqttService.setChargeLimit)(this, productKey, deviceKey, Number(state.val));
            } else if (stateName2 == "lowVoltageBlock") {
              if (this.config.useLowVoltageBlock) {
                if (state.val == true) {
                  (0, import_mqttService.setOutputLimit)(this, productKey, deviceKey, 0);
                }
              }
            }
            break;
          case "solarInputPower":
            if (this.config.useCalculation) {
              (0, import_calculationService.calculateEnergy)(this, productKey, deviceKey, "solarInput", state);
            }
            break;
          case "outputPackPower":
            if (this.config.useCalculation) {
              (0, import_calculationService.calculateEnergy)(this, productKey, deviceKey, "outputPack", state);
            }
            break;
          case "packInputPower":
            if (this.config.useCalculation) {
              (0, import_calculationService.calculateEnergy)(this, productKey, deviceKey, "packInput", state);
            }
            break;
          case "outputHomePower":
            if (this.config.useCalculation) {
              (0, import_calculationService.calculateEnergy)(this, productKey, deviceKey, "outputHome", state);
            }
            break;
          default:
            break;
        }
      } else {
        this.log.debug(`state ${id} deleted`);
      }
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new ZendureSolarflow(options);
} else {
  (() => new ZendureSolarflow())();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ZendureSolarflow
});
//# sourceMappingURL=main.js.map
