// ===== بستن ولکام =====
function closeWelcome() {
    const popup = document.getElementById('welcomePopup');
    if (popup) popup.style.display = 'none';
}

// ===== داده‌های خدمات =====
const servicesData = [
    { id: 1, title: "آرایش عروس", description: "خاص‌ترین روز زندگیتان را بی‌نظیر کنید", price: "۲,۵۰۰,۰۰۰ تومان", image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=300&fit=crop" },
    { id: 2, title: "میکاپ حرفه‌ای", description: "آرایش روز و مجلسی با جدیدترین تکنیک‌ها", price: "۱,۲۰۰,۰۰۰ تومان", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=300&fit=crop" },
    { id: 3, title: "آموزش آرایش", description: "از مبتدی تا پیشرفته با مدرک معتبر", price: "۸۰۰,۰۰۰ تومان", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop" },
    { id: 4, title: "شینیون", description: "مدل‌های شیک و مدرن شینیون", price: "۹۰۰,۰۰۰ تومان", image: "https://images.unsplash.com/photo-1583265709629-6003f291a18a?w=400&h=300&fit=crop" }
];

// ===== گالری =====
const galleryData = [
    { id: 1, title: "شینیون مجلسی", image: "https://images.unsplash.com/photo-1583265709629-6003f291a18a?w=600&h=400&fit=crop" },
    { id: 2, title: "شینیون ساده", image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&h=400&fit=crop" },
    { id: 3, title: "شینیون عروس", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=400&fit=crop" },
    { id: 4, title: "شینیون مدرن", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=400&fit=crop" }
];

// ===== رندر خدمات =====
function renderServices() {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;
    grid.innerHTML = servicesData.map(s => `
        <div class="service-card">
            <img src="${s.image}" alt="${s.title}" loading="lazy">
            <div class="content">
                <h3>${s.title}</h3>
                <p>${s.description}</p>
                <span class="price">${s.price}</span>
                <button class="btn-primary" onclick="openReservation(${s.id})" style="border:none;cursor:pointer;">رزرو کنید</button>
            </div>
        </div>
    `).join('');
}

// ===== رندر گالری =====
function renderGallery() {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;
    grid.innerHTML = galleryData.map(item => `
        <div class="gallery-item">
            <img src="${item.image}" alt="${item.title}" loading="lazy">
            <div class="overlay"><h4>👑 ${item.title}</h4></div>
        </div>
    `).join('');
}

// ===== باز کردن فرم رزرو =====
function openReservation(id) {
    const service = servicesData.find(s => s.id === id);
    if (!service) return;
    
    localStorage.setItem('selectedService', JSON.stringify(service));
    
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'block';
    
    const modalTitle = document.querySelector('#loginModal h2');
    if (modalTitle) {
        modalTitle.textContent = `📋 رزرو ${service.title}`;
    }
    
    let extraInfo = document.getElementById('extraReservationInfo');
    if (!extraInfo) {
        extraInfo = document.createElement('div');
        extraInfo.id = 'extraReservationInfo';
        extraInfo.style.cssText = `
            background: #fef9e7;
            border-right: 4px solid #f39c12;
            padding: 1rem;
            border-radius: 10px;
            margin: 1rem 0;
            font-size: 0.95rem;
            color: #7d6608;
            line-height: 1.8;
        `;
        const modalContent = document.querySelector('#loginForm');
        if (modalContent) {
            modalContent.parentNode.insertBefore(extraInfo, modalContent);
        }
    }
    extraInfo.innerHTML = `
        <strong>📌 نکات مهم:</strong><br>
        ✅ پس از ثبت درخواست، ادمین با شما هماهنگ می‌کند.<br>
        ✅ در صورت تایم خالی، پیامک تایید برای شما ارسال می‌شود.<br>
        ✅ در صورت استفاده مجدد، تخفیف ویژه به شما تعلق می‌گیرد.
    `;
    extraInfo.style.display = 'block';
}

// ===== سیستم کاربران =====
const userManager = {
    users: JSON.parse(localStorage.getItem('melikaUsers')) || {},
    
    addUser(phone, name = '') {
        if (!this.users[phone]) {
            this.users[phone] = { visitCount: 0, name: name, joinDate: new Date().toISOString() };
        }
        this.users[phone].visitCount += 1;
        if (name && !this.users[phone].name) {
            this.users[phone].name = name;
        }
        this.saveUsers();
        return this.users[phone];
    },
    
    saveUsers() {
        localStorage.setItem('melikaUsers', JSON.stringify(this.users));
    },
    
    getDiscount(visitCount) {
        if (visitCount >= 10) return 10;
        if (visitCount >= 5) return 7;
        if (visitCount >= 3) return 4;
        if (visitCount >= 2) return 2;
        return 0;
    }
};

// ===== رویدادهای صفحه =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('صفحه بارگذاری شد!');
    
    // ===== دکمه ورود =====
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        console.log('دکمه ورود پیدا شد!');
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('دکمه ورود کلیک شد!');
            const modal = document.getElementById('loginModal');
            if (modal) {
                modal.style.display = 'block';
                console.log('مودال باز شد!');
            } else {
                console.log('مودال پیدا نشد!');
            }
            
            const modalTitle = document.querySelector('#loginModal h2');
            if (modalTitle) modalTitle.textContent = '🔐 ورود به حساب کاربری';
            
            const extraInfo = document.getElementById('extraReservationInfo');
            if (extraInfo) extraInfo.style.display = 'none';
        });
    } else {
        console.log('دکمه ورود پیدا نشد!');
    }

    // ===== بستن مودال =====
    const closeBtn = document.getElementById('closeModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            const modal = document.getElementById('loginModal');
            if (modal) modal.style.display = 'none';
        });
    }

    window.addEventListener('click', function(e) {
        const modal = document.getElementById('loginModal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // ===== فرم ورود =====
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const phone = document.getElementById('phoneInput').value;
            const code = document.getElementById('codeInput').value;
            
            if (phone.length < 11) {
                alert('❌ لطفاً شماره موبایل را به درستی وارد کنید!');
                return;
            }
            
            if (code !== '1234') {
                alert('❌ کد تایید اشتباه است! (کد صحیح: 1234)');
                return;
            }
            
            const user = userManager.addUser(phone);
            const discount = userManager.getDiscount(user.visitCount);
            
            let numbers = JSON.parse(localStorage.getItem('melikaNumbers')) || [];
            if (!numbers.includes(phone)) {
                numbers.push(phone);
                localStorage.setItem('melikaNumbers', JSON.stringify(numbers));
            }
            
            const selectedService = JSON.parse(localStorage.getItem('selectedService'));
            
            let message = '';
            
            if (selectedService) {
                let reservations = JSON.parse(localStorage.getItem('melikaReservations')) || [];
                reservations.push({
                    name: user.name || 'کاربر',
                    phone: phone,
                    service: selectedService.title,
                    date: new Date().toISOString(),
                    status: 'pending',
                    visitCount: user.visitCount,
                    discount: discount
                });
                localStorage.setItem('melikaReservations', JSON.stringify(reservations));
                
                message = `📋 درخواست رزرو شما برای "${selectedService.title}" ثبت شد!\n\n`;
                message += `✅ درخواست شما به ادمین ارسال شد.\n`;
                message += `📞 شماره تماس: ${phone}\n`;
                message += `⏰ زمان ثبت: ${new Date().toLocaleDateString('fa-IR')}\n\n`;
                
                if (discount > 0) {
                    message += `🎉 **تخفیف ویژه شما:**\n`;
                    message += `به دلیل ${user.visitCount} بار مراجعه، ${discount}% تخفیف به شما تعلق گرفت!\n\n`;
                }
                
                message += `📌 **مراحل بعدی:**\n`;
                message += `1️⃣ ادمین با شما تماس می‌گیرد.\n`;
                message += `2️⃣ در صورت تایم خالی، پیامک تایید برای شما ارسال می‌شود.\n`;
                
                localStorage.removeItem('selectedService');
                
            } else {
                message = `✅ خوش آمدید!\n`;
                message += `📞 شماره: ${phone}\n`;
                message += `📋 تعداد مراجعه: ${user.visitCount}\n`;
                if (discount > 0) {
                    message += `🎯 تخفیف شما: ${discount}%\n`;
                }
            }
            
            document.getElementById('userPhone').textContent = phone;
            document.getElementById('visitCount').textContent = user.visitCount;
            document.getElementById('discountPercent').textContent = discount + '%';
            document.getElementById('userInfo').style.display = 'block';
            
            alert(message);
            
            setTimeout(() => {
                document.getElementById('loginModal').style.display = 'none';
                const extraInfo = document.getElementById('extraReservationInfo');
                if (extraInfo) extraInfo.style.display = 'none';
                const modalTitle = document.querySelector('#loginModal h2');
                if (modalTitle) modalTitle.textContent = '🔐 ورود به حساب کاربری';
            }, 2000);
        });
    }

    // ===== منو همبرگری =====
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            const nav = document.querySelector('.nav-links');
            if (nav) nav.classList.toggle('active');
        });
    }

    // ===== دکمه بازگشت به بالا =====
    const backBtn = document.getElementById('backToTop');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    window.addEventListener('scroll', function() {
        const btn = document.getElementById('backToTop');
        if (btn) {
            if (window.scrollY > 300) btn.style.display = 'block';
            else btn.style.display = 'none';
        }
    });

    // ===== انیمیشن شمارنده =====
    animateNumbers();

    // ===== رندر =====
    renderServices();
    renderGallery();

    // ===== فرم تماس =====
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('fullName').value;
            const phone = document.getElementById('phoneNumber').value;
            const service = document.getElementById('serviceSelect').value;
            const message = document.getElementById('messageText').value;
            
            let contacts = JSON.parse(localStorage.getItem('melikaContacts')) || [];
            contacts.push({ name, phone, service, message, date: new Date().toISOString() });
            localStorage.setItem('melikaContacts', JSON.stringify(contacts));
            
            let numbers = JSON.parse(localStorage.getItem('melikaNumbers')) || [];
            if (!numbers.includes(phone)) {
                numbers.push(phone);
                localStorage.setItem('melikaNumbers', JSON.stringify(numbers));
            }
            
            alert('✅ پیام شما با موفقیت ارسال شد!\nدر اسرع وقت با شما تماس گرفته می‌شود.');
            this.reset();
        });
    }
});

// ===== انیمیشن شمارنده =====
function animateNumbers() {
    const counters = document.querySelectorAll('.number');
    counters.forEach(counter => {
        const updateCount = () => {
            const target = parseInt(counter.getAttribute('data-count'));
            const count = parseInt(counter.innerText);
            const increment = target / 80;
            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(updateCount, 20);
            } else {
                counter.innerText = target + '+';
            }
        };
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                updateCount();
                observer.disconnect();
            }
        });
        observer.observe(counter);
    });
}
