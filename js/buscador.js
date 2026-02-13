class BuscadorInterno {
    constructor() {
        this.form = document.forms.buscador;
        this.input = this.form.elements.search;
        this.resultado = document.querySelector("main section");

        const lang = document.documentElement.lang;
        this.paginas = (lang === "es")
            ? ["index.html", "aficiones.html", "proyectos.html", "contacto.html"]
            : ["index.html", "hobbies.html", "projects.html", "contact.html"];

        this.form.addEventListener("submit", (e) => {
            e.preventDefault();
            this.buscar(this.input.value.trim());
        });
    }

    async buscar(termino) {
        this.resultado.innerHTML = "";

        if (!termino) {
            this.resultado.innerHTML = "<p>No se ha escrito nada.</p>";
            return;
        }

        //convertimos vocales en comodines (a -> aá) para que detecte tildes
        const patron = termino
            .replace(/[aá]/gi, '[aá]')
            .replace(/[eé]/gi, '[eé]')
            .replace(/[ií]/gi, '[ií]')
            .replace(/[oó]/gi, '[oó]')
            .replace(/[uú]/gi, '[uú]');
        
        //búsqueda con ese patrón
        const regex = new RegExp(patron, 'gi'); 
        const resultados = [];
        const parser = new DOMParser();

        for (let pagina of this.paginas) {
            try {
                const resp = await fetch(pagina);
                const htmlTexto = await resp.text();
                const doc = parser.parseFromString(htmlTexto, 'text/html');

                //solo se busca en el contenido, no en menus...
                const ignorar = doc.querySelectorAll('nav, footer, form, script, style, header');
                ignorar.forEach(el => el.remove());

                //obtenemos texto limpio
                const textoLimpio = doc.body.textContent.replace(/\s+/g, " ");
                if (regex.test(textoLimpio)) {
                    regex.lastIndex = 0; //reiniciar para buscar posición
                    const match = regex.exec(textoLimpio);
                    const snippet = this.getSnippet(textoLimpio, match.index, termino.length);
                    resultados.push({ pagina, snippet });
                }
            } catch (err) {
                console.log("Error en:", pagina);
            }
        }
        //resaltar texto
        this.mostrarResultados(resultados, regex, termino);
    }

    getSnippet(texto, index, len) {
        const start = Math.max(0, index - 40);
        const end = Math.min(texto.length, index + len + 40);
        return "..." + texto.slice(start, end) + "...";
    }

    mostrarResultados(lista, regex, terminoOriginal) {
        if (lista.length === 0) {
            this.resultado.innerHTML = `<p>Sin resultados para <strong>${terminoOriginal}</strong>.</p>`;
            return;
        }

        let html = "<ul>";
        for (let r of lista) {
            const url = r.pagina + "?search=" + encodeURIComponent(terminoOriginal);
            
            //poner la etiqueta <mark> si la palabra tiene tilde o no
            const snippetMarcado = r.snippet.replace(regex, m => `<mark>${m}</mark>`);

            html += `
                <li>
                    <a href="${url}">${r.pagina.replace(".html", "")}</a><br>
                    <small>${snippetMarcado}</small>
                </li>`;
        }
        html += "</ul>";
        this.resultado.innerHTML = html;
    }
}

new BuscadorInterno();