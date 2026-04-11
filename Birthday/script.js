/* ── 全局变量 ── */
let isFlipped = false;
let isPlaying = false;
let audioCtx = null;
let nodes = [];

/* ── 1. 卡片翻转逻辑 ── */
const card = document.getElementById('card');
card.addEventListener('click', () => {
    // 防止在动画进行中重复点击
    if (card.classList.contains('animating')) return;

    isFlipped = !isFlipped;
    card.classList.add('animating');
    card.classList.toggle('flipped');

    // 监听动画结束（CSS transition 设为 0.95s）
    setTimeout(() => {
        card.classList.remove('animating');
    }, 950);

    if (isFlipped) {
        // 当卡片翻开时，显示生日内容部分并触发特效
        document.getElementById('bday-section').classList.add('show');
        document.getElementById('hint-text').style.opacity = '0';
        startConfetti(); // 喷洒纸屑
        createFloaters(); // 启动漂浮装饰物
    }
});

/* ── 2. 吹灭蜡烛逻辑 ── */
function blowCandles() {
    const flames = document.querySelectorAll('.flame');
    let wasLit = false;
    flames.forEach(f => {
        if (f.classList.contains('lit')) {
            f.classList.remove('lit');
            wasLit = true;
        }
    });

    if (wasLit) {
        // 成功吹灭后，再次喷洒纸屑作为反馈
        startConfetti();
    }
}

/* ── 3. 漂浮装饰物特效 ── */
function createFloaters() {
    const symbols = ['✨', '💖', '🎂', '🌸', '🎈'];
    setInterval(() => {
        if (!isFlipped) return; // 仅在卡片翻开后产生
        const el = document.createElement('div');
        el.className = 'floater';
        el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        el.style.left = Math.random() * 100 + 'vw';
        el.style.top = '100vh';
        el.style.animationDuration = (Math.random() * 2 + 3) + 's';
        document.body.appendChild(el);

        // 动画结束后移除元素，防止内存泄漏
        setTimeout(() => el.remove(), 5000);
    }, 800);
}

/* ── 4. 生日歌播放逻辑 (使用 Web Audio API) ── */
function playBirthdaySong() {
    if (!audioCtx) {
        audioCtx = new(window.AudioContext || window.webkitAudioContext)();
    }

    // 生日快乐旋律频率
    const notes = [
        261.6, 261.6, 293.7, 261.6, 349.2, 329.6,
        261.6, 261.6, 293.7, 261.6, 392.0, 349.2,
        261.6, 261.6, 523.3, 440.0, 349.2, 329.6, 293.7,
        466.2, 466.2, 440.0, 349.2, 392.0, 349.2
    ];

    let t = audioCtx.currentTime;
    notes.forEach((f, i) => {
        let d = 0.4; // 音符时长
        if (i % 6 === 5) d = 0.8; // 句尾音符加长

        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        o.type = 'sine'; // 正弦波
        o.frequency.setValueAtTime(f, t);

        // 渐入渐出效果，让声音不突兀
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(.28, t + .04);
        g.gain.linearRampToValueAtTime(.2, t + d * .8);
        g.gain.linearRampToValueAtTime(0, t + d);

        o.start(t);
        o.stop(t + d);
        nodes.push(o);
        t += d;
    });

    // 播放结束自动重置按钮状态
    setTimeout(() => {
        if (isPlaying) stopMusic();
    }, (t - audioCtx.currentTime) * 1000 + 100);
}

function stopMusic() {
    isPlaying = false;
    nodes.forEach(n => {
        try { n.stop(); } catch (e) {}
    });
    nodes = [];
    document.getElementById('play-btn').innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12"><path d="M3 2l7 4-7 4V2z" fill="#7a4a2a"/></svg>';
    document.getElementById('audio-label').textContent = '点击播放生日歌';
}

function toggleMusic() {
    if (isPlaying) {
        stopMusic();
    } else {
        isPlaying = true;
        // 切换为暂停图标
        document.getElementById('play-btn').innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12"><rect x="1" y="1" width="4" height="10" rx="1" fill="#7a4a2a"/><rect x="7" y="1" width="4" height="10" rx="1" fill="#7a4a2a"/></svg>';
        document.getElementById('audio-label').textContent = '♪ 生日快乐歌播放中...';
        playBirthdaySong();
    }
}

/* ── 5. 纸屑喷洒特效 ── */
function startConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    const colors = ['#f2d74e', '#95c3de', '#ff9a91', '#f2ceff', '#aeef91'];

    for (let i = 0; i < 120; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            velX: Math.random() * 4 - 2,
            velY: Math.random() * 5 + 3,
            angle: Math.random() * 360
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            ctx.save();
            ctx.fillStyle = p.color;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle * Math.PI / 180);
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();

            p.y += p.velY;
            p.x += p.velX;
            p.angle += 5;
        });

        if (particles.some(p => p.y < canvas.height)) {
            requestAnimationFrame(draw);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    draw();
}