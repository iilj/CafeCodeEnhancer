// ==UserScript==
// @name         CafeCoder Enhancer
// @namespace    http://tampermonkey.net/
// @version      2019.12.30.1
// @description  CafeCoder のUIを改善し，コンテストを快適にします（たぶん）
// @author       iilj (Twitter @iiljj, AtCoder @abb)
// @match        https://www.cafecoder.top/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // タイトルがない場合につける
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
        document.querySelector("head").insertAdjacentElement('afterbegin', title);
    }

    // 不正なリンクの修正
    document.querySelectorAll("a[href*='kakecoder.com']").forEach((lnk) => {
        lnk.href = lnk.href.replace('kakecoder.com', 'cafecoder.top');
    });
    document.querySelectorAll("a[href*='.html']").forEach((lnk) => {
        lnk.href = lnk.href.replace('.html', '.php');
    });

    // h4 まわりの UI 改善
    document.querySelectorAll("h4").forEach((h4) => {
        h4.setAttribute(
            "style",
            "margin-top: 1rem;"
            + "border-bottom: 2px solid lightblue;"
            + "border-left: 10px solid lightblue;"
            + "padding-left: 0.5rem;");
    });

    if (location.href.indexOf("/Problems/") != -1) {
        // 入出力サンプルの UI 改善＋コピーボタンの追加
        document.querySelectorAll("span[style]:not([class])").forEach((span, idx, _nodelist) => {
            if (!span.style.backgroundColor && span.getAttribute("style").indexOf("background-color") == -1) {
                return;
            }
            span.setAttribute(
                "style",
                "display: block;"
                + "margin: 0.4rem;"
                + "padding: 0.4rem;"
                + "background-color: #efefef;"
                + "border: 1px solid #bbbbbb;"
                + "border-radius: 0.4rem;"
                + "font-family: Menlo,Monaco,Consolas,\"Courier New\",monospace;");
            span.id = `myprespan-${idx}`;
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

        // C++17 を標準で選択する
        document.querySelector("select[name=language]").selectedIndex = 1;
    }

})();
