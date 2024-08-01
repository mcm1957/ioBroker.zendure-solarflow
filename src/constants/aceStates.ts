/* eslint-disable @typescript-eslint/indent */
import { ISolarflowState } from "../models/ISolarflowState";
import { sharedStates } from "./sharedStates";

export const aceStates: ISolarflowState[] = sharedStates.concat([
  {
    title: "dcOutputPower",
    nameDe: "Aktuelle DC Ausgangsleistung",
    nameEn: "Current DC output power",
    type: "number",
    role: "value.power",
    unit: "W",
  },
  {
    title: "dcSwitch",
    nameDe: "DC Schalter",
    nameEn: "DC switch",
    type: "boolean",
    role: "value",
  },
  {
    title: "inputLimit",
    nameDe: "Limit der Eingangsleistung",
    nameEn: "limit of input power",
    type: "number",
    role: "value.power",
    unit: "W",
  },
  {
    title: "gridPower",
    nameDe: "Leistung vom Stromnetz",
    nameEn: "Grid power",
    type: "number",
    role: "value.power",
    unit: "W",
  },
  {
    title: "acMode",
    nameDe: "AC Modus",
    nameEn: "AC mode",
    type: "number",
    role: "value",
  },
  {
    title: "batteryElectric",
    nameDe: "Batterie Leistung",
    nameEn: "Battery electric",
    type: "number",
    role: "value.power",
    unit: "W",
  },
  {
    title: "gridInputPower",
    nameDe: "Aktuelle AC Eingangsleistung",
    nameEn: "Current AC input power",
    type: "number",
    role: "value.power",
    unit: "W",
  },
  {
    title: "acOutputPower",
    nameDe: "Aktuelle AC Ausgangsleistung",
    nameEn: "Current AC output power",
    type: "number",
    role: "value.power",
    unit: "W",
  },
  {
    title: "acSwitch",
    nameDe: "AC Schalter",
    nameEn: "AC switch",
    type: "boolean",
    role: "value",
  },
]);
