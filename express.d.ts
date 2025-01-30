import { Province, District, Sector, Cell, Village } from "./interfaces"; // Adjust the import path

declare global {
  namespace Express {
    interface Request {
      // Add custom properties to the Request object if needed
      user?: any;
    }

    interface Response {
      // Add custom properties to the Response object if needed
      customProperty?: string;
    }
  }
}