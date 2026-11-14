// ============================================================
// إعدادات Firebase & EmailJS (تم ربط بيانات مشروعك بنجاح)
// ============================================================

window.firebaseConfig = {
    apiKey: "AIzaSyA4Jqhnk6oWNhWIsTMa5f_px2x01Ql7RKY",
    authDomain: "test-3c5ff.firebaseapp.com",
    projectId: "test-3c5ff",
    storageBucket: "test-3c5ff.firebasestorage.app",
    messagingSenderId: "496785918889",
    appId: "1:496785918889:web:ddb0f800d47d50202e52b8",
    measurementId: "G-D0LG580TR0"
};

// إعدادات EmailJS لإرسال كود الـ 6 أرقام للبريد الحقيقي
// (إذا لم تضع مفاتيحك بعد، سيعمل النظام تلقائياً ويعطيك الكود في إشعار منبثق لتجربته)
window.emailJsConfig = {
    serviceId: "YOUR_SERVICE_ID",
    templateId: "YOUR_TEMPLATE_ID",
    publicKey: "YOUR_PUBLIC_KEY"
};

// تهيئة تطبيق فايربيس
window.isFirebaseReady = false;
window.auth = null;
window.db = null;
window.googleProvider = null;

try {
    if (typeof firebase !== 'undefined') {
        if (!firebase.apps.length) {
            firebase.initializeApp(window.firebaseConfig);
        }
        window.auth = firebase.auth();
        window.db = firebase.firestore();
        window.googleProvider = new firebase.auth.GoogleAuthProvider();
        window.googleProvider.setCustomParameters({ prompt: 'select_account' });
        window.isFirebaseReady = true;
        console.log("✅ تم الاتصال بمشروع Firebase بنجاح:", window.firebaseConfig.projectId);
    }
} catch (error) {
    console.error("Firebase Init Error:", error);
}
