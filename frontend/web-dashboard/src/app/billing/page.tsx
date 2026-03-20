'use client';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Link from 'next/link';

const stripePromise = loadStripe('pk_test_mock_strip_key');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    const cardElement = elements.getElement(CardElement);
    console.log('Validando tarjeta enviando request asíncrono hacia Core API Stripe Webhooks...');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md" id="stripe-form">
      <div className="bg-surface p-4 rounded-lg border border-gray-700 focus-within:border-primary focus-within:shadow-[0_0_15px_rgba(56,189,248,0.2)] transition-all">
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#F8FAFC',
              fontFamily: 'Inter, sans-serif',
              '::placeholder': { color: '#64748B' },
              iconColor: '#38BDF8'
            },
            invalid: { color: '#F472B6', iconColor: '#F472B6' }
          }
        }} id="stripe-card-element" />
      </div>
      <button type="submit" disabled={!stripe} className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold py-3 px-4 rounded-lg transition-opacity shadow-lg disabled:opacity-50" id="btn-submit-payment">
        Autorizar Enlace de Cobro
      </button>
    </form>
  );
};

export default function Billing() {
  return (
    <div className="min-h-screen bg-background p-10 flex flex-col items-center overflow-auto" id="billing-page">
      <header className="w-full max-w-4xl flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-accent" id="billing-title">Portal Financiero Web3/Facturación</h1>
        <Link href="/dashboard" className="text-gray-400 hover:text-primary transition-colors font-medium border border-gray-700 px-4 py-2 rounded-md hover:border-primary" id="btn-back-dashboard">
          Retornar al SOC
        </Link>
      </header>

      <section className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-2xl shadow-xl flex flex-col h-full hover:shadow-primary/10 transition-shadow" id="payment-method-card">
          <h2 className="text-xl font-semibold mb-2">Seguridad Financiera</h2>
          <p className="text-sm text-gray-400 mb-8">Administra tus métodos de pago para habilitar nodos y consumos de Agentes de IA (Procesamiento Seguro PCI-DSS via Stripe).</p>
          <Elements stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        </div>

        <div className="glass p-8 rounded-2xl shadow-xl flex flex-col hover:shadow-accent/10 transition-shadow" id="invoices-card">
          <h2 className="text-xl font-semibold mb-6 flex items-center justify-between">
            <span>Suscripciones Activas</span>
            <span className="text-xs bg-surface text-brand px-2 py-1 rounded border border-brand/50">Renovación Abril 2026</span>
          </h2>
          <ul className="space-y-4 flex-1">
            <li className="flex justify-between items-center p-4 bg-surface rounded-lg transition-all cursor-pointer border border-transparent hover:border-gray-600 hover:shadow-md" id="invoice-item-1">
              <span className="text-gray-200 font-medium">Bono Ingestión IoT Ilimitada</span>
              <span className="font-bold text-emerald-400">$340.00</span>
            </li>
            <li className="flex justify-between items-center p-4 bg-surface rounded-lg transition-all cursor-pointer border border-transparent hover:border-gray-600 hover:shadow-md" id="invoice-item-2">
              <span className="text-gray-200 font-medium">Llamadas Function Calling IA </span>
              <span className="font-bold text-accent">$12.50</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
