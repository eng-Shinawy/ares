import { useState, useEffect } from "react";
import { apiFetchJson } from "@/utils/api-client";

const BASE_URL = "http://localhost:5000/api";

export function useCountries(accessToken: string | undefined, initialPage = 1, initialSearch = "") {
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(initialSearch);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 10;
  const language = "en"; // Default language

  const fetchCountries = async (currentPage: number, currentSearch: string) => {
    try {
      setLoading(true);
      const url = `api/countries/${currentPage}/${pageSize}/${language}${currentSearch ? `?s=${encodeURIComponent(currentSearch)}` : ''}`;
      
      const response = await apiFetchJson<any>(url, {
        method: "GET",
        accessToken, // Although public, it's fine to pass
      });
      
      setCountries(response.resultData || []);
      const total = response.pageInfo?.[0]?.totalRecords || 0;
      setTotalRecords(total);
      setTotalPages(Math.ceil(total / pageSize) || 1);
    } catch (error) {
      console.error("Failed to fetch countries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries(page, search);
  }, [page, search, accessToken]);

  return { 
    countries, 
    loading, 
    page, 
    totalPages, 
    totalRecords,
    setPage, 
    search,
    setSearch,
    refresh: () => fetchCountries(page, search) 
  };
}

export const checkCountry = async (accessToken: string, id: string) => {
  const res = await fetch(`${BASE_URL}/check-country/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (res.status === 204) {
    return { canDelete: true };
  }

  const data = await res.json();
  if (res.status === 200) {
    return { canDelete: false, message: data.message };
  }

  throw new Error("Failed to check country status");
};

export const deleteCountry = async (accessToken: string, id: string) => {
  const res = await fetch(`${BASE_URL}/delete-country/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to delete country");
  }

  return await res.json();
};
