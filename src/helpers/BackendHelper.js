import { makeAPICall } from "./ApiHelper";
import {
  ALL_USERS,
  CHANGE_PASSWORD,
  DELETE_ACCOUNT,
  EDIT_PROFILE,
  JOB_CONFIG,
  JOB_CONFIG_GET,
  JOB_CONFIG_UPDATE,
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
export const deleteAccountCallApi = (data) =>
  makeAPICall({
    option: { method: "delete", url: `${DELETE_ACCOUNT}` },
    data,
  });
export const usersCallApi = () =>
  makeAPICall({ option: { method: "get", url: ALL_USERS } });
// Change password API
export const changePasswordCallApi = (payload) =>
  makeAPICall({
    option: { method: "post", url: CHANGE_PASSWORD },
    data: payload,
  });
export const jobConfigGetCallApi = () =>
  makeAPICall({ option: { method: "get", url: JOB_CONFIG_GET } });
export const jobConfigUpdateCallApi = () =>
  makeAPICall({ option: { method: "POST", url: JOB_CONFIG_UPDATE } });
export const jobConfigCallApi = () =>
  makeAPICall({ option: { method: "PATCH", url: JOB_CONFIG } });

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
