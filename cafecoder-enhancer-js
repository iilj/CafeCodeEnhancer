// ==UserScript==
// @name         CafeCoder Enhancer
// @namespace    http://tampermonkey.net/
// @version      2019.12.26.1
// @description  try to take over the world!
// @author       iilj (Twitter @iiljj, AtCoder @abb)
// @match        https://www.cafecoder.top/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // タイトルがない場合につける
    let title = document.querySelector("title");
    if (!title) {
        const head = document.querySelector("head");
        title = document.createElement("title");
        title.innerText = "CafeCoder!";
        head.insertAdjacentElement('afterbegin', title);
    }

    // 不正なリンクの修正
    document.querySelectorAll("a[href*='kakecoder.com']").forEach((lnk)=>{
        lnk.href = lnk.href.replace('kakecoder.com', 'cafecoder.top');
    });
    document.querySelectorAll("a[href*='.html']").forEach((lnk)=>{
        lnk.href = lnk.href.replace('.html', '.php');
    });

    // h4 まわりの UI 改善
    document.querySelectorAll("h4").forEach((h4)=>{
        h4.setAttribute("style", "margin-top:1rem; border-bottom:2px solid lightblue; border-left:10px solid lightblue; padding-left: 0.5rem;");
    });
    let cnt = 0;

    // 入出力サンプルの UI 改善＋コピーボタンの追加
    if (location.href.indexOf("/Problems/") != -1) {
        document.querySelectorAll("span[style]:not([class])").forEach((span)=>{
            //console.log(window.getComputedStyle(span).backgroundColor);
            if (!span.style.backgroundColor && span.getAttribute("style").indexOf("background-color") == -1) {
                return;
            }
            console.log(span.style.backgroundColor);
            span.setAttribute("style", "display:block; margin:0.4rem; padding:0.4rem; background-color:#efefef; border:1px solid #bbbbbb; border-radius: 0.4rem; font-family: Menlo,Monaco,Consolas,\"Courier New\",monospace;");
            span.id = "myprespan-" + cnt;
            if (span.firstChild.nodeName == "#text") {
                span.firstChild.data = span.firstChild.data.trim();
            }
            if (span.lastChild.nodeName == "#text") {
                span.lastChild.data = span.lastChild.data.trim();
            }

            let btn = document.createElement("button");
            btn.innerText = "テキストをコピー！";
            btn.setAttribute("class", "btn btn-primary copy-sample-input");
            btn.style.display = "block";
            btn.addEventListener("click", ()=>{
                //test
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
            cnt++;
        });
    }

    // C++17 を標準で選択する
    document.querySelector("select[name=language]").selectedIndex = 1;
})();
