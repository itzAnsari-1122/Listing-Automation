import { makeAPICall } from "./ApiHelper";
import {
  ALL_USERS,
  CHANGE_PASSWORD,
  DELETE_ACCOUNT,
  EDIT_PROFILE,
  LISTINGS,
  LISTINGS_DETAIL,
  LISTINGS_EDIT,
  LISTINGS_FLAGGED,
  LISTINGS_SYNC,
  LOGIN,
  NOTIFICATION,
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
export const changePasswordCallApi = (payload) =>
  makeAPICall({
    option: { method: "post", url: CHANGE_PASSWORD },
    data: payload,
  });
export const deleteAccountCallApi = (data) =>
  makeAPICall({
    option: { method: "delete", url: `${DELETE_ACCOUNT}` },
    data,
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
export const NotificationCallApi = ({
  page = 1,
  limit = 10,
  type = "all",
  status = "all",
  marketplaceIds = [],
} = {}) =>
  makeAPICall({
    option: {
      method: "post",
      url: `${NOTIFICATION}/get?page=${page}&limit=${limit}&type=${type}&status=${status}`,
    },
    data: { marketplaceIds }, // ✅ wrapped in object
  });

export const NotificationReadByIdCallApi = (id) =>
  makeAPICall({
    option: {
      method: "patch",
      url: `${NOTIFICATION}/${id}/read`,
    },
  });
export const DeleteAllNotificationByIdCallApi = () =>
  makeAPICall({
    option: {
      method: "delete",
      url: `${NOTIFICATION}`,
    },
  });
export const DeleteAllReadNotificationByIdCallApi = () =>
  makeAPICall({
    option: {
      method: "delete",
      url: `${NOTIFICATION}/read`,
    },
  });

export const NotificationMarkAllAsReadCallApi = () =>
  makeAPICall({
    option: {
      method: "patch",
      url: `${NOTIFICATION}/read/all`,
    },
  });
export const UnreadNotificationsCAllApi = ({ marketplaceIds = [] }) =>
  makeAPICall({
    option: {
      method: "post",
      url: `${NOTIFICATION}/unread`,
      data: marketplaceIds, // Use marketplaceIds
    },
  });
