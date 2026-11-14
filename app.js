// ============================================================
// كود الجافاسكربت الرئيسي للتحكم بالواجهة و Firebase و كود الـ 6 أرقام
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// تعريف دالة التبديل بين التبويبات بشكل عام لتستجيب فوراً
window.switchTab = function (target) {
    const tabLoginBtn = document.getElementById('tabLoginBtn');
    const tabRegisterBtn = document.getElementById('tabRegisterBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const otpSection = document.getElementById('otpSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const tabHeader = document.getElementById('tabHeader');

    if (!tabLoginBtn || !tabRegisterBtn || !loginForm || !registerForm) return;

    if (target === 'login') {
        tabLoginBtn.classList.add('active');
        tabRegisterBtn.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    } else {
        tabRegisterBtn.classList.add('active');
        tabLoginBtn.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    }

    if (otpSection) otpSection.classList.add('hidden');
    if (dashboardSection) dashboardSection.classList.add('hidden');
    if (tabHeader) tabHeader.classList.remove('hidden');
};

function initApp() {
    // عناصر النماذج
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const otpSection = document.getElementById('otpSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const tabHeader = document.getElementById('tabHeader');

    // حقول الدخول
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    const loginGoogleBtn = document.getElementById('loginGoogleBtn');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');

    // حقول التسجيل
    const regName = document.getElementById('regName');
    const regEmail = document.getElementById('regEmail');
    const regPassword = document.getElementById('regPassword');
    const regConfirmPassword = document.getElementById('regConfirmPassword');
    const registerSubmitBtn = document.getElementById('registerSubmitBtn');
    const registerGoogleBtn = document.getElementById('registerGoogleBtn');

    // حقول كود الـ 6 أرقام (OTP)
    const otpDigits = document.querySelectorAll('.otp-digit');
    const otpTargetEmail = document.getElementById('otpTargetEmail');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    const resendOtpBtn = document.getElementById('resendOtpBtn');
    const countdownTimer = document.getElementById('countdownTimer');
    const resendCountdownText = document.getElementById('resendCountdownText');
    const cancelOtpBtn = document.getElementById('cancelOtpBtn');

    // لوحة التحكم
    const userAvatar = document.getElementById('userAvatar');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    const userUidDisplay = document.getElementById('userUidDisplay');
    const authProviderDisplay = document.getElementById('authProviderDisplay');
    const logoutBtn = document.getElementById('logoutBtn');

    let countdownInterval = null;
    const COUNTDOWN_SECONDS = 60;

    // ============================================================
    // 1. نظام الإشعارات (Toast Notifications)
    // ============================================================
    window.showToast = function (message, type = 'info', duration = 5000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        let iconClass = 'fa-solid fa-circle-info';
        if (type === 'success') iconClass = 'fa-solid fa-circle-check';
        if (type === 'error') iconClass = 'fa-solid fa-triangle-exclamation';

        toast.innerHTML = `
            <i class="${iconClass}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    };

    function toggleLoading(button, isLoading, originalText = '') {
        if (!button) return;
        const spinner = button.querySelector('.spinner');
        const btnText = button.querySelector('.btn-text');
        if (isLoading) {
            button.disabled = true;
            if (spinner) spinner.classList.remove('hidden');
            if (btnText) btnText.style.opacity = '0.5';
        } else {
            button.disabled = false;
            if (spinner) spinner.classList.add('hidden');
            if (btnText) {
                btnText.style.opacity = '1';
                if (originalText) btnText.textContent = originalText;
            }
        }
    }

    // ============================================================
    // 2. إظهار/إخفاء كلمة المرور
    // ============================================================
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = this.querySelector('i');
            if (!input) return;

            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // ============================================================
    // 3. كود الـ 6 أرقام (OTP Logic)
    // ============================================================
    function generate6DigitCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async function sendOtpEmail(email, name, otpCode) {
        const config = window.emailJsConfig;
        const isEmailJsConfigured = config &&
            config.serviceId && config.serviceId !== 'YOUR_SERVICE_ID' &&
            config.publicKey && config.publicKey !== 'YOUR_PUBLIC_KEY';

        if (isEmailJsConfigured && window.emailjs) {
            try {
                await emailjs.send(
                    config.serviceId,
                    config.templateId,
                    { to_email: email, user_name: name, otp_code: otpCode },
                    config.publicKey
                );
                showToast(`تم إرسال رمز التفعيل المكون من 6 أرقام إلى ${email}`, 'success');
                return true;
            } catch (err) {
                console.error('EmailJS Send Error:', err);
                showToast('تعذر إرسال الإيميل عبر EmailJS، تم تفعيل العرض التجريبي.', 'error');
            }
        }

        // الوضع التجريبي: يطبع الكود في الـ Console ويظهره كإشعار
        console.log(`%c[كود التحقق التجريبي] 🔑 الكود هو: ${otpCode}`, 'background: #4f46e5; color: #fff; font-size: 16px; padding: 6px 14px; border-radius: 6px;');
        showToast(`🔑 [كود تجريبي]: رمز التفعيل هو ${otpCode} (للاختبار الفوري)`, 'info', 10000);
        return true;
    }

    function startOtpCountdown() {
        let timeLeft = COUNTDOWN_SECONDS;
        if (resendCountdownText) resendCountdownText.classList.remove('hidden');
        if (resendOtpBtn) resendOtpBtn.classList.add('hidden');
        if (countdownTimer) countdownTimer.textContent = timeLeft;

        if (countdownInterval) clearInterval(countdownInterval);

        countdownInterval = setInterval(() => {
            timeLeft--;
            if (countdownTimer) countdownTimer.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                if (resendCountdownText) resendCountdownText.classList.add('hidden');
                if (resendOtpBtn) resendOtpBtn.classList.remove('hidden');
            }
        }, 1000);
    }

    // التنقل بين خانات الـ 6 أرقام
    otpDigits.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            const val = e.target.value.replace(/[^0-9]/g, '');
            e.target.value = val ? val[0] : '';
            if (val && index < otpDigits.length - 1) {
                otpDigits[index + 1].focus();
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && index > 0) {
                otpDigits[index - 1].focus();
            }
        });

        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = (e.clipboardData || window.clipboardData).getData('text').trim();
            const digits = pastedData.replace(/[^0-9]/g, '').slice(0, 6);
            if (digits.length > 0) {
                digits.split('').forEach((char, i) => {
                    if (otpDigits[i]) otpDigits[i].value = char;
                });
                const nextIndex = Math.min(digits.length, otpDigits.length - 1);
                otpDigits[nextIndex].focus();
            }
        });
    });

    function showOtpSection(email) {
        if (tabHeader) tabHeader.classList.add('hidden');
        if (loginForm) loginForm.classList.remove('active');
        if (registerForm) registerForm.classList.remove('active');
        if (dashboardSection) dashboardSection.classList.add('hidden');
        if (otpSection) otpSection.classList.remove('hidden');

        if (otpTargetEmail) otpTargetEmail.textContent = email;
        otpDigits.forEach(input => input.value = '');
        setTimeout(() => {
            if (otpDigits[0]) otpDigits[0].focus();
        }, 200);

        startOtpCountdown();
    }

    if (cancelOtpBtn) {
        cancelOtpBtn.addEventListener('click', () => {
            sessionStorage.removeItem('pending_registration');
            window.switchTab('register');
        });
    }

    // ============================================================
    // 4. إرسال نموذج إنشاء حساب جديد
    // ============================================================
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = regName.value.trim();
            const email = regEmail.value.trim().toLowerCase();
            const password = regPassword.value;
            const confirmPassword = regConfirmPassword.value;

            if (password.length < 6) {
                showToast('كلمة المرور يجب أن تكون 6 أحرف أو أرقام على الأقل', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showToast('كلمتا المرور غير متطابقتين!', 'error');
                return;
            }

            toggleLoading(registerSubmitBtn, true);

            try {
                const otpCode = generate6DigitCode();
                const pendingData = {
                    name,
                    email,
                    password,
                    otpCode,
                    createdAt: Date.now()
                };
                sessionStorage.setItem('pending_registration', JSON.stringify(pendingData));

                await sendOtpEmail(email, name, otpCode);
                showOtpSection(email);
            } catch (err) {
                console.error(err);
                showToast('حدث خطأ أثناء المحاولة، يرجى إعادة المحاولة', 'error');
            } finally {
                toggleLoading(registerSubmitBtn, false);
            }
        });
    }

    // إعادة إرسال الكود
    if (resendOtpBtn) {
        resendOtpBtn.addEventListener('click', async () => {
            const raw = sessionStorage.getItem('pending_registration');
            if (!raw) {
                showToast('انتهت الجلسة، يرجى كتابة البيانات مجدداً', 'error');
                window.switchTab('register');
                return;
            }
            const pendingData = JSON.parse(raw);
            const newOtp = generate6DigitCode();
            pendingData.otpCode = newOtp;
            sessionStorage.setItem('pending_registration', JSON.stringify(pendingData));

            showToast('جاري إعادة إرسال الكود...', 'info');
            await sendOtpEmail(pendingData.email, pendingData.name, newOtp);
            startOtpCountdown();
        });
    }

    // ============================================================
    // 5. تأكيد كود الـ 6 أرقام
    // ============================================================
    if (verifyOtpBtn) {
        verifyOtpBtn.addEventListener('click', async () => {
            const enteredOtp = Array.from(otpDigits).map(input => input.value).join('');

            if (enteredOtp.length !== 6) {
                showToast('يرجى إدخال كود التحقق كاملاً المكون من 6 أرقام', 'error');
                return;
            }

            const raw = sessionStorage.getItem('pending_registration');
            if (!raw) {
                showToast('انتهت صلاحية الرمز، يرجى إعادة المحاولة', 'error');
                window.switchTab('register');
                return;
            }

            const pendingData = JSON.parse(raw);

            if (enteredOtp !== pendingData.otpCode) {
                showToast('رمز التحقق غير صحيح! تأكد من الرمز وحاول مجدداً', 'error');
                otpDigits.forEach(input => input.classList.add('error'));
                setTimeout(() => otpDigits.forEach(input => input.classList.remove('error')), 1500);
                return;
            }

            toggleLoading(verifyOtpBtn, true);

            // التحقق من تفعيل فايربيس
            if (window.isFirebaseReady && window.auth) {
                try {
                    const userCredential = await window.auth.createUserWithEmailAndPassword(
                        pendingData.email,
                        pendingData.password
                    );
                    const user = userCredential.user;

                    await user.updateProfile({ displayName: pendingData.name });

                    if (window.db) {
                        try {
                            await window.db.collection('users').doc(user.uid).set({
                                name: pendingData.name,
                                email: pendingData.email,
                                isEmailVerified: true,
                                authProvider: 'password',
                                createdAt: new Date().toISOString()
                            });
                        } catch (dbErr) {
                            console.warn('Firestore Note:', dbErr);
                        }
                    }

                    sessionStorage.removeItem('pending_registration');
                    showToast('تم التحقق وتفعيل حسابك بنجاح! مرحباً بك 🎉', 'success');
                } catch (error) {
                    console.error('Firebase Auth Error:', error);
                    handleAuthError(error);
                } finally {
                    toggleLoading(verifyOtpBtn, false);
                }
            } else {
                // وضع المحاكاة التجريبي (في حال لم يضع المستخدم مفاتيح فايربيس بعد)
                toggleLoading(verifyOtpBtn, false);
                sessionStorage.removeItem('pending_registration');
                showToast('تم التحقق بنجاح من كود الـ 6 أرقام! 🎉 (وضع تجريبي)', 'success');
                renderUserDashboard({
                    displayName: pendingData.name,
                    email: pendingData.email,
                    uid: 'DEMO-USER-' + Math.floor(1000 + Math.random() * 9000),
                    providerId: 'demo-email'
                });
            }
        });
    }

    // ============================================================
    // 6. تسجيل الدخول بالبريد وكلمة المرور
    // ============================================================
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = loginEmail.value.trim().toLowerCase();
            const password = loginPassword.value;

            toggleLoading(loginSubmitBtn, true);

            if (window.isFirebaseReady && window.auth) {
                try {
                    await window.auth.signInWithEmailAndPassword(email, password);
                    showToast('تم تسجيل الدخول بنجاح! مرحباً بعودتك 👋', 'success');
                } catch (error) {
                    console.error('Login Error:', error);
                    handleAuthError(error);
                } finally {
                    toggleLoading(loginSubmitBtn, false);
                }
            } else {
                toggleLoading(loginSubmitBtn, false);
                showToast('لتسجيل الدخول الفعلي بقاعدة البيانات، يرجى وضع مفاتيح مشروعك في ملف firebase-config.js', 'info');
            }
        });
    }

    // ============================================================
    // 7. تسجيل الدخول بجوجل (Google Sign-In)
    // ============================================================
    async function handleGoogleSignIn() {
        if (window.isFirebaseReady && window.auth && window.googleProvider) {
            try {
                showToast('جاري تسجيل الدخول عبر Google...', 'info');
                const result = await window.auth.signInWithPopup(window.googleProvider);
                const user = result.user;

                if (window.db) {
                    try {
                        await window.db.collection('users').doc(user.uid).set({
                            name: user.displayName || 'مستخدم Google',
                            email: user.email,
                            photoURL: user.photoURL || '',
                            isEmailVerified: true,
                            authProvider: 'google.com',
                            lastLogin: new Date().toISOString()
                        }, { merge: true });
                    } catch (err) {
                        console.warn(err);
                    }
                }

                showToast(`أهلاً بك ${user.displayName || ''}! تم الدخول بنجاح عبر Google 🚀`, 'success');
            } catch (error) {
                console.error('Google Sign-In Error:', error);
                if (error.code === 'auth/popup-closed-by-user') {
                    showToast('تم إغلاق نافذة Google من قبل المستخدم', 'info');
                } else {
                    handleAuthError(error);
                }
            }
        } else {
            showToast('لتسجيل الدخول بجوجل، يرجى إضافة مفاتيح Firebase في ملف firebase-config.js وتفعيل خيار Google في Firebase Console', 'info', 6000);
        }
    }

    if (loginGoogleBtn) loginGoogleBtn.addEventListener('click', handleGoogleSignIn);
    if (registerGoogleBtn) registerGoogleBtn.addEventListener('click', handleGoogleSignIn);

    // ============================================================
    // 8. نسيت كلمة المرور
    // ============================================================
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = loginEmail.value.trim();

            if (!email) {
                showToast('يرجى إدخال بريدك الإلكتروني في خانة البريد أولاً', 'info');
                loginEmail.focus();
                return;
            }

            if (window.isFirebaseReady && window.auth) {
                try {
                    await window.auth.sendPasswordResetEmail(email);
                    showToast(`تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}`, 'success');
                } catch (error) {
                    handleAuthError(error);
                }
            } else {
                showToast(`[تجريبي] سيتم إرسال رابط استعادة كلمة المرور إلى ${email} بمجرد وضع مفاتيح فايربيس`, 'info');
            }
        });
    }

    // ============================================================
    // 9. عرض لوحة التحكم للمستخدم وتسجيل الخروج
    // ============================================================
    function renderUserDashboard(userData) {
        if (tabHeader) tabHeader.classList.add('hidden');
        if (loginForm) loginForm.classList.remove('active');
        if (registerForm) registerForm.classList.remove('active');
        if (otpSection) otpSection.classList.add('hidden');
        if (dashboardSection) dashboardSection.classList.remove('hidden');

        if (userNameDisplay) userNameDisplay.textContent = userData.displayName || 'عزيزنا المستخدم';
        if (userEmailDisplay) userEmailDisplay.textContent = userData.email || 'بدون بريد';
        if (userUidDisplay) userUidDisplay.textContent = userData.uid;

        if (userAvatar) {
            if (userData.photoURL) {
                userAvatar.src = userData.photoURL;
            } else {
                const name = encodeURIComponent(userData.displayName || userData.email || 'User');
                userAvatar.src = `https://ui-avatars.com/api/?name=${name}&background=6366f1&color=fff&size=128`;
            }
        }

        if (authProviderDisplay) {
            authProviderDisplay.textContent = (userData.providerId === 'google.com') 
                ? 'حساب Google 🌐' 
                : 'البريد الإلكتروني الموثق ✉️';
        }
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (window.isFirebaseReady && window.auth) {
                try {
                    await window.auth.signOut();
                } catch (err) {
                    console.error(err);
                }
            }
            showToast('تم تسجيل الخروج بنجاح 👋', 'info');
            window.switchTab('login');
        });
    }

    // مراقبة حالة تسجيل الدخول التلقائية عبر Firebase
    if (window.isFirebaseReady && window.auth) {
        window.auth.onAuthStateChanged(user => {
            if (user) {
                const isGoogle = user.providerData && user.providerData.some(p => p.providerId === 'google.com');
                renderUserDashboard({
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    uid: user.uid,
                    providerId: isGoogle ? 'google.com' : 'password'
                });
            } else {
                if (dashboardSection && !dashboardSection.classList.contains('hidden')) {
                    window.switchTab('login');
                }
            }
        });
    }

    // ============================================================
    // 10. ترجمة وتوضيح أخطاء Firebase بالعربية
    // ============================================================
    function handleAuthError(error) {
        let msg = 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً';
        switch (error.code) {
            case 'auth/invalid-email':
                msg = 'صيغة البريد الإلكتروني غير صحيحة';
                break;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                msg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
                break;
            case 'auth/email-already-in-use':
                msg = 'هذا البريد الإلكتروني مسجل بالفعل بحساب آخر!';
                break;
            case 'auth/weak-password':
                msg = 'كلمة المرور ضعيفة، يجب أن لا تقل عن 6 أحرف أو أرقام';
                break;
            case 'auth/too-many-requests':
                msg = 'تم حظر المحاولات مؤقتاً لكثرة المحاولات، يرجى الانتظار قليلاً';
                break;
            case 'auth/network-request-failed':
                msg = 'تعذر الاتصال بالشبكة، تأكد من اتصال الإنترنت';
                break;
            case 'auth/popup-blocked':
                msg = 'المتصفح حظر النافذة المنبثقة، يرجى السماح بالنوافذ المنبثقة';
                break;
            case 'auth/unauthorized-domain':
                msg = 'النطاق غير مصرح به في Firebase Console -> Authorized Domains';
                break;
            default:
                msg = error.message || msg;
                break;
        }
        showToast(msg, 'error', 6000);
    }
}
