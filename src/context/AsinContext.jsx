import React, { createContext, useContext, useState } from "react";
import {
  AllAsinCallApi,
  CreateAsinCallApi,
  UpdateAsinCallApi,
  DeleteAsinCallApi,
  UploadAsinCsvCallApi,
  DownloadAsinCsvCallApi,
} from "../helpers/BackendHelper";
import { themeToast } from "../components/ui/ThemeToaster";

const AsinContext = createContext(undefined);

export const useAsin = () => useContext(AsinContext);

export const AsinProvider = ({ children }) => {
  const [asinLoading, setAsinLoading] = useState(false);
  const [allAsins, setAllAsins] = useState([]);
  const [asinPagination, setAsinPagination] = useState({});
  const getAllAsinsService = async ({
    page = 0,
    pageSize = 10,
    search = "",
  }) => {
    try {
      setAsinLoading(true);
      const res = await AllAsinCallApi({ page, pageSize, search });
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      setAllAsins(list);
      setAsinPagination(res?.pagination || {});
      return list;
    } catch (error) {
      themeToast.error(
        error?.response?.data?.message || "Failed to fetch ASINs",
      );
      throw error;
    } finally {
      setAsinLoading(false);
    }
  };

  const createAsinService = async (asin) => {
    const res = await CreateAsinCallApi(asin);
    const created = res?.data ?? res;
    setAllAsins((prev) => [created, ...prev]);
    return created;
  };

  const updateAsinService = async (id, asin) => {
    const res = await UpdateAsinCallApi(id, asin);
    const updated = res?.data ?? res;
    setAllAsins((prev) =>
      prev.map((a) => (a._id === id || a.id === id ? updated : a)),
    );
    return updated;
  };

  const deleteAsinService = async (id) => {
    await DeleteAsinCallApi(id);
    setAllAsins((prev) => prev.filter((a) => a._id !== id && a.id !== id));
  };

  const uploadCsvService = async (file) => {
    const out = await UploadAsinCsvCallApi(file);
    await getAllAsinsService();
    return out;
  };

  const downloadCsvService = async () => {
    await DownloadAsinCsvCallApi();
  };

  return (
    <AsinContext.Provider
      value={{
        asinLoading,
        allAsins,
        setAllAsins,
        getAllAsinsService,
        createAsinService,
        updateAsinService,
        deleteAsinService,
        uploadCsvService,
        downloadCsvService,
        asinPagination,
      }}
    >
      {children}
    </AsinContext.Provider>
  );
};
