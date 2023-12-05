// inject HTML into the body of the current tab
async function injectHTML(link) {
    let html = await fetch(chrome.runtime.getURL(link));
    let text = await html.text();
    console.log(text);
    document.body.insertAdjacentHTML('beforeend', text);
}

async function injectCSS(link) {
    document.body.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="${link}">`);
}

function injectScript(file, node) {
    var th = document.getElementsByTagName(node)[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    th.appendChild(s);
}

injectHTML('index.html');
injectCSS(chrome.runtime.getURL('bootstrap-ns.min.css'));
injectCSS(chrome.runtime.getURL('styles.css'));
injectCSS('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css');
injectScript(chrome.runtime.getURL('inject.js'), 'body');