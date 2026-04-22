import React, { useRef, useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  Pressable,
} from "react-native";

const { width } = Dimensions.get("window");

export default function ImageSlider({
  images = [],
  autoPlayInterval = 3000,
  onImagePress,
}) {
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);
  const length = images.length;

  useEffect(() => {
    if (!length) return;

    const interval = setInterval(() => {
      const next = (index + 1) % length;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
      setIndex(next);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [index, length, autoPlayInterval]);

  const onScrollEnd = (e) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / width);
    setIndex(newIndex);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        scrollEventThrottle={16}
      >
        {images.length ? (
          images.map((uri, i) => (
            <Pressable
              key={i}
              onPress={() => {
                console.log("SLIDER CLICK:", i); // ✅ DEBUG
                onImagePress && onImagePress(i);
              }}
            >
              <Image source={{ uri }} style={styles.image} resizeMode="cover" />
            </Pressable>
          ))
        ) : (
          <Pressable
            onPress={() => onImagePress && onImagePress(0)}
            style={styles.placeholder}
          >
            <Image
              source={require("../images/Aspirelogo.png")}
              style={styles.image}
              resizeMode="contain"
            />
          </Pressable>
        )}
      </ScrollView>

      {/* DOTS */}
      <View style={styles.dotsContainer}>
        {Array.from({ length: Math.max(1, length) }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, index === i && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center" },
  image: { width: width, height: width * 0.9 },
  placeholder: {
    width,
    height: width * 0.9,
    alignItems: "center",
    justifyContent: "center",
  },
  dotsContainer: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: "#ddd",
    margin: 6,
  },
  dotActive: {
    backgroundColor: "#fff",
    width: 10,
    height: 10,
  },
});
