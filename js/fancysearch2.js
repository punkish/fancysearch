const fancySearch = function () {

    let facetKeys;

	const makeFsContainer = function(selector) {

        // We are going to create the following HTML
        /*
         *
         * <div class="fs-param-empty">
         *    <div class="fs-key off"></div>
         *    <input class="fs-key-input">
         *    <div class="fs-val off"></div>
         *    <input class="fs-val-input off">
         *    <div class="fs-cancel off"></div>
         * </div>
         *
         */
    
        let fsp = document.createElement('div');
        fsp.className = 'fs-param-empty';
    
        let fsk = document.createElement('div');
        fsk.className = 'fs-key off';
        let fskInput = document.createElement('input');
        fskInput.className = 'fs-key-input';
    
        let fsv = document.createElement('div');
        fsv.className = 'fs-val off';
        let fsvInput = document.createElement('input');
        fsvInput.className = 'fs-val-input off';
    
        let fsc = document.createElement('div');
        fsc.innerText = 'x';
        fsc.className = 'fs-cancel off';
    
        // add '.fs-key' div to '.fs-param' div
        // and then add '.fs-param' div to 'fs' div
        fsp.appendChild(fsk);
        fsp.appendChild(fskInput);
        fsp.appendChild(fsv);
        fsp.appendChild(fsvInput);
        fsp.appendChild(fsc);
        selector.appendChild(fsp);
    
        fskInput.addEventListener('keydown', modifyKeyPress);
        fsvInput.addEventListener('keydown', modifyKeyPress);
        fsc.addEventListener('click', removeFsp);
    };
    
    const modifyKeyPress = function(event) {
        
        const ENTER = 13;
        const BACKSPACE = 8;
        const DEL = 46;
    
        event = event || window.event;
        const keyPressed = event.which || event.keyCode;
    
        let thisInput = event.target;
        let fsp = thisInput.parentElement;
        let fsk = fsp.children[0];
        let fskInput = fsp.children[1];
        let fsv = fsp.children[2];
        let fsvInput = fsp.children[3];
        let fsc = fsp.children[4];
        
        if (keyPressed == ENTER) {
            
            if (fsk.innerText === 'TEXT:' && fsvInput.value !== '') {
                fsp.className = 'fs-param-filled';
                fsv.innerText = fsvInput.value;
                fsv.className = 'fs-val on';
                fsvInput.className = 'off';
                fsc.className = 'fs-cancel on';
    
                makeFsContainer(fs);
    
                let fskInputColl = document.querySelectorAll('input[class="fs-key-input"]');
                let nextInput = fskInputColl[fskInputColl.length - 1];
                aCfacets('key', nextInput, facetKeys);
                nextInput.focus();
            }
    
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
        else if (keyPressed == BACKSPACE || keyPressed == DEL) {
    
            if (thisInput.value === '') {
                let allFsp = document.querySelectorAll('.fs-param-filled');
                let lastFsp = allFsp[allFsp.length - 1];
    
                if (lastFsp.className === 'fs-param-filled') {
                    lastFsp.className = 'fs-param-filled hilite';
                }
                else if (lastFsp.className = 'fs-param-filled hilite') {
                    lastFsp.parentElement.removeChild(lastFsp);
                }
            }
        }
    };
    
    const removeFsp = function(event) {
        const that = this.parentElement;
        that.parentElement.removeChild(that);
    };
    
    const aCfacets = function(type, selector, choices) {
    
        new autoComplete({
            selector: selector,
            minChars: 0,
            source: function(term, suggest) {
    
                term = term.toLowerCase();
                let matches = [];
                let j = choices.length;
    
                for (let i = 0; i < j; i++) {
                    if (~choices[i].toLowerCase().indexOf(term)) {
                        matches.push(choices[i]);
                    }
                }
    
                suggest(matches);
            },
            onSelect: function(e, term, item) {
    
                let newChoices;
                let thisInput = this.selector;
                let fsp = thisInput.parentElement;
                
                if (type === 'key') {
                    
                    let fsk = fsp.children[0];
                    fsk.innerText = thisInput.value + ':';
                    fsk.className = 'fs-key on';
                    thisInput.className = 'off';
    
                    let i = 0;
                    let j = facets.length;
    
                    for (; i < j; i++) {
                        if (facets[i]['key'] === term) {
                            newChoices = facets[i]['values'];
                            if (facets[i]['noDuplicates']) {
                                facetKeys.splice(facetKeys.indexOf(term), 1);
                            }
                            break;
                        }
                    }
    
                    let nextInput = fsp.children[3];
                    nextInput.className = 'fs-val-input on';
                    aCfacets('val', nextInput, newChoices);
                    nextInput.focus();
                }
                else if (type === 'val') {
    
                    let fsv = fsp.children[2];
                    
                    if (term) {
                        fsv.innerText = thisInput.value;
                        fsv.className = 'fs-val on';
                    }
                    
                    thisInput.className = 'off';
                    fsp.className = 'fs-param-filled';
                    fsp.children[4].className = 'fs-cancel on';
    
                    let i = 0;
                    let j = facets.length;
    
                    for (; i < j; i++) {
                        if (facets[i]['key'] === term) {
                            newChoices = facets[i]['values'];
                            break;
                        }
                    }
    
                    makeFsContainer(fs);
    
                    let fskInputColl = document.querySelectorAll('input[class="fs-key-input"]');
                    let nextInput = fskInputColl[fskInputColl.length - 1];
                    aCfacets('key', nextInput, facetKeys);
                    nextInput.focus();
                }
            }
        });
    };


	return  {
        
        result: function() {
        
            // let fskInputColl = document.querySelectorAll('input[class="fs-key-input"]');
            // let lastInput = fskInputColl[fskInputColl.length - 1];
            // lastInput.className = 'off';
        
            const params = fs.childNodes;
            let q = {};
            for (let i = 0, j = params.length; i < j; i++) {
                const kv = params[i].children;
        
                // https://stackoverflow.com/questions/952924/javascript-chop-slice-trim-off-last-character-in-string
                const key = kv[1].value;
                const val = kv[3].value.replace(/\n$/, '');
        
                if (key && val) {
                    if (key in q) {
                        if (typeof(q[key]) === 'string') {
                            const str = q[key];
                            q[key] = [str, val]
                        }
                        else {
                            q[key].push(val);
                        }
                    }
                    else {
                        q[key] = val;
                    }
                }
            }
            
            return q;
        },

		init: function(o) {

            // https://stackoverflow.com/questions/7028145/find-key-name-in-hash-with-only-one-key
            facetKeys = o.facets.map(element => { return element['key'] });
            
            makeFsContainer(o.selector);
            let fskInputColl = document.querySelectorAll('input[class="fs-key-input"]');
            let fskInput = fskInputColl[fskInputColl.length - 1];
            aCfacets('key', fskInput, facetKeys);
            fskInput.focus();
		}
	};

}();