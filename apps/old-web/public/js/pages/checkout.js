import { PRODUCTS, cart, auth, showToast } from '../common.js';

// ========== CHECKOUT PAGE ==========

function initCheckoutPage() {
  const summaryContainer = document.getElementById('checkout-summary');
  if (!summaryContainer) return;

  function renderCheckoutSummary() {
    if (cart.items.length === 0) {
      summaryContainer.innerHTML =
        '<p>Your cart is empty. <a href="shop.html">Return to shop</a>.</p>';
      return;
    }

    const subtotal = cart.getTotal();
    const shipping = subtotal >= 6000 ? 0 : 500;
    const tax = Math.round(cart.getTax() * 100) / 100;
    const total = subtotal + shipping;

    summaryContainer.innerHTML = `
      <h3 style="font-size: 1.25rem; margin-bottom: 1.5rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem;">Order Summary</h3>
      <div class="checkout-items" style="margin-bottom: 1.5rem;">
        ${cart.items
          .map((item) => {
            const product = PRODUCTS.find((p) => p.id === item.productId);
            if (!product) return '';
            return `
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem; align-items: center;">
              <div style="position: relative;">
                <img src="${product.image}" alt="${product.name}" style="width: 64px; height: 64px; object-fit: cover; border-radius: 6px; border: 1px solid #eee;" loading="lazy">
                <span style="position: absolute; top: -8px; right: -8px; background: #666; color: #fff; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;">${item.quantity}</span>
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 500; font-size: 0.95rem;">${product.name}</div>
                ${item.color ? `<div style="font-size: 0.8rem; color: #666;">${item.color}</div>` : ''}
              </div>
              <div style="font-weight: 500;">₹${(product.price * item.quantity).toFixed(2)}</div>
            </div>
          `;
          })
          .join('')}
      </div>
      <div style="border-top: 1px solid #eee; padding-top: 1rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.95rem;">
          <span style="color: #555;">Subtotal</span>
          <span>₹${subtotal.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.95rem;">
          <span style="color: #555;">Included GST</span>
          <span>₹${tax.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 0.95rem;">
          <span style="color: #555;">Shipping</span>
          <span>${shipping === 0 ? 'Free' : '₹' + shipping.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-top: 1px solid #eee; padding-top: 1rem; font-weight: 600; font-size: 1.25rem;">
          <span>Total</span>
          <span>₹${total.toFixed(2)}</span>
        </div>
      </div>
    `;
  }

  renderCheckoutSummary();

  const checkoutForm = document.getElementById('checkout-form');
  const pincodeInput = document.getElementById('checkout-pincode');
  const cityInput = document.getElementById('checkout-city');
  const stateInput = document.getElementById('checkout-state');
  const serviceabilityMsg = document.getElementById('serviceability-msg');
  let isServiceable = false;
  let deliveryEstimate = null;

  if (pincodeInput) {
    pincodeInput.addEventListener('input', async (e) => {
      const pin = e.target.value.trim();
      if (pin.length === 6) {
        serviceabilityMsg.textContent = 'Checking serviceability...';
        serviceabilityMsg.style.color = '#666';
        try {
          const res = await fetch(`/api/logistics/pincode/${pin}`);
          const data = await res.json();
          if (data.success) {
            cityInput.value = data.city;
            stateInput.value = data.state;
            isServiceable = data.serviceable;

            if (isServiceable) {
              const d1 = new Date(data.estimatedMin).toLocaleDateString();
              const d2 = new Date(data.estimatedMax).toLocaleDateString();
              serviceabilityMsg.textContent = `Serviceable! Delivery estimated between ${d1} and ${d2}.`;
              serviceabilityMsg.style.color = 'green';
            } else {
              serviceabilityMsg.textContent =
                'Sorry, we do not deliver to this pincode at the moment.';
              serviceabilityMsg.style.color = 'red';
            }
          } else {
            isServiceable = false;
            cityInput.value = '';
            stateInput.value = '';
            serviceabilityMsg.textContent = 'Invalid pincode.';
            serviceabilityMsg.style.color = 'red';
          }
        } catch (err) {
          serviceabilityMsg.textContent = 'Error checking pincode.';
          serviceabilityMsg.style.color = 'red';
        }
      } else {
        cityInput.value = '';
        stateInput.value = '';
        serviceabilityMsg.textContent = '';
        isServiceable = false;
      }
    });
  }

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const activeTab = document.querySelector('.payment-tab.active');
      const paymentMethod = activeTab ? activeTab.dataset.target : 'card';

      const emailInput = document.getElementById('checkout-email');
      const phoneInput = document.getElementById('checkout-phone');
      const contact = emailInput ? emailInput.value : '';
      const user = auth.getCurrentUser();

      const subtotal = cart.getTotal();
      const shipping = subtotal >= 6000 ? 0 : 500;
      const tax = Math.round(cart.getTax() * 100) / 100;
      const total = subtotal + shipping;

      if (!isServiceable) {
        alert('Please enter a serviceable pincode to proceed.');
        return;
      }

      if (paymentMethod === 'cod') {
        if (!user || !user.is_verified) {
          alert(
            'Cash on Delivery is only available for verified accounts. Please log in with a verified phone number.'
          );
          return;
        }
      }

      const address1 = document.getElementById('checkout-address1')
        ? document.getElementById('checkout-address1').value
        : '';
      const address2 = document.getElementById('checkout-address2')
        ? document.getElementById('checkout-address2').value
        : '';
      const landmark = document.getElementById('checkout-landmark')
        ? document.getElementById('checkout-landmark').value
        : '';
      const city = cityInput ? cityInput.value : '';
      const state = stateInput ? stateInput.value : '';
      const pincode = pincodeInput ? pincodeInput.value : '';

      const address = { address1, address2, landmark, city, state, pincode };

      try {
        const response = await window.auth.fetchWithAuth('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentMethod,
            contact,
            address,
            items: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity
            }))
          })
        });
        const data = await response.json();

        if (!data.success) {
          alert('Failed to initialize order: ' + (data.message || 'Server error'));
          return;
        }

        if (paymentMethod === 'cod') {
          alert('Order placed successfully (Cash on Delivery)!');
          cart.clear();
          window.location.href = 'invoice.html?id=' + data.orderId;
          return;
        }

        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: 'Bare Minimum',
          description: 'Curated Essentials',
          order_id: data.razorpayOrderId,
          handler: async function (response) {
            const verifyRes = await window.auth.fetchWithAuth('/api/payment/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderId: data.orderId
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              alert('Payment successful! Order placed.');
              cart.clear();
              window.location.href = 'invoice.html?id=' + data.orderId;
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: 'Test User',
            email: 'test@bareminimum.example.com',
            contact: '9999999999'
          },
          theme: {
            color: '#c49a6c'
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          alert('Payment Failed: ' + response.error.description);
        });
        rzp.open();
      } catch (err) {
        console.error(err);
        alert('An error occurred while connecting to the payment gateway.');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initCheckoutPage, 100);
});
