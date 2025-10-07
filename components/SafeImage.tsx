import React from 'react';
import { Image, ImageProps, ImageSourcePropType } from 'react-native';

interface SafeImageProps extends Omit<ImageProps, 'source'> {
  source: ImageSourcePropType | { uri?: string | null };
  fallbackSource?: ImageSourcePropType;
}

export function SafeImage({ source, fallbackSource, ...props }: SafeImageProps) {
  const getValidSource = (): ImageSourcePropType => {
    if (typeof source === 'object' && source !== null && 'uri' in source) {
      const uri = source.uri;
      if (!uri || (typeof uri === 'string' && uri.trim() === '')) {
        console.warn('[SafeImage] Empty or invalid URI provided, using fallback');
        return fallbackSource || require('@/assets/images/icon.png');
      }
      return { uri: uri as string };
    }
    if (!source) {
      console.warn('[SafeImage] No source provided, using fallback');
      return fallbackSource || require('@/assets/images/icon.png');
    }
    return source as ImageSourcePropType;
  };

  return <Image {...props} source={getValidSource()} />;
}
