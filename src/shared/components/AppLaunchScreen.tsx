import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "@/theme";

const splashMark = require("../../../assets/images/splash-icon.png");

/** Pantalla breve mostrada al abrir la aplicación, antes del contenido principal. */
export function AppLaunchScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [animationValues] = useState(() => ({
    contentOpacity: new Animated.Value(0),
    contentScale: new Animated.Value(0.92),
    contentTranslateY: new Animated.Value(14),
    screenOpacity: new Animated.Value(1),
  }));
  const {
    contentOpacity,
    contentScale,
    contentTranslateY,
    screenOpacity,
  } = animationValues;

  useEffect(() => {
    let isMounted = true;

    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(contentScale, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(820),
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 230,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished && isMounted) {
        setIsVisible(false);
      }
    });

    return () => {
      isMounted = false;
      animation.stop();
    };
  }, [contentOpacity, contentScale, contentTranslateY, screenOpacity]);

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      accessibilityLabel="Cargando MARJYM"
      accessibilityRole="progressbar"
      style={[styles.screen, { opacity: screenOpacity }]}
    >
      <View style={styles.topShape} />
      <View style={styles.bottomShape} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: contentOpacity,
            transform: [
              { translateY: contentTranslateY },
              { scale: contentScale },
            ],
          },
        ]}
      >
        <View style={styles.markCard}>
          <Image source={splashMark} style={styles.mark} />
          <View style={styles.sparkle}>
            <Ionicons color={colors.accent} name="sparkles" size={15} />
          </View>
        </View>

        <Text style={styles.brand}>MARJYM</Text>
        <Text style={styles.tagline}>TU TIENDA, MÁS CERCA DE TI</Text>

        <View style={styles.loadingLine}>
          <View style={styles.loadingProgress} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bottomShape: {
    backgroundColor: "#F8D978",
    borderRadius: 180,
    bottom: -132,
    height: 286,
    left: -86,
    opacity: 0.27,
    position: "absolute",
    width: 286,
  },
  brand: {
    color: "#3E668F",
    fontSize: 35,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginTop: 20,
  },
  content: {
    alignItems: "center",
  },
  loadingLine: {
    backgroundColor: "#DCE5F1",
    borderRadius: 999,
    height: 4,
    marginTop: 30,
    overflow: "hidden",
    width: 74,
  },
  loadingProgress: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: "100%",
    width: "58%",
  },
  mark: {
    height: 48,
    resizeMode: "contain",
    width: 48,
  },
  markCard: {
    alignItems: "center",
    backgroundColor: "#3E668F",
    borderRadius: 22,
    elevation: 7,
    height: 92,
    justifyContent: "center",
    shadowColor: "#172033",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    width: 92,
  },
  screen: {
    alignItems: "center",
    backgroundColor: "#FFF1C9",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 100,
  },
  sparkle: {
    alignItems: "center",
    backgroundColor: "#FFFDF7",
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    position: "absolute",
    right: -8,
    top: -8,
    width: 28,
  },
  tagline: {
    color: "#687286",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2.2,
    marginTop: 8,
  },
  topShape: {
    backgroundColor: "#3E668F",
    borderBottomLeftRadius: 210,
    height: 244,
    opacity: 0.1,
    position: "absolute",
    right: -82,
    top: 0,
    width: 292,
  },
});
