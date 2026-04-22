import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Image,
  FlatList,
  Dimensions,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { API_URL } from "@env";

const { width } = Dimensions.get("window");

export default function Slides() {
  const flatListRef = useRef(null);

  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const API = `${API_URL}/api/banner/all`;

  // ================= LOAD BANNERS =================
  const loadBanners = async () => {
    try {
      const res = await axios.get(API);

      const mobileBanners = res.data.filter(
        (b) => b.platform === "mobile"
      );

      const formatted = mobileBanners.map((item) => ({
        ...item,
        fullImageUrl: `${API_URL}${item.bannerImage}`,
      }));

      setSlides(formatted);
    } catch (error) {
      console.log("❌ Banner load error:", error.message);
    }
  };

  // ================= INITIAL LOAD =================
  useEffect(() => {
    loadBanners();
  }, []);

  // ================= AUTO SLIDE =================
  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % slides.length;

        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });

        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [slides]);

  // ================= MANUAL SCROLL =================
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  // ================= EMPTY STATE =================
  if (slides.length === 0) {
    return <View style={{ height: 200 }} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) =>
          item.id?.toString() || index.toString()
        }
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image
              source={{ uri: item.fullImageUrl }}
              style={styles.image}
            />
          </View>
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfig}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* ================= DOTS ================= */}
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    alignSelf: "center",
  },

  slide: {
    width: width,
    height: 500, // keep between 180–220
    backgroundColor: "#eee",
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover", // IMPORTANT
  },

  // ===== DOTS =====
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },

  activeDot: {
    backgroundColor: "#000",
    width: 10,
    height: 10,
  },
});