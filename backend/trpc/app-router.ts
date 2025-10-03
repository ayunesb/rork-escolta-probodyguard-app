import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import signInRoute from "./routes/auth/sign-in/route";
import signUpRoute from "./routes/auth/sign-up/route";
import getUserRoute from "./routes/auth/get-user/route";
import createBookingRoute from "./routes/bookings/create/route";
import listBookingsRoute from "./routes/bookings/list/route";
import createPaymentIntentRoute from "./routes/payments/create-intent/route";
import refundPaymentRoute from "./routes/payments/refund/route";
import { addPaymentMethodProcedure } from "./routes/payments/add-payment-method/route";
import { removePaymentMethodProcedure } from "./routes/payments/remove-payment-method/route";
import { setDefaultPaymentMethodProcedure } from "./routes/payments/set-default-payment-method/route";
import { getPaymentIntentProcedure } from "./routes/payments/get-payment-intent/route";
import { braintreeClientTokenProcedure } from "./routes/payments/braintree/client-token/route";
import { braintreeCheckoutProcedure } from "./routes/payments/braintree/checkout/route";
import { braintreeRefundProcedure } from "./routes/payments/braintree/refund/route";
import sendMessageRoute from "./routes/chat/send-message/route";
import listGuardsRoute from "./routes/guards/list/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  auth: createTRPCRouter({
    signIn: signInRoute,
    signUp: signUpRoute,
    getUser: getUserRoute,
  }),
  bookings: createTRPCRouter({
    create: createBookingRoute,
    list: listBookingsRoute,
  }),
  payments: createTRPCRouter({
    createIntent: createPaymentIntentRoute,
    refund: refundPaymentRoute,
    addPaymentMethod: addPaymentMethodProcedure,
    removePaymentMethod: removePaymentMethodProcedure,
    setDefaultPaymentMethod: setDefaultPaymentMethodProcedure,
    getPaymentIntent: getPaymentIntentProcedure,
    braintree: createTRPCRouter({
      clientToken: braintreeClientTokenProcedure,
      checkout: braintreeCheckoutProcedure,
      refund: braintreeRefundProcedure,
    }),
  }),
  chat: createTRPCRouter({
    sendMessage: sendMessageRoute,
  }),
  guards: createTRPCRouter({
    list: listGuardsRoute,
  }),
});

export type AppRouter = typeof appRouter;
