import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import Video from "react-native-video";

import Plashvideo from "../images/ABS_splashscreenvideo.mp4";

const SplashScreen = ({ navigation }) => {
  const navigated = useRef(false);

  const goNext = () => {
    if (!navigated.current) {
      navigated.current = true;
      navigation.replace("Home"); // or Login
    }
  };

  return (
    <View style={styles.container}>
      <Video
        source={Plashvideo}
        style={styles.video}
        resizeMode="cover"
        muted={true}
        repeat={false}

        onEnd={goNext}            //  when video finishes
        onError={(e) => {
          console.log("Video error", e);
          goNext();               //  fail-safe
        }}
      />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  video: { width: "100%", height: "100%" },
});
