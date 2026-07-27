import app from "./app";
import dotenv from "dotenv";
import { connectDatabase } from "./database/connection";

dotenv.config();

const PORT = process.env.PORT || 3000;

connectDatabase().then(() => {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
});
