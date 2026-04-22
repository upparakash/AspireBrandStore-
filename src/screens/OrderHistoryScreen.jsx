// src/screens/OrderHistoryScreen.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";
import { ITHINK_ACCESS_TOKEN, ITHINK_SECRET_KEY } from "@env";
import { SafeAreaView } from "react-native-safe-area-context";
//  Constants OUTSIDE component — no recreation on every render
const ITHINK_TRACK_URL = "https://api.ithinklogistics.com/api_v3/order/track.json";




export default function OrderHistoryScreen({ navigation }) {
  // ─── 1. useState hooks ───────────────────────────────────────────────────
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTrackingModal, setShowTrackingModal] = useState(false);   // header " Track" modal
  const [trackingOrderId, setTrackingOrderId] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [showTrackingResultModal, setShowTrackingResultModal] = useState(false); // API result modal
  const [trackingResult, setTrackingResult] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState("");

  // ─── 2. useCallback hooks ────────────────────────────────────────────────
  const loadOrders = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setError("Please login to view orders.");
        setOrders([]);
        return;
      }
      const response = await fetch(`${API_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.orders) {
        setOrders(data.orders);
      } else {
        setOrders([]);
        setError(data.message || "No orders found");
      }
    } catch (err) {
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ─── 3. useMemo hooks ────────────────────────────────────────────────────
  const statusOptions = useMemo(
    () => ["all", "pending", "processing", "completed", "cancelled", "delivered"],
    []
  );

  // ─── 4. applyFilters ─────────────────────────────────────────────────────
  const applyFilters = useCallback(
    (ordersList = orders) => {
      let filtered = [...ordersList];

      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(order =>
          (order.id || order.orderNumber)?.toString().includes(searchTerm) ||
          order.fullName?.toLowerCase().includes(searchLower) ||
          order.phone?.includes(searchTerm) ||
          order.city?.toLowerCase().includes(searchLower) ||
          order.shipment_id?.toLowerCase().includes(searchLower) ||
          order.items?.some(item =>
            (item.productName || item.name)?.toLowerCase().includes(searchLower)
          )
        );
      }

      if (statusFilter !== "all") {
        filtered = filtered.filter(order =>
          order.orderStatus?.toLowerCase() === statusFilter ||
          order.paymentStatus?.toLowerCase() === statusFilter ||
          order.items?.some(item =>
            (item.itemStatus || "Pending").toLowerCase() === statusFilter
          )
        );
      }

      filtered.sort((a, b) => {
        switch (sortOption) {
          case "newest": return new Date(b.createdAt) - new Date(a.createdAt);
          case "oldest": return new Date(a.createdAt) - new Date(b.createdAt);
          case "priceHigh": return parseFloat(b.totalAmount) - parseFloat(a.totalAmount);
          case "priceLow": return parseFloat(a.totalAmount) - parseFloat(b.totalAmount);
          default: return 0;
        }
      });

      setFilteredOrders(filtered);
    },
    [orders, searchTerm, statusFilter, sortOption]
  );

  // ─── 5. useEffect hooks ──────────────────────────────────────────────────
  useEffect(() => { loadOrders(); }, [loadOrders]);
  useEffect(() => { applyFilters(); }, [applyFilters]);

  // ─── 6. Handler functions ────────────────────────────────────────────────
  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  // Calls iThink API and shows result modal
  const handleTrackOrder = async (orderId, shipmentId) => {
    const awb = shipmentId || `ORDER_${orderId}`;

    // Add debugging
    console.log('Tracking attempt with:', {
      orderId,
      shipmentId,
      awb,
      fullOrderData: orders.find(o => o.id === orderId)
    });

    setTrackingLoading(true);
    setTrackingError("");
    setTrackingResult(null);
    setShowTrackingResultModal(true);

    try {
      const response = await fetch(ITHINK_TRACK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            awb_number_list: awb,
            access_token: ITHINK_ACCESS_TOKEN,
            secret_key: ITHINK_SECRET_KEY,
          },
        }),
      });

      const json = await response.json();
      console.log('iThink API Response:', json); // Debug log

      if (json.status_code === 200 && json.data) {
        const awbKey = Object.keys(json.data).find(k => k !== "message");
        if (awbKey && json.data[awbKey]?.message === "success") {
          setTrackingResult(json.data[awbKey]);
        } else {
          // Show more detailed error
          const errorMsg = json.data?.[awb]?.message ||
            json.message ||
            "No tracking info found for this shipment.";
          setTrackingError(errorMsg);
        }
      } else {
        setTrackingError(json.message || "Unable to fetch tracking info.");
      }
    } catch (err) {
      console.error('Tracking error:', err);
      setTrackingError("Network error. Please try again.");
    } finally {
      setTrackingLoading(false);
    }
  };

  // Opens the manual-entry modal (header " Track" button)
  const handleOpenTrackingModal = () => {
    setShowTrackingModal(true);
    setTrackingOrderId("");
  };

  // Closes manual-entry modal, then calls the API
  const handleModalTrack = () => {
    if (!trackingOrderId.trim()) {
      Alert.alert("Error", "Please enter an Order ID");
      return;
    }
    setShowTrackingModal(false);
    handleTrackOrder(null, trackingOrderId.trim());
  };

  const handleCancelOrder = async (orderId) => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order? This will initiate a refund.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              setOrders(prev =>
                prev.map(o =>
                  (o.id || o._id) === orderId
                    ? { ...o, paymentStatus: "REFUND_PROCESSING" }
                    : o
                )
              );
              const token = await AsyncStorage.getItem("token");
              const response = await fetch(`${API_URL}/api/phonepe/refund/${orderId}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              });
              const data = await response.json();
              if (!response.ok) throw new Error(data?.message || "Refund failed");
              Alert.alert("Success", "Refund initiated successfully");
              await loadOrders();
            } catch (err) {
              Alert.alert("Error", err.message || "Refund failed");
              await loadOrders();
            }
          },
        },
      ]
    );
  };

  // ─── 7. Pure helpers ─────────────────────────────────────────────────────
  const getPaymentStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "PAID":
      case "SUCCESS":
      case "COMPLETED": return "#28A745";
      case "REFUNDED": return "#6F42C1";
      case "PENDING": return "#FFC107";
      case "FAILED":
      case "CANCELLED": return "#DC3545";
      case "REFUND_PENDING":
      case "REFUND_PROCESSING": return "#17A2B8";
      default: return "#6C757D";
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
      case "DELIVERED": return "#28A745";
      case "PENDING": return "#FFC107";
      case "PROCESSING": return "#17A2B8";
      case "CANCELLED": return "#DC3545";
      default: return "#6C757D";
    }
  };

  const getPaymentMethodDisplay = (method) => {
    if (!method) return "N/A";
    switch (method.toUpperCase()) {
      case "COD": return "💵 COD";
      case "PHONEPE": return "📱 PhonePe";
      case "CARD": return "💳 Card";
      case "UPI": return "📲 UPI";
      default: return method;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} • ${date.toLocaleTimeString()}`;
  };

  const formatCurrency = (amount) => `₹${parseFloat(amount).toFixed(2)}`;

  // ─── 8. Conditional early returns (ALWAYS after all hooks) ───────────────
  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F5C542" />
      </View>
    );
  }

  if (error && orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{error}</Text>
        <TouchableOpacity onPress={loadOrders} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── 9. Main render ──────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>My Orders</Text>
          <TouchableOpacity onPress={handleOpenTrackingModal} style={styles.trackButton}>
            <Text style={styles.trackButtonText}>📦 Track</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Order ID, Product..."
            placeholderTextColor="#999"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
          <TouchableOpacity
            style={[styles.filterChip, statusFilter === "all" && styles.filterChipActive]}
            onPress={() => setStatusFilter("all")}
          >
            <Text style={[styles.filterText, statusFilter === "all" && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>
          {statusOptions.slice(1).map(status => (
            <TouchableOpacity
              key={status}
              style={[styles.filterChip, statusFilter === status && styles.filterChipActive]}
              onPress={() => setStatusFilter(status)}
            >
              <Text style={[styles.filterText, statusFilter === status && styles.filterTextActive]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          {[
            { key: "newest", label: "Newest" },
            { key: "oldest", label: "Oldest" },
            { key: "priceHigh", label: "Price ↓" },
            { key: "priceLow", label: "Price ↑" },
          ].map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.sortOption, sortOption === opt.key && styles.sortOptionActive]}
              onPress={() => setSortOption(opt.key)}
            >
              <Text
                style={[
                  styles.sortText,
                  sortOption === opt.key && styles.sortTextActive
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {/* ── Orders List ── */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(o) => (o.id?.toString() || o._id?.toString())}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>
              {searchTerm || statusFilter !== "all" ? "No matching orders found" : "No orders found"}
            </Text>
            {(searchTerm || statusFilter !== "all") && (
              <Text style={styles.emptyListSubText}>Try adjusting your filters</Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={styles.orderHeaderLeft}>
                <Text style={styles.orderId}>Order #{item.id || item.orderNumber}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getOrderStatusColor(item.orderStatus) }]}>
                  <Text style={styles.statusBadgeText}>{item.orderStatus || "Pending"}</Text>
                </View>
              </View>
              <View style={styles.paymentMethodBadge}>
                <Text style={styles.paymentMethodText}>{getPaymentMethodDisplay(item.paymentMethod)}</Text>
              </View>
            </View>

            <Text style={styles.date}>{formatDate(item.createdAt)}</Text>

            <View style={styles.paymentStatusContainer}>
              <Text style={styles.paymentStatusLabel}>Payment: </Text>
              <View style={[styles.paymentStatusBadge, { backgroundColor: getPaymentStatusColor(item.paymentStatus) }]}>
                <Text style={styles.paymentStatusBadgeText}>{item.paymentStatus || "PENDING"}</Text>
              </View>
            </View>

            {(item.fullName || item.phone || item.shipment_id) && (
              <View style={styles.customerInfo}>
                {item.fullName && <Text style={styles.customerName}>👤 {item.fullName}</Text>}
                {item.phone && <Text style={styles.customerDetail}>📞 {item.phone}</Text>}
                {item.shipment_id && <Text style={styles.shipmentId}>📮 ID: {item.shipment_id}</Text>}
              </View>
            )}

            <View style={styles.productsWrapper}>
              <Text style={styles.itemsHeader}>Items ({item.items?.length || 0})</Text>
              {Array.isArray(item.items) && item.items.length > 0 ? (
                item.items.slice(0, 2).map((it, index) => (
                  <View key={it.id || index} style={styles.productRow}>
                    <Image
                      source={{ uri: it.imageUrl || it.imageUri || "https://via.placeholder.com/50" }}
                      style={styles.productImage}
                    />
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={1}>{it.name || it.productName}</Text>
                      <Text style={styles.productPrice}>{formatCurrency(it.price)} x {it.qty || it.quantity}</Text>
                      <Text style={styles.itemStatus}>📍 {it.itemStatus || "Pending"}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noItemsText}>No items in this order</Text>
              )}
              {item.items?.length > 2 && (
                <Text style={styles.moreItemsText}>+{item.items.length - 2} more items</Text>
              )}
            </View>

            <View style={styles.footer}>
              <View>
                <Text style={styles.totalAmount}>Total: {formatCurrency(item.totalAmount)}</Text>
                {item.paymentMethod?.toUpperCase() === "COD" &&
                  item.paymentStatus?.toUpperCase() === "PENDING" && (
                    <Text style={styles.codNote}>Pay on delivery</Text>
                  )}
              </View>

              <View style={styles.buttonGroup}>
                {item.shipment_id && (
                  <TouchableOpacity
                    style={styles.trackOrderButton}
                    onPress={() => handleTrackOrder(item.id, item.shipment_id)}
                  >
                    <Text style={styles.trackOrderText}>📍 Track</Text>
                  </TouchableOpacity>
                )}

                {item.paymentMethod?.toUpperCase() === "ONLINE" &&
                  item.paymentStatus?.toUpperCase() === "PAID" && (
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => handleCancelOrder(item.id || item._id)}
                    >
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                  )}

                {item.paymentStatus?.toUpperCase() === "REFUND_PROCESSING" && (
                  <Text style={styles.processingText}>Processing...</Text>
                )}

                <TouchableOpacity
                  style={styles.viewDetailsButton}
                  onPress={() => navigation.navigate("OrderDetailsScreen", { order: item })}
                >
                  <Text style={styles.viewDetails}>Details ›</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      {/* ══════════════════════════════════════════════════════════════════
          MODAL 1 — Manual entry modal (header " Track" button)
      ══════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={showTrackingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTrackingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowTrackingModal(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Track Your Order</Text>
            <Text style={styles.modalDescription}>
              Enter your Order ID or Shipment ID to track your package
            </Text>

            <View style={styles.modalInputContainer}>
              <Text style={styles.modalLabel}>Order ID / Shipment ID</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., ORDER_489-A or 489"
                placeholderTextColor="#999"
                value={trackingOrderId}
                onChangeText={setTrackingOrderId}
                autoFocus
              />
              <TouchableOpacity style={styles.modalTrackButton} onPress={handleModalTrack}>
                <Text style={styles.modalTrackButtonText}>Track Order</Text>
              </TouchableOpacity>
            </View>

            {orders.length > 0 && (
              <View style={styles.recentOrdersContainer}>
                <Text style={styles.recentTitle}>Recent Orders:</Text>
                {orders.slice(0, 3).map(order => (
                  <TouchableOpacity
                    key={order.id}
                    style={styles.recentOrderItem}
                    onPress={() => setTrackingOrderId(order.shipment_id || `ORDER_${order.id}`)}
                  >
                    <Text style={styles.recentOrderId}>Order #{order.id}</Text>
                    <Text style={styles.recentShipmentId}>{order.shipment_id || "No tracking yet"}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════════
          MODAL 2 — iThink API result modal
      ══════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={showTrackingResultModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTrackingResultModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "85%" }]}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowTrackingResultModal(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>📦 Tracking Details</Text>

            {/* Loading state */}
            {trackingLoading && (
              <View style={{ alignItems: "center", paddingVertical: 30 }}>
                <ActivityIndicator size="large" color="#F5C542" />
                <Text style={{ marginTop: 12, color: "#666" }}>Fetching tracking info...</Text>
              </View>
            )}

            {/* Error state */}
            {trackingError !== "" && !trackingLoading && (
              <View style={trackingResultStyles.errorBox}>
                <Text style={trackingResultStyles.errorText}>{trackingError}</Text>
              </View>
            )}

            {/* Success state */}
            {trackingResult && !trackingLoading && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Status banner */}
                <View style={[
                  trackingResultStyles.statusBanner,
                  { backgroundColor: getOrderStatusColor(trackingResult.current_status) },
                ]}>
                  <Text style={trackingResultStyles.statusBannerText}>
                    {trackingResult.current_status}
                  </Text>
                  <Text style={trackingResultStyles.logisticText}>
                    via {trackingResult.logistic}
                  </Text>
                </View>

                {/* Key info grid */}
                <View style={trackingResultStyles.infoGrid}>
                  {[
                    { label: "AWB No.", value: trackingResult.awb_no },
                    { label: "Order Type", value: trackingResult.order_type },
                    { label: "Expected Delivery", value: trackingResult.expected_delivery_date || "N/A" },
                    { label: "OFD Attempts", value: trackingResult.ofd_count || "0" },
                  ].map(({ label, value }) => (
                    <View key={label} style={trackingResultStyles.infoItem}>
                      <Text style={trackingResultStyles.infoLabel}>{label}</Text>
                      <Text style={trackingResultStyles.infoValue}>{value}</Text>
                    </View>
                  ))}
                </View>

                {/* Last scan */}
                {trackingResult.last_scan_details && (
                  <View style={trackingResultStyles.lastScanBox}>
                    <Text style={trackingResultStyles.sectionTitle}>📍 Last Update</Text>
                    <Text style={trackingResultStyles.lastScanStatus}>
                      {trackingResult.last_scan_details.status}
                    </Text>
                    <Text style={trackingResultStyles.lastScanLocation}>
                      {trackingResult.last_scan_details.scan_location}
                    </Text>
                    <Text style={trackingResultStyles.lastScanTime}>
                      {trackingResult.last_scan_details.status_date_time}
                    </Text>
                    {trackingResult.last_scan_details.remark && (
                      <Text style={trackingResultStyles.lastScanRemark}>
                        ⚠️ {trackingResult.last_scan_details.remark}
                      </Text>
                    )}
                  </View>
                )}

                {/* Timeline */}
                {trackingResult.scan_details?.length > 0 && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={trackingResultStyles.sectionTitle}>🕐 Tracking Timeline</Text>
                    {[...trackingResult.scan_details].reverse().map((scan, index, arr) => (
                      <View key={index} style={trackingResultStyles.timelineItem}>
                        <View style={trackingResultStyles.timelineLeft}>
                          <View style={[
                            trackingResultStyles.timelineDot,
                            index === 0 && { backgroundColor: "#F5C542", borderColor: "#F5C542" },
                          ]} />
                          {index < arr.length - 1 && (
                            <View style={trackingResultStyles.timelineLine} />
                          )}
                        </View>
                        <View style={trackingResultStyles.timelineRight}>
                          <Text style={trackingResultStyles.timelineStatus}>{scan.status}</Text>
                          <Text style={trackingResultStyles.timelineLocation}>{scan.scan_location}</Text>
                          <Text style={trackingResultStyles.timelineTime}>{scan.scan_date_time}</Text>
                          {scan.remark ? (
                            <Text style={trackingResultStyles.timelineRemark}>{scan.remark}</Text>
                          ) : null}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

    

    </SafeAreaView>
   
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
   safeArea: {
    flex: 1,
    backgroundColor: "#D5E2E6",
  },
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: { backgroundColor: "#F5C542", paddingTop: 12, paddingBottom: 12, elevation: 4, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 12 },
  backButton: { padding: 5 },
  backArrow: { fontSize: 32, fontWeight: "bold", color: "#000" },
  headerText: { fontSize: 22, fontWeight: "700", color: "#000" },
  trackButton: { backgroundColor: "rgba(0,0,0,0.1)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  trackButtonText: { fontSize: 14, fontWeight: "600", color: "#000" },
  searchContainer: { paddingHorizontal: 16, marginBottom: 12 },
  searchInput: { backgroundColor: "#fff", borderRadius: 25, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: "#333", elevation: 2 },
  filtersRow: { paddingHorizontal: 16, marginBottom: 12 },
  filterChip: { backgroundColor: "rgba(0,0,0,0.1)", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginRight: 8 },
  filterChipActive: { backgroundColor: "#000" },
  filterText: { fontSize: 13, fontWeight: "500", color: "#000" },
  filterTextActive: { color: "#F5C542" },
  sortRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 8 },
  sortLabel: { fontSize: 12, color: "#000", fontWeight: "500" },
  sortOption: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 15, backgroundColor: "rgba(0,0,0,0.1)" },
  sortOptionActive: { backgroundColor: "#000" },
  sortText: { fontSize: 12, color: "#000", fontWeight: "500" },
  sortTextActive: { color: "#F5C542" },
  listContainer: { padding: 12 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 14, elevation: 3, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  orderHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  orderId: { fontSize: 16, fontWeight: "700", color: "#333" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { color: "#fff", fontSize: 10, fontWeight: "600" },
  paymentMethodBadge: { backgroundColor: "#E8F0FE", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16 },
  paymentMethodText: { fontSize: 11, fontWeight: "600", color: "#1A73E8" },
  date: { color: "#777", fontSize: 12, marginBottom: 8 },
  paymentStatusContainer: { flexDirection: "row", alignItems: "center", marginBottom: 12, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: "#F8F9FA", borderRadius: 8 },
  paymentStatusLabel: { fontSize: 12, color: "#555", fontWeight: "500" },
  paymentStatusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginLeft: 6 },
  paymentStatusBadgeText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  customerInfo: { marginBottom: 12, padding: 10, backgroundColor: "#F8F9FA", borderRadius: 8 },
  customerName: { fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 4 },
  customerDetail: { fontSize: 12, color: "#666", marginBottom: 2 },
  shipmentId: { fontSize: 11, color: "#17A2B8", fontFamily: "monospace", marginTop: 4 },
  productsWrapper: { marginTop: 4 },
  itemsHeader: { fontSize: 13, fontWeight: "600", color: "#666", marginBottom: 8 },
  productRow: { flexDirection: "row", marginBottom: 10, alignItems: "center" },
  productImage: { width: 50, height: 50, borderRadius: 8, marginRight: 10, backgroundColor: "#f0f0f0" },
  productInfo: { flex: 1 },
  productName: { fontSize: 13, fontWeight: "600", color: "#333" },
  productPrice: { color: "#C89D00", fontWeight: "600", fontSize: 12, marginTop: 2 },
  itemStatus: { marginTop: 2, fontSize: 11, color: "#0077B6" },
  noItemsText: { color: "#777", fontSize: 12, fontStyle: "italic", textAlign: "center", paddingVertical: 10 },
  moreItemsText: { color: "#777", fontSize: 11, fontStyle: "italic", marginTop: 4, textAlign: "right" },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  totalAmount: { fontSize: 16, fontWeight: "700", color: "#000" },
  codNote: { fontSize: 11, color: "#28A745", fontWeight: "600", marginTop: 2 },
  buttonGroup: { flexDirection: "row", alignItems: "center", gap: 8 },
  trackOrderButton: { backgroundColor: "#17A2B8", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  trackOrderText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  cancelButton: { backgroundColor: "#DC3545", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  cancelText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  processingText: { color: "#FFC107", fontSize: 11, fontWeight: "600" },
  viewDetailsButton: { backgroundColor: "#F5C542", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  viewDetails: { fontSize: 12, fontWeight: "600", color: "#000" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F5F5", padding: 20 },
  emptyText: { fontSize: 22, fontWeight: "700", marginBottom: 16, color: "#333" },
  retryButton: { backgroundColor: "#F5C542", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25 },
  retryText: { fontSize: 16, fontWeight: "600", color: "#000" },
  emptyListContainer: { alignItems: "center", paddingVertical: 40 },
  emptyListText: { fontSize: 18, fontWeight: "600", color: "#666", marginBottom: 8 },
  emptyListSubText: { fontSize: 14, color: "#999" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F5F5" },
  // Shared modal styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", borderRadius: 20, padding: 20, width: "90%", maxHeight: "80%" },
  modalClose: { position: "absolute", top: 15, right: 15, zIndex: 1 },
  modalCloseText: { fontSize: 24, color: "#999", fontWeight: "bold" },
  modalTitle: { fontSize: 24, fontWeight: "700", color: "#333", marginBottom: 12, textAlign: "center" },
  modalDescription: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 20, lineHeight: 20 },
  modalInputContainer: { marginBottom: 20 },
  modalLabel: { fontSize: 14, fontWeight: "500", color: "#333", marginBottom: 8 },
  modalInput: { borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 12, fontSize: 16, marginBottom: 16, backgroundColor: "#fff" },
  modalTrackButton: { backgroundColor: "#F5C542", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  modalTrackButtonText: { fontSize: 16, fontWeight: "600", color: "#000" },
  recentOrdersContainer: { borderTopWidth: 1, borderTopColor: "#f0f0f0", paddingTop: 16 },
  recentTitle: { fontSize: 14, fontWeight: "600", color: "#666", marginBottom: 12 },
  recentOrderItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, paddingHorizontal: 12, backgroundColor: "#F8F9FA", borderRadius: 10, marginBottom: 8 },
  recentOrderId: { fontSize: 13, fontWeight: "600", color: "#333" },
  recentShipmentId: { fontSize: 11, color: "#17A2B8", fontFamily: "monospace" },
});

const trackingResultStyles = StyleSheet.create({
  errorBox: { backgroundColor: "#FFF3F3", borderRadius: 10, padding: 16, marginVertical: 16, borderLeftWidth: 4, borderLeftColor: "#DC3545" },
  errorText: { color: "#DC3545", fontSize: 14 },
  statusBanner: { borderRadius: 12, padding: 16, alignItems: "center", marginBottom: 16 },
  statusBannerText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  logisticText: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4 },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  infoItem: { width: "47%", backgroundColor: "#F8F9FA", borderRadius: 10, padding: 12 },
  infoLabel: { fontSize: 11, color: "#999", marginBottom: 4, textTransform: "uppercase" },
  infoValue: { fontSize: 14, fontWeight: "600", color: "#333" },
  lastScanBox: { backgroundColor: "#FFFBEA", borderRadius: 12, padding: 14, borderLeftWidth: 4, borderLeftColor: "#F5C542", marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#333", marginBottom: 10 },
  lastScanStatus: { fontSize: 16, fontWeight: "700", color: "#333" },
  lastScanLocation: { fontSize: 13, color: "#555", marginTop: 4 },
  lastScanTime: { fontSize: 12, color: "#888", marginTop: 2 },
  lastScanRemark: { fontSize: 12, color: "#DC3545", marginTop: 6, fontStyle: "italic" },
  timelineItem: { flexDirection: "row", marginBottom: 4 },
  timelineLeft: { width: 28, alignItems: "center" },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#fff", borderWidth: 2, borderColor: "#CCC", marginTop: 3 },
  timelineLine: { width: 2, flex: 1, backgroundColor: "#E0E0E0", marginTop: 4, marginBottom: -4, alignSelf: "center" },
  timelineRight: { flex: 1, paddingBottom: 20, paddingLeft: 8 },
  timelineStatus: { fontSize: 14, fontWeight: "600", color: "#333" },
  timelineLocation: { fontSize: 12, color: "#666", marginTop: 2 },
  timelineTime: { fontSize: 11, color: "#999", marginTop: 2 },
  timelineRemark: { fontSize: 11, color: "#17A2B8", fontStyle: "italic", marginTop: 3 },
});