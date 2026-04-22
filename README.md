<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Robs Delivery Express 🚀</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; background-color: #f0f2f5; color: #333; }
        .container { max-width: 900px; margin: auto; padding: 20px; }
        
        /* --- PUBLICIDAD (PÚBLICA) --- */
        .ads-header { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
        .video-box { grid-column: span 2; background: #000; border-radius: 12px; height: 280px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        video { width: 100%; height: 100%; object-fit: cover; }
        .banner-box img { width: 100%; height: 110px; object-fit: cover; border-radius: 8px; background: #ddd; }

        /* --- MENÚ DE NAVEGACIÓN --- */
        .nav-menu { display: flex; gap: 8px; margin-bottom: 20px; }
        .nav-btn { flex: 1; padding: 12px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; color: white; transition: 0.3s; }
        .btn-admin { background: #f39c12; }
        .btn-rest { background: #27ae60; }
        .btn-client { background: #3498db; }
        .nav-btn:hover { filter: brightness(1.1); transform: translateY(-2px); }

        /* --- SECCIONES --- */
        .content-section { display: none; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .active { display: block; }
        
        /* --- ESTILOS DE CLIENTES --- */
        .rest-card { border: 1px solid #eee; padding: 15px; margin-bottom: 15px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; background: #fff; }
        .rest-info h3 { margin: 0; color: #2c3e50; }
        .btn-ver { background: #3498db; color: white; padding: 8px 15px; border-radius: 5px; text-decoration: none; font-size: 14px; cursor: pointer; border:none;}

        input, textarea { width: 100%; padding: 10px; margin: 8px 0; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; }
        .status-bar { text-align: right; font-size: 13px; margin-bottom: 10px; color: #666; }
    </style>
</head>
<body>

<div class="container">
    
    <div class="ads-header">
        <div class="video-box">
            <video id="reproductorAds" autoplay muted loop playsinline poster="https://via.placeholder.com/800x280?text=Cargando+Video...">
                <source src="" id="videoSrc">
            </video>
        </div>
        <div class="banner-box"><img id="banner1" src="https://via.placeholder.com/400x110?text=Publicidad+Disponible"></div>
        <div class="banner-box"><img id="banner2" src="https://via.placeholder.com/400x110?text=Publicidad+Disponible"></div>
    </div>

    <div class="status-bar">
        <span id="userStatus">Invitado</span> | 
        <button id="btnLogin" style="cursor:pointer; border:none; background:none; color:#4285F4; font-weight:bold;">Iniciar Sesión</button>
    </div>

    <div class="nav-menu">
        <button class="nav-btn btn-client" onclick="showSection('client-sec')">🍴 Ver Restaurantes</button>
        <button class="nav-btn btn-rest" onclick="showSection('rest-sec')">🏠 Soy Dueño</button>
        <button class="nav-btn btn-admin" onclick="showSection('admin-sec')">⚙️ Admin</button>
    </div>

    <div id="client-sec" class="content-section active">
        <h2>Restaurantes en tu zona</h2>
        <div id="vistaClientes">Cargando locales...</div>
    </div>

    <div id="rest-sec" class="content-section">
        <h2>Panel de Mi Negocio</h2>
        <p><small>Debes iniciar sesión para registrar locales o subir productos.</small></p>
        <input id="restNombre" placeholder="Nombre del Restaurante">
        <input id="restProvincia" placeholder="Ciudad / Provincia">
        <button class="btn-rest" id="btnGuardarRest">Registrar Mi Local</button>
        <hr>
        <div id="gestionMenu" style="margin-top:20px;">
            <h3>Subir Producto</h3>
            <div id="statusSeleccion" style="background:#e8f5e9; padding:10px; margin-bottom:10px; border-radius:5px; font-weight:bold; color:#2e7d32;">Ningún local seleccionado</div>
            <input type="hidden" id="prodRestID">
            <input id="prodNombre" placeholder="Nombre (ej. Pizza Familiar)">
            <input id="prodPrecio" type="number" placeholder="Precio ($)">
            <input type="file" id="prodFoto" accept="image/*" capture="environment">
            <button class="btn-rest" id="btnGuardarProd">Publicar en el Menú</button>
        </div>
        <h3>Mis Locales</h3>
        <div id="listaRest"></div>
    </div>

    <div id="admin-sec" class="content-section">
        <h2 style="color:#f39c12;">Control de Publicidad</h2>
        <p>Solo personal autorizado.</p>
        <label>Video Promocional (MP4):</label>
        <input type="file" id="fileVideo" accept="video/mp4">
        <button class="btn-admin" onclick="subirPublicidad('video', 'fileVideo')">Cambiar Video</button>
        <hr>
        <label>Banners:</label>
        <input type="file" id="fileBanner1" accept="image/*">
        <button class="btn-admin" onclick="subirPublicidad('banner1', 'fileBanner1')">Cambiar Banner 1</button>
    </div>

</div>

<script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
    import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
    import { getFirestore, collection, addDoc, onSnapshot, doc, setDoc, query, where } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
    import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-storage.js";

    const firebaseConfig = {
        apiKey: "AIzaSyCo8_Qzp_Up72063TbNqDPWFTPqZxvHRcE",
        authDomain: "robs-delivery-express-9fd38.firebaseapp.com",
        projectId: "robs-delivery-express-9fd38",
        storageBucket: "robs-delivery-express-9fd38.firebasestorage.app",
        messagingSenderId: "932715527848",
        appId: "1:932715527848:web:ecdfa23d7cc9c0ca6f4c9d"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);
    const provider = new GoogleAuthProvider();

    // --- NAVEGACIÓN ---
    window.showSection = (id) => {
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    };

    // --- LOGIN ---
    document.getElementById('btnLogin').onclick = () => signInWithPopup(auth, provider);

    onAuthStateChanged(auth, (user) => {
        const status = document.getElementById('userStatus');
        if (user) {
            status.innerText = user.email;
            cargarMisRestaurantes(user.uid);
        } else {
            status.innerText = "Invitado";
            document.getElementById('listaRest').innerHTML = "";
        }
    });

    // --- CARGAR PUBLICIDAD (PÚBLICA) ---
    onSnapshot(collection(db, "publicidad"), (snap) => {
        snap.forEach(d => {
            const url = d.data().url;
            if (d.id === "video") { document.getElementById('videoSrc').src = url; document.getElementById('reproductorAds').load(); }
            if (d.id === "banner1") document.getElementById('banner1').src = url;
            if (d.id === "banner2") document.getElementById('banner2').src = url;
        });
    });

    // --- VISTA PÚBLICA DE CLIENTES ---
    onSnapshot(collection(db, "restaurantes"), (snap) => {
        let h = "";
        snap.forEach(d => {
            const r = d.data();
            h += `<div class="rest-card">
                <div class="rest-info">
                    <h3>${r.nombre}</h3>
                    <small>📍 ${r.provincia}</small>
                </div>
                <button class="btn-ver">Ver Menú</button>
            </div>`;
        });
        document.getElementById('vistaClientes').innerHTML = h || "No hay restaurantes registrados.";
    });

    // --- FUNCIONES ADMIN Y DUEÑO ---
    window.subirPublicidad = async (tipo, id) => {
        if(!auth.currentUser) return alert("Inicia sesión como administrador.");
        const file = document.getElementById(id).files[0];
        const sRef = ref(storage, `publicidad/${tipo}`);
        await uploadBytes(sRef, file);
        const url = await getDownloadURL(sRef);
        await setDoc(doc(db, "publicidad", tipo), { url });
        alert("Publicidad actualizada.");
    };

    document.getElementById('btnGuardarRest').onclick = async () => {
        if(!auth.currentUser) return alert("Debes iniciar sesión.");
        await addDoc(collection(db, "restaurantes"), {
            nombre: document.getElementById('restNombre').value,
            provincia: document.getElementById('restProvincia').value,
            duenoId: auth.currentUser.uid
        });
        alert("Local guardado.");
    };

    function cargarMisRestaurantes(uid) {
        const q = query(collection(db, "restaurantes"), where("duenoId", "==", uid));
        onSnapshot(q, (snap) => {
            let h = "";
            snap.forEach(d => {
                h += `<div style="padding:10px; border-bottom:1px solid #eee;">
                    <b>${d.data().nombre}</b> 
                    <button onclick="seleccionarRestaurante('${d.id}', '${d.data().nombre}')">Gestionar</button>
                </div>`;
            });
            document.getElementById('listaRest').innerHTML = h;
        });
    }

    window.seleccionarRestaurante = (id, nombre) => {
        document.getElementById('prodRestID').value = id;
        document.getElementById('statusSeleccion').innerText = "Editando: " + nombre;
    };
</script>
</body>
</html>
