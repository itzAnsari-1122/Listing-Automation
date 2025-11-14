// colorMap.js
import { FiCheckCircle, FiAlertCircle, FiInfo } from "react-icons/fi";

export const colorMap = {
  success: {
    icon: FiCheckCircle,
    iconBg: "#16A34A",
    border: "#16A34A",
    bg: "rgba(22, 163, 74, 0.12)",
    hover: "rgba(22, 163, 74, 0.18)",
  },
  error: {
    icon: FiAlertCircle,
    iconBg: "#DC2626",
    border: "#DC2626",
    bg: "rgba(220, 38, 38, 0.12)",
    hover: "rgba(220, 38, 38, 0.18)",
  },
  warn: {
    icon: FiAlertCircle,
    iconBg: "#FACC15",
    border: "#FACC15",
    bg: "rgba(250, 204, 21, 0.12)",
    hover: "rgba(250, 204, 21, 0.18)",
  },
  info: {
    icon: FiInfo,
    iconBg: "#3B82F6",
    border: "#3B82F6",
    bg: "rgba(59, 130, 246, 0.12)",
    hover: "rgba(59, 130, 246, 0.18)",
  },
};

export const CountryOptions = [
  {
    value: "ATVPDKIKX0DER",
    label: "United States",
    code: "US",
    regionType: "NORTH_AMERICA",
  },
  {
    value: "A2EUQ1WTGCTBG2",
    label: "Canada",
    code: "CA",
    regionType: "NORTH_AMERICA",
  },
  {
    value: "A1AM78C64UM0Y8",
    label: "Mexico",
    code: "MX",
    regionType: "NORTH_AMERICA",
  },
  {
    value: "A2Q3Y263D00KWC",
    label: "Brazil",
    code: "BR",
    regionType: "NORTH_AMERICA",
  },
  {
    value: "A28R8C7NBKEWEA",
    label: "Ireland",
    code: "IE",
    regionType: "EUROPE",
  },
  { value: "A1RKKUPIHCS9HS", label: "Spain", code: "es", regionType: "EUROPE" },
  {
    value: "A1F83G8C2ARO7P",
    label: "United Kingdom",
    code: "UK",
    regionType: "EUROPE",
  },
  {
    value: "A13V1IB3VIYZZH",
    label: "France",
    code: "FR",
    regionType: "EUROPE",
  },
  {
    value: "AMEN7PMS3EDWL",
    label: "Belgium",
    code: "BE",
    regionType: "EUROPE",
  },
  {
    value: "A1805IZSGTT6HS",
    label: "Netherlands",
    code: "NL",
    regionType: "EUROPE",
  },
  {
    value: "A1PA6795UKMFR9",
    label: "Germany",
    code: "DE",
    regionType: "EUROPE",
  },
  { value: "APJ6JRA9NG5V4", label: "Italy", code: "it", regionType: "EUROPE" },
  {
    value: "A2NODRKZP88ZB9",
    label: "Sweden",
    code: "SE",
    regionType: "EUROPE",
  },
  {
    value: "A1C3SOZRARQ6R3",
    label: "Poland",
    code: "PL",
    regionType: "EUROPE",
  },
  {
    value: "A33AVAJ2PDY3EV",
    label: "Turkey",
    code: "TR",
    regionType: "EUROPE",
  },
  {
    value: "A2VIGQ35RCS4UG",
    label: "United Arab Emirates",
    code: "AE",
    regionType: "UAE",
  },
  {
    value: "A19VAU5U5O7RUS",
    label: "Singapore",
    code: "SG",
    regionType: "SINGAPORE",
  },
  {
    value: "A39IBJ37TRP1C6",
    label: "Australia",
    code: "AU",
    regionType: "AUSTRALIA",
  },
  { value: "A1VC38T7YXB528", label: "Japan", code: "JP", regionType: "JAPAN" },
];

export const marketplaceToCountry = {
  ATVPDKIKX0DER: "US",
  A2EUQ1WTGCTBG2: "CA",
  A1AM78C64UM0Y8: "MX",
  A2Q3Y263D00KWC: "BR",
  A28R8C7NBKEWEA: "IE",
  A1RKKUPIHCS9HS: "ES",
  A1F83G8C2ARO7P: "UK",
  A13V1IB3VIYZZH: "FR",
  AMEN7PMS3EDWL: "BE",
  A1805IZSGTT6HS: "NL",
  A1PA6795UKMFR9: "DE",
  APJ6JRA9NG5V4: "IT",
  A2NODRKZP88ZB9: "SE",
  AE08WJ6YKNBMC: "ZA",
  A1C3SOZRARQ6R3: "PL",
  ARBP9OOSHTCHU: "EG",
  A33AVAJ2PDY3EV: "TR",
  A17E79C6D8DWNP: "SA",
  A2VIGQ35RCS4UG: "AE",
  A21TJRUUN4KGV: "IN",
  A19VAU5U5O7RUS: "SG",
  A39IBJ37TRP1C6: "AU",
  A1VC38T7YXB528: "JP",
};

export const REGION_TYPES = [
  "AUSTRALIA",
  "NORTH_AMERICA",
  "EUROPE",
  "JAPAN",
  "UAE",
  "SINGAPORE",
];
