import { Controller, Post, Req, Res, Headers, RawBodyRequest } from '@nestjs/common';
import { Stripe } from 'stripe';
import { Request, Response } from 'express';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', { 
  apiVersion: '2023-10-16' 
});

@Controller('billing')
export class BillingController {
  
  // Endpoint seguro que requiere raw body para validar la firma de Stripe
  @Post('webhook')
  async handleWebhook(@Req() req: RawBodyRequest<Request>, @Res() res: Response, @Headers('stripe-signature') signature: string) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock';
    let event;

    try {
      if (!req.rawBody) throw new Error('Raw body is missing');
      event = stripe.webhooks.constructEvent(req.rawBody, signature, endpointSecret);
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        // Confirmar pago exitoso (ej. habilitar suscripción / features)
        console.log(`PaymentIntent successful:`, event.data.object);
        break;
      case 'charge.refunded':
        // Manejar reversiones y revocar acceso
        console.log('Charge refunded:', event.data.object);
        break;
      case 'customer.subscription.updated':
        // Actualizar plan en BD
        console.log('Subscription updated:', event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Acknowledge a Stripe para evitar reintentos
    res.json({ received: true });
  }
}
