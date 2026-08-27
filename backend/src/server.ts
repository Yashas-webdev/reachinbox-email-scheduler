import "dotenv/config";
import app from "./app.js";
import "./workers/email.worker.js";
import { recoverPendingSchedules } from "./services/schedule.service.js";

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  try {
    await recoverPendingSchedules();
  } catch (error) {
    console.error("[Recovery] Failed to run startup schedule recovery:", error);
  }
});