export type VehicleStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE";

export interface RouteItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleItem {
  id: string;
  code: string;
  plateNumber: string | null;
  status: VehicleStatus;
  capacity: number | null;
  routeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OperationsDashboardData {
  routes: RouteItem[];
  vehicles: VehicleItem[];
  totals: {
    routes: number;
    activeRoutes: number;
    vehicles: number;
    activeVehicles: number;
    maintenanceVehicles: number;
  };
}
