import React, { useEffect } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';

interface ToastProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error';
  duration?: number;
  onHide?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type,
  duration = 3000,
  onHide,
}) => {
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(duration),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide?.();
      });
    }
  }, [visible]);

  if (!visible) return null;

  const bgColor = type === 'success' ? '#34C759' : '#FF6B6B';

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={[styles.toast, { backgroundColor: bgColor }]}>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  toast: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
