import { create } from 'zustand';
import { BreakdownRequest, JobStatus } from '../types/requests';
import { INITIAL_REQUESTS } from '../services/api/mockData';
import { notificationService } from '../services/notifications/notificationService';

interface MechanicState {
  isOnline: boolean;
  activeJob: BreakdownRequest | null;
  incomingRequests: BreakdownRequest[];
  completedJobs: BreakdownRequest[];
  earnings: {
    today: number;
    week: number;
    total: number;
  };
  toggleOnlineStatus: () => void;
  setOnlineStatus: (status: boolean) => void;
  acceptRequest: (requestId: string) => void;
  rejectRequest: (requestId: string) => void;
  updateJobStatus: (requestId: string, nextStatus: JobStatus) => void;
  completeJob: (requestId: string, finalCost: number) => void;
}

const INITIAL_INCOMING: BreakdownRequest[] = [
  {
    id: 'req_mf_10254',
    customerId: 'cust_01',
    customerName: 'Ashan Kumar',
    customerPhone: '+91 98765 43210',
    vehicle: {
      id: 'veh_01',
      userId: 'cust_01',
      type: 'car',
      make: 'Hyundai',
      model: 'Creta SX (O)',
      year: 2022,
      licensePlate: 'MH 02 EE 4092',
      fuelType: 'petrol',
      isDefault: true,
      createdAt: '2025-01-01T00:00:00Z',
    },
    category: 'battery_jumpstart',
    categoryName: 'Battery Jumpstart',
    description: 'Car battery completely dead after leaving hazard lights on. Engine will not crank.',
    photos: [],
    location: {
      latitude: 10.3673,
      longitude: 77.9803,
      address: 'SV Road, Near Bus Stand, Dindigul',
      landmark: 'Near Central Bus Terminus',
    },
    status: 'submitted',
    urgency: 'high',
    estimatedCost: 400,
    etaMinutes: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'req_mf_10248',
    customerId: 'cust_02',
    customerName: 'Ramesh Sundar',
    customerPhone: '+91 98111 22334',
    vehicle: {
      id: 'veh_02',
      userId: 'cust_02',
      type: 'car',
      make: 'Maruti',
      model: 'Swift VXi',
      year: 2020,
      licensePlate: 'TN 57 AW 8891',
      fuelType: 'petrol',
      isDefault: true,
      createdAt: '2025-02-01T00:00:00Z',
    },
    category: 'brake_failure',
    categoryName: 'Brake Assistance',
    description: 'Brake pedal feeling spongy and grinding noise.',
    photos: [],
    location: {
      latitude: 10.3621,
      longitude: 77.9754,
      address: 'Palani Road, Dindigul',
      landmark: 'Near Bypass Junction',
    },
    status: 'submitted',
    urgency: 'high',
    estimatedCost: 450,
    etaMinutes: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_ACTIVE_JOB: BreakdownRequest = {
  id: 'req_mf_10236',
  customerId: 'cust_04',
  customerName: 'Vikram Seth',
  customerPhone: '+91 98450 12345',
  vehicle: {
    id: 'veh_04',
    userId: 'cust_04',
    type: 'car',
    make: 'Tata',
    model: 'Nexon EV',
    year: 2023,
    licensePlate: 'TN 57 CZ 9102',
    fuelType: 'electric',
    isDefault: true,
    createdAt: '2025-01-10T00:00:00Z',
  },
  category: 'oil_change',
  categoryName: 'Oil Change Service',
  description: 'Doorstep engine oil replacement & 15-point fluid checkup.',
  photos: [],
  location: {
    latitude: 10.3705,
    longitude: 77.989,
    address: 'Ward 4, Dindigul',
    landmark: 'Opposite State Bank',
  },
  status: 'heading_to_customer',
  urgency: 'standard',
  estimatedCost: 650,
  etaMinutes: 12,
  assignedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const INITIAL_COMPLETED_JOBS: BreakdownRequest[] = [
  {
    id: 'req_mf_10221',
    customerId: 'cust_05',
    customerName: 'Karthik Raja',
    customerPhone: '+91 97890 55443',
    vehicle: {
      id: 'veh_05',
      userId: 'cust_05',
      type: 'car',
      make: 'Toyota',
      model: 'Innova Crysta',
      year: 2021,
      licensePlate: 'TN 57 BE 3311',
      fuelType: 'diesel',
      isDefault: true,
      createdAt: '2024-11-01T00:00:00Z',
    },
    category: 'flat_tyre',
    categoryName: 'Tyre Service',
    description: 'Rear right puncture repair completed.',
    photos: [],
    location: {
      latitude: 10.3812,
      longitude: 77.9942,
      address: 'GT Nagar, Dindigul',
    },
    status: 'completed',
    urgency: 'standard',
    estimatedCost: 350,
    finalCost: 350,
    assignedAt: '2026-11-12T16:00:00Z',
    completedAt: '2026-11-12T16:30:00Z',
    createdAt: '2026-11-12T15:55:00Z',
    updatedAt: '2026-11-12T16:30:00Z',
  },
  {
    id: 'req_mf_10198',
    customerId: 'cust_06',
    customerName: 'Saravanan M',
    customerPhone: '+91 99401 88776',
    vehicle: {
      id: 'veh_06',
      userId: 'cust_06',
      type: 'car',
      make: 'Honda',
      model: 'City ZX',
      year: 2020,
      licensePlate: 'TN 57 AR 1099',
      fuelType: 'petrol',
      isDefault: true,
      createdAt: '2024-10-15T00:00:00Z',
    },
    category: 'general_diagnostics',
    categoryName: 'General Service',
    description: 'Full vehicle diagnostics & checkup.',
    photos: [],
    location: {
      latitude: 10.355,
      longitude: 77.968,
      address: 'Vedasandur Road, Dindigul',
    },
    status: 'completed',
    urgency: 'standard',
    estimatedCost: 750,
    finalCost: 750,
    assignedAt: '2026-10-28T13:30:00Z',
    completedAt: '2026-10-28T14:10:00Z',
    createdAt: '2026-10-28T13:20:00Z',
    updatedAt: '2026-10-28T14:10:00Z',
  },
  {
    id: 'req_mf_10185',
    customerId: 'cust_07',
    customerName: 'Dinesh Kumar',
    customerPhone: '+91 94432 11223',
    vehicle: {
      id: 'veh_07',
      userId: 'cust_07',
      type: 'car',
      make: 'Mahindra',
      model: 'Thar 4x4',
      year: 2022,
      licensePlate: 'TN 57 D 7788',
      fuelType: 'diesel',
      isDefault: true,
      createdAt: '2024-10-01T00:00:00Z',
    },
    category: 'fuel_delivery',
    categoryName: 'Emergency Fuel',
    description: '5 Litres Diesel delivered on highway.',
    photos: [],
    location: {
      latitude: 10.395,
      longitude: 78.012,
      address: 'Trichy Highway Bypass, Dindigul',
    },
    status: 'completed',
    urgency: 'standard',
    estimatedCost: 550,
    finalCost: 550,
    assignedAt: '2026-10-20T20:00:00Z',
    completedAt: '2026-10-20T20:30:00Z',
    createdAt: '2026-10-20T19:50:00Z',
    updatedAt: '2026-10-20T20:30:00Z',
  },
];

export const useMechanicStore = create<MechanicState>((set, get) => ({
  isOnline: true,
  activeJob: INITIAL_ACTIVE_JOB,
  incomingRequests: INITIAL_INCOMING,
  completedJobs: INITIAL_COMPLETED_JOBS,
  earnings: {
    today: 0,
    week: 0,
    total: 28400,
  },

  toggleOnlineStatus: () => {
    set((state) => ({ isOnline: !state.isOnline }));
  },

  setOnlineStatus: (status) => {
    set({ isOnline: status });
  },

  acceptRequest: (requestId) => {
    const { incomingRequests } = get();
    const target = incomingRequests.find((r) => r.id === requestId);
    if (!target) return;

    const acceptedJob: BreakdownRequest = {
      ...target,
      status: 'accepted',
      assignedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      etaMinutes: 12,
    };

    set((state) => ({
      activeJob: acceptedJob,
      incomingRequests: state.incomingRequests.filter((r) => r.id !== requestId),
    }));

    // Cross-sync: Update customer store in real time
    try {
      const { useCustomerStore } = require('./customerStore');
      useCustomerStore.getState().updateRequestStatus(requestId, 'accepted');
    } catch {}

    notificationService.sendLocalNotification(
      'Breakdown Assistance Accepted',
      `You accepted job #${requestId.slice(-4)} for ${target.customerName}. Head over now!`
    );
  },

  rejectRequest: (requestId) => {
    set((state) => ({
      incomingRequests: state.incomingRequests.filter((r) => r.id !== requestId),
    }));
  },

  updateJobStatus: (requestId, nextStatus) => {
    set((state) => {
      if (state.activeJob && state.activeJob.id === requestId) {
        const updated = {
          ...state.activeJob,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
        };
        return { activeJob: updated };
      }
      return state;
    });

    // Cross-sync: Update customer tracking screen in real time
    try {
      const { useCustomerStore } = require('./customerStore');
      useCustomerStore.getState().updateRequestStatus(requestId, nextStatus);
    } catch {}

    const statusLabels: Record<JobStatus, string> = {
      requested: 'Service requested',
      submitted: 'Request submitted',
      accepted: 'Mechanic accepted',
      heading_to_customer: 'Heading to Customer location',
      arrived: 'Arrived at Breakdown scene',
      inspection: 'Vehicle inspection in progress',
      quote_submitted: 'Quotation submitted for customer approval',
      quote_approved: 'Quotation approved by customer',
      work_in_progress: 'Repairing vehicle',
      completed: 'Breakdown service completed',
      paid: 'Payment settled',
      disputed: 'Dispute filed',
      cancelled: 'Service cancelled',
    };

    notificationService.sendLocalNotification('Job Status Updated', statusLabels[nextStatus] || nextStatus);
  },

  completeJob: (requestId, finalCost) => {
    const { activeJob } = get();
    if (!activeJob || activeJob.id !== requestId) return;

    const completed: BreakdownRequest = {
      ...activeJob,
      status: 'completed',
      finalCost,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      activeJob: null,
      completedJobs: [completed, ...state.completedJobs],
      earnings: {
        today: state.earnings.today + finalCost,
        week: state.earnings.week + finalCost,
        total: state.earnings.total + finalCost,
      },
    }));

    // Cross-sync: Mark request completed on customer end
    try {
      const { useCustomerStore } = require('./customerStore');
      useCustomerStore.getState().updateRequestStatus(requestId, 'completed');
    } catch {}

    notificationService.sendLocalNotification(
      'Job Completed & Payment Logged',
      `Assistance successfully provided. Earnings of ₹${finalCost} recorded.`
    );
  },
}));

