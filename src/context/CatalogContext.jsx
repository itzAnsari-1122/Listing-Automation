import React, { createContext, useContext, useState, useEffect } from "react";
import {
  CatalogFlaggedCallApi,
  getAllCatalogsCallApi,
} from "../helpers/BackendHelper";

const CatalogContext = createContext();
export const useCatalog = () => useContext(CatalogContext);

export const CatalogProvider = ({ children }) => {
  const [allCatalog, setAllCatalog] = useState(null);
  const [catalogLoading, setAllCatalogLoading] = useState(false);
  const [flaggedCatalog, setFlaggedCatalog] = useState(null);
  const [catalogPagination, setCatalogPagination] = useState({
    totalItems: 0,
    pageSize: 25,
    currentPage: 1,
    totalPages: 1,
  });
  const [catalogFlaggedPagination, setCatalogFlaggedPagination] = useState({
    totalItems: 0,
    pageSize: 10,
    currentPage: 1,
    totalPages: 1,
  });

  const getAllCatalogsService = async (page, limit) => {
    try {
      setAllCatalogLoading(true);
      const currentPage = page || catalogPagination?.currentPage || 1;
      const pageSize = limit || catalogPagination?.pageSize || 25;

      const { data, pagination } = await getAllCatalogsCallApi({
        page: currentPage,
        limit: pageSize,
      });
      setAllCatalog(data || []);
      return { data, pagination };
    } catch (error) {
      console.error("Get all catalogs failed", error);
      throw error;
    } finally {
      setAllCatalogLoading(false);
    }
  };

  const catalogFlaggedService = async (page = 1, limit = 10) => {
    try {
      setAllCatalogLoading(true);
      const { data, pagination } = await CatalogFlaggedCallApi({ page, limit });
      setFlaggedCatalog(data);
      return { data, pagination };
    } catch (error) {
      console.error("Get flagged catalogs failed", error);
      throw error;
    } finally {
      setAllCatalogLoading(false);
    }
  };

  return (
    <CatalogContext.Provider
      value={{
        allCatalog,
        catalogLoading,
        getAllCatalogsService,
        flaggedCatalog,
        catalogFlaggedService,
        catalogPagination,
        setCatalogPagination,
        catalogFlaggedPagination,
        setCatalogFlaggedPagination,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
};
