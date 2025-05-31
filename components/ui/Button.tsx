import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS, FONTS, RADIUS } from '@/lib/constants';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}: ButtonProps) {
  // Get styles based on variant and size
  const buttonStyle = getButtonStyle(variant, size, disabled);
  const textStyleForVariant = getTextStyle(variant, size, disabled);

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.card} 
          size={size === 'small' ? 'small' : 'small'} 
        />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text style={[textStyleForVariant, textStyle]}>{title}</Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </TouchableOpacity>
  );
}

// Helper functions to get styles based on variant and size
function getButtonStyle(variant: ButtonVariant, size: ButtonSize, disabled: boolean): ViewStyle {
  const baseStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.m,
  };

  // Size styles
  const sizeStyles: Record<ButtonSize, ViewStyle> = {
    small: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    medium: {
      paddingVertical: 12,
      paddingHorizontal: 20,
    },
    large: {
      paddingVertical: 16,
      paddingHorizontal: 24,
    },
  };

  // Variant styles
  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: {
      backgroundColor: disabled ? COLORS.disabled : COLORS.primary,
    },
    secondary: {
      backgroundColor: disabled ? COLORS.disabled : COLORS.secondary,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: disabled ? COLORS.disabled : COLORS.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  };

  return {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
  };
}

function getTextStyle(variant: ButtonVariant, size: ButtonSize, disabled: boolean): TextStyle {
  const baseStyle: TextStyle = {
    fontWeight: '600',
  };

  // Size styles
  const sizeStyles: Record<ButtonSize, TextStyle> = {
    small: {
      fontSize: FONTS.body3.fontSize,
    },
    medium: {
      fontSize: FONTS.body2.fontSize,
    },
    large: {
      fontSize: FONTS.body1.fontSize,
    },
  };

  // Variant styles
  const variantStyles: Record<ButtonVariant, TextStyle> = {
    primary: {
      color: COLORS.card,
    },
    secondary: {
      color: COLORS.card,
    },
    outline: {
      color: disabled ? COLORS.textTertiary : COLORS.primary,
    },
    ghost: {
      color: disabled ? COLORS.textTertiary : COLORS.primary,
    },
  };

  return {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
  };
}

export default Button;