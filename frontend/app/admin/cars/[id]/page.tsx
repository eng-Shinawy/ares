"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Stack,
  Divider,
  Chip,
  Button,
  Avatar,
  IconButton,
  Grid,
  alpha,
  useTheme,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SettingsIcon from "@mui/icons-material/Settings";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

import { getCarById } from "@/app/api/cars/cars";

export default function CarDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const { data: session } = useSession();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;
   console.log(id);
   
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !session?.accessToken) return;

    const fetchCar = async () => {
      try {
        setLoading(true);

        const data = await getCarById(
          session.accessToken,
          id as string
        );

        // safe mapping (لو API بيرجع wrapper)
        const carData = data?.data ?? data?.result ?? data;

        setCar(carData);
      } catch (err) {
        console.error("Failed to load car:", err);
        setCar(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id, session?.accessToken]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!car) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error" variant="h6" textAlign="center">
          Vehicle not found
        </Typography>
      </Box>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "success";
      case "rented":
        return "warning";
      case "maintenance":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: "auto" }}>
      
      {/* Action Bar */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <IconButton
          onClick={() => router.back()}
          sx={{ bgcolor: alpha(theme.palette.divider, 0.1) }}
        >
          <ArrowBackIcon />
        </IconButton>

        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => router.push(`/admin/cars/${id}/edit`)}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            px: 3,
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          }}
        >
          Edit Vehicle
        </Button>
      </Stack>

      {/* Main Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 5,
          border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
        }}
      >
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          alignItems="center"
          mb={4}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
            }}
          >
            <DirectionsCarIcon sx={{ fontSize: 40 }} />
          </Avatar>

          <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
            <Typography variant="h4" fontWeight={800}>
              {car.make} {car.model}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              justifyContent={{ xs: "center", sm: "flex-start" }}
              mt={1}
            >
              <Chip
                label={car.year}
                variant="outlined"
                size="small"
                sx={{ fontWeight: 700 }}
              />

              <Chip
                label={car.availabilityStatus}
                color={getStatusColor(car.availabilityStatus)}
                size="small"
                sx={{ fontWeight: 700 }}
              />
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ mb: 4 }} />

        {/* Info Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <InfoItem
              icon={<AttachMoneyIcon color="success" />}
              label="Daily Rate"
              value={`$${car.pricePerDay}`}
              highlight
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <InfoItem
              icon={<LocationOnIcon color="error" />}
              label="Location"
              value={car.locationCity}
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <InfoItem
              icon={<SettingsIcon />}
              label="Transmission"
              value={car.transmission}
              small
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <InfoItem
              icon={<LocalGasStationIcon />}
              label="Fuel"
              value={car.fuelType}
              small
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <InfoItem
              icon={<EventSeatIcon />}
              label="Seats"
              value={`${car.seats} Seats`}
              small
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <InfoItem
              icon={<DirectionsCarIcon />}
              label="License Plate"
              value={car.licensePlate}
              small
            />
          </Grid>
        </Grid>

        {/* Description */}
        <Box
          sx={{
            mt: 5,
            p: 3,
            bgcolor: alpha(theme.palette.action.hover, 0.5),
            borderRadius: 3,
          }}
        >
          <Typography
            variant="subtitle2"
            color="text.secondary"
            gutterBottom
            fontWeight={700}
          >
            DESCRIPTION
          </Typography>

          <Typography variant="body1" lineHeight={1.7}>
            {car.description || "No description provided for this vehicle."}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

/* Reusable component */
function InfoItem({ icon, label, value, highlight = false }: any) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
        display: "flex",
        alignItems: "center",
        gap: 2,
        transition: "0.2s",
        "&:hover": { transform: "translateY(-2px)" },
      }}
    >
      <Box
        sx={{
          p: 1,
          borderRadius: 2,
          bgcolor: highlight
            ? alpha(theme.palette.success.main, 0.1)
            : alpha(theme.palette.action.hover, 1),
          display: "flex",
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>

        <Typography fontWeight={700} variant={highlight ? "h6" : "body1"}>
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}