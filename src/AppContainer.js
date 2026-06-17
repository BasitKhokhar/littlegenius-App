// components/AppContainer.js
import React from "react";
import { View, StyleSheet, StatusBar, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "./Theme/colors";

/**
 * Universal App Container
 * - Theme-driven background
 * - StatusBar color handled globally
 * - SafeArea for left/right only
 */
const AppContainer = ({ children }) => {
    const isDark =
        colors.bodybackground === "#0d0d0d" ||
        colors.bodybackground === "#01010a";

    return (
        <View style={[styles.root, { backgroundColor: colors.cardsbackground }]}>
            <StatusBar
                translucent={true}
                backgroundColor={"transparent"}
                barStyle={"light-content"}
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
