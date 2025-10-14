import { Request, Response, NextFunction } from 'express';

// Content Security Policy configuration
const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Needed for React Native Web
    "'unsafe-eval'", // Needed for development
    'https://js.braintreegateway.com',
    'https://assets.braintreegateway.com',
    'https://checkout.paypal.com',
    'https://www.paypal.com',
    'https://c.paypal.com',
    'https://www.google.com',
    'https://www.gstatic.com',
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Needed for React Native Web styles
    'https://checkout.paypal.com',
    'https://www.paypal.com',
    'https://fonts.googleapis.com',
  ],
  'img-src': [
    "'self'",
    'data:',
    'https:',
    'https://checkout.paypal.com',
    'https://www.paypal.com',
    'https://c.paypal.com',
    'https://assets.braintreegateway.com',
    'https://maps.googleapis.com',
    'https://maps.gstatic.com',
  ],
  'connect-src': [
    "'self'",
    'https://api.braintreegateway.com',
    'https://api.sandbox.braintreegateway.com',
    'https://client-analytics.braintreegateway.com',
    'https://client-analytics.sandbox.braintreegateway.com',
    'https://api.paypal.com',
    'https://www.paypal.com',
    'https://checkout.paypal.com',
    'https://securetoken.googleapis.com',
    'https://identitytoolkit.googleapis.com',
    'https://firestore.googleapis.com',
    'https://firebase.googleapis.com',
    'https://functions.firebase.com',
    'https://*.cloudfunctions.net',
    'wss://*.firebaseio.com',
    'https://maps.googleapis.com',
    'https://www.google-analytics.com',
    'https://analytics.google.com',
  ],
  'font-src': [
    "'self'",
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ],
  'form-action': [
    "'self'",
    'https://www.paypal.com',
    'https://checkout.paypal.com',
  ],
  'frame-src': [
    'https://checkout.paypal.com',
    'https://www.paypal.com',
    'https://assets.braintreegateway.com',
    'https://c.paypal.com',
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'upgrade-insecure-requests': [],
};

// Security Headers Configuration
const SECURITY_HEADERS = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': [
    'camera=(self)',
    'microphone=(self)',
    'geolocation=(self)',
    'payment=(self "https://checkout.paypal.com" "https://www.paypal.com")',
    'usb=()',
    'magnetometer=()',
    'accelerometer=()',
    'gyroscope=()',
  ].join(', '),
  
  // Strict Transport Security (HTTPS only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// Generate CSP header value
function generateCSPHeader(isDevelopment = false): string {
  const directives = { ...CSP_DIRECTIVES };
  
  if (isDevelopment) {
    // Relax some restrictions for development
    directives['script-src'].push("'unsafe-eval'");
    directives['connect-src'].push('ws://localhost:*', 'http://localhost:*');
  }
  
  return Object.entries(directives)
    .map(([directive, values]) => {
      if (values.length === 0) {
        return directive;
      }
      return `${directive} ${values.join(' ')}`;
    })
    .join('; ');
}

// Middleware to add security headers
export function securityHeadersMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Add Content Security Policy
  res.setHeader('Content-Security-Policy', generateCSPHeader(isDevelopment));
  
  // Add other security headers
  Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
    // Skip HTTPS-only headers in development
    if (isDevelopment && header === 'Strict-Transport-Security') {
      return;
    }
    res.setHeader(header, value);
  });
  
  next();
}

// Specific CSP for payment pages
export function paymentCSPMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const paymentCSP = {
    ...CSP_DIRECTIVES,
    'frame-src': [
      ...CSP_DIRECTIVES['frame-src'],
      'https://assets.braintreegateway.com',
      'https://js.braintreegateway.com',
    ],
    'script-src': [
      ...CSP_DIRECTIVES['script-src'],
      'https://js.braintreegateway.com',
      'https://www.paypalobjects.com',
    ],
  };
  
  const cspHeader = Object.entries(paymentCSP)
    .map(([directive, values]) => {
      if (Array.isArray(values) && values.length === 0) {
        return directive;
      }
      return `${directive} ${values.join(' ')}`;
    })
    .join('; ');
  
  res.setHeader('Content-Security-Policy', cspHeader);
  next();
}

// CORS configuration for security
export const corsOptions = {
  origin: function (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8081',
      'https://escolta-pro.web.app',
      'https://escolta-pro.firebaseapp.com',
      // Add your production domains here
    ];
    
    if (process.env.NODE_ENV === 'development') {
      // Allow all localhost origins in development
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Firebase-AppCheck',
  ],
};

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
};

// Payment-specific rate limiting
export const paymentRateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 payment requests per minute
  message: {
    error: 'Too many payment attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
};

export {
  CSP_DIRECTIVES,
  SECURITY_HEADERS,
  generateCSPHeader,
};