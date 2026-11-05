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
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { useResponsive } from '../../../hooks/useResponsive';

const ACCENT_YELLOW = '#FFC400';

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  status: 'active' | 'inactive';
  thumb: any;
}

const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv_01',
    name: 'Oil Change Service',
    category: 'General',
    basePrice: 699,
    status: 'active',
    thumb: require('../../../../assets/images/thumb-oil-service.png'),
  },
  {
    id: 'srv_02',
    name: 'Battery Jumpstart',
    category: 'Battery',
    basePrice: 199,
    status: 'active',
    thumb: require('../../../../assets/images/service-battery-thumb.png'),
  },
  {
    id: 'srv_03',
    name: 'Brake Assistance',
    category: 'General',
    basePrice: 399,
    status: 'active',
    thumb: require('../../../../assets/images/thumb-general-service.png'),
  },
  {
    id: 'srv_04',
    name: 'Tyre Service',
    category: 'Tyre',
    basePrice: 499,
    status: 'active',
    thumb: require('../../../../assets/images/thumb-tyre-service.png'),
  },
  {
    id: 'srv_05',
    name: 'AC Service',
    category: 'AC',
    basePrice: 1299,
    status: 'active',
    thumb: require('../../../../assets/images/thumb-general-service.png'),
  },
  {
    id: 'srv_06',
    name: 'Car Wash',
    category: 'Wash',
    basePrice: 349,
    status: 'active',
    thumb: require('../../../../assets/images/thumb-general-service.png'),
  },
  {
    id: 'srv_07',
    name: 'Clutch & Transmission Repair',
    category: 'Mechanical',
    basePrice: 1899,
    status: 'active',
    thumb: require('../../../../assets/images/thumb-general-service.png'),
  },
  {
    id: 'srv_08',
    name: 'Body Paint & Scratch Denting',
    category: 'Bodywork',
    basePrice: 2499,
    status: 'inactive',
    thumb: require('../../../../assets/images/thumb-general-service.png'),
  },
];

export default function MechanicWebServicesPricingScreen() {
  const { isDark } = useTheme();
  const { width } = useResponsive();

  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('General');
  const [formPrice, setFormPrice] = useState('499');

  const allCount = services.length;
  const activeCount = services.filter((s) => s.status === 'active').length;
  const inactiveCount = services.filter((s) => s.status === 'inactive').length;

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (filterTab === 'active' && s.status !== 'active') return false;
      if (filterTab === 'inactive' && s.status !== 'inactive') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [services, filterTab, searchQuery]);

  const handleOpenAdd = () => {
    setFormName('');
    setFormCategory('General');
    setFormPrice('499');
    setAddModalOpen(true);
  };

  const handleSaveAdd = () => {
    if (!formName.trim()) return;
    const newItem: ServiceItem = {
      id: `srv_${Date.now()}`,
      name: formName.trim(),
      category: formCategory.trim(),
      basePrice: parseInt(formPrice, 10) || 499,
      status: 'active',
      thumb: require('../../../../assets/images/thumb-general-service.png'),
    };
    setServices([newItem, ...services]);
    setAddModalOpen(false);
  };

  const handleOpenEdit = (item: ServiceItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormPrice(item.basePrice.toString());
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    setServices(
      services.map((s) =>
        s.id === editingItem.id
          ? {
              ...s,
              name: formName.trim(),
              category: formCategory.trim(),
              basePrice: parseInt(formPrice, 10) || s.basePrice,
            }
          : s
      )
    );
    setEditingItem(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingId) return;
    setServices(services.filter((s) => s.id !== deletingId));
    setDeletingId(null);
  };

  const toggleServiceStatus = (id: string) => {
    setServices(
      services.map((s) =>
        s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s
      )
    );
  };

  return (
    <ScrollView
      style={[styles.scrollRoot, { backgroundColor: isDark ? '#101114' : '#F5F6F8' }]}
      contentContainerStyle={[styles.scrollContent, width < 600 && { padding: 14 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header Row: Title & Subtitle + Add Service Button */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.pageTitle, { color: isDark ? '#FFFFFF' : '#101114' }]}>
            Services & Pricing
          </Text>
          <Text style={styles.pageSubtitle}>
            Manage the services you offer and set your service base prices.
          </Text>
        </View>

        <Pressable onPress={handleOpenAdd} style={styles.addServiceBtn}>
          <Ionicons name="add" size={16} color="#101114" style={{ marginRight: 6 }} />
          <Text style={styles.addServiceBtnText}>+ Add Service</Text>
        </Pressable>
      </View>

      {/* 2. Filter Tabs & Search Bar */}
      <View style={styles.filtersBar}>
        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
          style={{ width: '100%', flexGrow: 0 }}
        >
          <Pressable
            onPress={() => setFilterTab('all')}
            style={[
              styles.tabPill,
              filterTab === 'all' && styles.tabPillActive,
              filterTab !== 'all' && {
                backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                borderColor: isDark ? '#23252B' : '#E5E7EB',
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                filterTab === 'all'
                  ? styles.tabTextActive
                  : { color: isDark ? '#9CA3AF' : '#6B7280' },
              ]}
            >
              All Services ({allCount})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setFilterTab('active')}
            style={[
              styles.tabPill,
              filterTab === 'active' && styles.tabPillActive,
              filterTab !== 'active' && {
                backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                borderColor: isDark ? '#23252B' : '#E5E7EB',
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                filterTab === 'active'
                  ? styles.tabTextActive
                  : { color: isDark ? '#9CA3AF' : '#6B7280' },
              ]}
            >
              Active ({activeCount})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setFilterTab('inactive')}
            style={[
              styles.tabPill,
              filterTab === 'inactive' && styles.tabPillActive,
              filterTab !== 'inactive' && {
                backgroundColor: isDark ? '#16171B' : '#FFFFFF',
                borderColor: isDark ? '#23252B' : '#E5E7EB',
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                filterTab === 'inactive'
                  ? styles.tabTextActive
                  : { color: isDark ? '#9CA3AF' : '#6B7280' },
              ]}
            >
              Inactive ({inactiveCount})
            </Text>
          </Pressable>
        </ScrollView>

        {/* Search Input */}
        <View
          style={[
            styles.searchBox,
            width < 600 && { width: '100%', minWidth: 0 },
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
            placeholder="Search service..."
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

      {/* 3. Services Responsive Table Card */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ width: '100%', borderRadius: 16 }}
        contentContainerStyle={{ minWidth: width < 768 ? 640 : '100%' }}
      >
        <View
          style={[
            styles.tableCard,
            {
              width: '100%',
              backgroundColor: isDark ? '#16171B' : '#FFFFFF',
              borderColor: isDark ? '#23252B' : '#E5E7EB',
            },
          ]}
        >
        {/* Table Header */}
        <View
          style={[
            styles.tableHeaderRow,
            {
              borderBottomColor: isDark ? '#23252B' : '#F1F2F4',
              backgroundColor: isDark ? '#1A1B1F' : '#F8FAFC',
            },
          ]}
        >
          <Text style={[styles.colHeader, { flex: 3 }]}>Service Name</Text>
          <Text style={[styles.colHeader, { flex: 2 }]}>Category</Text>
          <Text style={[styles.colHeader, { flex: 2 }]}>Base Price</Text>
          <Text style={[styles.colHeader, { flex: 2 }]}>Status</Text>
          <Text style={[styles.colHeader, { flex: 1.5, textAlign: 'right' }]}>Actions</Text>
        </View>

        {/* Table Rows */}
        {filteredServices.length > 0 ? (
          filteredServices.map((item, index) => {
            const isLast = index === filteredServices.length - 1;
            return (
              <View
                key={item.id}
                style={[
                  styles.tableRow,
                  !isLast && {
                    borderBottomWidth: 1,
                    borderBottomColor: isDark ? '#23252B' : '#F1F2F4',
                  },
                ]}
              >
                {/* 1. Service Name + Thumbnail */}
                <View style={[styles.cellFlex, { flex: 3 }]}>
                  <View style={styles.rowThumbBox}>
                    <Image source={item.thumb} style={styles.rowThumbImg} resizeMode="contain" />
                  </View>
                  <Text style={[styles.serviceNameText, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                    {item.name}
                  </Text>
                </View>

                {/* 2. Category */}
                <View style={[styles.cellFlex, { flex: 2 }]}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>

                {/* 3. Base Price */}
                <View style={[styles.cellFlex, { flex: 2 }]}>
                  <Text style={[styles.priceText, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                    ₹{item.basePrice.toLocaleString()}
                  </Text>
                </View>

                {/* 4. Status */}
                <View style={[styles.cellFlex, { flex: 2 }]}>
                  <Pressable
                    onPress={() => toggleServiceStatus(item.id)}
                    style={[
                      styles.statusPill,
                      item.status === 'active' ? styles.statusActive : styles.statusInactive,
                    ]}
                  >
                    <Ionicons
                      name={item.status === 'active' ? 'play' : 'pause'}
                      size={10}
                      color={item.status === 'active' ? '#16A34A' : '#6B7280'}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        styles.statusPillText,
                        { color: item.status === 'active' ? '#15803D' : '#4B5563' },
                      ]}
                    >
                      {item.status === 'active' ? 'Active' : 'Inactive'}
                    </Text>
                  </Pressable>
                </View>

                {/* 5. Actions */}
                <View style={[styles.cellFlex, { flex: 1.5, justifyContent: 'flex-end', gap: 12 }]}>
                  <Pressable
                    onPress={() => handleOpenEdit(item)}
                    style={styles.actionIconBtn}
                    accessibilityLabel="Edit Service"
                  >
                    <Ionicons name="pencil" size={16} color="#9CA3AF" />
                  </Pressable>
                  <Pressable
                    onPress={() => setDeletingId(item.id)}
                    style={styles.actionIconBtn}
                    accessibilityLabel="Delete Service"
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </Pressable>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyTableBox}>
            <Ionicons name="search-outline" size={32} color="#9CA3AF" />
            <Text style={styles.emptyTableText}>No services found matching your criteria.</Text>
          </View>
        )}
      </View>
      </ScrollView>

      {/* Add Service Modal */}
      {addModalOpen && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setAddModalOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF' },
              ]}
            >
              <View style={styles.modalHeaderRow}>
                <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  Add New Service
                </Text>
                <Pressable onPress={() => setAddModalOpen(false)}>
                  <Ionicons name="close" size={20} color="#747B87" />
                </Pressable>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  Service Name
                </Text>
                <TextInput
                  value={formName}
                  onChangeText={setFormName}
                  placeholder="e.g. Wheel Balancing & Alignment"
                  placeholderTextColor="#9CA3AF"
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: isDark ? '#16171B' : '#F9FAFB',
                      borderColor: isDark ? '#2B2D35' : '#E5E7EB',
                      color: isDark ? '#FFFFFF' : '#101114',
                    },
                  ]}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  Category
                </Text>
                <TextInput
                  value={formCategory}
                  onChangeText={setFormCategory}
                  placeholder="e.g. Tyres, Mechanical, General"
                  placeholderTextColor="#9CA3AF"
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: isDark ? '#16171B' : '#F9FAFB',
                      borderColor: isDark ? '#2B2D35' : '#E5E7EB',
                      color: isDark ? '#FFFFFF' : '#101114',
                    },
                  ]}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  Base Price (₹)
                </Text>
                <TextInput
                  value={formPrice}
                  onChangeText={setFormPrice}
                  keyboardType="numeric"
                  placeholder="e.g. 599"
                  placeholderTextColor="#9CA3AF"
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: isDark ? '#16171B' : '#F9FAFB',
                      borderColor: isDark ? '#2B2D35' : '#E5E7EB',
                      color: isDark ? '#FFFFFF' : '#101114',
                    },
                  ]}
                />
              </View>

              <View style={styles.modalBtnRow}>
                <Pressable
                  onPress={() => setAddModalOpen(false)}
                  style={[
                    styles.modalCancelBtn,
                    { backgroundColor: isDark ? '#23252B' : '#F3F4F6' },
                  ]}
                >
                  <Text style={[styles.modalCancelText, { color: isDark ? '#FFFFFF' : '#374151' }]}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable onPress={handleSaveAdd} style={styles.modalPrimaryBtn}>
                  <Text style={styles.modalPrimaryBtnText}>Add Service</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Edit Service Modal */}
      {editingItem && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setEditingItem(null)}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF' },
              ]}
            >
              <View style={styles.modalHeaderRow}>
                <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  Edit Service Pricing
                </Text>
                <Pressable onPress={() => setEditingItem(null)}>
                  <Ionicons name="close" size={20} color="#747B87" />
                </Pressable>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  Service Name
                </Text>
                <TextInput
                  value={formName}
                  onChangeText={setFormName}
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: isDark ? '#16171B' : '#F9FAFB',
                      borderColor: isDark ? '#2B2D35' : '#E5E7EB',
                      color: isDark ? '#FFFFFF' : '#101114',
                    },
                  ]}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  Category
                </Text>
                <TextInput
                  value={formCategory}
                  onChangeText={setFormCategory}
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: isDark ? '#16171B' : '#F9FAFB',
                      borderColor: isDark ? '#2B2D35' : '#E5E7EB',
                      color: isDark ? '#FFFFFF' : '#101114',
                    },
                  ]}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? '#FFFFFF' : '#101114' }]}>
                  Base Price (₹)
                </Text>
                <TextInput
                  value={formPrice}
                  onChangeText={setFormPrice}
                  keyboardType="numeric"
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: isDark ? '#16171B' : '#F9FAFB',
                      borderColor: isDark ? '#2B2D35' : '#E5E7EB',
                      color: isDark ? '#FFFFFF' : '#101114',
                    },
                  ]}
                />
              </View>

              <View style={styles.modalBtnRow}>
                <Pressable
                  onPress={() => setEditingItem(null)}
                  style={[
                    styles.modalCancelBtn,
                    { backgroundColor: isDark ? '#23252B' : '#F3F4F6' },
                  ]}
                >
                  <Text style={[styles.modalCancelText, { color: isDark ? '#FFFFFF' : '#374151' }]}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable onPress={handleSaveEdit} style={styles.modalPrimaryBtn}>
                  <Text style={styles.modalPrimaryBtnText}>Save Changes</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setDeletingId(null)}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: isDark ? '#1A1B1F' : '#FFFFFF', maxWidth: 400 },
              ]}
            >
              <View style={[styles.modalIconWrap, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="trash" size={28} color="#DC2626" />
              </View>
              <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#101114', textAlign: 'center' }]}>
                Remove Service?
              </Text>
              <Text style={[styles.modalSubText, { textAlign: 'center' }]}>
                Are you sure you want to remove this service from your workshop list? Customers will no longer be able to book it from your workshop.
              </Text>

              <View style={styles.modalBtnRow}>
                <Pressable
                  onPress={() => setDeletingId(null)}
                  style={[
                    styles.modalCancelBtn,
                    { backgroundColor: isDark ? '#23252B' : '#F3F4F6' },
                  ]}
                >
                  <Text style={[styles.modalCancelText, { color: isDark ? '#FFFFFF' : '#374151' }]}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleConfirmDelete}
                  style={[styles.modalPrimaryBtn, { backgroundColor: '#DC2626' }]}
                >
                  <Text style={[styles.modalPrimaryBtnText, { color: '#FFFFFF' }]}>Delete</Text>
                </Pressable>
              </View>
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
  addServiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT_YELLOW,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addServiceBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#101114',
  },
  filtersBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabPillActive: {
    backgroundColor: '#101114',
    borderColor: '#101114',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tabTextActive: {
    color: ACCENT_YELLOW,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 260,
    maxWidth: 380,
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    outlineStyle: 'none' as any,
  },
  tableCard: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  colHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#747B87',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cellFlex: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowThumbBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    marginRight: 12,
  },
  rowThumbImg: {
    width: '100%',
    height: '100%',
  },
  serviceNameText: {
    fontSize: 14,
    fontWeight: '800',
  },
  categoryText: {
    fontSize: 13,
    color: '#747B87',
    fontWeight: '500',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#DCFCE7',
  },
  statusInactive: {
    backgroundColor: '#F3F4F6',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  actionIconBtn: {
    padding: 6,
  },
  emptyTableBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyTableText: {
    fontSize: 13,
    color: '#747B87',
  },
  // Modal
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
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubText: {
    fontSize: 13,
    color: '#747B87',
    lineHeight: 18,
  },
  formGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    outlineStyle: 'none' as any,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalPrimaryBtn: {
    flex: 1,
    backgroundColor: ACCENT_YELLOW,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalPrimaryBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#101114',
  },
});

