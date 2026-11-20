const https = require('https');
const crypto = require('crypto');
const { SERVICE_ACCOUNT, FCM_TOKEN, DEFAULT_PAYLOAD } = require('./constants');

// 1. Generate Google OAuth 2.0 Access Token using native crypto (No NPM install required)
function getAccessToken(serviceAccount) {
  return new Promise((resolve, reject) => {
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: serviceAccount.token_uri,
      exp: now + 3600,
      iat: now
    };

    const base64UrlEncode = (str) =>
      Buffer.from(str)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const unsignedJwt = `${encodedHeader}.${encodedPayload}`;

    const signer = crypto.createSign('RSA-SHA256');
    signer.update(unsignedJwt);
    const signature = signer.sign(serviceAccount.private_key, 'base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const jwt = `${unsignedJwt}.${signature}`;

    const postData = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    }).toString();

    const req = https.request(serviceAccount.token_uri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(body);
          resolve(response.access_token);
        } else {
          reject(new Error(`Failed to get OAuth token [${res.statusCode}]: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// 2. Send Notification via FCM HTTP v1 API
async function sendFCM(targetToken = FCM_TOKEN, customOptions = {}) {
  try {
    console.log("🔐 Authenticating with Google OAuth2...");
    const accessToken = await getAccessToken(SERVICE_ACCOUNT);
    console.log("✅ OAuth2 Access Token generated successfully.");

    const projectId = SERVICE_ACCOUNT.project_id;
    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

    // Clone payload from constants and apply any overrides
    const notification = {
      ...DEFAULT_PAYLOAD.notification,
      ...(customOptions.title ? { title: customOptions.title } : {}),
      ...(customOptions.body ? { body: customOptions.body } : {}),
      ...(customOptions.imageUrl ? { image: customOptions.imageUrl } : {})
    };

    const data = {
      ...DEFAULT_PAYLOAD.data,
      ...(customOptions.imageUrl ? { image: customOptions.imageUrl, image_url: customOptions.imageUrl } : {}),
      ...(customOptions.data || {})
    };

    // Ensure all data values are strings (Firebase HTTP v1 requirement)
    const stringifiedData = {};
    for (const [key, val] of Object.entries(data)) {
      stringifiedData[key] = String(val);
    }

    const payload = {
      message: {
        token: targetToken,
        notification: notification,
        data: stringifiedData,
        android: {
          ...DEFAULT_PAYLOAD.android,
          notification: {
            ...DEFAULT_PAYLOAD.android.notification,
            image: notification.image
          }
        },
        apns: {
          ...DEFAULT_PAYLOAD.apns,
          fcm_options: {
            image: notification.image
          }
        }
      }
    };

    const postData = JSON.stringify(payload, null, 2);
    console.log("\n📦 Payload being sent to FCM (Using Constants):\n", postData);

    return new Promise((resolve, reject) => {
      const req = https.request(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res) => {
        let resBody = '';
        res.on('data', (chunk) => resBody += chunk);
        res.on('end', () => {
          console.log(`\n📡 [FCM Response Status]: ${res.statusCode}`);
          console.log(`📡 [FCM Response Body]: ${resBody}`);
          if (res.statusCode === 200) {
            console.log("\n🎉 Notification sent successfully!");
            resolve(JSON.parse(resBody));
          } else {
            console.error("\n❌ FCM returned an error.");
            reject(new Error(`FCM error: ${res.statusCode} ${resBody}`));
          }
        });
      });

      req.on('error', (err) => {
        console.error("❌ Network request error:", err);
        reject(err);
      });

      req.write(postData);
      req.end();
    });
  } catch (err) {
    console.error("❌ Error sending notification:", err.message);
  }
}

// 3. Execution (CLI arguments override constants if provided)
const cliToken = process.argv[2] || FCM_TOKEN;
const cliTitle = process.argv[3];
const cliBody = process.argv[4];
const cliImage = process.argv[5];

console.log("=========================================");
console.log("🚀 Mali Setu FCM Push Notification Tester");
console.log("=========================================");
console.log(`Target Token: ${cliToken}`);

sendFCM(cliToken, {
  title: cliTitle,
  body: cliBody,
  imageUrl: cliImage
});
