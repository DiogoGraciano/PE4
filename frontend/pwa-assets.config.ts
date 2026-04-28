import {
  defineConfig,
  minimal2023Preset,
  createAppleSplashScreens,
  combinePresetAndAppleSplashScreens,
} from '@vite-pwa/assets-generator/config';

export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: combinePresetAndAppleSplashScreens(
    minimal2023Preset,
    createAppleSplashScreens({
      padding: 0.3,
      resizeOptions: { fit: 'contain', background: 'white' },
      darkResizeOptions: { fit: 'contain', background: '#1e1e2e' },
    }),
  ),
  images: ['resources/icon.png'],
});
