// Check if mobile device
const isMobile = /Mobi|Android/i.test(navigator.userAgent);

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));
document.getElementById('container').appendChild(renderer.domElement);

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 30;
controls.maxDistance = 300;
controls.enableZoom = !isMobile;

// Camera position
camera.position.set(0, 40, 120);
controls.update();

// Lighting
const ambientLight = new THREE.AmbientLight(0x222222);
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xffffff, 1, 300);
scene.add(sunLight);

// Stars background
const createStars = () => {
    const count = isMobile ? 3000 : 8000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 2000;
        positions[i3 + 1] = (Math.random() - 0.5) * 2000;
        positions[i3 + 2] = (Math.random() - 0.5) * 2000;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: isMobile ? 0.8 : 1.2,
        transparent: true,
        opacity: 0.8
    });

    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
};
createStars();

// Texture loader
const textureLoader = new THREE.TextureLoader();

// Function to create planet material with textures
const createPlanetMaterial = (planet) => {
    // Base textures for each planet
    const textures = {
        "Sun": {
            map: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/sun_surface.jpg',
            emissive: 0xFDB813,
            emissiveIntensity: 1.0,
            bumpScale: 0.05
        },
        "Mercury": {
            map: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/mercury_map.jpg',
            bumpMap: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/mercury_normal.jpg',
            bumpScale: 0.1
        },
        "Venus": {
            map: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/venus_surface_2k.jpg',
            bumpMap: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/venus_normal_2k.jpg',
            bumpScale: 0.2
        },
        "Earth": {
            map: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
            bumpMap: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg',
            specularMap: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg',
            bumpScale: 0.3
        },
        "Mars": {
            map: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/mars_1k_color.jpg',
            bumpMap: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/mars_1k_topo.jpg',
            bumpScale: 0.4
        },
        "Jupiter": {
            map: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/jupiter_2k.jpg',
            bumpScale: 0.5
        },
        "Saturn": {
            map: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/saturn_2k.jpg',
            bumpScale: 0.3
        },
        "Uranus": {
            map: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/uranus_2k.jpg',
            bumpScale: 0.2
        },
        "Neptune": {
            map: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/neptune_2k.jpg',
            bumpScale: 0.2
        }
    };

    const planetTextures = textures[planet.name] || {};

    const material = new THREE.MeshPhongMaterial({
        color: planet.color,
        emissive: planetTextures.emissive || (planet.emissive ? planet.color : 0x000000),
        emissiveIntensity: planetTextures.emissiveIntensity || (planet.emissive ? 0.5 : 0),
        shininess: 30,
        specular: planet.name === "Earth" ? 0x333333 : 0x111111
    });

    // Load textures if available
    if (planetTextures.map) {
        textureLoader.load(planetTextures.map, (texture) => {
            material.map = texture;
            material.needsUpdate = true;
        });
    }

    if (planetTextures.bumpMap) {
        textureLoader.load(planetTextures.bumpMap, (texture) => {
            material.bumpMap = texture;
            material.bumpScale = planetTextures.bumpScale || 0.05;
            material.needsUpdate = true;
        });
    }

    if (planetTextures.specularMap) {
        textureLoader.load(planetTextures.specularMap, (texture) => {
            material.specularMap = texture;
            material.needsUpdate = true;
        });
    }

    return material;
};

// Celestial bodies data
const planets = [
    {
        name: "Sun", radius: 12, distance: 0, color: 0xFDB813,
        rotationSpeed: 0.002, orbitSpeed: 0.04, emissive: true,
        info: "The star at the center of our solar system",
        surface: "Photosphere temperature: 5,500°C, with granulation patterns from convection"
    },
    {
        name: "Mercury", radius: 3, distance: 35, color: 0xA9A9A9,
        rotationSpeed: 0.004, orbitSpeed: 0.04,
        info: "Smallest planet with extreme temperature variations",
        surface: "Basaltic rock with smooth plains and intercrater plains"
    },
    {
        name: "Venus", radius: 5, distance: 50, color: 0xE6C229,
        rotationSpeed: 0.002, orbitSpeed: 0.015,
        info: "Hottest planet with surface temperatures over 450°C",
        surface: "Basaltic rock with extensive volcanic features"
    },
    {
        name: "Earth", radius: 5.2, distance: 70, color: 0x6B93D6,
        rotationSpeed: 0.02, orbitSpeed: 0.01,
        info: "Our home planet with liquid water and life",
        surface: "Oceanic crust (basalt) and continental crust (granite)"
    },
    {
        name: "Mars", radius: 3.5, distance: 90, color: 0x993D00,
        rotationSpeed: 0.018, orbitSpeed: 0.008,
        info: "The Red Planet with iron oxide surface",
        surface: "Basaltic rock with iron oxide giving red color"
    },
    {
        name: "Jupiter", radius: 11, distance: 120, color: 0xB07F35,
        rotationSpeed: 0.04, orbitSpeed: 0.002,
        info: "Largest planet with Great Red Spot storm",
        surface: "No solid surface, cloud layers of ammonia and water"
    },
    {
        name: "Saturn", radius: 9, distance: 150, color: 0xE5D7BD,
        rotationSpeed: 0.038, orbitSpeed: 0.0009, hasRing: true,
        info: "Known for its spectacular ring system",
        surface: "No solid surface, upper atmosphere of ammonia crystals"
    },
    {
        name: "Uranus", radius: 6, distance: 180, color: 0xD1E7E7,
        rotationSpeed: 0.03, orbitSpeed: 0.0004,
        info: "Rotates on its side with extreme axial tilt",
        surface: "No solid surface, upper atmosphere of methane"
    },
    {
        name: "Neptune", radius: 5.8, distance: 210, color: 0x5B5DDF,
        rotationSpeed: 0.032, orbitSpeed: 0.0001,
        info: "Windiest planet with supersonic winds",
        surface: "No solid surface, mantle of water and methane ices"
    }
];

// Create celestial bodies
const celestialBodies = [];
const orbitLines = [];
let globalSpeedFactor = 1;
const planetSpeedFactors = {};
let hoveredPlanet = null;
let activePlanet = null;
let hoverTimeout = null;
let clickTimeout = null;

// Create UI controls for each planet
const planetControlsContainer = document.getElementById('planetControls');
planets.forEach((planet, index) => {
    // Skip the Sun for individual controls
    if (index === 0) return;

    planetSpeedFactors[planet.name] = 1;

    const controlDiv = document.createElement('div');
    controlDiv.className = 'planet-control';

    const colorDiv = document.createElement('div');
    colorDiv.className = 'planet-color';
    colorDiv.style.backgroundColor = `#${planet.color.toString(16).padStart(6, '0')}`;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'planet-name';
    nameSpan.textContent = planet.name;

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '5';
    slider.step = '0.1';
    slider.value = '1';
    slider.className = 'planet-speed';
    slider.dataset.planet = planet.name;

    const valueSpan = document.createElement('span');
    valueSpan.className = 'value-display';
    valueSpan.textContent = '1.0x';
    valueSpan.id = `${planet.name.toLowerCase()}SpeedValue`;

    controlDiv.appendChild(colorDiv);
    controlDiv.appendChild(nameSpan);
    controlDiv.appendChild(slider);
    controlDiv.appendChild(valueSpan);

    planetControlsContainer.appendChild(controlDiv);

    // Add event listener for planet speed control
    slider.addEventListener('input', (e) => {
        const speed = parseFloat(e.target.value);
        planetSpeedFactors[planet.name] = speed;
        document.getElementById(`${planet.name.toLowerCase()}SpeedValue`).textContent = speed.toFixed(1) + 'x';
    });
});

// Create planets and orbits with optimized geometry
planets.forEach((planet) => {
    const segments = isMobile ? 32 : 64; // Increased segments for better texture mapping
    const geometry = new THREE.SphereGeometry(planet.radius, segments, segments);
    const material = createPlanetMaterial(planet);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.planet = planet;

    if (planet.hasRing) {
        const ringGeometry = new THREE.RingGeometry(planet.radius * 1.5, planet.radius * 2.5, 64);
        const ringMaterial = new THREE.MeshPhongMaterial({
            color: 0xC0C0C0,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7,
            bumpMap: textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/saturn_ring_alpha.png'),
            bumpScale: 0.1
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        mesh.add(ring);
    }

    // Create orbit line
    if (planet.distance > 0) {
        const orbitGeometry = new THREE.BufferGeometry();
        const points = [];
        const segments = isMobile ? 32 : 64;
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                Math.cos(angle) * planet.distance,
                0,
                Math.sin(angle) * planet.distance
            ));
        }
        orbitGeometry.setFromPoints(points);
        const orbitMaterial = new THREE.LineBasicMaterial({
            color: 0x4a6cf7,
            transparent: true,
            opacity: 0.3
        });
        const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
        scene.add(orbit);
        orbitLines.push(orbit);
    }

    mesh.position.x = planet.distance;
    scene.add(mesh);

    celestialBodies.push({
        mesh: mesh,
        data: planet,
        angle: Math.random() * Math.PI * 2
    });
});

// Position the sun light
sunLight.position.copy(celestialBodies[0].mesh.position);

// Hide loading screen
setTimeout(() => {
    document.getElementById('loading').style.display = 'none';
}, 1500); // Increased timeout to allow textures to load

// Planet info handling
const planetInfo = document.getElementById('planetInfo');

const updatePlanetInfoPosition = (mouseX, mouseY) => {
    const offset = 15;
    planetInfo.style.left = `${Math.min(mouseX + offset, window.innerWidth - 220)}px`;
    planetInfo.style.top = `${mouseY + offset}px`;
};

const showPlanetInfo = (planet, mouseX, mouseY, isClick = false) => {
    const speed = planetSpeedFactors[planet.name] || 1;
    planetInfo.innerHTML = `
                <h3>${planet.name}</h3>
                <p>${planet.info}</p>
                ${isClick ? `
                <p><strong>Current Speed:</strong> ${(speed * globalSpeedFactor).toFixed(1)}x</p>
                <p><strong>Orbit Speed:</strong> ${(planet.orbitSpeed * speed * globalSpeedFactor).toFixed(4)}</p>
                <p><strong>Rotation Speed:</strong> ${(planet.rotationSpeed * speed * globalSpeedFactor).toFixed(4)}</p>
                ` : `
                <p><strong>Surface:</strong> ${planet.surface}</p>
                `}
            `;
    planetInfo.style.display = 'block';
    if (mouseX && mouseY) {
        updatePlanetInfoPosition(mouseX, mouseY);
    }
};

const hidePlanetInfo = () => {
    planetInfo.style.display = 'none';
};

// Highlight planet
const highlightPlanet = (planetMesh, highlight) => {
    if (highlight) {
        planetMesh.material.emissive.set(0x4a6cf7);
        planetMesh.material.emissiveIntensity = 0.3;
    } else {
        planetMesh.material.emissive.set(planetMesh.userData.planet.emissive ? planetMesh.userData.planet.color : 0x000000);
        planetMesh.material.emissiveIntensity = planetMesh.userData.planet.emissive ? 0.5 : 0;
    }
    planetMesh.material.needsUpdate = true;
};

// Handle both hover and click events
const handlePlanetInteraction = (event, isClick = false) => {
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(celestialBodies.map(body => body.mesh));

    // Clear previous hover state
    if (hoveredPlanet && !isClick) {
        highlightPlanet(hoveredPlanet, false);
        hoveredPlanet = null;
    }

    // Clear timeouts
    if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
    }
    if (clickTimeout) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
    }

    if (intersects.length > 0) {
        const planetMesh = intersects[0].object;
        const planet = planetMesh.userData.planet;

        if (isClick) {
            // Click behavior
            activePlanet = planetMesh;
            highlightPlanet(planetMesh, true);
            showPlanetInfo(planet, event.clientX, event.clientY, true);

            // Auto-hide after 3 seconds
            clickTimeout = setTimeout(() => {
                highlightPlanet(planetMesh, false);
                hidePlanetInfo();
                activePlanet = null;
            }, 3000);
        } else {
            // Hover behavior
            hoveredPlanet = planetMesh;
            highlightPlanet(planetMesh, true);

            // Show info after a short delay
            hoverTimeout = setTimeout(() => {
                if (!activePlanet) {
                    showPlanetInfo(planet, event.clientX, event.clientY);
                }
            }, 200);
        }
    } else if (!isClick && !activePlanet) {
        hidePlanetInfo();
    }
};

// Set up event listeners
if (isMobile) {
    renderer.domElement.addEventListener('click', (event) => {
        handlePlanetInteraction(event, true);
    });
} else {
    renderer.domElement.addEventListener('mousemove', (event) => {
        handlePlanetInteraction(event);
    });

    renderer.domElement.addEventListener('click', (event) => {
        handlePlanetInteraction(event, true);
    });
}

// Toggle planet controls on mobile
const toggleControlsBtn = document.getElementById('toggleControls');
const planetControls = document.getElementById('planetControls');

toggleControlsBtn.addEventListener('click', () => {
    planetControls.classList.toggle('visible');
    toggleControlsBtn.classList.toggle('rotated');
});

// Global speed control
const speedControl = document.getElementById('speedControl');
const speedValue = document.getElementById('speedValue');

speedControl.addEventListener('input', (e) => {
    globalSpeedFactor = parseFloat(e.target.value);
    speedValue.textContent = globalSpeedFactor.toFixed(1) + 'x';
});

// Reset view and speeds
document.getElementById('resetView').addEventListener('click', () => {
    // Reset camera
    controls.reset();
    camera.position.set(0, 40, 120);

    // Reset planet highlights
    if (activePlanet) {
        highlightPlanet(activePlanet, false);
        activePlanet = null;
    }
    if (hoveredPlanet) {
        highlightPlanet(hoveredPlanet, false);
        hoveredPlanet = null;
    }

    // Reset speeds
    globalSpeedFactor = 1;
    speedControl.value = 1;
    speedValue.textContent = '1.0x';

    // Reset individual planet speeds
    for (const planet in planetSpeedFactors) {
        planetSpeedFactors[planet] = 1;
    }

    // Update all sliders
    document.querySelectorAll('.planet-speed').forEach(slider => {
        slider.value = 1;
        const planetName = slider.dataset.planet;
        document.getElementById(`${planetName.toLowerCase()}SpeedValue`).textContent = '1.0x';
    });

    hidePlanetInfo();

    // Reset to default view
    setCameraView('default');
    document.querySelectorAll('.view-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('[data-view="default"]').classList.add('active');
});

// Camera view functions
const setCameraView = (view) => {
    switch (view) {
        case 'default':
            camera.position.set(0, 40, 120);
            controls.target.set(0, 0, 0);
            controls.update();
            break;
        case 'top':
            camera.position.set(0, 200, 0);
            controls.target.set(0, 0, 0);
            controls.update();
            break;
        case 'side':
            camera.position.set(200, 0, 0);
            controls.target.set(0, 0, 0);
            controls.update();
            break;
        case 'front':
            camera.position.set(0, 0, 200);
            controls.target.set(0, 0, 0);
            controls.update();
            break;
        case 'sun':
            camera.position.set(0, 0, 20);
            controls.target.set(0, 0, 0);
            controls.update();
            break;
    }
};

// Set up view buttons
document.querySelectorAll('.view-button').forEach(button => {
    button.addEventListener('click', () => {
        const view = button.dataset.view;
        setCameraView(view);

        // Update active button
        document.querySelectorAll('.view-button').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
    });
});

// Set default view as active
document.querySelector('[data-view="default"]').classList.add('active');

// Animation loop with self-rotation
const animate = () => {
    requestAnimationFrame(animate);

    // Update planet positions and rotations
    celestialBodies.forEach((body, index) => {
        if (index > 0) {
            const planetSpeed = planetSpeedFactors[body.data.name] || 1;
            body.angle += body.data.orbitSpeed * planetSpeed * globalSpeedFactor;
            body.mesh.position.x = Math.cos(body.angle) * body.data.distance;
            body.mesh.position.z = Math.sin(body.angle) * body.data.distance;
        }

        const rotationSpeed = planetSpeedFactors[body.data.name] || 1;
        body.mesh.rotation.y += body.data.rotationSpeed * rotationSpeed * globalSpeedFactor;
    });

    controls.update();
    renderer.render(scene, camera);
};

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Handle mobile touch events
if (isMobile) {
    let touchStartX = 0;
    let touchStartY = 0;

    renderer.domElement.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    renderer.domElement.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        if (Math.abs(touchEndX - touchStartX) < 10 && Math.abs(touchEndY - touchStartY) < 10) {
            const fakeEvent = {
                clientX: touchEndX,
                clientY: touchEndY
            };
            handlePlanetInteraction(fakeEvent, true);
        }
    }, { passive: true });
}

animate();
