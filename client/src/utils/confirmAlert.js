import Swal from 'sweetalert2';

export const confirmAction = async (message) => {
  const result = await Swal.fire({
    title: 'Dharti Amrut',
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#27ae60',
    cancelButtonColor: '#e74c3c',
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    customClass: {
      popup: 'animated fadeInDown faster'
    }
  });
  return result.isConfirmed;
};
