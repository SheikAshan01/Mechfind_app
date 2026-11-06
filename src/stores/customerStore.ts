import { create } from 'zustand';
import { Vehicle } from '../types/customer';
import { NearbyMechanic } from '../types/mechanic';
import { BreakdownRequest, LocationCoordinates, ProblemCategory } from '../types/requests';
import { INITIAL_REQUESTS, INITIAL_VEHICLES, MOCK_MECHANICS } from '../services/api/mockData';
import { DEFAULT_COORDINATES } from '../services/location/locationService';
import { crudPersistenceService } from '../services/storage/crudPersistenceService';

interface CustomerState {
  isInitialized: boolean;
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  nearbyMechanics: NearbyMechanic[];
  requests: BreakdownRequest[];
  currentLocation: LocationCoordinates;
  searchFilter: string;
  selectedCategoryFilter: ProblemCategory | 'all';
  selectedVehicleTypeFilter: 'all' | 'car' | 'bike';
  initializeStore: () => Promise<void>;
  setCurrentLocation: (loc: LocationCoordinates) => void;
  setSearchFilter: (query: string) => void;
  setCategoryFilter: (cat: ProblemCategory | 'all') => void;
  setVehicleTypeFilter: (type: 'all' | 'car' | 'bike') => void;
  setSelectedVehicleId: (id: string) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'userId' | 'createdAt'>) => Promise<Vehicle>;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<{ success: boolean; error?: string }>;
  deleteBooking: (requestId: string) => Promise<{ success: boolean; error?: string }>;
  createBreakdownRequest: (params: {
    vehicleId: string;
    category: ProblemCategory;
    categoryName: string;
    description: string;
    photos: string[];
    landmark: string;
    urgency: 'standard' | 'high' | 'critical';
    estimatedCost: number;
    mechanicId?: string;
  }) => BreakdownRequest;
  cancelRequest: (requestId: string, reason: string) => void;
  updateRequestStatus: (
    requestId: string,
    status: BreakdownRequest['status'],
    mechanic?: NearbyMechanic
  ) => void;
  respondToQuote: (requestId: string, decision: 'approved' | 'rejected', rejectionReason?: string) => void;
  rateMechanic: (mechanicId: string, rating: number, comment: string) => void;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  isInitialized: false,
  vehicles: [],
  selectedVehicleId: null,
  nearbyMechanics: MOCK_MECHANICS,
  requests: [],
  currentLocation: DEFAULT_COORDINATES,
  searchFilter: '',
  selectedCategoryFilter: 'all',
  selectedVehicleTypeFilter: 'all',

  initializeStore: async () => {
    try {
      const [savedVehicles, savedRequests] = await Promise.all([
        crudPersistenceService.getVehicles(),
        crudPersistenceService.getRequests(),
      ]);

      set((state) => {
        const activeVeh =
          savedVehicles.find((v) => v.id === state.selectedVehicleId) ||
          savedVehicles[0] ||
          null;

        return {
          isInitialized: true,
          vehicles: savedVehicles,
          selectedVehicleId: activeVeh ? activeVeh.id : null,
          requests: savedRequests,
        };
      });
    } catch {
      set({ isInitialized: true });
    }
  },

  setCurrentLocation: (loc) => set({ currentLocation: loc }),
  setSearchFilter: (query) => set({ searchFilter: query }),
  setCategoryFilter: (cat) => set({ selectedCategoryFilter: cat }),
  setVehicleTypeFilter: (type) => set({ selectedVehicleTypeFilter: type }),
  setSelectedVehicleId: (id) => set({ selectedVehicleId: id }),

  addVehicle: async (vehicleData) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: `veh_${Date.now()}`,
      userId: 'cust_01',
      createdAt: new Date().toISOString(),
    };

    const updated = [...get().vehicles, newVehicle];
    set({
      vehicles: updated,
      selectedVehicleId: get().selectedVehicleId || newVehicle.id,
    });

    await crudPersistenceService.saveVehicles(updated);
    return newVehicle;
  },

  updateVehicle: async (id, updates) => {
    const updated = get().vehicles.map((v) => (v.id === id ? { ...v, ...updates } : v));
    set({ vehicles: updated });
    await crudPersistenceService.saveVehicles(updated);
  },

  deleteVehicle: async (id) => {
    const { vehicles, selectedVehicleId, requests } = get();

    // Delegate to persistence service with active requests validation
    const result = await crudPersistenceService.deleteVehicle(id, requests);
    if (!result.success) {
      return result;
    }

    const remaining = vehicles.filter((v) => v.id !== id);
    const newSelectedId =
      selectedVehicleId === id ? (remaining[0]?.id || null) : selectedVehicleId;

    set({
      vehicles: remaining,
      selectedVehicleId: newSelectedId,
    });

    return { success: true };
  },

  deleteBooking: async (requestId) => {
    const { requests } = get();

    const result = await crudPersistenceService.deleteBooking(requestId);
    if (!result.success) {
      return result;
    }

    const remaining = requests.filter((r) => r.id !== requestId);
    set({ requests: remaining });

    return { success: true };
  },

  createBreakdownRequest: (params) => {
    const { vehicles, currentLocation } = get();
    const vehicle = vehicles.find((v) => v.id === params.vehicleId) || vehicles[0];

    let custId = 'cust_01';
    let custName = 'Customer';
    let custPhone = '';

    try {
      const { useAuthStore } = require('./authStore');
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        custId = currentUser.id;
        custName = currentUser.fullName || 'Customer';
        custPhone = currentUser.phoneNumber || '';
      }
    } catch {}

    // Rapido / On-Demand Flow: Newly booked request begins in 'submitted' (searching for nearby mechanics)
    // No driver/mechanic details are assigned until a mechanic accepts
    const newRequest: BreakdownRequest = {
      id: `req_${Date.now()}`,
      customerId: custId,
      customerName: custName,
      customerPhone: custPhone,
      vehicle,
      category: params.category,
      categoryName: params.categoryName,
      description: params.description,
      photos: params.photos,
      location: {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        address: currentLocation.address,
        landmark: params.landmark,
      },
      status: 'submitted',
      urgency: params.urgency,
      estimatedCost: params.estimatedCost,
      mechanicId: undefined,
      mechanic: undefined,
      etaMinutes: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newRequest, ...get().requests];
    set({ requests: updated });
    crudPersistenceService.saveRequests(updated);

    // Realtime Dispatch: Deliver broadcast request to mechanic workspace
    try {
      const { useMechanicStore } = require('./mechanicStore');
      useMechanicStore.setState((prev: any) => ({
        incomingRequests: [newRequest, ...(prev.incomingRequests || [])],
      }));
    } catch {}

    return newRequest;
  },

  cancelRequest: (requestId, reason) => {
    const updated = get().requests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: 'cancelled' as const,
            cancellationReason: reason,
            cancelledAt: new Date().toISOString(),
          }
        : r
    );
    set({ requests: updated });
    crudPersistenceService.saveRequests(updated);
  },

  updateRequestStatus: (requestId, status, mechanic) => {
    const updated = get().requests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status,
            ...(mechanic
              ? {
                  mechanic,
                  mechanicId: mechanic.id,
                  etaMinutes: mechanic.estimatedArrivalMinutes || 12,
                  assignedAt: new Date().toISOString(),
                }
              : {}),
            updatedAt: new Date().toISOString(),
            ...(status === 'completed' ? { completedAt: new Date().toISOString() } : {}),
          }
        : r
    );
    set({ requests: updated });
    crudPersistenceService.saveRequests(updated);
  },

  respondToQuote: (requestId, decision, rejectionReason) => {
    const updated = get().requests.map((r) => {
      if (r.id !== requestId) return r;
      const currentQuote = r.quote;
      if (!currentQuote) return r;

      const updatedQuote = {
        ...currentQuote,
        status: decision,
        approvedAt: decision === 'approved' ? new Date().toISOString() : undefined,
        rejectedAt: decision === 'rejected' ? new Date().toISOString() : undefined,
        customerRejectionReason: rejectionReason,
      };

      return {
        ...r,
        quote: updatedQuote,
        status: decision === 'approved' ? ('work_in_progress' as const) : ('inspection' as const),
        finalCost: decision === 'approved' ? currentQuote.grandTotal : r.finalCost,
        updatedAt: new Date().toISOString(),
      };
    });

    set({ requests: updated });
    crudPersistenceService.saveRequests(updated);
  },

  rateMechanic: (mechanicId, rating, comment) => {
    set((state) => ({
      nearbyMechanics: state.nearbyMechanics.map((m) => {
        if (m.id === mechanicId) {
          const newTotalReviews = m.reviewCount + 1;
          const newAvgRating = Math.round(((m.rating * m.reviewCount + rating) / newTotalReviews) * 10) / 10;
          let reviewerName = 'Customer';
          try {
            const { useAuthStore } = require('./authStore');
            const currentUser = useAuthStore.getState().user;
            if (currentUser?.fullName) reviewerName = currentUser.fullName;
          } catch {}

          return {
            ...m,
            rating: newAvgRating,
            reviewCount: newTotalReviews,
            reviews: [
              {
                id: `rev_${Date.now()}`,
                jobId: 'job_recent',
                customerId: 'cust_01',
                customerName: reviewerName,
                rating,
                comment,
                createdAt: 'Just now',
              },
              ...(m.reviews || []),
            ],
          };
        }
        return m;
      }),
    }));
  },
}));

// Auto-initialize store on load
useCustomerStore.getState().initializeStore();
