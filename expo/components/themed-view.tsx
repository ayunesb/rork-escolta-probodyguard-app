export { ThemedView } from './index';
export async function ThemedViewWrapper() {
  const mod = await import('../escolta-pro/components/themed-view');
  return mod.ThemedView;
}
