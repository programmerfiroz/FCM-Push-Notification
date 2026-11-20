# Mali Setu - FCM Push Notification Specification & Tester

FCM HTTP v1 Push Notification Guide & Tester for **Mali Setu** (and Flutter Apps).  
Ye documentation aur code sabhi devices (**Android 8 to 15, iOS, Samsung, Xiaomi, Vivo, Oppo, OnePlus**) aur sabhi app states (**App Killed, Background, Foreground/Open**) ke liye banaya gaya hai.

---

## 📌 The 3 Core Pillars (Click, Image, Sound)

Har notification mein ye 3 cheezein 100% guarantee ke saath work karni chahiye:

1. **Click Action (Deep Navigation)**:
   - Notification par click karte hi seedha destination screen khulni chahiye (e.g. Connection Request par seedha Matrimony Profile khule).
   - Android & iOS dono ke liye payload me `click_action: "FLUTTER_NOTIFICATION_CLICK"` aur specific IDs string me hona mandatory hai.
2. **Image (Rich Media / Big Picture)**:
   - **App Band (Killed) / Minimize**: Android OS aur iOS APNs tray mein expandable badi photo dikhaye.
   - **App Open**: Flutter app background me photo download karke local heads-up banner me badi photo dikhaye.
3. **Sound (Audio & Alert)**:
   - Android par `channel_id: "fcm_push_channel"` (Importance: Max, Sound: true).
   - iOS par `sound: "default"` aur `mutable-content: 1`.

---

## 🌟 1. Universal Master Payload (Recommended for ALL States)

Ye **Universal Payload** hai. Ise use karne se aapko alag-alag API call karne ki zaroorat nahi padti. Chahe user ka phone lock ho, app kill ho ya app open ho — ye payload har device par 100% kaam karta hai:

```json
{
  "message": {
    "token": "DEVICE_FCM_REGISTRATION_TOKEN",

    "notification": {
      "title": "New Connection Request! ❤️",
      "body": "Pooja Mali has sent you a connection request.",
      "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80"
    },

    "data": {
      "type": "connection_request",
      "profile_id": "350",
      "notification_id": "25008",
      "click_action": "FLUTTER_NOTIFICATION_CLICK",
      "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80",
      "image_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80"
    },

    "android": {
      "priority": "HIGH",
      "notification": {
        "channel_id": "fcm_push_channel",
        "sound": "default",
        "default_sound": true,
        "default_vibrate_timings": true,
        "notification_priority": "PRIORITY_MAX",
        "click_action": "FLUTTER_NOTIFICATION_CLICK",
        "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80"
      }
    },

    "apns": {
      "headers": {
        "apns-priority": "10"
      },
      "payload": {
        "aps": {
          "alert": {
            "title": "New Connection Request! ❤️",
            "body": "Pooja Mali has sent you a connection request."
          },
          "sound": "default",
          "badge": 1,
          "mutable-content": 1
        }
      },
      "fcm_options": {
        "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80"
      }
    }
  }
}
```

---

## 📱 2. State-Wise Breakdown & Specific Payloads

### State A: App Killed (Terminated) / Phone Locked

> **Requirement**: App RAM me bilkul nahi hai. Android/iOS OS khud notification tray manage karega. Click karne par app Cold Start hogi aur target screen khulegi.

#### Payload:
```json
{
  "message": {
    "token": "DEVICE_FCM_TOKEN",
    "notification": {
      "title": "New Connection Request! ❤️",
      "body": "Pooja Mali has sent you a connection request.",
      "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80"
    },
    "data": {
      "type": "connection_request",
      "profile_id": "350",
      "notification_id": "25008",
      "click_action": "FLUTTER_NOTIFICATION_CLICK"
    },
    "android": {
      "priority": "HIGH",
      "notification": {
        "channel_id": "fcm_push_channel",
        "sound": "default",
        "notification_priority": "PRIORITY_MAX",
        "click_action": "FLUTTER_NOTIFICATION_CLICK",
        "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80"
      }
    },
    "apns": {
      "payload": {
        "aps": {
          "sound": "default",
          "badge": 1,
          "mutable-content": 1
        }
      },
      "fcm_options": {
        "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80"
      }
    }
  }
}
```

#### How it works:
- **Click**: User notification tray par tap karega -> `FirebaseMessaging.instance.getInitialMessage()` run hoga -> Splash screen ke baad pending navigation router profile ID `350` par redirect kar dega.
- **Image**: Android OS tray me BigPicture format me photo expand karke dikhayega.
- **Sound**: High importance channel ka ringtone sound play hoga.

---

### State B: App Open (Foreground / Active Screen)

> **Requirement**: User app chala raha hai. OS direct system notification nahi dikhata, balki Flutter app ka `FirebaseMessaging.onMessage` listener trigger hota hai. Flutter code ko local notification popup banner dikhana hota hai.

#### Payload (Data-Rich Payload):
```json
{
  "message": {
    "token": "DEVICE_FCM_TOKEN",
    "notification": {
      "title": "New Connection Request! ❤️",
      "body": "Pooja Mali has sent you a connection request.",
      "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80"
    },
    "data": {
      "type": "connection_request",
      "profile_id": "350",
      "notification_id": "25008",
      "click_action": "FLUTTER_NOTIFICATION_CLICK",
      "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80",
      "image_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80"
    },
    "android": {
      "priority": "HIGH",
      "notification": {
        "channel_id": "fcm_push_channel",
        "sound": "default"
      }
    }
  }
}
```

#### How it works:
- **Click**: Flutter local notifications plugin ka `onDidReceiveNotificationResponse` trigger hoga aur seedha `navigateFromPayload()` call hoke instant screen change ho jayegi bina app reload kiye.
- **Image**: `NotificationHandlerService._downloadAndSaveImage()` silent download karega aur `BigPictureStyleInformation` ke sath drop-down banner me badi photo dikhayega.
- **Sound**: Channel id `fcm_push_channel` ki default alert sound pop-up ke sath bajegi.

---

## ⚠️ Critical Rules for All Android Devices (Chinese OEMs / Battery Optimizers)

1. **Always Use String Values in `data`**:
   Firebase HTTP v1 me agar aapne number ya boolean pass kiya (e.g. `"profile_id": 350`), to Xiaomi (MIUI) aur Oppo/Vivo devices par FCM parse crash ho jata hai. Hamesha string likhein: `"profile_id": "350"`.
2. **Channel ID is Mandatory**:
   Android 8.0+ me bina channel ID ke sound aur pop-up banner nahi aata. Hamesha `"channel_id": "fcm_push_channel"` hona chahiye jo app ke Android code me registered hai.
3. **Priority HIGH**:
   Aggressive battery saver wale phones (Samsung OneUI, Xiaomi HyperOS, Vivo FuntouchOS) par background notification turant deliver hone ke liye `"priority": "HIGH"` hona zaroori hai.

---

## 🚀 How to Run Tester

Project directory:
```bash
cd /Users/firozmohammad/DigiEmperor/TestNotifictionBackend
```

### 1. Default (Send with Image, Sound & Click Action):
```bash
node send_fcm.js
```

### 2. Send to a Specific Device Token:
```bash
node send_fcm.js "PASTE_YOUR_DEVICE_TOKEN_HERE"
```

### 3. Custom Title, Body & Custom Image:
```bash
node send_fcm.js "DEVICE_TOKEN" "Custom Title" "Custom Message" "https://example.com/custom_image.jpg"
```
