import {
  backButton,
  viewport,
  miniApp,
  initData,
  init as initSDK,
  swipeBehavior,
} from '@tma.js/sdk-react';

export function init(): void {
  initSDK();

  if (!backButton.isSupported() || !miniApp.isSupported()) {
    return
  }

  backButton.mount();
  miniApp.mount()
  miniApp.bindCssVars();
  initData.restore();
  void viewport
    .mount()
    .catch(e => {
      console.error('Something went wrong mounting the viewport', e);
    })
    .then(() => {
      viewport.bindCssVars();
      if (viewport.expand.isAvailable()) {
        viewport.expand();
      }
      if (swipeBehavior.mount.isAvailable()) {
        swipeBehavior.mount();
      }
      if (swipeBehavior.disableVertical.isAvailable()) {
        swipeBehavior.disableVertical();
      }
    });
}
