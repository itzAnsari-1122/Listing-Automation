// Users.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiUsers, FiPlus, FiEdit2, FiTrash2, FiCamera } from "react-icons/fi";
import { Tooltip } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { GoPasskeyFill } from "react-icons/go";
import CustomTable from "../../components/ui/CustomTable";
import ThemeTextField from "../../components/ui/ThemeTextField";
import ThemeLoader from "../../components/ui/ThemeLoader";
import MainCard from "../../components/ui/MainCard";
import ThemeButton from "../../components/ui/ThemeButton";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Search, X } from "lucide-react";

/* ───────────────────────── Helpers: Toast & Confirm ───────────────────────── */

function Toast({ open, onClose, type = "info", message }) {
  if (!open) return null;
  const bg =
    type === "success"
      ? "rgba(16,185,129,0.95)"
      : type === "error"
        ? "rgba(239,68,68,0.95)"
        : "rgba(59,130,246,0.95)";
  return (
    <div
      className="fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 rounded-xl px-4 py-3 text-sm font-semibold shadow-xl"
      style={{ background: bg, color: "#fff" }}
      role="status"
      aria-live="polite"
      onClick={onClose}
      title="Dismiss"
    >
      {message}
    </div>
  );
}

export default function Users() {
  const {
    allUsersService,
    allUsers,
    registerService,
    editProfileService,
    deleteAccountService,
    user,
    userLoading,
    changePasswordService,
  } = useAuth();

  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [users, setUsers] = useState([]);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [busy, setBusy] = useState(false);
  const [tableLoading, setTableLoading] = useState(false); // Add table loading state

  const [editOpen, setEditOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchDraft);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchDraft]);

  const [toast, setToast] = useState({
    open: false,
    type: "info",
    message: "",
  });

  // Update the useEffect to handle loading states properly
  useEffect(() => {
    const fetchUsers = async () => {
      setBusy(true);
      setTableLoading(true);
      try {
        await allUsersService();
      } finally {
        setBusy(false);
        setTableLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (Array.isArray(allUsers)) setUsers(allUsers);
  }, [allUsers]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.name || u.username || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q),
    );
  }, [users, search]);

  const totalCount = filteredUsers.length;
  const pagedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  const getInitial = (name) => name?.charAt(0)?.toUpperCase() || "?";

  const handleUserRegistered = (newUser) => {
    setUsers((prev) => [...prev, newUser]);
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setEditOpen(true);
  };
  const openPwd = (user) => {
    setSelectedUser(user);
    setPwdOpen(true);
  };
  const openDel = (user) => {
    setSelectedUser(user);
    setDeleteAccountOpen(true);
  };

  const columns = [
    {
      id: "profile",
      label: "Image",
      minWidth: 80,
      render: (row) =>
        row.profilePic ? (
          <img
            src={row.profilePic}
            alt={row.name || row.username}
            className="h-12 w-12 rounded-full border-2 object-cover shadow-sm"
            style={{ borderColor: "var(--color-primary)" }}
          />
        ) : (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "#fff",
            }}
          >
            {getInitial(row.name || row.username)}
          </div>
        ),
    },
    {
      id: "name",
      label: "Name",
      minWidth: 180,
      render: (row) => (
        <Tooltip title={row.name || row.username || ""} arrow>
          <div
            className="truncate font-semibold"
            style={{
              maxWidth: 240,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              color: "var(--color-text)",
            }}
          >
            {row.name || row.username || "-"}
          </div>
        </Tooltip>
      ),
    },
    {
      id: "email",
      label: "Email",
      minWidth: 220,
      render: (row) => (
        <div style={{ color: "var(--color-text)", opacity: 0.85 }}>
          {row.email || "-"}
        </div>
      ),
    },
    {
      id: "actions",
      label: "Actions",
      minWidth: 160,
      render: (row) => {
        const isSelf = user?._id === row._id;

        return (
          <div className="flex items-center gap-2">
            <ThemeButton
              buttonType="icon"
              variant="outline"
              tone="primary"
              onClick={() => openEdit(row)}
              title="Edit"
            >
              <FiEdit2 />
            </ThemeButton>

            <ThemeButton
              buttonType="icon"
              variant="outline"
              tone="success"
              onClick={() => openPwd(row)}
              title="Change Password"
            >
              <GoPasskeyFill />
            </ThemeButton>

            {!isSelf && (
              <ThemeButton
                buttonType="icon"
                variant="outline"
                tone="danger"
                onClick={() => openDel(row)}
                title="Delete"
              >
                <FiTrash2 />
              </ThemeButton>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="mx-auto mb-12 mt-8 min-h-screen max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Add ThemeLoader like ListingReport.jsx */}
      {busy && <ThemeLoader type="bar" />}

      <h1
        className="mb-4 flex items-center gap-3 text-2xl font-bold"
        style={{ color: "var(--color-text)" }}
      >
        <FiUsers size={28} style={{ color: "var(--color-primary)" }} />
        All Users
      </h1>

      <MainCard bgColor="var(--color-surface)" className="mb-6">
        <div className="mb-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-96">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: "gray" }}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              className="w-full rounded-lg border py-2 pl-10 pr-10 text-sm outline-none focus:ring-2"
              style={{
                borderColor: "#e2e8f0",
                color: "var(--color-text)",
                backgroundColor: "var(--color-surface)",
              }}
            />
            {searchDraft && (
              <button
                type="button"
                onClick={() => setSearchDraft("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <ThemeButton
            onClick={() => setRegisterModalOpen(true)}
            tone="primary"
            variant="contained"
          >
            <span className="flex items-center gap-2">
              <FiPlus />
              Add New User
            </span>
          </ThemeButton>
        </div>

        <CustomTable
          columns={columns}
          data={pagedData}
          totalCount={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(n) => {
            setRowsPerPage(n);
            setPage(1);
          }}
          loading={tableLoading || userLoading} // Combine loading states like ListingReport
        />
      </MainCard>

      {registerModalOpen && (
        <RegisterUserModal
          onClose={() => setRegisterModalOpen(false)}
          registerService={registerService}
          onUserRegistered={handleUserRegistered}
        />
      )}

      {editOpen && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setEditOpen(false)}
          editProfileService={editProfileService}
        />
      )}

      {pwdOpen && selectedUser && (
        <PasswordModal
          user={selectedUser}
          onClose={() => setPwdOpen(false)}
          changePasswordService={changePasswordService}
        />
      )}

      {deleteAccountOpen && (
        <DeleteAccountModal
          user={selectedUser}
          onClose={() => setDeleteAccountOpen(false)}
          deleteAccountService={deleteAccountService}
        />
      )}

      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </div>
  );
}

/* ─────────────── Modal Wrapper ─────────────── */

function Modal({ title, children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl p-6 shadow-2xl"
        style={{
          backgroundColor: "var(--color-surface)",
          color: "var(--color-text)",
          boxShadow: "0 8px 20px var(--color-shadow-heavy)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="mb-5 text-xl font-bold"
          style={{ color: "var(--color-primary)" }}
        >
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

/* ─────────────── Edit User ─────────────── */

const editUserSchema = yup.object({
  username: yup.string().trim().min(2, "Too short").required("Required"),
  email: yup.string().trim().email("Invalid email").required("Required"),
});

function EditUserModal({ user, onClose, editProfileService }) {
  const [profilePic, setProfilePic] = useState(user.profilePic || null);
  const fileRef = useRef(null);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: user.name || user.username || "",
      email: user.email || "",
    },
    resolver: yupResolver(editUserSchema),
    mode: "onTouched",
  });

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      const payload = {
        username: values.username,
        email: values.email,
        profilePic,
      };
      await editProfileService(user._id, payload);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleImage = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfilePic(reader.result);
    reader.readAsDataURL(f);
  };

  return (
    <Modal title="Edit Profile" onClose={onClose}>
      <div className="mb-5 flex flex-col items-center">
        <div className="relative">
          <img
            src={
              profilePic || user.profilePic || "https://via.placeholder.com/100"
            }
            alt="Profile"
            className="h-24 w-24 rounded-full border-4 object-cover shadow-md"
            style={{ borderColor: "var(--color-primary)" }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-2 -right-2 grid h-10 w-10 place-items-center rounded-full shadow-md transition"
            style={{ background: "var(--color-primary)", color: "#fff" }}
            title="Upload new"
          >
            <FiCamera />
          </button>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImage}
          />
        </div>
      </div>

      <ThemeTextField
        label="Name (Username)"
        name="username"
        isController
        control={control}
        error={errors.username?.message}
      />
      <ThemeTextField
        label="Email"
        name="email"
        isController
        control={control}
        error={errors.email?.message}
      />

      <div className="mt-4 flex justify-end gap-3">
        <ThemeButton variant="outline" tone="neutral" onClick={onClose}>
          Cancel
        </ThemeButton>
        <ThemeButton
          tone="primary"
          loading={saving}
          onClick={handleSubmit(onSubmit)}
        >
          Save Changes
        </ThemeButton>
      </div>
    </Modal>
  );
}

/* ─────────────── Password Modal ─────────────── */

const passwordSchema = yup.object({
  old: yup.string().required("Required"),
  new: yup.string().min(6, "At least 6 characters").required("Required"),
  confirm: yup
    .string()
    .oneOf([yup.ref("new")], "Passwords must match")
    .required("Required"),
});

function PasswordModal({ user, onClose, changePasswordService }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { old: "", new: "", confirm: "" },
    resolver: yupResolver(passwordSchema),
    mode: "onTouched",
  });

  const onSubmit = (data) => {
    const payload = {
      oldPassword: data.old,
      newPassword: data.new,
    };
    changePasswordService(payload);
    onClose();
  };

  return (
    <Modal
      title={`Change Password – ${user.name || user.username}`}
      onClose={onClose}
    >
      <ThemeTextField
        label="Old Password"
        type="password"
        name="old"
        isController
        control={control}
        error={errors.old?.message}
      />
      <ThemeTextField
        label="New Password"
        type="password"
        name="new"
        isController
        control={control}
        error={errors.new?.message}
      />
      <ThemeTextField
        label="Confirm Password"
        type="password"
        name="confirm"
        isController
        control={control}
        error={errors.confirm?.message}
      />

      <div className="mt-4 flex justify-end gap-3">
        <ThemeButton variant="outline" tone="neutral" onClick={onClose}>
          Cancel
        </ThemeButton>
        <ThemeButton tone="primary" onClick={handleSubmit(onSubmit)}>
          Change Password
        </ThemeButton>
      </div>
    </Modal>
  );
}

/* ─────────────── Delete Account ─────────────── */

const deleteAccountSchema = yup.object({
  password: yup.string().required("Required"),
});

function DeleteAccountModal({ user, onClose, deleteAccountService }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { password: "" },
    resolver: yupResolver(deleteAccountSchema),
    mode: "onTouched",
  });

  const onSubmit = (data) => {
    deleteAccountService({ password: data.password, userId: user?._id });
    onClose();
  };

  return (
    <Modal
      title={`Delete Account – ${user?.name || user?.username}`}
      onClose={onClose}
    >
      <ThemeTextField
        label="Password"
        type="password"
        name="password"
        isController
        control={control}
        error={errors.password?.message}
      />

      <div className="mt-4 flex justify-end gap-3">
        <ThemeButton variant="outline" tone="neutral" onClick={onClose}>
          Cancel
        </ThemeButton>
        <ThemeButton tone="danger" onClick={handleSubmit(onSubmit)}>
          Delete Account
        </ThemeButton>
      </div>
    </Modal>
  );
}

/* ─────────────── Register User ─────────────── */

const registerSchema = yup.object({
  username: yup.string().trim().min(2, "Too short").required("Required"),
  email: yup.string().trim().email("Invalid email").required("Required"),
  password: yup.string().min(6, "At least 6 characters").required("Required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Required"),
});

function RegisterUserModal({ onClose, registerService, onUserRegistered }) {
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    resolver: yupResolver(registerSchema),
    mode: "onTouched",
  });

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfilePic(reader.result);
    reader.readAsDataURL(f);
  };

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        username: values.username,
        email: values.email,
        password: values.password,
        profilePic,
      };
      const response = await registerService(payload);
      if (response?.success) {
        onUserRegistered(response.user);
        reset();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Add New User" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="mb-2 flex justify-center">
          <div
            className="group relative h-24 w-24 cursor-pointer overflow-hidden rounded-full border-2"
            style={{ borderColor: "var(--color-primary)" }}
          >
            <img
              src={
                profilePic ||
                "https://cdn-icons-png.flaticon.com/512/847/847969.png"
              }
              alt="profile"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-1 right-1 grid h-9 w-9 place-items-center rounded-full shadow-md transition"
              style={{ background: "var(--color-primary)", color: "#fff" }}
            >
              <FiCamera />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
          </div>
        </div>

        <ThemeTextField
          label="Name (Username)"
          name="username"
          isController
          control={control}
          error={errors.username?.message}
        />
        <ThemeTextField
          label="Email"
          name="email"
          isController
          control={control}
          error={errors.email?.message}
        />
        <ThemeTextField
          label="Password"
          type="password"
          name="password"
          isController
          control={control}
          error={errors.password?.message}
        />
        <ThemeTextField
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          isController
          control={control}
          error={errors.confirmPassword?.message}
        />

        <div className="mt-2 flex justify-end gap-3">
          <ThemeButton
            variant="outline"
            tone="neutral"
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </ThemeButton>
          <ThemeButton tone="primary" type="submit" loading={loading}>
            Add New User
          </ThemeButton>
        </div>
      </form>
    </Modal>
  );
}
