
let loading = null;
function loadScript() {
  if (window.Razorpay) return Promise.resolve();
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = resolve;
      s.onerror = () => { loading = null; reject(new Error('Could not load the payment window. Check your connection.')); };
      document.body.appendChild(s);
    });
  }
  return loading;
}

export async function payWithRazorpay({ keyId, razorpayOrderId, amount, currency }, { name, email, contact } = {}) {
  await loadScript();
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: keyId,
      order_id: razorpayOrderId,
      amount,
      currency,
      name: 'Bookstore',
      description: 'Book order',
      prefill: { name, email, contact },
      theme: { color: '#2874f0' },
      handler: resolve,
      modal: { ondismiss: () => reject({ dismissed: true }) },
    });
    rzp.on('payment.failed', (r) => reject(new Error(r?.error?.description || 'Payment failed')));
    rzp.open();
  });
}