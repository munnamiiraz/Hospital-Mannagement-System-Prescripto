import { toast, ToastOptions } from 'react-toastify';

export const toastConfig: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true
};

export const showToast = {
  success: (message: string) => toast.success(message, toastConfig),
  error: (message: string) => toast.error(message, toastConfig),
  info: (message: string) => toast.info(message, toastConfig),
  warning: (message: string) => toast.warning(message, toastConfig),
};