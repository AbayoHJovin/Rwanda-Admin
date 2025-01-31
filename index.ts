const express = require("express");
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { Province, Cell, District, Sector, Village } from "./interfaces";
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

function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

// Root endpoint
app.get("/", (_req: Request, res: Response) => {
  res.send("Welcome to the Rwanda Location API. Try /provinces, /districts, /sectors, /cells, /villages");
});

// Get all provinces
app.get("/provinces", async (req: Request, res: Response) => {
  try {
    const provinces: Province[] = await prisma.provinces.findMany({
      select: { provinceId: true, name: true },
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
      select: { districtId: true, name: true, provinceId: true },
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
      select: { sectorId: true, name: true, districtId: true },
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
      select: { cellId: true, name: true, sectorId: true },
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
      select: { villageId: true, name: true, cellId: true },
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
        districts: { select: { districtId: true, name: true, provinceId: true } },
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
            sectors: { select: { sectorId: true, name: true, districtId: true } },
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
                  cells: { select: { cellId: true, name: true } },
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
                      villages: { select: { villageId: true, name: true } },
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

// Search for a village by name and return its administrative hierarchy
app.get("/search/village/:villageName", async (req: Request, res: Response) => {
  let { villageName } = req.params;
  villageName = capitalizeFirstLetter(villageName);
  try {
    const village: Village | null = await prisma.villages.findFirst({
      where: { name: villageName },
      include: {
        cell: {
          include: {
            sector: {
              include: {
                district: {
                  include: {
                    province: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!village) {
      return res.status(404).json({ error: "Village not found" });
    }

    res.json(village);
  } catch (error) {
    console.error("Error searching for village:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// // Search for a cell by name and return its administrative hierarchy
// app.get("/search/cell/:cellName", async (req: Request, res: Response) => {
//   const { cellName } = req.params;
// //   cellName = capitalizeFirstLetter(cellName);
//   console.log(cellName)
//   try {
//     const cell: Cell[] | null = await prisma.cells.findMany({
//       where: { name: cellName },
//       include: {
//         sector: {
//           include: {
//             district: {
//               include: {
//                 province: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     if (!cell) {
//       return res.status(404).json({ error: "Cell not found" });
//     }
//     res.json(cell);
//   } catch (error) {
//     console.error("Error searching for cell:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });


app.get("/search/cell/:cellName", async (req: Request, res: Response) => {
    const { cellName } = req.params;
  
    // cellName = capitalizeFirstLetter(cellName); // Ensure consistency in casing
    console.log("Searching for cell:", cellName);
  
    try {
      const cell: Cell[] = await prisma.cells.findMany(
        {where: { name: "Bugomba" }},
      );
  
      console.log("Database response:", cell);
  
      if (cell.length === 0) {
        return res.status(404).json({ error: `Cell '${cellName}' not found` });
      }
  
      res.json(cell);
    } catch (error) {
      console.error("Error searching for cell:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  

// Search for a sector by name and return its administrative hierarchy
app.get("/search/sector/:sectorName", async (req: Request, res: Response) => {
  let { sectorName } = req.params;
  sectorName = sectorName.toUpperCase()
  try {
    const sector: Sector | null = await prisma.sectors.findFirst({
      where: { name: sectorName },
      include: {
        district: {
          include: {
            province: true,
          },
        },
      },
    });

    if (!sector) {
      return res.status(404).json({ error: "Sector not found" });
    }

    res.json(sector);
  } catch (error) {
    console.error("Error searching for sector:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Search for a district by name and return its administrative hierarchy
app.get("/search/district/:districtName", async (req: Request, res: Response) => {
  let { districtName } = req.params;
 districtName = districtName.toUpperCase();
  try {
    const district: District | null = await prisma.districts.findFirst({
      where: { name: districtName },
      include: {
        province: true,
      },
    });

    if (!district) {
      return res.status(404).json({ error: "District not found" });
    }

    res.json(district);
  } catch (error) {
    console.error("Error searching for district:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Search for a province by name
app.get("/search/province/:provinceName", async (req: Request, res: Response) => {
  let { provinceName } = req.params;
  provinceName = provinceName.toUpperCase()
  try {
    const province: Province | null = await prisma.provinces.findFirst({
      where: { name: provinceName },
    });

    if (!province) {
        console.log(province)
        console.log(provinceName)
      return res.status(404).json({ error: "Province not found" });
    }

    res.json(province);
  } catch (error) {
    console.error("Error searching for province:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});