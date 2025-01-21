// ==UserScript==
// @name         	разговорыоважном.рф - Download all videos
// @name:ru      	Разговоры о важном (https://разговорыоважном.рф/) - Скачать все видео
// @description  	Downloading all videos from the site “Talking About Important”.
// @description:ru  Скачивание видео с сайта "Разговоры о важном" на конкретном топике\дне.
// @author       	xenongee
// @version      	2025-01-20
// @namespace    	http://tampermonkey.net/
// @homepageURL  	https://github.com/xnngee/important-talks-video-downloader
// @updateURL    	https://github.com/xnngee/important-talks-video-downloader/raw/refs/heads/main/important-talks-video-downloader.user.js
// @downloadURL  	https://github.com/xnngee/important-talks-video-downloader/raw/refs/heads/main/important-talks-video-downloader.user.js
// @icon            https://www.google.com/s2/favicons?sz=64&domain=xn--80aafadvc9bifbaeqg0p.xn--p1ai
// @match           https://xn--80aafadvc9bifbaeqg0p.xn--p1ai/*
// @grant        	window.close
// ==/UserScript==

(function() {
    'use strict';
    const currentURL = window.location.href;
    const downloadSVG = `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: invert(100%) saturate(0%) brightness(1000%);">
<path d="M6 21H18M12 3V17M12 17L17 12M12 17L7 12" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

    function downloadButtons() {
        document.body.insertAdjacentHTML('afterbegin', `
            <div style="display: flex; justify-content: center; padding: 10px; background-color: #333; gap: 15px; position: fixed; bottom: 20px; right: 90px; border-radius: 50px; height: 50px; align-items: center;">
                <a id="download_videos" style="color: white; text-decoration: none; display: flex; gap: 5px; padding-top:1px;" href="#">
                    ${downloadSVG}
                    <span>Скачать все видео</span>
                </a>
            </div>
        `);

        document.getElementById("download_videos").addEventListener("click", e => {
            const materialItems = document.querySelectorAll(`.materials-section .materials-content .materials-column:nth-child(2) .material-item`);

            const videoLinks = [];
            const uniqueHref = new Set();

            materialItems.forEach(item => {
                const strongElement = item.querySelector('strong');
                if (strongElement && strongElement.textContent.trim() === 'Видео') {
                    const downloadLinks = item.querySelectorAll('a[download]');
                    downloadLinks.forEach(link => {
                        const href = link.getAttribute('href');
                        if (!uniqueHref.has(href)) {
                            uniqueHref.add(href);
                            videoLinks.push(link);
                        }
                    });
                }
            });

            if (videoLinks.length > 0) {
                if (confirm(`Скачать ${videoLinks.length} видео?`)) {
                    videoLinks.forEach(link => {
                        link.click();
                    });
                }
            } else {
                alert('Видео для скачивания не найдены.');
            }
        });
    }

    downloadButtons();
})();
