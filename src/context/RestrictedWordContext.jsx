import React, { createContext, useContext, useState } from "react";
import {
  AllRestrictedCallApi,
  CreateRestrictedCallApi,
  UpdateRestrictedCallApi,
  DeleteRestrictedCallApi,
  UploadRestrictedCsvCallApi,
  DownloadRestrictedCsvCallApi,
} from "../helpers/BackendHelper";
import { themeToast } from "../components/ui/ThemeToaster";

const RestrictedWordContext = createContext(undefined);
export const useRestrictedWord = () => useContext(RestrictedWordContext);

export const RestrictedWordProvider = ({ children }) => {
  const [restrictedWordLoading, setRestrictedWordLoading] = useState(false);
  const [allRestrictedWords, setAllRestrictedWords] = useState([]);
  const [restrictedWordPagination, setRestrictedWordPagination] = useState({});

  const getAllRestrictedWordsService = async ({
    page = 1,
    pageSize = 10,
    search = "",
  }) => {
    try {
      setRestrictedWordLoading(true);
      const res = await AllRestrictedCallApi({ page, pageSize, search });
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      setAllRestrictedWords(list);
      setRestrictedWordPagination(res?.pagination || {});
      return list;
    } catch (error) {
      themeToast.error(
        error?.response?.data?.message || "Failed to fetch restricted words",
      );
      throw error;
    } finally {
      setRestrictedWordLoading(false);
    }
  };

  const createRestrictedWordService = async (wordData) => {
    try {
      const res = await CreateRestrictedCallApi(wordData);
      const created = res?.data ?? res;
      setAllRestrictedWords((prev) => [created, ...prev]);
      themeToast.success("Restricted word created successfully!");
      return created;
    } catch (error) {
      themeToast.error(
        error?.response?.data?.message || "Failed to create restricted word",
      );
      throw error;
    }
  };

  const updateRestrictedWordService = async (id, wordData) => {
    try {
      const res = await UpdateRestrictedCallApi(id, wordData);
      const updated = res?.data ?? res;
      setAllRestrictedWords((prev) =>
        prev.map((w) => (w._id === id || w.id === id ? updated : w)),
      );
      themeToast.success("Restricted word updated successfully!");
      return updated;
    } catch (error) {
      themeToast.error(
        error?.response?.data?.message || "Failed to update restricted word",
      );
      throw error;
    }
  };

  const deleteRestrictedWordService = async (id) => {
    try {
      await DeleteRestrictedCallApi(id);
      setAllRestrictedWords((prev) =>
        prev.filter((w) => w._id !== id && w.id !== id),
      );
      themeToast.success("Restricted word deleted successfully!");
    } catch (error) {
      themeToast.error(
        error?.response?.data?.message || "Failed to delete restricted word",
      );
      throw error;
    }
  };

  const uploadRestrictedWordCsvService = async (file) => {
    try {
      const result = await UploadRestrictedCsvCallApi(file);
      await getAllRestrictedWordsService();
      themeToast.success("CSV uploaded successfully!");
      return result;
    } catch (error) {
      themeToast.error(
        error?.response?.data?.message ||
          "Failed to upload restricted words CSV",
      );
      throw error;
    }
  };

  const downloadRestrictedWordCsvService = async () => {
    try {
      await DownloadRestrictedCsvCallApi();
      themeToast.success("CSV downloaded successfully!");
    } catch (error) {
      themeToast.error(
        error?.response?.data?.message ||
          "Failed to download restricted words CSV",
      );
      throw error;
    }
  };

  return (
    <RestrictedWordContext.Provider
      value={{
        restrictedWordLoading,
        allRestrictedWords,
        setAllRestrictedWords,
        getAllRestrictedWordsService,
        createRestrictedWordService,
        updateRestrictedWordService,
        deleteRestrictedWordService,
        uploadRestrictedWordCsvService,
        downloadRestrictedWordCsvService,
        restrictedWordPagination,
      }}
    >
      {children}
    </RestrictedWordContext.Provider>
  );
};
