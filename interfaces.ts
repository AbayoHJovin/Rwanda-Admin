// interfaces.ts

export interface Province {
    provinceId: number;
    name: string;
    districts?: District[];
  }
  
  export interface District {
    districtId: number;
    name: string;
    provinceId: number;
    sectors?: Sector[];
  }
  
  export interface Sector {
    sectorId: number;
    name: string;
    districtId: number;
    cells?: Cell[];
  }
  
  export interface Cell {
    cellId: number;
    name: string;
    sectorId: number;
    villages?: Village[];
  }
  
  export interface Village {
    villageId: number;
    name: string;
    cellId: number;
  }