import { Guard } from '@/types';

interface GuardMapProps {
  guards: Guard[];
  clientLocation: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

export default function GuardMap(props: GuardMapProps): JSX.Element;
