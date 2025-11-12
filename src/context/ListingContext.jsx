import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ListingCallApi,
  ListingFlaggedCallApi,
  ListingDetailCallApi,
  ListingSyncCallApi,
  EditListingCallApi,
} from "../helpers/BackendHelper";

const ListingContext = createContext();
export const useListing = () => useContext(ListingContext);

export const ListingProvider = ({ children }) => {
  const [listingLoading, setListingLoading] = useState(false);
  const [listingFlaggedLoading, setListingFlaggedLoading] = useState(false);
  const [listingFlagged, setListingFlagged] = useState(null);
  const [listingDetailLoading, setListingDetailLoading] = useState(false);
  const [listingDetail, setListingDetail] = useState(null);
  const [listing, setListing] = useState(null);
  const [listingSyncLoading, setListingSyncLoading] = useState(false);

  const ListingService = async (payload) => {
    try {
      setListingLoading(true);
      const data = await ListingCallApi(payload);
      setListing(data);
      return data;
    } catch (error) {
      themeToast.error(
        error?.response?.data?.message || "Failed to fetch listing",
      );
      throw error;
    } finally {
      setListingLoading(false);
    }
  };
  const EditListingService = async (asin, payload, marketplaceIds) => {
    try {
      setListingLoading(true);
      const response = await EditListingCallApi(asin, payload, marketplaceIds);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setListingLoading(false);
    }
  };
  const ListingFlaggedService = async (payload) => {
    try {
      setListingFlaggedLoading(true);
      const data = await ListingFlaggedCallApi(payload);
      setListingFlagged(data);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setListingFlaggedLoading(false);
    }
  };
  const ListingDetailService = async (payload) => {
    try {
      setListingDetailLoading(true);
      const data = await ListingDetailCallApi(payload);
      setListingDetail(data);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setListingDetailLoading(false);
    }
  };
  const ListingSyncService = async () => {
    try {
      setListingSyncLoading(true);
      await ListingSyncCallApi();
    } catch (error) {
    } finally {
      setListingSyncLoading(false);
    }
  };

  return (
    <ListingContext.Provider
      value={{
        ListingService,
        listingLoading,
        listingDetailLoading,
        listingDetail,
        ListingDetailService,
        ListingSyncService,
        listingSyncLoading,
        listing,
        EditListingService,
        listingFlagged,
        ListingFlaggedService,
        listingFlaggedLoading,
      }}
    >
      {children}
    </ListingContext.Provider>
  );
};
