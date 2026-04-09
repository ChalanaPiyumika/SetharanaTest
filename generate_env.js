const fs = require('fs');
const path = require('path');

const privateKeyPath = path.join(__dirname, '..', 'Key 4_8_2026, 7_54_52 PM.pk');
const privateKeyBase64 = fs.readFileSync(privateKeyPath).toString('base64');

const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (TiDB Serverless)
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_NAME=test
DB_USER=41RTJPoR5WxDQ6y.root
DB_PASSWORD=hDqxp7oNR4XYgbdb
DB_SSL=true

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_ACCESS_EXPIRY=20m
JWT_REFRESH_EXPIRY=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# PayHere Configuration
PAYHERE_MERCHANT_ID=1233975
PAYHERE_MERCHANT_SECRET=NzY2Njc1OTY2MTA0OTA2ODM2MzYzNjI1MjY1MDIyMzU0NTQyODU=
PAYHERE_SANDBOX=true
PAYHERE_NOTIFY_URL=http://localhost:5000/api/v1/payments/webhook
PAYHERE_RETURN_URL=http://localhost:5173/payment-success
PAYHERE_CANCEL_URL=http://localhost:5173/payment-cancel

# PayHere Refund API
PAYHERE_APP_ID=4OVyc4NHc6y4JH5EsPQOO23HF
PAYHERE_APP_SECRET=4TwfVqqquC948aUDGr8Kqi4a8ahj0PPZ28QorS5hbicQ

# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=chalana.works@gmail.com
EMAIL_PASS=tlrygyhtdbtmhynb
EMAIL_FROM=Seth Arana Ayurveda Consultation <chalana.works@gmail.com>

# Google OAuth Configuration
GOOGLE_CLIENT_ID=313191576445-0h65d9d83rq8n2i14arc1rt8b0tsll32.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dojeklyno
CLOUDINARY_API_KEY=258166156986458
CLOUDINARY_API_SECRET=PLACEHOLDER_USER_WILL_UPDATE

# JaaS (Jitsi as a Service) Configuration
JAAS_APP_ID=vpaas-magic-cookie-bc1ac0c8434941698062ee8aa31dd285
JAAS_API_KEY_ID=vpaas-magic-cookie-bc1ac0c8434941698062ee8aa31dd285/4fe98b
JAAS_PRIVATE_KEY=${privateKeyBase64}
`;

fs.writeFileSync(path.join(__dirname, '.env'), envContent);
console.log('✅ Successfully wrote .env file with Base64 Private Key');
