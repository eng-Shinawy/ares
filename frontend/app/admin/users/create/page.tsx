"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  CircularProgress,
  MenuItem,
  Alert,
  Divider,
} from "@mui/material";
import { createUser } from "@/app/api/users/users";

export default function CreateSupplierPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<any>({});

  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    status: "active",
    role: "Supplier",
  });

  // -------------------------
  // VALIDATION
  // -------------------------
  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9+\s-]{8,15}$/;

    const newErrors: any = {};

    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(form.email)) newErrors.email = "Invalid email";

    if (!form.password.trim()) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Minimum 6 characters";
    } else if (!/[A-Z]/.test(form.password)) {
      newErrors.password = "Must contain uppercase letter";
    } else if (!/[^A-Za-z0-9]/.test(form.password)) {
      newErrors.password = "Must contain special character";
    }

    if (!form.firstName.trim())
      newErrors.firstName = "First name is required";

    if (!form.lastName.trim())
      newErrors.lastName = "Last name is required";

    if (form.phoneNumber && !phoneRegex.test(form.phoneNumber))
      newErrors.phoneNumber = "Invalid phone number";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // -------------------------
  // SUBMIT
  // -------------------------
  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError("");

      const isValid = validate();
      if (!isValid) return;

      await createUser({
        email: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneNumber: form.phoneNumber,
        status: form.status,
        roles: [form.role], // ✅ مهم جدًا
      });

      router.push("/admin/users");
    } catch (err: any) {
      setError(err?.message || "Create user failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 750, mx: "auto" }}>

      {/* Header */}
      <Typography variant="h5" fontWeight={800} mb={1}>
        Create User
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={3}>
        Create a new system user account
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Card */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          border: "1px solid rgba(0,0,0,0.08)",
          background: "#fff",
        }}
      >
        <Stack spacing={2.2}>

          {/* Account */}
          <Typography fontWeight={700} color="primary">
            Account Info
          </Typography>

          <TextField
            label="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            fullWidth
            error={Boolean(errors.email)}
            helperText={errors.email}
          />

          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            fullWidth
            error={Boolean(errors.password)}
            helperText={errors.password}
          />

          <Divider />

          {/* Personal */}
          <Typography fontWeight={700} color="primary">
            Personal Info
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="First Name"
              value={form.firstName}
              onChange={(e) =>
                setForm({ ...form, firstName: e.target.value })
              }
              fullWidth
              error={Boolean(errors.firstName)}
              helperText={errors.firstName}
            />

            <TextField
              label="Last Name"
              value={form.lastName}
              onChange={(e) =>
                setForm({ ...form, lastName: e.target.value })
              }
              fullWidth
              error={Boolean(errors.lastName)}
              helperText={errors.lastName}
            />
          </Stack>

          <TextField
            label="Phone Number"
            value={form.phoneNumber}
            onChange={(e) =>
              setForm({ ...form, phoneNumber: e.target.value })
            }
            fullWidth
            error={Boolean(errors.phoneNumber)}
            helperText={errors.phoneNumber}
          />

          <Divider />

          {/* Role */}
          <Typography fontWeight={700} color="primary">
            Role
          </Typography>

          <TextField
            select
            label="User Role"
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value })
            }
            fullWidth
          >
            <MenuItem value="Supplier">Supplier</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="User">User</MenuItem>
          </TextField>

          {/* Status */}
          <TextField
            select
            label="Status"
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value })
            }
            fullWidth
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="blocked">Blocked</MenuItem>
          </TextField>

          {/* Actions */}
          <Stack
            direction="row"
            spacing={2}
            justifyContent="flex-end"
            mt={2}
          >
            <Button
              variant="outlined"
              onClick={() => router.back()}
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={saving}
              sx={{
                borderRadius: 2,
                px: 3,
                fontWeight: 600,
              }}
            >
              {saving ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Create User"
              )}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}