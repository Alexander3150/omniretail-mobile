import React, { forwardRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface KeyboardAwareContainerProps extends ScrollViewProps {
  children?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  extraBottomSpace?: number;
  keyboardVerticalOffset?: number;
}

export const KeyboardAwareContainer = forwardRef<
  ScrollView,
  KeyboardAwareContainerProps
>(function KeyboardAwareContainer(
  {
    children,
    containerStyle,
    contentContainerStyle,
    extraBottomSpace = 40,
    keyboardVerticalOffset,
    style,
    ...rest
  },
  ref,
) {
  const insets = useSafeAreaInsets();
  const insetsBottom = insets?.bottom ?? 0;

  const defaultOffset =
    keyboardVerticalOffset ?? (Platform.OS === "ios" ? 20 : 0);

  const basePaddingBottom =
    (StyleSheet.flatten(contentContainerStyle)?.paddingBottom as number) || 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={defaultOffset}
      style={[styles.keyboardAvoiding, containerStyle]}
    >
      <ScrollView
        ref={ref}
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={[
          contentContainerStyle,
          {
            paddingBottom: basePaddingBottom + insetsBottom + extraBottomSpace,
          },
        ]}
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={[styles.scroll, style]}
        {...rest}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
});
