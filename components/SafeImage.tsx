import React from 'react';
import { Image, ImageProps, ImageSourcePropType } from 'react-native';

interface SafeImageProps extends Omit<ImageProps, 'source'> {
  source: ImageSourcePropType | { uri?: string | null };
  fallbackSource?: ImageSourcePropType;
}

export function SafeImage({ source, fallbackSource, ...props }: SafeImageProps) {
  const getValidSource = (): ImageSourcePropType => {
    if (typeof source === 'object' && 'uri' in source) {
      const uri = source.uri;
      if (!uri || uri.trim() === '') {
        return fallbackSource || require('@/assets/images/icon.png');
      }
      return { uri };
    }
    return source as ImageSourcePropType;
  };

  return <Image {...props} source={getValidSource()} />;
}
