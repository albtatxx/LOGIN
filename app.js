// ============================================================
// كود الجافاسكربت الرئيسي للتحكم بالواجهة و Firebase و كود التفعيل
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

    // عناصر شاشة التفعيل
    const verificationTitle = document.getElementById('verificationTitle');
    const verificationSubtitle = document.getElementById('verificationSubtitle');
    const otpTargetEmail = document.getElementById('otpTargetEmail');
    const otpInputsContainer = document.getElementById('otpInputsContainer');
    const firebaseLinkContainer = document.getElementById('firebaseLinkContainer');
    const checkVerifiedBtn = document.getElementById('checkVerifiedBtn');
    const otpDigits = document.querySelectorAll('.otp-digit');
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
    // 3. التحقق وإرسال رسائل التفعيل
    // ============================================================
    function isEmailJsReady() {
        const config = window.emailJsConfig;
        return (config &&
            config.serviceId && config.serviceId !== 'YOUR_SERVICE_ID' &&
            config.publicKey && config.publicKey !== 'YOUR_PUBLIC_KEY');
    }

    function generate6DigitCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
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

    // التنقل التلقائي بين خانات كود الـ 6 أرقام
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

    // إظهار شاشة التفعيل
    function showVerificationSection(email, mode = 'otp') {
        if (tabHeader) tabHeader.classList.add('hidden');
        if (loginForm) loginForm.classList.remove('active');
        if (registerForm) registerForm.classList.remove('active');
        if (dashboardSection) dashboardSection.classList.add('hidden');
        if (otpSection) otpSection.classList.remove('hidden');

        if (otpTargetEmail) otpTargetEmail.textContent = email;

        if (mode === 'otp') {
            // وضع كود الـ 6 أرقام (EmailJS)
            verificationSubtitle.textContent = 'أدخل رمز التحقق المكون من 6 أرقام المُرسل إلى بريدك:';
            otpInputsContainer.classList.remove('hidden');
            firebaseLinkContainer.classList.add('hidden');
            otpDigits.forEach(input => input.value = '');
            setTimeout(() => { if (otpDigits[0]) otpDigits[0].focus(); }, 200);
        } else {
            // وضع رابط التفعيل المباشر من جوجل/فايربيس
            verificationSubtitle.textContent = 'تم إرسال رسالة تفعيل رسمية إلى بريدك الإلكتروني:';
            otpInputsContainer.classList.add('hidden');
            firebaseLinkContainer.classList.remove('hidden');
        }

        startOtpCountdown();
    }

    if (cancelOtpBtn) {
        cancelOtpBtn.addEventListener('click', () => {
            sessionStorage.removeItem('pending_registration');
            window.switchTab('register');
        });
    }

    // ============================================================
    // 4. إنشاء حساب جديد وإرسال الإيميل الحقيقي فوراً
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
                // الخيار الأول: إذا كان المستخدم قام بربط EmailJS، نرسل كود الـ 6 أرقام
                if (isEmailJsReady()) {
                    const otpCode = generate6DigitCode();
                    const pendingData = { name, email, password, otpCode, mode: 'otp' };
                    sessionStorage.setItem('pending_registration', JSON.stringify(pendingData));

                    await emailjs.send(
                        window.emailJsConfig.serviceId,
                        window.emailJsConfig.templateId,
                        { to_email: email, user_name: name, otp_code: otpCode },
                        window.emailJsConfig.publicKey
                    );

                    showToast(`تم إرسال كود الـ 6 أرقام بنجاح إلى ${email}`, 'success');
                    showVerificationSection(email, 'otp');
                } 
                // الخيار الثاني: نظام فايربيس الرسمي التلقائي (يرسل إيميل تفعيل حقيقي من جوجل فوراً دون الحاجة لـ EmailJS)
                else {
                    if (!window.isFirebaseReady || !window.auth) {
                        showToast('خطأ: لم يتم الاتصال بفايربيس بشكل صحيح', 'error');
                        return;
                    }

                    // إنشاء الحساب في فايربيس
                    const userCredential = await window.auth.createUserWithEmailAndPassword(email, password);
                    const user = userCredential.user;

                    // تحديث اسم المستخدم
                    await user.updateProfile({ displayName: name });

                    // إرسال إيميل التفعيل الحقيقي الرسمي من سيرفرات جوجل/فايربيس
                    await user.sendEmailVerification();

                    sessionStorage.setItem('pending_registration', JSON.stringify({ name, email, mode: 'link' }));

                    showToast(`تم إرسال رسالة التفعيل بنجاح إلى ${email}! تفقد صندوق الوارد أو الـ Spam`, 'success', 7000);
                    showVerificationSection(email, 'link');
                }
            } catch (err) {
                console.error('Registration/Send Error:', err);
                handleAuthError(err);
            } finally {
                toggleLoading(registerSubmitBtn, false);
            }
        });
    }

    // زر التحقق من تفعيل الرابط (في وضع فايربيس المباشر)
    if (checkVerifiedBtn) {
        checkVerifiedBtn.addEventListener('click', async () => {
            if (!window.auth || !window.auth.currentUser) {
                showToast('يرجى تسجيل الدخول أولاً', 'info');
                window.switchTab('login');
                return;
            }

            toggleLoading(checkVerifiedBtn, true);

            try {
                // تحديث حالة المستخدم من السيرفر لمعرفة هل ضغط على الرابط في الإيميل
                await window.auth.currentUser.reload();
                const user = window.auth.currentUser;

                if (user.emailVerified) {
                    showToast('تم التحقق من بريدك بنجاح! مرحباً بك 🎉', 'success');
                    sessionStorage.removeItem('pending_registration');
                    renderUserDashboard({
                        displayName: user.displayName,
                        email: user.email,
                        photoURL: user.photoURL,
                        uid: user.uid,
                        providerId: 'password'
                    });
                } else {
                    showToast('لم يتم تفعيل الحساب بعد! يرجى فتح الرسالة في بريدك والضغط على رابط التفعيل ثم المحاولة مجدداً.', 'error', 6000);
                }
            } catch (err) {
                console.error(err);
                showToast('حدث خطأ أثناء فحص حالة التفعيل، يرجى المحاولة لاحقاً', 'error');
            } finally {
                toggleLoading(checkVerifiedBtn, false);
            }
        });
    }

    // زر إعادة إرسال الرسالة
    if (resendOtpBtn) {
        resendOtpBtn.addEventListener('click', async () => {
            const raw = sessionStorage.getItem('pending_registration');
            if (!raw) {
                showToast('انتهت الجلسة، يرجى كتابة البيانات مجدداً', 'error');
                window.switchTab('register');
                return;
            }
            const pendingData = JSON.parse(raw);

            try {
                if (pendingData.mode === 'otp' && isEmailJsReady()) {
                    const newOtp = generate6DigitCode();
                    pendingData.otpCode = newOtp;
                    sessionStorage.setItem('pending_registration', JSON.stringify(pendingData));

                    showToast('جاري إرسال كود جديد إلى بريدك...', 'info');
                    await emailjs.send(
                        window.emailJsConfig.serviceId,
                        window.emailJsConfig.templateId,
                        { to_email: pendingData.email, user_name: pendingData.name, otp_code: newOtp },
                        window.emailJsConfig.publicKey
                    );
                    showToast(`تم إرسال كود جديد إلى ${pendingData.email}`, 'success');
                } else {
                    if (window.auth && window.auth.currentUser) {
                        showToast('جاري إعادة إرسال رسالة التفعيل...', 'info');
                        await window.auth.currentUser.sendEmailVerification();
                        showToast(`تم إرسال رسالة التفعيل مجدداً إلى ${pendingData.email}`, 'success');
                    }
                }
                startOtpCountdown();
            } catch (err) {
                console.error(err);
                showToast('تعذر إعادة الإرسال حالياً، انتظر قليلاً ثم حاول مجدداً', 'error');
            }
        });
    }

    // ============================================================
    // 5. تأكيد كود الـ 6 أرقام (عند استخدام وضع EmailJS)
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
                showToast('رمز التحقق غير صحيح! تأكد من الرمز المرسل إلى بريدك وحاول مجدداً', 'error');
                otpDigits.forEach(input => input.classList.add('error'));
                setTimeout(() => otpDigits.forEach(input => input.classList.remove('error')), 1500);
                return;
            }

            toggleLoading(verifyOtpBtn, true);

            // إنشاء الحساب الفعلي في فايربيس
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
                showToast('خطأ: فايربيس غير متصل', 'error');
                toggleLoading(verifyOtpBtn, false);
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
                    const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
                    const user = userCredential.user;

                    // التحقق مما إذا كان البريد قد تم تفعيله
                    if (!user.emailVerified && !isEmailJsReady()) {
                        showToast('تنبيه: لم تقم بتفعيل حسابك بعد. يرجى مراجعة بريدك والضغط على رابط التفعيل أولاً.', 'error', 7000);
                        toggleLoading(loginSubmitBtn, false);
                        return;
                    }

                    showToast('تم تسجيل الدخول بنجاح! مرحباً بعودتك 👋', 'success');
                } catch (error) {
                    console.error('Login Error:', error);
                    handleAuthError(error);
                } finally {
                    toggleLoading(loginSubmitBtn, false);
                }
            } else {
                toggleLoading(loginSubmitBtn, false);
                showToast('فايربيس غير متصل حالياً', 'error');
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
            showToast('لتسجيل الدخول بجوجل، تأكد من تفعيل Google في Firebase Console', 'info', 6000);
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
                    showToast(`تم إرسال رابط استعادة كلمة المرور إلى ${email}`, 'success');
                } catch (error) {
                    handleAuthError(error);
                }
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
            if (user && user.emailVerified) {
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
            case 'auth/operation-not-allowed':
                msg = 'طريقة التسجيل هذه غير مفعلة، يرجى تفعيل Email/Password في Firebase Console';
                break;
            default:
                msg = error.message || msg;
                break;
        }
        showToast(msg, 'error', 6000);
    }
}
