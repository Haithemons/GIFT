document.addEventListener('DOMContentLoaded', () => {

    // --- 0. Intro Animation (النقاط الذهبية الأصلية) ---
    const introScreen = document.getElementById('intro-screen');
    const introCanvas = document.getElementById('intro-canvas');
    const introCtx = introCanvas.getContext('2d');
    const introAudio = document.getElementById('intro-audio');
    const introText = document.getElementById('intro-text');
    const btnStartIntro = document.getElementById('btn-start-intro');

    function resizeIntroCanvas() {
        introCanvas.width = window.innerWidth;
        introCanvas.height = window.innerHeight;
    }
    resizeIntroCanvas();
    window.addEventListener('resize', resizeIntroCanvas);

    let targetPoints = [];

    fetch('points.json')
        .then(response => response.json())
        .then(data => {
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            data.forEach(pt => {
                if (pt.x < minX) minX = pt.x;
                if (pt.x > maxX) maxX = pt.x;
                if (pt.y < minY) minY = pt.y;
                if (pt.y > maxY) maxY = pt.y;
            });

            const imgWidth = maxX - minX;
            const imgHeight = maxY - minY;
            const scale = 0.85; 
            const centerX = introCanvas.width / 2 - (imgWidth * scale) / 2;
            const centerY = introCanvas.height / 2 - (imgHeight * scale) / 2 - 140;

            targetPoints = data.map(pt => {
                const startX = Math.random() * introCanvas.width;
                const startY = Math.random() * introCanvas.height;
                const finalX = (pt.x - minX) * scale + centerX;
                const finalY = (pt.y - minY) * scale + centerY;

                return {
                    x: startX,
                    y: startY,
                    targetX: finalX,
                    targetY: finalY,
                    vx: (finalX - startX) / 60,
                    vy: (finalY - startY) / 60,
                    radius: Math.random() * 1.6 + 0.8,
                    alpha: Math.random() * 0.4 + 0.6
                };
            });
            requestAnimationFrame(renderIntro);
        })
        .catch(err => console.log("Error loading points.json:", err));

    let introFrameCount = 0;
    function renderIntro() {
        introCtx.clearRect(0, 0, introCanvas.width, introCanvas.height);

        targetPoints.forEach(pt => {
            if (introFrameCount < 70) {
                pt.x += pt.vx;
                pt.y += pt.vy;
            } else {
                pt.x = pt.targetX;
                pt.y = pt.targetY;
            }

            introCtx.beginPath();
            introCtx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
            introCtx.fillStyle = `rgba(255, 243, 200, ${pt.alpha})`;
            
            introCtx.shadowBlur = 15;
            introCtx.shadowColor = '#ffe599';
            introCtx.fill();
        });

        introFrameCount++;

        if (introFrameCount === 30) {
            introText.classList.add('show');
        }

        if (introFrameCount < 120) {
            requestAnimationFrame(renderIntro);
        }
    }

    btnStartIntro.addEventListener('click', () => {
        introAudio.play().catch(err => console.log("Audio play failed:", err));
        introScreen.classList.add('fade-out');
    });

    // --- 1. Ambient Background Particles ---
    const bgCanvas = document.getElementById('ambient-canvas');
    const bgCtx = bgCanvas.getContext('2d');

    function resizeBgCanvas() {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
    }
    resizeBgCanvas();
    window.addEventListener('resize', resizeBgCanvas);

    const particles = Array.from({ length: 30 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.3 - 0.1
    }));

    function renderAmbient() {
        bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y < 0) p.y = bgCanvas.height;
            if (p.x < 0) p.x = bgCanvas.width;
            if (p.x > bgCanvas.width) p.x = 0;

            bgCtx.beginPath();
            bgCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            bgCtx.fillStyle = `rgba(243, 229, 171, ${p.alpha})`;
            bgCtx.shadowBlur = 4;
            bgCtx.shadowColor = '#d4af37';
            bgCtx.fill();
        });

        requestAnimationFrame(renderAmbient);
    }
    renderAmbient();

    // --- 2. Rain Animation for Book 1 ---
    const rainCanvas = document.getElementById('rain-canvas');
    const rainCtx = rainCanvas.getContext('2d');

    function resizeRainCanvas() {
        rainCanvas.width = window.innerWidth;
        rainCanvas.height = window.innerHeight;
    }
    resizeRainCanvas();
    window.addEventListener('resize', resizeRainCanvas);

    const raindrops = Array.from({ length: 60 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        length: Math.random() * 20 + 10,
        speed: Math.random() * 4 + 3,
        opacity: Math.random() * 0.4 + 0.1
    }));

    function renderRain() {
        rainCtx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
        
        raindrops.forEach(drop => {
            drop.y += drop.speed;
            if (drop.y > rainCanvas.height) {
                drop.y = -20;
                drop.x = Math.random() * window.innerWidth;
            }

            rainCtx.beginPath();
            rainCtx.moveTo(drop.x, drop.y);
            rainCtx.lineTo(drop.x - 1, drop.y + drop.length);
            rainCtx.strokeStyle = `rgba(174, 219, 245, ${drop.opacity})`;
            rainCtx.lineWidth = 1.2;
            rainCtx.stroke();
        });

        requestAnimationFrame(renderRain);
    }
    renderRain();

    // --- 3. 3D Interactive Flower Engine (Three.js Rose/Tulip Integration) ---
    (function () {
        'use strict';

        var stage = document.getElementById('flower-container');
        var canvas = document.getElementById('gl');
        var btn = document.getElementById('toggle');
        var slider = document.getElementById('bloom');
        var countEl = document.getElementById('count');
        var flowerStatus = document.getElementById('flower-status');
        var btnText = document.getElementById('btn-text');
        var touchHint = document.getElementById('touch-hint');
        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        var renderer;
        try {
            if (!window.THREE) throw new Error('three missing');
            renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        } catch (err) {
            return;
        }
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.outputEncoding = THREE.sRGBEncoding;

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);

        var TAU = Math.PI * 2;
        var GOLDEN = 137.50776 * Math.PI / 180;
        function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }
        function smooth(a, b, x) { var t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); }
        function ease(t) { t = clamp01(t); return t * t * t * (t * (t * 6 - 15) + 10); }
        function mix(a, b, t) { return a + (b - a) * t; }
        function rgb(hex) { var c = new THREE.Color(hex).convertSRGBToLinear(); return [c.r, c.g, c.b]; }
        function lerp3(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
        function mulberry32(a) {
            return function () {
                a |= 0; a = a + 0x6D2B79F5 | 0;
                var t = Math.imul(a ^ a >>> 15, 1 | a);
                t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
                return ((t ^ t >>> 14) >>> 0) / 4294967296;
            };
        }

        function profileRose(v) {
            var body = 0.30 + 0.70 * Math.sin(Math.min(1, v / 0.7) * Math.PI / 2);
            var t = Math.max(0, (v - 0.7) / 0.3);
            return body * Math.sqrt(Math.max(0, 1 - Math.pow(t, 2.4)));
        }
        function profileSepal(v) {
            return Math.pow(1 - v, 0.75) * (0.35 + 0.65 * Math.sin(Math.min(1, v / 0.3) * Math.PI / 2));
        }
        function profileLeaf(v) {
            return Math.pow(Math.sin(Math.PI * Math.pow(v, 0.75)), 0.9);
        }

        var PALETTES = [
            { base: 0x2a0208, mid: 0x7a0820, tip: 0xb3123a, edge: 0xe8466a, glow: 0xff3a5c, rim: 0xff4a6a },
            { base: 0x5e2434, mid: 0xd4788e, tip: 0xf0aebd, edge: 0xffe0e6, glow: 0xff9ab0, rim: 0xffb0c2 },
            { base: 0x4d3000, mid: 0xcf8c14, tip: 0xf2bd3a, edge: 0xfff0a8, glow: 0xffb020, rim: 0xffc84a },
            { base: 0x1a0830, mid: 0x5f2698, tip: 0x8f55cc, edge: 0xd9b8ff, glow: 0xa066ff, rim: 0xb68cff },
            { base: 0x5e5646, mid: 0xe2d9c2, tip: 0xf8f2e4, edge: 0xffffff, glow: 0xfff0d0, rim: 0xfff3dc }
        ];
        var P_BASE, P_MID, P_TIP, P_EDGE;
        function applyPaletteColors(p) {
            P_BASE = rgb(p.base); P_MID = rgb(p.mid); P_TIP = rgb(p.tip); P_EDGE = rgb(p.edge);
        }
        applyPaletteColors(PALETTES[0]);

        function petalColor(u, v, f, seed) {
            var c = v < 0.55 ? lerp3(P_BASE, P_MID, smooth(0, 0.55, v)) : lerp3(P_MID, P_TIP, smooth(0.55, 1, v));
            var e = Math.pow(Math.abs(u), 2.5) * smooth(0.45, 1, v) * 0.5;
            c = lerp3(c, P_EDGE, e);
            var vein = 1 - 0.06 * Math.sin(u * 14 + seed * 9) * smooth(0.1, 0.6, v);
            var k = (0.5 + 0.5 * Math.pow(f, 0.5)) * (0.94 + 0.12 * seed) * vein;
            return [c[0] * k, c[1] * k, c[2] * k];
        }
        var S_BASE = rgb(0x16401f), S_TIP = rgb(0x5aa352);
        function sepalColor(u, v) {
            var c = lerp3(S_BASE, S_TIP, smooth(0, 1, v));
            var m = 1 + 0.25 * (1 - smooth(0, 0.12, Math.abs(u)));
            return [c[0] * m, c[1] * m, c[2] * m];
        }
        var L_BASE = rgb(0x153d20), L_TIP = rgb(0x3f8c3e), L_RIB = rgb(0x9bd08a);
        function leafColor(u, v) {
            var c = lerp3(L_BASE, L_TIP, smooth(0, 1, v));
            c = lerp3(c, L_RIB, 0.45 * (1 - smooth(0, 0.07, Math.abs(u))) * smooth(0, 0.3, v));
            return c;
        }

        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        var rimUniform = { value: new THREE.Color(0xff4a6a).convertSRGBToLinear() };
        var petalMat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.6, metalness: 0 });
        petalMat.onBeforeCompile = function (shader) {
            shader.uniforms.uRim = rimUniform;
            shader.fragmentShader = 'uniform vec3 uRim;\n' + shader.fragmentShader.replace(
                '#include <emissivemap_fragment>',
                '#include <emissivemap_fragment>\n' +
                'float rimF = pow(1.0 - clamp(abs(dot(normalize(vNormal), normalize(vViewPosition))), 0.0, 1.0), 3.0);\n' +
                'totalEmissiveRadiance += uRim * rimF * 0.35;'
            );
        };
        var greenMat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.7, metalness: 0 });
        var stemMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(0x2a6a38).convertSRGBToLinear(), side: THREE.DoubleSide, roughness: 0.75, metalness: 0 });
        var thornMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(0x5a1a20).convertSRGBToLinear(), roughness: 0.7 });

        scene.add(new THREE.HemisphereLight(0xffe4e8, 0x3b0a16, 0.45));
        var key = new THREE.DirectionalLight(0xfff1e6, 0.95); key.position.set(3, 5, 4); scene.add(key);
        var rim = new THREE.DirectionalLight(0x8fe6c8, 0.75); rim.position.set(-4, 2.5, -3.5); scene.add(rim);

        function makeBlade(o, material) {
            var nu = o.nu, nv = o.nv;
            var count = (nu + 1) * (nv + 1);
            var pos = new Float32Array(count * 3);
            var col = new Float32Array(count * 3);
            var idx = [];
            for (var j = 0; j <= nv; j++) {
                for (var i = 0; i <= nu; i++) {
                    var c = o.colorAt((i / nu) * 2 - 1, j / nv);
                    var k = (j * (nu + 1) + i) * 3;
                    col[k] = c[0]; col[k + 1] = c[1]; col[k + 2] = c[2];
                }
            }
            for (var jj = 0; jj < nv; jj++) {
                for (var ii = 0; ii < nu; ii++) {
                    var a = jj * (nu + 1) + ii, b = a + 1, c2 = a + nu + 1, d = c2 + 1;
                    idx.push(a, c2, b, b, c2, d);
                }
            }
            var geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
            geo.setIndex(idx);
            var mesh = new THREE.Mesh(geo, material);
            mesh.frustumCulled = false;
            return { o: o, geo: geo, pos: pos, col: col, mesh: mesh };
        }

        function updateBlade(b, open, wob) {
            var o = b.o, nu = o.nu, nv = o.nv, pos = b.pos;
            var L = o.size, W = o.size * o.wScale;
            var tilt = mix(o.tiltC, o.tiltO, open) + wob;
            var curl = mix(o.curlC, o.curlO, open);
            var y = 0, r = 0, dv = 1 / nv;
            var cp = Math.cos(o.phi), sp = Math.sin(o.phi);
            for (var j = 0; j <= nv; j++) {
                var v = j * dv;
                var th = tilt + curl * Math.pow(v, 1.5);
                var s = Math.sin(th), c = Math.cos(th);
                var hw = W * o.profile(v);
                var ruf = o.ruffle * open * smooth(0.3, 1, v) * Math.sin(v * 10 + o.seed * TAU);
                var tipFlare = smooth(0.5, 1, v);
                for (var i = 0; i <= nu; i++) {
                    var u = (i / nu) * 2 - 1, au = Math.abs(u), e = u * u;
                    var x = u * hw, d;
                    if (o.flat) {
                        d = W * (o.fold * au + o.cup * e);
                    } else {
                        d = W * (o.cup * e * (1 - 0.55 * open) - o.flare * open * e * tipFlare + ruf * au * au * au);
                    }
                    var yy = y + d * s, rr = r - d * c;
                    var rad = o.r0 + rr; if (rad < 0.03) rad = 0.03;
                    var px, pz;
                    if (o.flat) {
                        px = rad * cp - x * sp;
                        pz = rad * sp + x * cp;
                    } else {
                        var wd = Math.max(rad, 0.1) * (1 + 0.7 * open);
                        var psi = 1.5 * Math.tanh(x / (wd * 1.5));
                        var a = o.phi + psi;
                        px = rad * Math.cos(a);
                        pz = rad * Math.sin(a);
                    }
                    var k = (j * (nu + 1) + i) * 3;
                    pos[k] = px; pos[k + 1] = o.y0 + yy; pos[k + 2] = pz;
                }
                y += c * L * dv;
                r += s * L * dv;
            }
            b.geo.attributes.position.needsUpdate = true;
            b.geo.computeVertexNormals();
        }

        var plant = new THREE.Group();
        scene.add(plant);

        var inner = new THREE.PointLight(0xff3a5c, 0.9, 2.6, 1.5);
        inner.position.set(0, 0.35, 0);
        plant.add(inner);

        var N = 48, SEG_U = 22, SEG_V = 18;
        var rnd = mulberry32(7);
        var blades = [];
        var shownCount = -1;

        for (var i = 0; i < N; i++) {
            (function (i) {
                var f = i / (N - 1);
                var seed = rnd();
                var o = {
                    nu: SEG_U, nv: SEG_V,
                    size: 0.40 + 0.62 * Math.pow(f, 0.9),
                    wScale: 0.58,
                    profile: profileRose,
                    r0: 0.03 + 0.32 * Math.pow(f, 1.1),
                    y0: -0.09 * f * f,
                    phi: i * GOLDEN,
                    tiltC: 0.06 + 0.10 * f,
                    tiltO: 0.10 + 0.76 * Math.pow(f, 1.2),
                    curlC: -(0.30 + 0.62 * f),
                    curlO: -0.10 + 0.56 * f,
                    cup: 0.03 + 0.03 * seed,
                    flare: 0.10 + 0.14 * f,
                    ruffle: 0.02,
                    fold: 0, flat: false, seed: seed,
                    colorAt: function (u, v) { return petalColor(u, v, f, seed); }
                };
                var b = makeBlade(o, petalMat);
                plant.add(b.mesh);
                blades.push({ b: b, f: f, delay: (1 - f) * 0.58 + seed * 0.03, dur: 0.4, petal: true, last: -1 });
            })(i);
        }

        for (var k = 0; k < 5; k++) {
            var so = {
                nu: 8, nv: 12, size: 0.62, wScale: 0.2, profile: profileSepal,
                r0: 0.2, y0: -0.07, phi: k * TAU / 5 + 0.3,
                tiltC: 0.38, tiltO: 2.0, curlC: -0.12, curlO: 0.25,
                cup: 0.15, flare: 0, ruffle: 0, fold: 0, flat: false, seed: k / 5,
                colorAt: sepalColor
            };
            var sb = makeBlade(so, greenMat);
            plant.add(sb.mesh);
            blades.push({ b: sb, delay: 0, dur: 0.55, petal: false, last: -1 });
        }

        var cupMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.09, 0.26, 28, 1, true), stemMat);
        cupMesh.position.y = -0.19; plant.add(cupMesh);
        var hip = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), stemMat);
        hip.position.y = -0.36; hip.scale.set(1, 0.9, 1); plant.add(hip);

        var stemCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, -0.1, 0),
            new THREE.Vector3(0.05, -0.8, 0.03),
            new THREE.Vector3(-0.06, -1.6, -0.04),
            new THREE.Vector3(0.08, -2.4, 0.03),
            new THREE.Vector3(0.02, -3.3, 0)
        ]);
        plant.add(new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 60, 0.055, 10, false), stemMat));

        var camTargetY = 0.35, dist = 5.6, elevation = 0.32;
        function resize() {
            var w = Math.max(1, stage.clientWidth), h = Math.max(1, stage.clientHeight);
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            var half = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
            dist = Math.max(5.2, 3.5 / (2 * half * camera.aspect));
            camera.updateProjectionMatrix();
        }
        if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);
        window.addEventListener('resize', resize);
        resize();

        var bloomVal = 0, target = 0, hold = 0.9;
        var scrubbing = false;
        var rotY = -0.4, spinVel = 0, autoSpin = 0.14;
        var dragging = false, moved = 0, downT = 0, lastX = 0, lastY = 0, lastT = 0;
        var time = 0;

        function syncUI() {
            btnText.textContent = target >= 0.5 ? 'إغلاق الزهرة' : 'إزهار الزهرة';
            if (target >= 0.5) {
                flowerStatus.textContent = "الزهرة في أوج تفتحها ✨";
            } else {
                flowerStatus.textContent = "الزهرة في حالة ذبول 🌿";
            }
        }

        function toggle() {
            hold = 0;
            target = target >= 0.5 ? 0 : 1;
            syncUI();
        }
        syncUI();
        btn.addEventListener('click', toggle);

        slider.addEventListener('input', function () {
            scrubbing = true; hold = 0;
            bloomVal = target = parseFloat(slider.value);
            syncUI();
            if (touchHint) touchHint.style.opacity = '0';
        });
        slider.addEventListener('pointerup', function () { scrubbing = false; });

        canvas.addEventListener('pointerdown', function (e) {
            dragging = true; moved = 0;
            downT = lastT = performance.now();
            lastX = e.clientX; lastY = e.clientY;
            try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
            canvas.classList.add('dragging');
            if (touchHint) touchHint.style.opacity = '0';
        });
        canvas.addEventListener('pointermove', function (e) {
            if (!dragging) return;
            var now = performance.now();
            var dx = e.clientX - lastX, dy = e.clientY - lastY;
            moved += Math.abs(dx) + Math.abs(dy);
            rotY += dx * 0.008;
            elevation = Math.min(1.0, Math.max(0.02, elevation + dy * 0.004));
            var dtm = Math.max(8, now - lastT) / 1000;
            spinVel = Math.max(-6, Math.min(6, (dx * 0.008) / dtm));
            lastX = e.clientX; lastY = e.clientY; lastT = now;
        });
        function endDrag() {
            if (!dragging) return;
            dragging = false;
            canvas.classList.remove('dragging');
            if (moved < 6 && performance.now() - downT < 350) toggle();
        }
        canvas.addEventListener('pointerup', endDrag);
        canvas.addEventListener('pointercancel', endDrag);

        var last = performance.now();
        function frame(now) {
            var dt = Math.min(0.05, (now - last) / 1000);
            last = now; time += dt;

            if (!scrubbing) {
                if (hold > 0) {
                    hold -= dt;
                } else if (bloomVal < target) {
                    bloomVal = Math.min(target, bloomVal + dt / 8);
                } else if (bloomVal > target) {
                    bloomVal = Math.max(target, bloomVal - dt / 5);
                }
                slider.value = bloomVal.toFixed(3);
            }

            var openCount = 0;
            for (var n = 0; n < blades.length; n++) {
                var bl = blades[n];
                var open = ease((bloomVal - bl.delay) / bl.dur);
                var wob = bl.petal ? 0.025 * open * Math.sin(time * 0.9 + n * 0.7) : 0;
                if (bl.petal && open >= 0.5) openCount++;
                if (Math.abs(open - bl.last) > 0.0002 || wob !== 0) {
                    updateBlade(bl.b, open, wob);
                    bl.last = open;
                }
            }

            if (openCount !== shownCount) {
                shownCount = openCount;
                countEl.textContent = String(openCount);
            }

            if (!dragging) rotY += spinVel * dt;
            spinVel += (autoSpin - spinVel) * (1 - Math.exp(-dt * 1.5));
            plant.rotation.y = rotY;
            plant.rotation.z = Math.sin(time * 0.5) * 0.015;
            plant.rotation.x = Math.sin(time * 0.37) * 0.012;

            camera.position.set(0, camTargetY + dist * Math.sin(elevation), dist * Math.cos(elevation));
            camera.lookAt(0, camTargetY, 0);
            renderer.render(scene, camera);
            requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    })();

    // --- 4. Mobile Book Carousel & Correct RTL Drag ---
    const track = document.getElementById('carousel-track');
    const cards = Array.from(track.querySelectorAll('.book-card'));
    const dotsContainer = document.getElementById('carousel-dots');
    
    let currentIndex = 0;
    let carouselStartX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let isDragging = false;
    let hasMoved = false;

    cards.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (idx === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(idx));
        dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.querySelectorAll('.dot'));

    function updateCarousel() {
        const cardWidth = 160 + 16;
        const containerWidth = track.parentElement.offsetWidth;
        const centerOffset = (containerWidth - 160) / 2;
        
        currentTranslate = currentIndex * cardWidth - centerOffset;
        prevTranslate = currentTranslate;
        
        track.style.transform = `translateX(${currentTranslate}px)`;

        cards.forEach((card, idx) => {
            card.classList.toggle('active', idx === currentIndex);
        });

        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentIndex);
        });
    }

    function goToSlide(index) {
        currentIndex = Math.max(0, Math.min(index, cards.length - 1));
        updateCarousel();
    }

    const container = document.getElementById('carousel-container');

    container.addEventListener('touchstart', (e) => {
        isDragging = true;
        hasMoved = false;
        carouselStartX = e.touches[0].clientX;
        track.style.transition = 'none';
    }, {passive: true});

    container.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const currentPosition = e.touches[0].clientX;
        const diff = currentPosition - carouselStartX;
        if (Math.abs(diff) > 5) hasMoved = true;
        track.style.transform = `translateX(${prevTranslate - diff}px)`;
    }, {passive: true});

    container.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        track.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
        
        const movedBy = currentTranslate - prevTranslate;
        if (movedBy > 40 && currentIndex < cards.length - 1) {
            currentIndex += 1;
        } else if (movedBy < -40 && currentIndex > 0) {
            currentIndex -= 1;
        }
        updateCarousel();
    });

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        hasMoved = false;
        carouselStartX = e.clientX;
        track.style.transition = 'none';
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const currentPosition = e.clientX;
        const diff = currentPosition - carouselStartX;
        if (Math.abs(diff) > 5) hasMoved = true;
        track.style.transform = `translateX(${prevTranslate - diff}px)`;
    });

    container.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        track.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
        
        const movedBy = currentTranslate - prevTranslate;
        if (movedBy > 40 && currentIndex < cards.length - 1) {
            currentIndex += 1;
        } else if (movedBy < -40 && currentIndex > 0) {
            currentIndex -= 1;
        }
        updateCarousel();
    });

    container.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            track.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
            updateCarousel();
        }
    });

    updateCarousel();
    window.addEventListener('resize', updateCarousel);

    // --- 5. Book Pages & Auto Music Player ---
    const bookPages = {
        1: { page: document.getElementById('book-page-1'), audio: document.getElementById('bg-audio-1') },
        2: { page: document.getElementById('book-page-2'), audio: document.getElementById('bg-audio-2') },
        3: { page: document.getElementById('book-page-3'), audio: document.getElementById('bg-audio-3') },
        4: { page: document.getElementById('book-page-4'), audio: document.getElementById('bg-audio-4') },
        5: { page: document.getElementById('book-page-5'), audio: document.getElementById('bg-audio-5') }
    };

    cards.forEach((card) => {
        card.addEventListener('click', () => {
            if (hasMoved) return;
            const bookId = card.getAttribute('data-book');
            const target = bookPages[bookId];

            if (target && target.page) {
                target.page.classList.add('active');
                if (navigator.vibrate) navigator.vibrate(25);
                if (target.audio) {
                    target.audio.play().catch(err => console.log("Audio autoplay prevented:", err));
                }
            }
        });
    });

    for (let id in bookPages) {
        const closeBtn = document.querySelector(`[data-close-book="${id}"]`);
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                const target = bookPages[id];
                if (target && target.page) {
                    target.page.classList.remove('active');
                    if (target.audio && !target.audio.paused) {
                        target.audio.pause();
                        target.audio.currentTime = 0;
                    }
                }
            });
        }
    }

    // --- 6. Finale Matrix Rain & Particle Countdown ---
    const btnFinale = document.getElementById('btn-finale');
    const finaleScreen = document.getElementById('finale-screen');
    const btnCloseFinale = document.getElementById('btn-close-finale');
    const matrixCanvas = document.getElementById('finale-matrix-canvas');
    const particleCanvas = document.getElementById('finale-particle-canvas');

    if (btnFinale && finaleScreen && matrixCanvas && particleCanvas) {
        const mCtx = matrixCanvas.getContext('2d');
        const pCtx = particleCanvas.getContext('2d');

        let matrixAnimId = null;
        let particleAnimId = null;
        let sequenceTimers = [];
        let isFinaleRunning = false;

        const matrixChars = 'HAPPYBIRTHDAYTOMALAK01❤✦✧0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const fontSize = 14;
        let columns = 0;
        let drops = [];

        function resizeFinaleCanvases() {
            matrixCanvas.width = window.innerWidth;
            matrixCanvas.height = window.innerHeight;
            particleCanvas.width = window.innerWidth;
            particleCanvas.height = window.innerHeight;

            columns = Math.floor(matrixCanvas.width / fontSize);
            drops = new Array(columns).fill(0).map(() => Math.floor(Math.random() * -40));
        }

        function renderMatrixRain() {
            if (!isFinaleRunning) return;

            mCtx.fillStyle = 'rgba(0, 0, 0, 0.08)';
            mCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

            mCtx.font = `bold ${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const char = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
                const x = i * fontSize;
                const y = drops[i] * fontSize;

                mCtx.fillStyle = Math.random() > 0.92 ? '#ffc2df' : '#ff5ea8';
                mCtx.fillText(char, x, y);

                if (y > matrixCanvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }

            matrixAnimId = requestAnimationFrame(renderMatrixRain);
        }

        let particles = [];
        const MAX_PARTICLES = 2500;

        function initParticles() {
            particles = [];
            for (let i = 0; i < MAX_PARTICLES; i++) {
                particles.push({
                    x: Math.random() * particleCanvas.width,
                    y: Math.random() * particleCanvas.height,
                    tx: particleCanvas.width / 2,
                    ty: particleCanvas.height / 2,
                    vx: 0,
                    vy: 0,
                    size: Math.random() * 1.8 + 1.4,
                    active: false
                });
            }
        }

        function getShapePoints(type, label) {
            const offCanvas = document.createElement('canvas');
            const offCtx = offCanvas.getContext('2d');
            const w = particleCanvas.width;
            const h = particleCanvas.height;
            offCanvas.width = w;
            offCanvas.height = h;

            offCtx.fillStyle = '#ffffff';
            offCtx.textBaseline = 'middle';
            offCtx.textAlign = 'center';

            if (type === 'heart') {
                const size = Math.min(w, h) * 0.013;
                const cx = w / 2;
                const cy = h / 2 - h * 0.02;

                offCtx.beginPath();
                for (let t = 0; t <= Math.PI * 2; t += 0.01) {
                    const hx = 16 * Math.pow(Math.sin(t), 3);
                    const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
                    const px = cx + hx * size;
                    const py = cy + hy * size;
                    if (t === 0) offCtx.moveTo(px, py);
                    else offCtx.lineTo(px, py);
                }
                offCtx.closePath();
                offCtx.fill();
            } else {
                const isNumber = label.length === 1;
                let baseFontSize = isNumber
                    ? Math.min(w, h) * 0.32
                    : Math.min((w * 0.75) / (label.length * 0.55), h * 0.16);

                offCtx.font = `900 ${Math.floor(baseFontSize)}px "Arial Black", "Tajawal", sans-serif`;
                
                const metrics = offCtx.measureText(label);
                const textWidth = metrics.width;
                
                if (textWidth > w * 0.75) {
                    baseFontSize = baseFontSize * ((w * 0.75) / textWidth);
                    offCtx.font = `900 ${Math.floor(baseFontSize)}px "Arial Black", "Tajawal", sans-serif`;
                }

                offCtx.fillText(label, w / 2, h / 2);
            }

            const imgData = offCtx.getImageData(0, 0, w, h).data;
            const points = [];
            const gap = w < 600 ? 3 : 4;

            for (let y = 0; y < h; y += gap) {
                for (let x = 0; x < w; x += gap) {
                    const alpha = imgData[(y * w + x) * 4 + 3];
                    if (alpha > 128) {
                        points.push({ x, y });
                    }
                }
            }
            return points;
        }

        function setTargetShape(type, label) {
            const pts = getShapePoints(type, label);
            if (pts.length === 0) return;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                if (i < pts.length) {
                    p.tx = pts[i].x;
                    p.ty = pts[i].y;
                    p.active = true;
                } else {
                    const randPt = pts[Math.floor(Math.random() * pts.length)];
                    p.tx = randPt.x + (Math.random() - 0.5) * 2;
                    p.ty = randPt.y + (Math.random() - 0.5) * 2;
                    p.active = true;
                }
            }
        }

        function scatterParticles() {
            for (let i = 0; i < particles.length; i++) {
                particles[i].tx = Math.random() * particleCanvas.width;
                particles[i].ty = Math.random() * particleCanvas.height;
                particles[i].active = false;
            }
        }

        function renderParticles() {
            if (!isFinaleRunning) return;

            pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

            pCtx.save();
            pCtx.shadowColor = '#ff5ea8';
            pCtx.shadowBlur = 12;
            pCtx.fillStyle = '#ff77b7';

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                const dx = p.tx - p.x;
                const dy = p.ty - p.y;

                p.vx = p.vx * 0.78 + dx * 0.14;
                p.vy = p.vy * 0.78 + dy * 0.14;
                p.x += p.vx;
                p.y += p.vy;

                if (p.active) {
                    pCtx.beginPath();
                    pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    pCtx.fill();
                }
            }
            pCtx.restore();

            particleAnimId = requestAnimationFrame(renderParticles);
        }

        function clearSequenceTimers() {
            sequenceTimers.forEach(t => clearTimeout(t));
            sequenceTimers = [];
        }

        function startFinaleShow() {
            isFinaleRunning = true;
            finaleScreen.classList.add('active');
            finaleScreen.setAttribute('aria-hidden', 'false');
            if (navigator.vibrate) navigator.vibrate(35);

            resizeFinaleCanvases();
            mCtx.fillStyle = '#000000';
            mCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

            initParticles();
            scatterParticles();

            cancelAnimationFrame(matrixAnimId);
            cancelAnimationFrame(particleAnimId);
            renderMatrixRain();
            renderParticles();

            clearSequenceTimers();

            const steps = [
                { delay: 600,  type: 'text',  label: '3' },
                { delay: 1800, type: 'text',  label: '2' },
                { delay: 3000, type: 'text',  label: '1' },
                { delay: 4300, type: 'text',  label: 'HAPPY' },
                { delay: 5800, type: 'text',  label: 'BIRTHDAY' },
                { delay: 7300, type: 'text',  label: 'TO' },
                { delay: 8600, type: 'text',  label: 'MALAK' },
                { delay: 10300, type: 'heart', label: 'HEART' }
            ];

            steps.forEach(step => {
                const timer = setTimeout(() => {
                    if (!isFinaleRunning) return;
                    setTargetShape(step.type, step.label);
                }, step.delay);
                sequenceTimers.push(timer);
            });
        }

        function stopFinaleShow() {
            isFinaleRunning = false;
            clearSequenceTimers();
            cancelAnimationFrame(matrixAnimId);
            cancelAnimationFrame(particleAnimId);
            finaleScreen.classList.remove('active');
            finaleScreen.setAttribute('aria-hidden', 'true');
        }

        btnFinale.addEventListener('click', startFinaleShow);
        btnCloseFinale.addEventListener('click', stopFinaleShow);
        window.addEventListener('resize', () => {
            if (isFinaleRunning) resizeFinaleCanvases();
        });
    }

});
