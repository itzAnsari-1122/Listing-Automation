import { makeAPICall } from "./ApiHelper";
import {
  ALL_USERS,
  DELETE_ACCOUNT,
  EDIT_PROFILE,
  LISTINGS,
  LISTINGS_DETAIL,
  LISTINGS_EDIT,
  LISTINGS_FLAGGED,
  LISTINGS_SYNC,
  LOGIN,
  PROFILE,
  REGISTER,
} from "./UrlHelper";

export const loginCallApi = (data) =>
  makeAPICall({ option: { method: "post", url: LOGIN }, data });
export const getProfileCallApi = (data) =>
  makeAPICall({ option: { method: "get", url: PROFILE }, data });
export const registerCallApi = (data) =>
  makeAPICall({ option: { method: "post", url: REGISTER }, data });
export const editProfileCallApi = (id, data) =>
  makeAPICall({
    option: { method: "put", url: `${EDIT_PROFILE}?id=${id}` },
    data,
  });
export const deleteAccountCallApi = (data) =>
  makeAPICall({
    option: { method: "delete", url: `${DELETE_ACCOUNT}` },
    data,
  });
export const changePasswordCallApi = (payload) =>
  makeAPICall({
    option: { method: "post", url: CHANGE_PASSWORD },
    data: payload,
  });
export const usersCallApi = () =>
  makeAPICall({ option: { method: "get", url: ALL_USERS } });
export const EditListingCallApi = (asin, data, marketplaceIds) =>
  makeAPICall({
    option: {
      method: "put", // Changed from "put" to match your route
      url: `${LISTINGS_EDIT}/${asin}?marketplaceIds=${marketplaceIds}`,
    },
    data, // This should be your payload object
  });
export const ListingCallApi = (data) =>
  makeAPICall({ option: { method: "post", url: LISTINGS }, data });
export const ListingDetailCallApi = (data) =>
  makeAPICall({ option: { method: "post", url: LISTINGS_DETAIL }, data });
export const ListingFlaggedCallApi = (data) =>
  makeAPICall({ option: { method: "post", url: LISTINGS_FLAGGED }, data });

export const ListingSyncCallApi = () =>
  makeAPICall({ option: { method: "get", url: LISTINGS_SYNC } });
