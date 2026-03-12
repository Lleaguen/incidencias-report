const URL_API = "https://script.google.com/macros/s/AKfycbyiJUsD4E9rDl3hsNPebjsiRHyq5puxX8rUHec3K5xwmHyQEoX7V3Yj4kj4oehqASFZWw/exec";

let incidencias = [];

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

function actualizarContador(){

    const contador = document.getElementById("contadorIncidencias");

    if(contador){

        contador.textContent = incidencias.length;

    }

}

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

function formatFecha(isoString) {

    if (!isoString || isoString === "") return "N/A";

    const fecha = new Date(isoString);

    return isNaN(fecha) ? isoString : fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

}

function formatHora(isoString) {

    if (!isoString || isoString === "") return "N/A";

    const fecha = new Date(isoString);

    return isNaN(fecha) ? isoString : fecha.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

}

function renderCards(data) {

    const contain = document.getElementById("contain");

    contain.innerHTML = data.map(item => {

        if (!item[0]) return "";

        const tipo = item[1] || "Sin título";
        const descripcion = item[2] || "Sin descripción";
        const fechaFormateada = formatFecha(item[5]);
        const horaFormateada = formatHora(item[6]);
        const fotoAntes = item[7];
        const fotoDespues = item[8];

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
                        <img src="${fotoAntes}" alt="Antes"
                        onerror="this.src='https://placehold.co/600x400'">
                    </div>

                    <div class="foto-wrapper">
                        <span>Después</span>
                        <img src="${fotoDespues}" alt="Después"
                        onerror="this.src='https://placehold.co/600x400'">
                    </div>

                </div>

            </article>
        `;

    }).join("");

}

document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const closeBtn = document.querySelector(".modal-close");

    const formModal = document.getElementById("formModal");

    /* MODAL DE IMAGEN */

    document.addEventListener("click", function (e) {

        if (e.target.tagName === "IMG" && e.target.closest(".foto-wrapper")) {

            modal.style.display = "flex";
            modalImg.src = e.target.src;

        }

    });

    closeBtn.onclick = function () {

        modal.style.display = "none";

    };

    modal.onclick = function (e) {

        if (e.target === modal) {

            modal.style.display = "none";

        }

    };

    /* FILTRO */

    document.getElementById("filtroTipo").addEventListener("change", function(){

        const tipo = this.value;

        if(tipo === "todos"){

            renderCards(incidencias);
            return;

        }

        const filtradas = incidencias.filter(i => i[1] === tipo);

        renderCards(filtradas);

    });

    /* ABRIR FORMULARIO */

    const btnNueva = document.getElementById("btnNuevaIncidencia");

    if(btnNueva){

        btnNueva.onclick = () => {

            formModal.style.display = "flex";

        };

    }

    /* CERRAR FORMULARIO */

    const cerrarForm = document.getElementById("cerrarForm");

    if(cerrarForm){

        cerrarForm.onclick = () => {

            formModal.style.display = "none";

        };

    }

    /* GUARDAR INCIDENCIA */

    const form = document.getElementById("formIncidencia");

    if(form){

        form.addEventListener("submit", async function(e){

            e.preventDefault();

            const tipo = document.getElementById("tipo").value;
            const descripcion = document.getElementById("descripcion").value;
            const fotoAntes = document.getElementById("fotoAntes").value;
            const fotoDespues = document.getElementById("fotoDespues").value;

            try{

                await fetch(URL_API,{
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