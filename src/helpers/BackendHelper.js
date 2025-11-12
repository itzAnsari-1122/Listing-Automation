import { makeAPICall } from "./ApiHelper";
import {
  ALL_USERS,
  ASIN_ALL,
  ASIN_CREATE,
  ASIN_DELETE,
  ASIN_DOWNLOAD_CSV,
  ASIN_GET,
  ASIN_UPDATE,
  ASIN_UPLOAD_CSV,
  CHANGE_PASSWORD,
  DELETE_ACCOUNT,
  EDIT_PROFILE,
  JOB_CONFIG_GET,
  JOB_CONFIG_UPDATE,
  LISTINGS,
  LISTINGS_DETAIL,
  LISTINGS_EDIT,
  LISTINGS_FLAGGED,
  LISTINGS_SYNC,
  LOGIN,
  NOTIFICATION,
  PROFILE,
  REGISTER,
  RESTRICTED_CREATE,
  RESTRICTED_DELETE,
  RESTRICTED_DOWNLOAD_CSV,
  RESTRICTED_GET,
  RESTRICTED_UPDATE,
  RESTRICTED_UPLOAD_CSV,
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
export const UnreadNotificationsCAllApi = () =>
  makeAPICall({
    option: {
      method: "get",
      url: `${NOTIFICATION}/unread`,
    },
  });
export const AllAsinCallApi = ({ page = 1, pageSize = 10, search = "" }) =>
  makeAPICall({
    option: {
      method: "get",
      url: `${ASIN_ALL}?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`,
    },
  });

export const CreateAsinCallApi = (asin) =>
  makeAPICall({
    option: { method: "post", url: ASIN_CREATE },
    data: { asin },
  });

export const GetAsinByIdCallApi = (id) =>
  makeAPICall({
    option: { method: "get", url: `${ASIN_GET}?id=${id}` },
  });

export const UpdateAsinCallApi = (id, asin) =>
  makeAPICall({
    option: { method: "put", url: `${ASIN_UPDATE}?id=${id}` },
    data: { asin },
  });

export const DeleteAsinCallApi = (id) =>
  makeAPICall({
    option: { method: "delete", url: `${ASIN_DELETE}?id=${id}` },
  });

export const UploadAsinCsvCallApi = (file) => {
  const formData = new FormData();
  formData.append("File", file);
  return makeAPICall(
    {
      option: { method: "post", url: ASIN_UPLOAD_CSV },
      data: formData,
      config: {
        headers: {
          /* 'Content-Type' auto-set by browser */
        },
      },
    },
    false,
    "multipart/form-data",
  );
};

export const DownloadAsinCsvCallApi = async () => {
  const res = await makeAPICall(
    {
      option: { method: "get", url: ASIN_DOWNLOAD_CSV },
      config: { responseType: "blob" },
    },
    true, // with headers and blob
  );

  // Create a browser download
  const blob = new Blob([res.data], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  // Grab filename from header if present
  const cd = res.headers?.["content-disposition"];
  const match = /filename="?(.*)"?/.exec(cd || "");
  a.download = match?.[1] || "asins.csv";

  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const AllRestrictedCallApi = ({
  page = 1,
  pageSize = 10,
  search = "",
}) =>
  makeAPICall({
    option: {
      method: "get",
      url: `${RESTRICTED_GET}?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`,
    },
  });

export const CreateRestrictedCallApi = (word) =>
  makeAPICall({
    option: { method: "post", url: RESTRICTED_CREATE },
    data: { word },
  });

export const GetRestrictedByIdCallApi = (id) =>
  makeAPICall({ option: { method: "get", url: `${RESTRICTED_GET}?id=${id}` } });

export const UpdateRestrictedCallApi = (id, word) =>
  makeAPICall({
    option: { method: "put", url: `${RESTRICTED_UPDATE}/${id}` },
    data: { word },
  });

export const DeleteRestrictedCallApi = (id) =>
  makeAPICall({
    option: { method: "delete", url: `${RESTRICTED_DELETE}?id=${id}` },
  });

export const UploadRestrictedCsvCallApi = (file) => {
  const fd = new FormData();
  fd.append("file", file);
  return makeAPICall(
    {
      option: { method: "post", url: RESTRICTED_UPLOAD_CSV },
      data: fd,
      config: { headers: {} },
    },
    false,
    "multipart/form-data",
  );
};

export const DownloadRestrictedCsvCallApi = async () => {
  const res = await makeAPICall(
    {
      option: { method: "get", url: RESTRICTED_DOWNLOAD_CSV },
      config: { responseType: "blob" },
    },
    true,
  );

  const blob = new Blob([res.data], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  const cd = res.headers?.["content-disposition"];
  const match = /filename="?(.*)"?/.exec(cd || "");
  a.download = match?.[1] || "restricted_words.csv";

  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const jobConfigGetCallApi = () =>
  makeAPICall({ option: { method: "get", url: JOB_CONFIG_GET } });
export const jobConfigUpdateCallApi = (data) =>
  makeAPICall({ option: { method: "POST", url: JOB_CONFIG_UPDATE }, data });
