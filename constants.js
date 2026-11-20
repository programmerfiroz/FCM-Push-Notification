const fs = require('fs');
const path = require('path');

// 1. Service Account Configuration (from file or inline)
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service_account.json');
const SERVICE_ACCOUNT = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));

// 2. Target FCM Device Registration Token
const FCM_TOKEN = "cCQppIgbSAGRxTDGu3QAku:APA91bHTxgzE3oFGLZcX5I8SvVN874r2geco7zpo2MBzmXLovafGCHvvCDf2MFiV253gigWv7GOf54CVzLFLBsbt75v7Veu_t94bw4m85OGD7tLACv_r-6Q";

// 3. Default Notification & Data Payload (Supports All App States: Killed, Background, Foreground)
// Designed for 100% compatibility with Android (8-15, Samsung, Xiaomi, Vivo, Oppo) and iOS APNs
const DEFAULT_PAYLOAD = {
  notification: {
    title: "New Connection Request! ❤️",
    body: "Pooja Mali has sent you a connection request.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80"
  },
  data: {
    type: "connection_request",
    profile_id: "350",
    click_action: "FLUTTER_NOTIFICATION_CLICK",
    notification_id: "25008",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80",
    image_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80"
  },
  android: {
    priority: "HIGH",
    notification: {
      channel_id: "fcm_push_channel",
      sound: "default",
      default_sound: true,
      default_vibrate_timings: true,
      notification_priority: "PRIORITY_MAX",
      click_action: "FLUTTER_NOTIFICATION_CLICK",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80"
    }
  },
  apns: {
    headers: {
      "apns-priority": "10"
    },
    payload: {
      aps: {
        alert: {
          title: "New Connection Request! ❤️",
          body: "Pooja Mali has sent you a connection request."
        },
        sound: "default",
        badge: 1,
        "mutable-content": 1
      }
    },
    fcm_options: {
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80"
    }
  }
};

module.exports = {
  SERVICE_ACCOUNT_PATH,
  SERVICE_ACCOUNT,
  FCM_TOKEN,
  DEFAULT_PAYLOAD
};
