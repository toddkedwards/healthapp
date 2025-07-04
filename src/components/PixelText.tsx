import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface PixelTextProps extends TextProps {
  variant?: 'title' | 'heading' | 'body' | 'caption' | 'button';
  color?: string;
  centered?: boolean;
  uppercase?: boolean;
  children: React.ReactNode;
}

export default function PixelText({
  variant = 'body',
  color,
  centered = false,
  uppercase = false,
  style,
  children,
  ...props
}: PixelTextProps) {
  const { theme } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'title':
        return {
          fontSize: 32,
          fontWeight: 'bold' as const,
          letterSpacing: 2,
        };
      case 'heading':
        return {
          fontSize: 20,
          fontWeight: 'bold' as const,
          letterSpacing: 1,
        };
      case 'body':
        return {
          fontSize: 16,
          fontWeight: 'normal' as const,
          letterSpacing: 0.5,
        };
      case 'caption':
        return {
          fontSize: 12,
          fontWeight: 'normal' as const,
          letterSpacing: 0.5,
        };
      case 'button':
        return {
          fontSize: 14,
          fontWeight: 'bold' as const,
          letterSpacing: 1,
        };
      default:
        return {
          fontSize: 16,
          fontWeight: 'normal' as const,
          letterSpacing: 0.5,
        };
    }
  };

  const textColor = color || theme.colors.text;
  const variantStyles = getVariantStyles();

  return (
    <Text
      style={[
        styles.base,
        variantStyles,
        {
          color: textColor,
          textAlign: centered ? 'center' : 'left',
          textTransform: uppercase ? 'uppercase' : 'none',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: 'monospace',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
}); 