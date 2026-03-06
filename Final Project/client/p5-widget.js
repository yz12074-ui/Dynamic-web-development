window.addEventListener("DOMContentLoaded", () => {
    const widgetSketch = (sketch) => {
        let bgImg;

        // ✅ use your real local files
        let tracks = [
            { title: "夜に駆ける (Yoru ni Kakeru)", artist: "YOASOBI", file: "assets/yoru.mp3" },
            { title: "Lemon", artist: "Kenshi Yonezu", file: "assets/lemon.mp3" },
            { title: "First Love", artist: "Hikaru Utada", file: "assets/firstlove.mp3" },
            { title: "Love Yourself", artist: "Justin Bieber", file: "assets/loveyourself.mp3" },
            { title: "Love Story", artist: "Taylor Swift", file: "assets/lovestory.mp3" },
        ];

        let screen = "menu"; // menu | songs | artists | now
        let menuItems = ["Playlists", "Artists", "Songs", "Settings", "About", "Now Playing"];
        let selection = 0;

        let currentTrackIndex = 0;
        let isPlaying = false;
        let audioReady = false;

        // UI geometry
        let ipod = {};
        let buttons = {};

        // -------- lifecycle --------
        sketch.preload = () => {
            // ✅ your actual filename has a space
            bgImg = sketch.loadImage(
                "assets/musicplayer.png",
                () => console.log("✅ bg loaded"),
                (e) => console.error("❌ bg failed", e)
            );

            for (let t of tracks) {
                t.sound = sketch.loadSound(
                    t.file,
                    () => console.log("✅ loaded:", t.file),
                    (err) => console.error("❌ failed:", t.file, err)
                );
            }
        };

        sketch.setup = () => {
            const c = sketch.createCanvas(260, 400);
            c.parent("p5-widget");
            sketch.pixelDensity(1);
            sketch.textFont("Helvetica");
            layout();
        };

        sketch.draw = () => {
            sketch.clear();

            // background image (cover)
            if (bgImg) {
                const scale = Math.max(sketch.width / bgImg.width, sketch.height / bgImg.height);
                const w = bgImg.width * scale;
                const h = bgImg.height * scale;
                const x = (sketch.width - w) / 2;
                const y = (sketch.height - h) / 2;
                sketch.image(bgImg, x, y, w, h);
            } else {
                sketch.noStroke();
                sketch.fill(255, 240);
                sketch.rect(0, 0, sketch.width, sketch.height, 18);
                sketch.fill(0, 140);
                sketch.textAlign(sketch.CENTER, sketch.CENTER);
                sketch.textSize(11);
                sketch.text("bg loading…", sketch.width / 2, 14);
            }

            drawScreen();
            drawWheel();

        };

        // -------- controls --------
        sketch.mouseWheel = (e) => {
            if (screen === "now") return false;
            const dir = e.delta > 0 ? 1 : -1;
            const max = getCurrentListLength() - 1;
            selection = sketch.constrain(selection + dir, 0, max);
            return false;
        };

        sketch.mousePressed = () => {
            if (!audioReady) {
                sketch.userStartAudio();
                audioReady = true;
            }

            if (hit(buttons.menu)) { goBack(); return; }
            if (hit(buttons.center)) { onCenter(); return; }
            if (hit(buttons.play)) { togglePlay(); return; }
            if (hit(buttons.next)) { nextTrack(); return; }
            if (hit(buttons.prev)) { prevTrack(); return; }
        };

        // -------- layout (scaled to 260x260) --------
        function layout() {
            ipod.x = sketch.width / 2;
            ipod.y = sketch.height / 2;

            ipod.w = sketch.width * 0.92;
            ipod.h = sketch.height * 0.92;
            ipod.r = 18;

            ipod.screen = {
                x: ipod.x - ipod.w * 0.30,
                y: ipod.y - ipod.h * 0.45,
                w: ipod.w * 0.62,
                h: ipod.h * 0.34,
                r: 8,
            };

            ipod.wheel = {
                x: ipod.x + ipod.w * 0.02,
                y: ipod.y + ipod.h * 0.20,
                rOuter: ipod.w * 0.39,
                rInner: ipod.w * 0.20,
            };

            const w = ipod.wheel;
            const rBtn = Math.max(12, w.rOuter * 0.26);
            buttons.menu = { x: w.x, y: w.y - w.rOuter * 0.72, r: rBtn };
            buttons.play = { x: w.x, y: w.y + w.rOuter * 0.72, r: rBtn };
            buttons.prev = { x: w.x - w.rOuter * 0.72, y: w.y, r: rBtn };
            buttons.next = { x: w.x + w.rOuter * 0.72, y: w.y, r: rBtn };
            buttons.center = { x: w.x, y: w.y, r: w.rInner };
        }

        // -------- drawing --------
        function drawScreen() {
            const s = ipod.screen;

            // bezel
            sketch.noStroke();
            sketch.fill(230, 220);
            sketch.rectMode(sketch.CORNER);
            sketch.rect(s.x - 5, s.y - 5, s.w + 10, s.h + 10, s.r + 6);

            // screen
            sketch.fill(245, 235);
            sketch.rect(s.x, s.y, s.w, s.h, s.r);

            // top bar
            sketch.fill(30);
            sketch.textAlign(sketch.CENTER, sketch.CENTER);
            sketch.textSize(12);
            sketch.text("iPod", s.x + s.w / 2, s.y + 12);

            drawBattery(s.x + s.w - 40, s.y + 6);

            // content
            sketch.push();
            sketch.translate(s.x, s.y + 22);

            if (screen === "menu") drawList(menuItems, selection);
            if (screen === "songs") drawList(tracks.map((t) => t.title), selection, "Songs");
            if (screen === "artists") drawList(uniqueArtists(), selection, "Artists");
            if (screen === "now") drawNowPlaying();

            sketch.pop();
        }

        function drawBattery(x, y) {
            sketch.push();
            sketch.translate(x, y);
            sketch.stroke(30);
            sketch.noFill();
            sketch.rect(0, 0, 26, 10, 2);
            sketch.rect(26, 3, 3, 4, 1);
            sketch.noStroke();
            sketch.fill(30);
            sketch.rect(2, 2, 16, 6, 2);
            sketch.pop();
        }

        function drawList(items, sel, header = "") {
            const s = ipod.screen;
            const padX = 10;
            const rowH = 16;

            if (header) {
                sketch.fill(80);
                sketch.textAlign(sketch.LEFT, sketch.CENTER);
                sketch.textSize(10);
                sketch.text(header, padX, 8);
                sketch.stroke(0, 0, 0, 35);
                sketch.line(padX, 14, s.w - padX, 14);
            }

            const startY = header ? 22 : 10;

            // only visible rows
            const maxRows = Math.max(1, Math.floor((s.h - startY - 6) / rowH));
            const offset = Math.max(0, sel - Math.floor(maxRows / 2));
            const end = Math.min(items.length, offset + maxRows);

            for (let i = offset; i < end; i++) {
                const y = startY + (i - offset) * rowH;

                if (i === sel) {
                    sketch.noStroke();
                    sketch.fill(70, 90, 120, 80);
                    sketch.rect(padX - 4, y - 8, s.w - padX * 2 + 8, rowH, 5);
                }

                sketch.fill(25);
                sketch.textAlign(sketch.LEFT, sketch.CENTER);
                sketch.textSize(10);

                let label = items[i];
                if (label.length > 18) label = label.slice(0, 18) + "…";
                sketch.text(label, padX, y);

                sketch.fill(60);
                sketch.textAlign(sketch.RIGHT, sketch.CENTER);
                sketch.text("›", s.w - padX, y);
            }
        }

        function drawNowPlaying() {
            const s = ipod.screen;
            const t = tracks[currentTrackIndex];

            sketch.fill(25);
            sketch.textAlign(sketch.LEFT, sketch.TOP);
            sketch.textSize(10);
            sketch.text("Now Playing", 10, 4);

            sketch.stroke(0, 0, 0, 35);
            sketch.line(10, 16, s.w - 10, 16);

            sketch.noStroke();
            sketch.fill(30);
            sketch.textSize(10);
            sketch.text(t.title, 10, 22, s.w - 20);

            sketch.fill(70);
            sketch.textSize(9);
            sketch.text(t.artist, 10, 52, s.w - 20);

            const barX = 10,
                barY = 70,
                barW = s.w - 20,
                barH = 6;
            sketch.fill(220);
            sketch.rect(barX, barY, barW, barH, 4);

            const snd = tracks[currentTrackIndex].sound;
            let prog = 0;

            if (snd && snd.isLoaded() && snd.duration() > 0) {
                // currentTime() returns seconds since start
                prog = sketch.constrain(snd.currentTime() / snd.duration(), 0, 1);
            }
            sketch.fill(120);
            sketch.rect(barX, barY, barW * prog, barH, 4);

            sketch.fill(60);
            sketch.textSize(9);
            sketch.text(isPlaying ? "▶ playing" : "⏸ paused", 10, 84);
        }

        function drawWheel() {
            const w = ipod.wheel;

            // outer
            sketch.noStroke();
            sketch.fill(245, 235);
            sketch.ellipse(w.x, w.y, w.rOuter * 2);

            // outline
            sketch.noFill();
            sketch.stroke(0, 0, 0, 25);
            sketch.strokeWeight(2);
            sketch.ellipse(w.x, w.y, w.rOuter * 2);

            // center
            sketch.noStroke();
            sketch.fill(250, 235);
            sketch.ellipse(w.x, w.y, w.rInner * 2);

            sketch.stroke(0, 0, 0, 18);
            sketch.noFill();
            sketch.ellipse(w.x, w.y, w.rInner * 2);

            // labels
            sketch.noStroke();
            sketch.fill(120);
            sketch.textAlign(sketch.CENTER, sketch.CENTER);

            sketch.textSize(10);
            sketch.text("menu", buttons.menu.x, buttons.menu.y);

            sketch.textSize(12);
            sketch.text("⏮", buttons.prev.x, buttons.prev.y);
            sketch.text("⏭", buttons.next.x, buttons.next.y);
            sketch.text("▶⏸", buttons.play.x, buttons.play.y);

            sketch.fill(170, 180, 190, 50);
            sketch.ellipse(buttons.center.x, buttons.center.y, buttons.center.r * 1.05);
        }

        // -------- logic --------
        function hit(btn) {
            return sketch.dist(sketch.mouseX, sketch.mouseY, btn.x, btn.y) <= btn.r;
        }

        function getCurrentListLength() {
            if (screen === "menu") return menuItems.length;
            if (screen === "songs") return tracks.length;
            if (screen === "artists") return uniqueArtists().length;
            return 0;
        }

        function onCenter() {
            if (screen === "menu") {
                const choice = menuItems[selection];
                if (choice === "Songs") {
                    screen = "songs";
                    selection = 0;
                } else if (choice === "Artists") {
                    screen = "artists";
                    selection = 0;
                } else if (choice === "Now Playing") { screen = "now"; } else { screen = "now"; }
                return;
            }

            if (screen === "songs") {
                currentTrackIndex = selection;
                screen = "now";
                playCurrentIfPlaying();
                return;
            }

            if (screen === "artists") {
                const artist = uniqueArtists()[selection];
                const idx = tracks.findIndex((t) => t.artist === artist);
                if (idx >= 0) currentTrackIndex = idx;
                screen = "now";
                playCurrentIfPlaying();
                return;
            }

            if (screen === "now") togglePlay();
        }

        function goBack() {
            if (screen === "songs" || screen === "artists" || screen === "now") {
                screen = "menu";
                selection = 0;
            }
        }

        function uniqueArtists() {
            const seen = new Set();
            const out = [];
            for (const t of tracks) {
                if (!seen.has(t.artist)) {
                    seen.add(t.artist);
                    out.push(t.artist);
                }
            }
            return out;
        }

        function togglePlay() {
            const s = tracks[currentTrackIndex].sound;
            if (!s) return;

            isPlaying = !isPlaying;
            if (isPlaying) {
                if (!s.isPlaying()) s.play();
            } else {
                if (s.isPlaying()) s.pause();
            }
        }

        function playCurrentIfPlaying() {
            if (!isPlaying) return;
            const s = tracks[currentTrackIndex].sound;
            if (!s) return;
            if (!s.isPlaying()) s.play();
        }

        function stopAllSounds() {
            for (let t of tracks) {
                if (t.sound && t.sound.isPlaying()) t.sound.stop();
            }
        }

        function nextTrack() {
            stopAllSounds();
            currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
            if (screen === "songs") selection = currentTrackIndex;
            playCurrentIfPlaying();
        }

        function prevTrack() {
            stopAllSounds();
            currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
            if (screen === "songs") selection = currentTrackIndex;
            playCurrentIfPlaying();
        }
    };

    new p5(widgetSketch, "p5-widget");
});