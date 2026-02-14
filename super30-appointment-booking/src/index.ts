import express from "express";
import authRoutes from "./routes/authRoutes";
import servicesRoutes from "./routes/services.routes";
import appointmentsRoutes from "./routes/appointments.routes";
import providersRoutes from "./routes/providers.routes";

import { config } from "./config";

const app = express();
const PORT = config.PORT || 3000;

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/services", servicesRoutes);
app.use("/appointments", appointmentsRoutes);
app.use("/providers", providersRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
