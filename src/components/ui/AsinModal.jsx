import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Box,
  Divider,
  Typography,
  Tooltip,
} from "@mui/material";
import {
  X,
  Plus,
  Edit,
  Trash,
  Download,
  Save,
  XCircle,
  Search as SearchIcon,
} from "lucide-react";
import { useAsin } from "../../context/AsinContext";
import ThemeTextField from "../Ui/ThemeTextField";
import ThemeButton from "../Ui/ThemeButton";
import ThemeLoader from "../Ui/ThemeLoader";
import { FaTimes } from "react-icons/fa";
import CustomTable from "./CustomTable";

const AsinModal = ({ open, onClose, onAddClick }) => {
  const {
    getAllAsinsService,
    asinLoading,
    allAsins,
    asinPagination,
    deleteAsinService,
    downloadCsvService,
    updateAsinService,
  } = useAsin();
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const searchRef = useRef(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const primary = "var(--color-primary)";
  const text = "var(--color-text)";
  const textMuted = "var(--color-text-muted, #6b7280)";
  const bg = "var(--color-bg)";
  const surface = "var(--color-surface)";
  const surface2 = "var(--color-surface-2, #f3f4f6)";
  const border = "var(--color-border, #e5e7eb)";

  useEffect(() => {
    if (open)
      getAllAsinsService({
        page,
        pageSize: rowsPerPage,
        search: searchRef.current?.value || "",
      });
  }, [open, page, rowsPerPage, debounced]);

  useEffect(() => {
    asinPagination?.currentPage && setPage(asinPagination.currentPage);
    asinPagination?.pageSize && setRowsPerPage(asinPagination.pageSize);
  }, [asinPagination]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [debounced]);

  useEffect(() => {
    const handler = (e) => {
      const isMeta = navigator.platform.toUpperCase().includes("MAC")
        ? e.metaKey
        : e.ctrlKey;
      if (isMeta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const startEdit = useCallback((row) => {
    const id = row._id ?? row.id;
    setEditingId(id);
    setEditValue(row.asin ?? "");
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditValue("");
    setSaving(false);
  }, []);

  const saveEdit = useCallback(
    async (optionalId) => {
      const idToSave = optionalId ?? editingId;
      if (!idToSave || !editValue?.trim()) return;
      try {
        setSaving(true);
        await updateAsinService(idToSave, editValue.trim());
        cancelEdit();
        await getAllAsinsService();
      } catch {
        setSaving(false);
      }
    },
    [editingId, editValue, updateAsinService, cancelEdit],
  );

  const openDelete = (row) => {
    const id = row._id ?? row.id;
    if (!id) return;
    setConfirmDel({ id, asin: row.asin });
  };

  const doDelete = async () => {
    if (!confirmDel?.id) return;
    try {
      await deleteAsinService(confirmDel.id);
      if (editingId === confirmDel.id) cancelEdit();
      setConfirmDel(null);
      await getAllAsinsService();
    } catch {
      setConfirmDel(null);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  };

  const isBusy = asinLoading || saving;

  const highlight = (value, q) => {
    if (!q) return value;
    const lower = value.toLowerCase();
    const idx = lower.indexOf(q.toLowerCase());
    if (idx === -1) return value;
    const before = value.slice(0, idx);
    const match = value.slice(idx, idx + q.length);
    const after = value.slice(idx + q.length);
    return (
      <>
        {before}
        <mark
          style={{
            backgroundColor: "rgba(59,130,246,0.25)",
            color: "inherit",
            padding: "0 2px",
            borderRadius: 3,
          }}
        >
          {match}
        </mark>
        {after}
      </>
    );
  };

  const columns = useMemo(
    () => [
      {
        id: "asin",
        label: "ASIN",
        minWidth: 220,
        render: (row) => {
          const id = row._id ?? row.id;
          const isEditing = editingId === id;
          if (isEditing) {
            return (
              <div onKeyDown={onKeyDown}>
                <ThemeTextField
                  name="asin"
                  placeholder="e.g., B07ABC1234"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="!mb-0"
                  autoFocus
                />
              </div>
            );
          }
          return (row.asin && highlight(row.asin, debounced)) || "-";
        },
      },
      {
        id: "actions",
        label: "Actions",
        minWidth: 140,
        render: (row) => {
          const id = row._id ?? row.id;
          const isEditing = editingId === id;
          if (isEditing) {
            return (
              <div className="flex items-center justify-end gap-8">
                <ThemeButton
                  size="sm"
                  onClick={() => saveEdit(id)}
                  loading={saving}
                  disabled={!editValue?.trim()}
                  tone="success"
                  className="!rounded-lg !font-semibold !normal-case"
                >
                  <Save size={16} className="mr-2" />
                  {saving ? "Saving..." : "Save"}
                </ThemeButton>

                <ThemeButton
                  size="sm"
                  variant="outline"
                  onClick={cancelEdit}
                  tone="neutral"
                  className="!rounded-lg !font-semibold !normal-case"
                >
                  <XCircle size={16} className="mr-2" />
                  Cancel
                </ThemeButton>
              </div>
            );
          }

          return (
            <div className="flex items-center justify-end gap-6">
              <Tooltip title="Edit">
                <span>
                  <ThemeButton
                    buttonType="icon"
                    onClick={() => {
                      setEditingId(id);
                      setEditValue(row.asin ?? "");
                    }}
                    disabled={Boolean(editingId)}
                    variant="outline"
                    tone="success"
                  >
                    <Edit size={16} />
                  </ThemeButton>
                </span>
              </Tooltip>

              <Tooltip title="Delete">
                <span>
                  <ThemeButton
                    buttonType="icon"
                    onClick={() => openDelete(row)}
                    disabled={Boolean(editingId)}
                    variant="outline"
                    tone="danger"
                  >
                    <Trash size={16} />
                  </ThemeButton>
                </span>
              </Tooltip>
            </div>
          );
        },
      },
    ],
    [editingId, editValue, saving, debounced, saveEdit, cancelEdit, onKeyDown],
  );

  return (
    <Dialog
      open={open}
      onClose={isBusy ? undefined : onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          width: { xs: "96%", md: "90%", lg: "80%" },
          height: { xs: "88vh", md: "84vh" },
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: `0 16px 40px var(--color-shadow-heavy)`,
          backgroundColor: surface,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {isBusy && <ThemeLoader type="bar" />}
      {isBusy && (
        <ThemeLoader
          type="overlay"
          message={asinLoading ? "Loading ASINs..." : "Saving changes..."}
        />
      )}

      <div
        className="flex flex-wrap items-center justify-between gap-2"
        style={{
          background: primary,
          borderBottom: `1px solid ${border}`,
          padding: 12,
        }}
      >
        <DialogTitle
          className="!m-0 p-0"
          sx={{
            fontSize: { xs: "1rem", md: "1.15rem" },
            fontWeight: 800,
            color: "#fff",
            letterSpacing: 0.3,
          }}
        >
          Manage ASINs
        </DialogTitle>

        <div className="flex grow items-center gap-2 md:grow-0">
          <div
            className="relative w-full md:w-96"
            role="search"
            aria-label="Search products"
          >
            <SearchIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: "var(--color-text-muted, #6b7280)" }}
              aria-hidden
            />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search products, brands, ASIN…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border py-2 pl-10 pr-10 text-sm outline-none transition-colors"
              style={{
                borderColor: border,
                color: text,
                backgroundColor: surface,
                boxShadow: "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 0 2px var(--color-primary)";
                e.currentTarget.style.borderColor = "var(--color-primary)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = border;
              }}
              aria-label="Search products, brands, or ASIN"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  searchRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-100"
                style={{
                  color: "var(--color-text-muted)",
                  opacity: 0.8,
                }}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Tooltip title="Export CSV">
            <ThemeButton
              variant="outline"
              size="sm"
              onClick={downloadCsvService}
              tone="surface"
            >
              <Download size={16} className="mr-2" />
              Export
            </ThemeButton>
          </Tooltip>

          <ThemeButton size="sm" onClick={onAddClick} tone="neutral">
            <Plus size={16} className="mr-2" />
            Add
          </ThemeButton>

          <ThemeButton
            buttonType="icon"
            aria-label="Close"
            onClick={onClose}
            variant="text"
            tone="neutral"
            sx={{
              color: "#ffffff",
              ml: 2,
              "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
            }}
          >
            <FaTimes size={16} />
          </ThemeButton>
        </div>
      </div>

      <DialogContent
        dividers
        sx={{
          p: 0,
          backgroundColor: bg,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Divider />

        {/* Replaced MUI Table with CustomTable */}
        <Box
          sx={{
            p: 2,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <CustomTable
            columns={columns}
            data={allAsins}
            totalCount={asinPagination?.totalItems || 0}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(nextPage) => setPage(nextPage)}
            onRowsPerPageChange={(nextRows) => {
              setRowsPerPage(nextRows);
              setPage(1);
            }}
            loading={isBusy}
            pagination={true}
          />

          {/* Empty / No match message (keeps the same semantics as earlier) */}
          {!isBusy && asinPagination?.totalItems === 0 && (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="h6" sx={{ color: text, fontWeight: 800 }}>
                {debounced ? "No matches" : "No ASINs yet"}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: textMuted, mt: 0.5, mb: 1.5 }}
              >
                {debounced
                  ? "Try a different search term."
                  : "Add your first ASIN to get started."}
              </Typography>
              {!debounced && (
                <ThemeButton size="sm" onClick={onAddClick} tone="primary">
                  <Plus size={16} className="mr-2" /> Add ASIN
                </ThemeButton>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

      <Dialog open={Boolean(confirmDel)} onClose={() => setConfirmDel(null)}>
        <DialogTitle sx={{ fontWeight: 800, color: text }}>
          Delete ASIN
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: surface }}>
          <DialogContentText sx={{ color: textMuted }}>
            Are you sure you want to delete{" "}
            <b style={{ color: text }}>{confirmDel?.asin}</b>? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <ThemeButton
            variant="outline"
            onClick={() => setConfirmDel(null)}
            tone="primary"
          >
            Cancel
          </ThemeButton>
          <ThemeButton onClick={doDelete} tone="danger">
            <Trash size={16} className="mr-2" /> Delete
          </ThemeButton>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default AsinModal;
