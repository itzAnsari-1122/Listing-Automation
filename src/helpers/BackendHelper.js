import { makeAPICall } from "./ApiHelper";
import { ALL_USERS, LOGIN, PROFILE, REGISTER } from "./UrlHelper";

export const loginCallApi = (data) =>
  makeAPICall({ option: { method: "post", url: LOGIN }, data });
export const getProfileCallApi = (data) =>
  makeAPICall({ option: { method: "get", url: PROFILE }, data });
