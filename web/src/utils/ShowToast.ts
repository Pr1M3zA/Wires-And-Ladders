import Swal from 'sweetalert2'

export const showToast = (title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info' | 'question', duration: number = 3000) => {
   Swal.fire({
      title: title,
      text: text,
      icon: icon,
      toast: true,
      position: 'top-end',
      timer: duration,
      timerProgressBar: true,
      showConfirmButton: false,
   });
}   