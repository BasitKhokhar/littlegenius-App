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

    return (
        <View style={[styles.root, { backgroundColor: colors.bg }]}>
            {/* Every screen's header is the dark indigo brand surface and sits
                under the translucent status bar, so the status-bar content
                (clock, battery, icons) must stay light/white in BOTH themes. */}
            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle="light-content"
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
