const URL_API = "https://script.google.com/macros/s/AKfycbwLrzCt8OerXd-omhTZiwOtdvCT7azRc--zoVKB0L605xPw-K3z5M55R3Rzd6jRjVFpJw/exec";

let incidencias = [];

/* =========================
   CARGAR DATOS
========================= */

async function fetchData() {

    try {

        const response = await fetch(URL_API);
        const data = await response.json();

        incidencias = data.slice(1);

        cargarTipos();
        renderCards(incidencias);
        actualizarContador();

    } catch (error) {

        console.error("Error cargando datos:", error);

    }

}

/* =========================
   CONTADOR
========================= */

function actualizarContador(){

    const contador = document.getElementById("contadorIncidencias");

    if(contador){
        contador.textContent = incidencias.length;
    }

}

/* =========================
   FILTROS
========================= */

function cargarTipos(){

    const filtro = document.getElementById("filtroTipo");

    filtro.innerHTML = `<option value="todos">Todas las incidencias</option>`;

    const tipos = [...new Set(incidencias.map(i => i[1]).filter(Boolean))];

    tipos.forEach(tipo => {

        const option = document.createElement("option");
        option.value = tipo;
        option.textContent = tipo;

        filtro.appendChild(option);

    });

}

/* =========================
   FORMATEO FECHA
========================= */

function formatFecha(valor) {

    if (!valor) return "N/A";

    const fecha = new Date(valor);

    return isNaN(fecha) ? valor : fecha.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

}

function formatHora(valor) {

    if (!valor) return "N/A";

    const fecha = new Date(valor);

    return isNaN(fecha) ? valor : fecha.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

}

/* =========================
   RENDER CARDS
========================= */

function renderCards(data) {

    const contain = document.getElementById("contain");

    contain.innerHTML = data.map(item => {

        if (!item[0]) return "";

        const tipo = item[1] || "Sin título";
        const descripcion = item[2] || "Sin descripción";
        const fechaFormateada = formatFecha(item[5]);
        const horaFormateada = formatHora(item[6]);

        const fotoAntes = item[7] || "";
        const fotoDespues = item[8] || "";

        return `

        <article class="card">

            <h3>${tipo}</h3>

            <p>${descripcion}</p>

            <div class="date-box">

                <div class="date-item">
                    <span>Fecha</span>
                    ${fechaFormateada}
                </div>

                <div class="date-item">
                    <span>Hora</span>
                    ${horaFormateada}
                </div>

            </div>

            <div class="fotos">

                <div class="foto-wrapper">
                    <span>Antes</span>
                    <img src="${fotoAntes || 'https://placehold.co/600x400'}"
                    alt="Antes">
                </div>

                <div class="foto-wrapper">
                    <span>Después</span>
                    <img src="${fotoDespues || 'https://placehold.co/600x400'}"
                    alt="Después">
                </div>

            </div>

        </article>

        `;

    }).join("");

}

/* =========================
   CONVERTIR IMAGEN BASE64
========================= */

function convertirBase64(file){

    return new Promise((resolve,reject)=>{

        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = () => resolve(reader.result);

        reader.onerror = error => reject(error);

    });

}

/* =========================
   EVENTOS DOM
========================= */

document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const closeBtn = document.querySelector(".modal-close");
    const formModal = document.getElementById("formModal");

    /* =========================
       MODAL DE IMAGEN
    ========================= */

    document.addEventListener("click", function (e) {

        if (e.target.tagName === "IMG" && e.target.closest(".foto-wrapper")) {

            modal.style.display = "flex";
            modalImg.src = e.target.src;

        }

    });

    closeBtn.onclick = () => modal.style.display = "none";

    modal.onclick = (e) => {

        if (e.target === modal) {
            modal.style.display = "none";
        }

    };

    /* =========================
       FILTRO
    ========================= */

    document.getElementById("filtroTipo").addEventListener("change", function(){

        const tipo = this.value;

        if(tipo === "todos"){

            renderCards(incidencias);
            return;

        }

        const filtradas = incidencias.filter(i => i[1] === tipo);

        renderCards(filtradas);

    });

    /* =========================
       ABRIR FORMULARIO
    ========================= */

    const btnNueva = document.getElementById("btnNuevaIncidencia");

    if(btnNueva){

        btnNueva.onclick = () => {

            formModal.style.display = "flex";

        };

    }

    /* =========================
       CERRAR FORMULARIO
    ========================= */

    const cerrarForm = document.getElementById("cerrarForm");

    if(cerrarForm){

        cerrarForm.onclick = () => {

            formModal.style.display = "none";

        };

    }

    /* =========================
       GUARDAR INCIDENCIA
    ========================= */

    const form = document.getElementById("formIncidencia");

    if(form){

        form.addEventListener("submit", async function(e){

            e.preventDefault();

            const tipo = document.getElementById("tipo").value;
            const descripcion = document.getElementById("descripcion").value;

            const fileAntes = document.getElementById("fotoAntes").files[0];
            const fileDespues = document.getElementById("fotoDespues").files[0];

            let fotoAntes = "";
            let fotoDespues = "";

            if(fileAntes){
                fotoAntes = await convertirBase64(fileAntes);
            }

            if(fileDespues){
                fotoDespues = await convertirBase64(fileDespues);
            }

            try{

                const response = await fetch(URL_API,{
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify({
                        tipo,
                        descripcion,
                        fotoAntes,
                        fotoDespues
                    })
                });

                const result = await response.json();

                console.log("Respuesta servidor:", result);

                formModal.style.display = "none";
                form.reset();

                fetchData();

            }catch(error){

                console.error("Error al guardar incidencia",error);

            }

        });

    }

    fetchData();

});
