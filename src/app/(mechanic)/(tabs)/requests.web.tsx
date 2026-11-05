import React, { useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { useMechanicStore } from '../../../stores/mechanicStore';
import { BreakdownRequest, JobStatus } from '../../../types/requests';
import { useResponsive } from '../../../hooks/useResponsive';

const ACCENT_YELLOW = '#FFC400';

export default function MechanicWebDispatchesScreen() {
  const { isDark } = useTheme();
  const { width } = useResponsive();

  const {
    activeJob,
    incomingRequests,
    completedJobs,
    acceptRequest,
    rejectRequest,
    updateJobStatus,
  } = useMechanicStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'incoming' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobForModal, setSelectedJobForModal] = useState<BreakdownRequest | null>(null);

  // Grouped datasets
  const allIncoming = incomingRequests || [];
  const allActive = activeJob ? [activeJob] : [];
  const allCompleted = completedJobs || [];

  const totalCount = allIncoming.length + allActive.length + allCompleted.length;
  const incomingCount = allIncoming.length;
  const activeCount = allActive.length;
  const completedCount = allCompleted.length;

  const filteredJobs = useMemo(() => {
    let list: Array<{ req: BreakdownRequest; type: 'incoming' | 'active' | 'completed' }> = [];

    if (activeFilter === 'all' || activeFilter === 'incoming') {
      list.push(...allIncoming.map((req) => ({ req, type: 'incoming' as const })));
    }
    if (activeFilter === 'all' || activeFilter === 'active') {
      list.push(...allActive.map((req) => ({ req, type: 'active' as const })));
    }
    if (activeFilter === 'all' || activeFilter === 'completed') {
      list.push(...allCompleted.map((req) => ({ req, type: 'completed' as const })));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(({ req }) => {
        const idMatch = req.id.toLowerCase().includes(q);
        const titleMatch = (req.categoryName || req.category || '').toLowerCase().includes(q);
        const locMatch = (req.location?.address || '').toLowerCase().includes(q);
        const custMatch = (req.customerName || '').toLowerCase().includes(q);
        return idMatch || titleMatch || locMatch || custMatch;
      });
    }

    return list;
  }, [activeFilter, allIncoming, allActive, allCompleted, searchQuery]);

  const formatJobId = (id: string) => {
    if (id.startsWith('MF')) return `#${id}`;
    if (id.startsWith('#')) return id;
    const digits = id.replace(/\D/g, '');
    if (digits.length > 0) {
      return `#MF${digits.padEnd(5, '0').slice(-5)}`;
    }
    return `#MF${id.slice(-5).toUpperCase()}`;
  };

  const getServiceThumbnail = (category?: string, categoryName?: string) => {
    const cat = `${category || ''} ${categoryName || ''}`.toLowerCase();
    if (cat.includes('battery')) {
      return require('../../../../assets/images/service-battery-thumb.png');
    }
    if (cat.includes('oil') || cat.includes('engine')) {
      return require('../../../../assets/images/thumb-oil-service.png');
    }
    if (cat.includes('tyre') || cat.includes('tire') || cat.includes('puncture')) {
      return require('../../../../assets/images/thumb-tyre-service.png');
    }
    return require('../../../../assets/images/thumb-general-service.png');
  };

  return (
    <ScrollView
      style={[styles.scrollRoot, { backgroundColor: isDark ? '#101114' : '#F5F6F8' }]}
      contentContainerStyle={[styles.scrollContent, width < 600 && { padding: 14 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header Row: Title & Subtitle + Live Updates Badge */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.pageTitle, { color: isDark ? '#FFFFFF' : '#101114' }]}>
            Dispatches
          </Text>
          <Text style={styles.pageSubtitle}>
            Real-time service requests from nearby customers
          </Text>
        </View>

        {/* Live Updates Indicator Badge */}
        <View
          style={[
            styles.liveBadge,
            {
              backgroundColor: isDark ? 'rgba(22, 163, 74, 0.15)' : '#DCFCE7',
              borderColor: isDark ? '#15803D' : '#86EFAC',
            },
          ]}
        >
          <View style={styles.livePulseDot} />
          <Ionicons name="radio" size={14} color="#16A34A" style={{ marginRight: 6 }} />
          <Text style={styles.liveBadgeText}>Live Updates</Text>
        </View>
      </View>

      {/* 2. Filter Pills & Search Input Row */}
      <View style={styles.filterAndSearchRow}>
        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsGroup}
          style={{ width: '100%', flexGrow: 0 }}
        >
          <Pressable
            onPress={() => setActiveFilter('all')}
            style={[
              styles.filterPill,
              activeFilter === 'all' && styles.filterPillActive,
              activeFilter !== 'all' && {
                backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                borderColor: isDark ? '#23252B' : '#E5E7EB',
              },
            ]}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'all'
                  ? styles.filterPillTextActive
                  : { color: isDark ? '#9CA3AF' : '#6B7280' },
              ]}
            >
              All ({totalCount})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveFilter('incoming')}
            style={[
              styles.filterPill,
              activeFilter === 'incoming' && styles.filterPillActive,
              activeFilter !== 'incoming' && {
                backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                borderColor: isDark ? '#23252B' : '#E5E7EB',
              },
            ]}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'incoming'
                  ? styles.filterPillTextActive
                  : { color: isDark ? '#9CA3AF' : '#6B7280' },
              ]}
            >
              Incoming ({incomingCount})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveFilter('active')}
            style={[
              styles.filterPill,
              activeFilter === 'active' && styles.filterPillActive,
              activeFilter !== 'active' && {
                backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                borderColor: isDark ? '#23252B' : '#E5E7EB',
              },
            ]}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'active'
                  ? styles.filterPillTextActive
                  : { color: isDark ? '#9CA3AF' : '#6B7280' },
              ]}
            >
              Active ({activeCount})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveFilter('completed')}
            style={[
              styles.filterPill,
              activeFilter === 'completed' && styles.filterPillActive,
              activeFilter !== 'completed' && {
                backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                borderColor: isDark ? '#23252B' : '#E5E7EB',
              },
            ]}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'completed'
                  ? styles.filterPillTextActive
                  : { color: isDark ? '#9CA3AF' : '#6B7280' },
              ]}
            >
              Completed ({completedCount})
            </Text>
          </Pressable>
        </ScrollView>

        {/* Search Input */}
        <View
          style={[
            styles.searchBarBox,
            width < 600 && { minWidth: 0, width: '100%', maxWidth: '100%' },
            {
              backgroundColor: isDark ? '#16171B' : '#FFFFFF',
              borderColor: isDark ? '#23252B' : '#E5E7EB',
            },
          ]}
        >
          <Ionicons name="search" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by Job ID, Service, or Location..."
            placeholderTextColor="#9CA3AF"
            style={[
              styles.searchInput,
              { color: isDark ? '#FFFFFF' : '#101114' },
            ]}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#9CA3AF" />
            </Pressable>
          )}
        </View>
      </View>

      {/* 3. Dispatches Cards List */}
      <View style={styles.dispatchesList}>
        {filteredJobs.length > 0 ? (
          filteredJobs.map(({ req, type }) => (
            <View
              key={req.id}
              style={[
                styles.dispatchCard,
                width < 700 && { flexDirection: 'column', alignItems: 'stretch' },
                {
                  backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                  borderColor: isDark ? '#23252B' : '#E5E7EB',
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                {/* Thumbnail */}
                <View style={styles.cardThumbnailBox}>
                  <Image
                    source={getServiceThumbnail(req.category, req.categoryName)}
                    style={styles.cardThumbImage}
                    resizeMode="contain"
                  />
                </View>

                {/* Information */}
                <View style={styles.cardDetailsCol}>
                  <View style={styles.cardHeaderLine}>
                    <Text
                      style={[
                        styles.cardJobTitle,
                        { color: isDark ? '#FFFFFF' : '#101114' },
                      ]}
                    >
                      {req.categoryName || 'Vehicle Service'}
                    </Text>

                    {/* Status Pill */}
                    {type === 'incoming' && (
                      <View style={styles.incomingPill}>
                        <Ionicons name="play" size={10} color="#CA8A04" style={{ marginRight: 4 }} />
                        <Text style={styles.incomingPillText}>Incoming</Text>
                      </View>
                    )}
                    {type === 'active' && (
                      <View style={styles.activePill}>
                        <Ionicons name="play" size={10} color="#16A34A" style={{ marginRight: 4 }} />
                        <Text style={styles.activePillText}>Active</Text>
                      </View>
                    )}
                    {type === 'completed' && (
                      <View style={styles.completedPill}>
                        <Ionicons name="checkmark" size={10} color="#15803D" style={{ marginRight: 4 }} />
                        <Text style={styles.completedPillText}>Completed</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.cardJobId}>{formatJobId(req.id)}</Text>

                  {/* Metadata Row */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaCol}>
                      <Ionicons name="location-outline" size={14} color="#9CA3AF" />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {req.location?.address || 'Dindigul West, Dindigul'}
                      </Text>
                    </View>
                    <View style={styles.metaCol}>
                      <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
                      <Text style={styles.metaText}>
                        {type === 'completed' ? '28 Oct, 02:10 PM' : 'Today, 10:24 AM'}
                      </Text>
                    </View>
                    <View style={styles.metaCol}>
                      <Ionicons name="navigate-outline" size={14} color="#9CA3AF" />
                      <Text style={styles.metaText}>
                        {type === 'incoming' ? '2.4 km' : type === 'active' ? '3.8 km' : '6.0 km'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Action Buttons based on Job Type */}
              <View
                style={[
                  styles.actionsBox,
                  width < 700 && {
                    width: '100%',
                    marginTop: 12,
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: isDark ? '#23252B' : '#F1F2F4',
                  },
                ]}
              >
                {type === 'incoming' ? (
                  <View style={[styles.incomingBtnGroup, width < 700 && { width: '100%' }]}>
                    <Pressable
                      onPress={() => rejectRequest(req.id)}
                      style={[
                        styles.declineButton,
                        width < 700 && { flex: 1 },
                        { backgroundColor: isDark ? '#23252B' : '#F3F4F6' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.declineButtonText,
                          { color: isDark ? '#FFFFFF' : '#374151' },
                        ]}
                      >
                        Decline
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => acceptRequest(req.id)}
                      style={[styles.acceptButton, width < 700 && { flex: 1, justifyContent: 'center' }]}
                    >
                      <Ionicons name="checkmark" size={15} color="#101114" style={{ marginRight: 4 }} />
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => setSelectedJobForModal(req)}
                    style={[
                      styles.viewDetailsButton,
                      width < 700 && { width: '100%', justifyContent: 'center' },
                      {
                        backgroundColor: isDark ? '#23252B' : '#F8FAFC',
                        borderColor: isDark ? '#2D3139' : '#E2E8F0',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.viewDetailsText,
                        { color: isDark ? '#FFFFFF' : '#101114' },
                      ]}
                    >
                      View Details
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={14}
                      color={isDark ? '#FFFFFF' : '#101114'}
                      style={{ marginLeft: 6 }}
                    />
                  </Pressable>
                )}
              </View>
            </View>
          ))
        ) : (
          <View
            style={[
              styles.emptyStateBox,
              {
                backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                borderColor: isDark ? '#23252B' : '#E5E7EB',
              },
            ]}
          >
            <View style={styles.emptyRadarCircle}>
              <Ionicons name="radio-outline" size={36} color={ACCENT_YELLOW} />
            </View>
            <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#101114' }]}>
              No Dispatches Found
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery.trim()
                ? 'No service requests matched your search query.'
                : 'No dispatches match the selected filter right now. You will receive live updates when customers request assistance nearby.'}
            </Text>
          </View>
        )}
      </View>

      {/* Job Details Modal */}
      {selectedJobForModal && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedJobForModal(null)}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF' },
              ]}
            >
              <View style={styles.modalHeaderRow}>
                <View>
                  <Text style={[styles.modalJobTitle, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                    {selectedJobForModal.categoryName || 'Service Request Details'}
                  </Text>
                  <Text style={styles.modalJobId}>{formatJobId(selectedJobForModal.id)}</Text>
                </View>
                <Pressable onPress={() => setSelectedJobForModal(null)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={20} color="#747B87" />
                </Pressable>
              </View>

              <View style={styles.modalInfoList}>
                <View style={styles.modalInfoItem}>
                  <Ionicons name="person-outline" size={16} color={ACCENT_YELLOW} style={{ marginRight: 8 }} />
                  <Text style={[styles.modalInfoLabel, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                    Customer: {selectedJobForModal.customerName || 'Customer'} ({selectedJobForModal.customerPhone || 'N/A'})
                  </Text>
                </View>

                <View style={styles.modalInfoItem}>
                  <Ionicons name="car-outline" size={16} color={ACCENT_YELLOW} style={{ marginRight: 8 }} />
                  <Text style={[styles.modalInfoLabel, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                    Vehicle: {selectedJobForModal.vehicle?.make} {selectedJobForModal.vehicle?.model} ({selectedJobForModal.vehicle?.licensePlate})
                  </Text>
                </View>

                <View style={styles.modalInfoItem}>
                  <Ionicons name="location-outline" size={16} color={ACCENT_YELLOW} style={{ marginRight: 8 }} />
                  <Text style={[styles.modalInfoLabel, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                    Location: {selectedJobForModal.location?.address}
                  </Text>
                </View>

                {selectedJobForModal.description && (
                  <View style={styles.modalInfoItem}>
                    <Ionicons name="document-text-outline" size={16} color={ACCENT_YELLOW} style={{ marginRight: 8 }} />
                    <Text style={[styles.modalInfoLabel, { color: isDark ? '#9CA3AF' : '#4B5563' }]}>
                      Notes: {selectedJobForModal.description}
                    </Text>
                  </View>
                )}
              </View>

              <Pressable
                onPress={() => setSelectedJobForModal(null)}
                style={styles.modalPrimaryBtn}
              >
                <Text style={styles.modalPrimaryBtnText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollRoot: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
    gap: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#747B87',
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 6,
  },
  liveBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
  },
  filterAndSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  filterPillsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillActive: {
    backgroundColor: ACCENT_YELLOW,
    borderColor: ACCENT_YELLOW,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  filterPillTextActive: {
    color: '#101114',
    fontWeight: '800',
  },
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 280,
    maxWidth: 420,
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    outlineStyle: 'none' as any,
  },
  dispatchesList: {
    gap: 12,
  },
  dispatchCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  cardThumbnailBox: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  cardThumbImage: {
    width: '100%',
    height: '100%',
  },
  cardDetailsCol: {
    flex: 1,
    minWidth: 200,
  },
  cardHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardJobTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  incomingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  incomingPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  completedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  completedPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#374151',
  },
  cardJobId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#747B87',
    marginTop: 2,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#747B87',
  },
  actionsBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  incomingBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  declineButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  declineButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: ACCENT_YELLOW,
  },
  acceptButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#101114',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyStateBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyRadarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 196, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#747B87',
    textAlign: 'center',
    maxWidth: 420,
    lineHeight: 18,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 16,
    padding: 24,
    gap: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalJobTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalJobId: {
    fontSize: 12,
    color: '#747B87',
    fontWeight: '600',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalInfoList: {
    gap: 10,
    paddingVertical: 8,
  },
  modalInfoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  modalInfoLabel: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  modalPrimaryBtn: {
    backgroundColor: ACCENT_YELLOW,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalPrimaryBtnText: {
    color: '#101114',
    fontWeight: '800',
    fontSize: 14,
  },
});

