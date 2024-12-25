// ==UserScript==
// @name         	razgovor.edsoo.ru - Download all videos
// @name:ru      	Разговоры о важном (https://razgovor.edsoo.ru/) - Скачать все видео
// @description  	Downloading all videos from the site “Talking About Important”, including video archives from Yandex.Disk.
// @description:ru  Скачивание видео с сайта "Разговоры о важном" на конкретном топике\дне, включая видео-архивы с Яндекс.Диска.
// @author       	xenongee
// @version      	2024-12-23
// @icon         	https://www.google.com/s2/favicons?sz=64&domain=edsoo.ru
// @namespace    	http://tampermonkey.net/
// @homepageURL  	https://github.com/xnngee/important-talks-video-downloader
// @updateURL    	https://github.com/xnngee/important-talks-video-downloader/raw/refs/heads/main/important-talks-video-downloader.user.js
// @downloadURL  	https://github.com/xnngee/important-talks-video-downloader/raw/refs/heads/main/important-talks-video-downloader.user.js
// @match        	https://razgovor.edsoo.ru/topic/*/
// @match        	https://disk.yandex.ru/d/*
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
            <div style="display: flex; justify-content: center; padding: 10px; background-color: #333; gap: 15px;">
                <span style="color: white; padding-top: 2px;">Скачать все видео:</span>
                <a id="alldownload" style="color: white; text-decoration: none; display: flex; gap: 5px" href="#">
                    ${downloadSVG}
                    <span style="padding-top: 2px;">Напрямую с сайта <small>(рекомендуется, многие видео с веб-качеством)</small></span>
                </a>
                <a id="alldownload_yandex" style="color: white; text-decoration: none; display: flex; gap: 5px" href="#">
                    ${downloadSVG}
                    <span style="padding-top: 2px;">Яндекс.Диск <small>(альтернативный способ, встречаются видео с оригинальным качеством)</small></span>
                </a>
            </div>
        `);

        document.getElementById("alldownload_yandex").addEventListener("click", (e) => {
            alert("Сейчас откроются вкладки с Яндекс.Диском, не закрывайте их! Скрипт обработает эти страницы, скачает архивы с видео и закроет их самостоятельно.");
            document.querySelectorAll(".topic-resource-download a").forEach((e, i) => {
                window.open(e.href, '_blank' + i)
            });
        });

        document.getElementById("alldownload").addEventListener("click", e => {
            const videoLinks = Array.from(document.querySelectorAll(".topic-resource-group-columns .column a"))
                .filter(e => e.href.includes("/video/"))
                .map(e => e.href);

            alert("Сейчас откроются вкладки с видео, не закрывайте их! Скрипт обработает эти страницы, скачает видео и закроет их самостоятельно.");

            const downloadedFiles = new Set();
            videoLinks.forEach((link, index) => {
                const newWindow = window.open(link, '_blank' + index);
                newWindow.onload = () => {
                    const videoPlayer = newWindow.document.getElementById('player');
                    if (videoPlayer) {
                        const source = videoPlayer.querySelector('source');
                        if (source) {
                            // Получаем имя файла из URL
                            const fileName = source.src.split('/').pop();
                            // Скачать ресурс по ссылке из src
                            fetch(source.src)
                                .then(response => response.blob())
                                .then(blob => {
                                    // Проверяем, скачивался ли уже файл с таким именем
                                    if (downloadedFiles.has(fileName)) {
                                        console.warn(`Файл ${fileName} уже скачан. Пропускаем.`);
                                        newWindow.close();
                                        return;
                                    }
                                    // Создаем ссылку для скачивания
                                    const url = window.URL.createObjectURL(blob);
                                    //const a = newWindow.document.body.insertAdjacentHTML('afterbegin', `
                                    //<div style="display: flex; justify-content: center; padding: 10px; background-color: #333; gap: 15px; position: absolute; top: 0; left: 0; width: 100%;">
                                    //    <a style="color: white; text-decoration: none; display:" href=${url} download=${fileName}>
                                    //        ${downloadSVG}
                                    //        <span style="color: white; padding-top: 2px; font-family">Скачать видео</span>
                                    //    </a>
                                    //</div>`);
                                    const a = newWindow.document.createElement('a');
                                    a.href = url;
                                    a.download = fileName;
                                    a.innerHTML = "Скачать видео";
                                    newWindow.document.body.appendChild(a);
                                    a.click();
                                    console.log('Скачиваем видео:', fileName);
                                    window.URL.revokeObjectURL(url);
                                    // Добавляем имя файла в список скачанных
                                    downloadedFiles.add(fileName);
                                    // Закрыть вкладку
                                    setTimeout(() => {
                                        newWindow.close();
                                    }, 1000);
                                })
                                .catch(error => {
                                    console.error('Ошибка при скачивании видео:', error);
                                    newWindow.close();
                                });
                        } else {
                            console.error("Тег <source> не найден");
                            newWindow.close();
                        }
                    } else {
                        console.error("Тег <video> с id 'player' не найден");
                        newWindow.close();
                    }
                }
            });
        });
    }

    function downloadButtonYandexDisk() {
        // Ручной способ
        document.body.insertAdjacentHTML( 'afterbegin', `
            <div id="alldownload" style="display: flex; justify-content: center; padding: 10px; background-color: #333; gap: 15px;">
                <a id="alldownload" style="color: white; text-decoration: none; display: flex; gap: 5px" href="#">
                    ${downloadSVG}
                    <span style="padding-top: 2px;">Нажмите сюда, если не началось автоматическое скачивание архива с видео</small></span>
                </a>
            </div>
        `);
        document.getElementById("alldownload").addEventListener("click", (e) => {
            document.querySelectorAll(".listing__items .listing-item").forEach(e => {
                const titleSpan = e.querySelector(".listing-item__info .listing-item__title span");
                if (titleSpan && titleSpan.innerHTML.toLowerCase().includes("3 видео")) {
                    e.click();
                }
            });
            document.querySelector(".resources-action-bar__side-right .download-button").click();
        })
    }

    function autoDownloadYandexDisk() {
        // Автоматический способ
        let attempts = 0;
        const maxAttempts = 3; // Максимальное количество попыток
        const interval = 500; // Интервал между попытками

        const findAndDownload = setInterval(() => {
            attempts++;
            const items = document.querySelectorAll(".listing__items .listing-item");
            items.forEach(item => {
                const titleSpan = item.querySelector(".listing-item__info .listing-item__title span");
                if (titleSpan && (titleSpan.innerHTML.trim().toLowerCase() === "3 видео")) {
                    item.click();
                    setTimeout(()=> {
                        document.querySelector(".resources-action-bar__side-right .download-button").click();
                    }, 500);
                    setTimeout(()=> {
                        window.close();
                    }, 5000);
                    clearInterval(findAndDownload);
                }
            });

            if (attempts >= maxAttempts) {
                clearInterval(findAndDownload);
                console.error(">>>> Не удалось найти папку '3 видео' после нескольких попыток.");
            }
        }, interval);
    }

    if (currentURL.startsWith('https://razgovor.edsoo.ru/topic/')) {
        downloadButtons();
    }

    if (currentURL.startsWith('https://disk.yandex.ru/d/')) {
        downloadButtonYandexDisk();
        autoDownloadYandexDisk();
    }
})();
