import { Image } from 'react-native';

export interface ImageDimensions {
  width: number;
  height: number;
}

export const getImageDimensions = (uri: string): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error)
    );
  });
};

export const calculateAspectRatioFit = (
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number
): ImageDimensions => {
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
  return {
    width: srcWidth * ratio,
    height: srcHeight * ratio,
  };
};

export const getOptimizedImageUrl = (
  url: string,
  width?: number,
  height?: number,
  quality?: number
): string => {
  if (!url) return url;

  if (url.includes('unsplash.com')) {
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    if (quality) params.append('q', quality.toString());
    params.append('auto', 'format');
    params.append('fit', 'crop');

    return `${url}?${params.toString()}`;
  }

  return url;
};

export const preloadImages = async (urls: string[]): Promise<void> => {
  const promises = urls.map(
    (url) =>
      new Promise<void>((resolve) => {
        Image.prefetch(url)
          .then(() => resolve())
          .catch(() => resolve());
      })
  );

  await Promise.all(promises);
};
