// import express, { Request, Response } from "express";
// import { PrismaClient } from "@prisma/client";
// import dotenv from "dotenv";
// import cors from "cors";
// import helmet from "helmet";
// import rateLimit from "express-rate-limit";
// import { Province,Cell,District,Sector,Village } from "./interfaces";

// // Load environment variables
// dotenv.config();

// const app = express();
// const prisma = new PrismaClient();
// const PORT = process.env.PORT || 3400;

// // Middleware for security and performance
// app.use(helmet()); // Adds security headers
// app.use(cors()); // Enables CORS
// app.use(express.json()); // Parses JSON requests

// // Rate limiting to prevent abuse
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// // Get all provinces
// app.get("/provinces", async (req: Request, res: Response) => {
//   try {
//     const provinces: Province[] = await prisma.provinces.findMany();
//     res.json(provinces);
//   } catch (error) {
//     console.error("Error fetching provinces:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Get all districts
// app.get("/districts", async (req: Request, res: Response) => {
//   try {
//     const districts: District[] = await prisma.districts.findMany();
//     res.json(districts);
//   } catch (error) {
//     console.error("Error fetching districts:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Get all sectors
// app.get("/sectors", async (req: Request, res: Response) => {
//   try {
//     const sectors: Sector[] = await prisma.sectors.findMany();
//     res.json(sectors);
//   } catch (error) {
//     console.error("Error fetching sectors:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Get all cells
// app.get("/cells", async (req: Request, res: Response) => {
//   try {
//     const cells: Cell[] = await prisma.cells.findMany();
//     res.json(cells);
//   } catch (error) {
//     console.error("Error fetching cells:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Get all villages
// app.get("/villages", async (req: Request, res: Response) => {
//   try {
//     const villages: Village[] = await prisma.villages.findMany();
//     res.json(villages);
//   } catch (error) {
//     console.error("Error fetching villages:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Get provinces with their districts
// app.get("/provinces/districts", async (req: Request, res: Response) => {
//   try {
//     const provinces: Province[] = await prisma.provinces.findMany({
//       include: { districts: true },
//     });
//     res.json(provinces);
//   } catch (error) {
//     console.error("Error fetching provinces with districts:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Get provinces -> districts -> sectors
// app.get("/provinces/districts/sectors", async (req: Request, res: Response) => {
//   try {
//     const data: Province[] = await prisma.provinces.findMany({
//       include: {
//         districts: { include: { sectors: true } },
//       },
//     });
//     res.json(data);
//   } catch (error) {
//     console.error("Error fetching nested data:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Get provinces -> districts -> sectors -> cells
// app.get(
//   "/provinces/districts/sectors/cells",
//   async (req: Request, res: Response) => {
//     try {
//       const data: Province[] = await prisma.provinces.findMany({
//         include: {
//           districts: { include: { sectors: { include: { cells: true } } } },
//         },
//       });
//       res.json(data);
//     } catch (error) {
//       console.error("Error fetching nested data:", error);
//       res.status(500).json({ error: "Internal server error" });
//     }
//   }
// );

// // Get provinces -> districts -> sectors -> cells -> villages
// app.get(
//   "/provinces/districts/sectors/cells/villages",
//   async (req: Request, res: Response) => {
//     try {
//       const data: Province[] = await prisma.provinces.findMany({
//         include: {
//           districts: {
//             include: {
//               sectors: {
//                 include: {
//                   cells: { include: { villages: true } },
//                 },
//               },
//             },
//           },
//         },
//       });
//       res.json(data);
//     } catch (error) {
//       console.error("Error fetching nested data:", error);
//       res.status(500).json({ error: "Internal server error" });
//     }
//   }
// );

// // Define the expected query parameters for the search endpoint
// interface SearchQueryParams {
//   provinceName?: string;
//   districtName?: string;
//   sectorName?: string;
//   cellName?: string;
//   villageName?: string;
// }

// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });






import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { Province,Cell,District,Sector,Village } from "./interfaces";
import apicache from "apicache";

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3400;

// Middleware for security and performance
app.use(helmet()); // Adds security headers
app.use(cors()); // Enables CORS
app.use(express.json()); // Parses JSON requests
app.use(compression()); // Compresses API responses

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Initialize caching
const cache = apicache.middleware;
app.use(cache("5 minutes")); // Cache responses for 5 minutes

// Get all provinces
app.get("/provinces", async (req: Request, res: Response) => {
  try {
    const provinces: Province[] = await prisma.provinces.findMany({
      select: { provinceId: true, name: true }, // Fetch only required fields
    });
    res.json(provinces);
  } catch (error) {
    console.error("Error fetching provinces:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all districts
app.get("/districts", async (req: Request, res: Response) => {
  try {
    const districts: District[] = await prisma.districts.findMany({
      select: { districtId: true, name: true, provinceId: true }, // Fetch only required fields
    });
    res.json(districts);
  } catch (error) {
    console.error("Error fetching districts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all sectors
app.get("/sectors", async (req: Request, res: Response) => {
  try {
    const sectors: Sector[] = await prisma.sectors.findMany({
      select: { sectorId: true, name: true, districtId: true }, // Fetch only required fields
    });
    res.json(sectors);
  } catch (error) {
    console.error("Error fetching sectors:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all cells
app.get("/cells", async (req: Request, res: Response) => {
  try {
    const cells: Cell[] = await prisma.cells.findMany({
      select: { cellId: true, name: true, sectorId: true }, // Fetch only required fields
    });
    res.json(cells);
  } catch (error) {
    console.error("Error fetching cells:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all villages
app.get("/villages", async (req: Request, res: Response) => {
  try {
    const villages: Village[] = await prisma.villages.findMany({
      select: { villageId: true, name: true, cellId: true }, // Fetch only required fields
    });
    res.json(villages);
  } catch (error) {
    console.error("Error fetching villages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get provinces with their districts
app.get("/provinces/districts", async (req: Request, res: Response) => {
  try {
    const provinces: Province[] = await prisma.provinces.findMany({
      select: {
        provinceId: true,
        name: true,
        districts: { select: { districtId: true, name: true, provinceId: true } }, // Fetch only required fields
      },
    });
    res.json(provinces);
  } catch (error) {
    console.error("Error fetching provinces with districts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get provinces -> districts -> sectors
app.get("/provinces/districts/sectors", async (_req: Request, res: Response) => {
  try {
    const data: Province[] = await prisma.provinces.findMany({
      select: {
        provinceId: true,
        name: true,
        districts: {
          select: {
            districtId: true,
            name: true,
            provinceId: true,
            sectors: { select: { sectorId: true, name: true, districtId: true } }, // Fetch only required fields
          },
        },
      },
    });
    res.json(data);
  } catch (error) {
    console.error("Error fetching nested data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get provinces -> districts -> sectors -> cells
app.get(
  "/provinces/districts/sectors/cells",
  async (req: Request, res: Response) => {
    try {
      const data: Province[] = await prisma.provinces.findMany({
        select: {
          provinceId: true,
          name: true,
          districts: {
            select: {
              districtId: true,
              name: true,
              provinceId: true,
              sectors: {
                select: {
                  sectorId: true,
                  name: true,
                  cells: { select: { cellId: true, name: true } }, // Fetch only required fields
                },
              },
            },
          },
        },
      });
      res.json(data);
    } catch (error) {
      console.error("Error fetching nested data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get provinces -> districts -> sectors -> cells -> villages
app.get(
  "/provinces/districts/sectors/cells/villages",
  async (req: Request, res: Response) => {
    try {
      const data: Province[] = await prisma.provinces.findMany({
        select: {
          provinceId: true,
          name: true,
          districts: {
            select: {
              districtId: true,
              name: true,
              provinceId: true,
              sectors: {
                select: {
                  sectorId: true,
                  name: true,
                  cells: {
                    select: {
                      cellId: true,
                      name: true,
                      villages: { select: { villageId: true, name: true } }, // Fetch only required fields
                    },
                  },
                },
              },
            },
          },
        },
      });
      res.json(data);
    } catch (error) {
      console.error("Error fetching nested data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});