// ==UserScript==
// @name         CafeCoder Enhancer
// @namespace    iilj
// @version      2020.01.04.1
// @description  CafeCoder のUIを改善し，コンテストを快適にします（たぶん）
// @author       iilj
// @supportURL   https://github.com/iilj/CafeCodeEnhancer/issues
// @match        https://www.cafecoder.top/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/noty/3.1.4/noty.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.4/codemirror.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.4/mode/clike/clike.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.4/mode/python/python.js
// @resource     css_noty https://cdnjs.cloudflare.com/ajax/libs/noty/3.1.4/noty.css
// @resource     css_cm https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.4/codemirror.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==

/* globals CodeMirror, Noty */

(function () {
    'use strict';

    GM_addStyle(GM_getResourceText('css_noty'));
    GM_addStyle(GM_getResourceText('css_cm'));
    GM_addStyle(`
/* h4 まわりの UI 改善 */
h4 {
    margin-top: 1rem;
    border-bottom: 2px solid lightblue;
    border-left: 10px solid lightblue;
    padding-left: 0.5rem;
}

/* ページ最下部のコンテンツが見やすいように調整する */
div.card {
    marginBottom: 30px;
}

/* コンテストページ上部のメニューを使いやすくする */
div.card-body a.nav-item.nav-link {
    border: 1px solid #bbbbbb;
    margin: 0.3rem;
    border-radius: 0.3rem;
}
div.card-body a.nav-item.nav-link:hover{
    background-color: #cccccc;
}

/* 入出力サンプルのUI */
.cce-myprenode {
    display: block;
    margin: 0.4rem;
    padding: 0.4rem;
    background-color: #efefef !important;
    border: 1px solid #bbbbbb;
    border-radius: 0.4rem;
    font-family: Menlo,Monaco,Consolas,"Courier New",monospace;
}
.CodeMirror {
    border-top: 1px solid black;
    border-bottom: 1px solid black;
}
    `);

    const msg = (type, text) => {
        new Noty({
            type: type,
            layout: 'top',
            timeout: 3000,
            text: text
        }).show();
    };

    // add title tag when there exists no title tag
    let result;
    if (!document.querySelector("title")) {
        const title = document.createElement("title");
        let stitle = "";
        if (result = location.href.match(/www\.cafecoder\.top\/([^\/]+)\/(index\.(php|html?))?$/)) {
            stitle += `${result[1]} (${document.querySelector("h1").innerText.trim()})`;
        } else if (result = location.href.match(/www\.cafecoder\.top\/([^\/]+)\/problem_list\.(php|html?)$/)) {
            stitle += `${result[1]} 問題一覧`;
        } else if (result = location.href.match(/www\.cafecoder\.top\/([^\/]+)\/Problems\/([^\/]+)\.(php|html?)$/)) {
            stitle += `${result[1]}-${result[2]}`;
            const h3 = document.querySelector("h3");
            if (h3) {
                stitle += " " + h3.innerText.trim();
            }
        }
        stitle += (stitle == "" ? "" : " : ") + "CafeCoder";
        title.innerText = stitle;
        document.querySelector("head").insertAdjacentElement('afterbegin', title);
    }

    // fix invalid/broken uri
    document.querySelectorAll("a[href*='kakecoder.com']").forEach((lnk) => {
        lnk.href = lnk.href.replace('kakecoder.com', 'cafecoder.top');
    });
    document.querySelectorAll("a[href*='.html']").forEach((lnk) => {
        lnk.href = lnk.href.replace('.html', '.php');
    });
    document.querySelectorAll("a[href^='//'][href$='.php']").forEach((lnk) => {
        const href = lnk.getAttribute('href');
        if (result = href.match(/^\/\/([^\/]+)\.(php|html?)$/)) {
            lnk.setAttribute('href', href.replace('//', location.href.indexOf("/Problems/") != -1 ? '../' : './'));
        }
    });

    // when problem page
    if (location.href.indexOf("/Problems/") != -1 && document.querySelector("h3") != null) {
        // improve UI/UX of I/O sample, and add sample copy button feature
        document.querySelectorAll("span[style]:not([class]), pre[style]:not([class]), div[style]:not([class]), .sample").forEach((node, idx, _nodelist) => {
            if (!node.classList.contains('sample') && !node.style.backgroundColor && node.getAttribute("style").indexOf("background-color") == -1) {
                return;
            }
            node.classList.add('cce-myprenode');
            node.id = `cce-myprenode-${idx}`;
            if (node.firstChild.nodeName == "#text") {
                node.firstChild.data = node.firstChild.data.trim();
            }
            if (node.lastChild.nodeName == "#text") {
                node.lastChild.data = node.lastChild.data.trim();
            }

            let btn = document.createElement("button");
            btn.innerText = "テキストをコピー！";
            btn.classList.add('btn', 'btn-primary', 'copy-sample-input');
            btn.style.display = "block";
            btn.addEventListener("click", () => {
                const elem = document.getElementById(node.id);
                document.getSelection().selectAllChildren(elem);
                if (document.execCommand("copy")) {
                    msg('success', 'テキストをコピーしました！');
                    document.getSelection().removeAllRanges();
                } else {
                    msg('error', 'コピーに失敗してしまったようです．');
                }
            }, false);
            node.insertAdjacentElement('beforebegin', btn);
        });

        // CodeMirror init
        const textarea = document.querySelector('form[name=submit_form] textarea[name=sourcecode]');
        const editor = CodeMirror.fromTextArea(textarea, {
            mode: "text/x-c++src",
            lineNumbers: true,
        });

        // CodeMirror lang selection changed event handler
        const selectlang = document.querySelector('form[name=submit_form] select[name=language]');
        selectlang.addEventListener('change', (event) => {
            const modelist = [
                'text/x-csrc', 'text/x-c++src', 'text/x-java', 'python', 'text/x-csharp'
            ];
            editor.setOption("mode", modelist[event.target.selectedIndex]);
        });

        // select lang C++17 as a default
        selectlang.selectedIndex = 1;
        selectlang.classList.add('form-control');

        // CodeMirror submit preprocess, remove default broken event
        const submitbtn = document.querySelector('form[name=submit_form] input[type=submit]');
        submitbtn.removeAttribute("onclick");
        submitbtn.classList.add('btn-primary');
        document.submit_form.addEventListener('submit', (event) => {
            editor.save();
            if (textarea.value == '') {
                msg('warning', 'ソースコードが入力されていません');
                event.preventDefault();
            }
        });
    }
})();
