import app from "./app";
import { connectDB } from "./config/database";
import { isDevelopment } from "./utils/constants";

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`${isDevelopment ? "[DEV]" : "[PROD]"} Server is running on port ${PORT}`);
  });
})();