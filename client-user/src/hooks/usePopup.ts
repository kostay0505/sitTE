import { popup, ShowOptions } from '@tma.js/sdk-react';

export const usePopup = () => {
  const showPopup = (options: ShowOptions) => {
    popup.show(options);
  };

  const showAlert = (message: string) => {
    popup.show({
      message,
      buttons: [{ text: 'OK' }],
    });
  };

  return {
    showPopup,
    showAlert,
  };
};
