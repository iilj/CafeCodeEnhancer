// ==UserScript==
// @name         CafeCoder Enhancer
// @namespace    http://tampermonkey.net/
// @version      2019.12.30.3
// @description  CafeCoder のUIを改善し，コンテストを快適にします（たぶん）
// @author       iilj (Twitter @iiljj, AtCoder @abb)
// @match        https://www.cafecoder.top/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // スタイル用クラスの定義を追加する
    const csscontent = `
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
.cce-myprespan {
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
    `;
    const cce_style = document.createElement('style');
    cce_style.type = "text/css";
    cce_style.innerText = csscontent;

    const head = document.querySelector("head");
    head.insertAdjacentElement('beforeend', cce_style);

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
            stitle += `${result[1]}-${result[2]} ${document.querySelector("h3").innerText.trim()}`;
        }
        stitle += (stitle == "" ? "" : " : ") + "CafeCoder";
        title.innerText = stitle;
        head.insertAdjacentElement('afterbegin', title);
    }

    // fix invalid uri
    document.querySelectorAll("a[href*='kakecoder.com']").forEach((lnk) => {
        lnk.href = lnk.href.replace('kakecoder.com', 'cafecoder.top');
    });
    document.querySelectorAll("a[href*='.html']").forEach((lnk) => {
        lnk.href = lnk.href.replace('.html', '.php');
    });

    // when problem page
    if (location.href.indexOf("/Problems/") != -1) {
        // improve UI/UX of I/O sample, and add sample copy button feature
        document.querySelectorAll("span[style]:not([class])").forEach((span, idx, _nodelist) => {
            if (!span.style.backgroundColor && span.getAttribute("style").indexOf("background-color") == -1) {
                return;
            }
            span.classList.add('cce-myprespan');
            span.id = `cce-myprespan-${idx}`;
            if (span.firstChild.nodeName == "#text") {
                span.firstChild.data = span.firstChild.data.trim();
            }
            if (span.lastChild.nodeName == "#text") {
                span.lastChild.data = span.lastChild.data.trim();
            }

            let btn = document.createElement("button");
            btn.innerText = "テキストをコピー！";
            btn.classList.add('btn', 'btn-primary', 'copy-sample-input');
            btn.style.display = "block";
            btn.addEventListener("click", () => {
                const elem = document.getElementById(span.id);
                document.getSelection().selectAllChildren(elem);
                if (document.execCommand("copy")) {
                    alert("テキストをコピーしました！");
                    document.getSelection().removeAllRanges();
                } else {
                    alert("コピーに失敗してしまったようです．");
                }
            }, false);
            span.insertAdjacentElement('beforebegin', btn);
        });

        // CodeMirror js
        const cm_js_ls = [
            'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.4/codemirror.js',
            'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.4/mode/clike/clike.js',
            'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.4/mode/python/python.js'
        ];
        let loadcnt = 0;
        let editor;
        const textarea = document.querySelector('form[name=submit_form] textarea[name=sourcecode]');
        cm_js_ls.forEach((jsuri) => {
            const cce_cm_script = document.createElement('script');
            cce_cm_script.onload = () => {
                loadcnt++;
                if (loadcnt == cm_js_ls.length) {
                    editor = CodeMirror.fromTextArea(textarea, {
                        mode: "text/x-c++src",
                        lineNumbers: true,
                    });
                }
            };
            cce_cm_script.src = jsuri;
            head.insertAdjacentElement('beforeend', cce_cm_script);
        });

        // CodeMirror css
        const cce_cm_style = document.createElement('link');
        cce_cm_style.type = "text/css";
        cce_cm_style.rel = 'stylesheet';
        cce_cm_style.href = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.4/codemirror.css';
        head.insertAdjacentElement('beforeend', cce_cm_style);

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
                alert("ソースコードが入力されていません");
                event.preventDefault();
            }
        });
    }
})();
