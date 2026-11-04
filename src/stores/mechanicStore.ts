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
    id: 'req_inc_201',
    customerId: 'cust_03',
    customerName: 'Pooja Bhatt',
    customerPhone: '+91 98111 22334',
    vehicle: {
      id: 'veh_03',
      userId: 'cust_03',
      type: 'car',
      make: 'Honda',
      model: 'City ZX',
      year: 2021,
      licensePlate: 'MH 02 CZ 1044',
      fuelType: 'petrol',
      isDefault: true,
      createdAt: '2025-03-01T00:00:00Z',
    },
    category: 'flat_tyre',
    categoryName: 'Flat Tyre & Puncture',
    description: 'Front left tyre hit a pothole and rapidly deflated. Spare tyre is in the trunk.',
    photos: [],
    location: {
      latitude: 19.0645,
      longitude: 72.835,
      address: 'Near Bandra Reclamation Promenade',
      landmark: 'Near Sea Link Toll Plaza Entry',
    },
    status: 'submitted',
    urgency: 'high',
    estimatedCost: 350,
    etaMinutes: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useMechanicStore = create<MechanicState>((set, get) => ({
  isOnline: true,
  activeJob: INITIAL_REQUESTS[0] || null, // req_live_101
  incomingRequests: INITIAL_INCOMING,
  completedJobs: [INITIAL_REQUESTS[1]],
  earnings: {
    today: 850,
    week: 4200,
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

