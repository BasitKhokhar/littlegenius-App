// components/AppContainer.js
import React from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "./Context/ThemeContext";

/**
 * Universal App Container
 * - Theme-driven background (reads the ACTIVE palette)
 * - StatusBar style follows the theme
 * - SafeArea for left/right/bottom; top owned by each screen's header
 */
const AppContainer = ({ children }) => {
    const colors = useThemeColors();
    const isDark = colors.mode === "dark";

    return (
        <View style={[styles.root, { backgroundColor: colors.bg }]}>
            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle={isDark ? "light-content" : "dark-content"}
            />

            <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safeArea}>
                {children}
            </SafeAreaView>
        </View>
    );
};

export default AppContainer;

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
});
