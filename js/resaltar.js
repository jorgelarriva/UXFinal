class Resaltador {
    constructor() {
        const params = new URLSearchParams(location.search);
        this.termino = params.get("search");

        if (this.termino) this.resaltarTexto();
    }

    resaltarTexto() {
        const patron = this.termino
            .replace(/[aá]/gi, '[aá]')
            .replace(/[eé]/gi, '[eé]')
            .replace(/[ií]/gi, '[ií]')
            .replace(/[oó]/gi, '[oó]')
            .replace(/[uú]/gi, '[uú]');
        
        const regex = new RegExp(patron, 'gi');
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    //ignora menús, footer...
                    if (node.parentElement.closest("nav, footer, form, script, header")) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        let nodo;
        const nodosParaCambiar = [];

        while (nodo = walker.nextNode()) {
            if (regex.test(nodo.textContent)) {
                nodosParaCambiar.push(nodo);
            }
        }

        nodosParaCambiar.forEach(nodo => {
            const span = document.createElement("span");
            span.innerHTML = nodo.textContent.replace(regex, m => `<mark>${m}</mark>`);
            nodo.parentNode.replaceChild(span, nodo);
        });
    }
}

new Resaltador();