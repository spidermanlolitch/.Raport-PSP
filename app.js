// Webhooky
const webhookMandat = 'https://discord.com/api/webhooks/1403683432227410001/aSOQ2awWpU5bBgGsgo1E0k_kkBIGU6bwOUEBsuSXgaVc-vp3-cmAlIWk5wHSkkdLheNg';
const webhookSadDecyzja = 'https://discord.com/api/webhooks/1403681144029057074/qWog2W1UxsgQp1P_IzmI0sqjmXtC7ZD4Fw3XsGhLX39AFaW31cyTC1Y0bNh6AfeqXy8c';
const webhookWniosekSad = 'https://discord.com/api/webhooks/1412788434648694804/n60lhu1ldk_rwms5f7TCE5XE3JO8XM-TZ4zReqem8dKynqoohH5_e4HFuInINYiVDCnd';
const webhookRaport = 'https://discord.com/api/webhooks/1434821037069045853/0iztVif0V05Up-p8MbO33dgoDeUzDeeOBaU0nQGHZpnuNp81IhfOfSYsxzQ_4Wg4Zgew';

// Funkcje pomocnicze
function toggleInnePole() {
    const przyczynaEl = document.getElementById('przyczyna');
    const div = document.getElementById('innePrzyczynaDiv');
    if (!przyczynaEl || !div) return;
    const przyczyna = przyczynaEl.value;
    div.style.display = przyczyna ? 'block' : 'none';
}

function pokazPoleArtykulu() {
    const select = document.getElementById("przyczyna");
    const inneDiv = document.getElementById("innePrzyczynaDiv");
    if (!select || !inneDiv) return;

    if (select.value !== "") {
        inneDiv.style.display = "block";
    } else {
        inneDiv.style.display = "none";
    }
}

function toggleRaportType() {
    const sel = document.getElementById('rodzajRaportu');
    const patrol = document.getElementById('patrolFields');
    const interw = document.getElementById('interwencjaFields');
    if (!sel || !patrol || !interw) return;

    const type = sel.value;
    patrol.style.display = type === 'patrol' ? 'block' : 'none';
    interw.style.display = type === 'interwencja' ? 'block' : 'none';
}

// NOWE: WNIOSEK - przełączanie pól w zależności od typu
function toggleWniosekType() {
    const sel = document.getElementById('typWniosku');
    const odmowa = document.getElementById('wniosekOdmowa');
    const sad = document.getElementById('wniosekSad');
    if (!sel || !odmowa || !sad) return;

    const isOdmowa = sel.value === 'odmowa';
    odmowa.style.display = isOdmowa ? 'block' : 'none';
    sad.style.display = isOdmowa ? 'none' : 'block';

    // wymagane pola zależnie od typu
    const powodOdmowa = document.getElementById('powodOdmowa');
    const opisSad = document.getElementById('opisSad');
    if (powodOdmowa) powodOdmowa.required = isOdmowa;
    if (opisSad) opisSad.required = !isOdmowa;
}

/**
 * Wysyła embed do webhooka Discord.
 */
async function wyslijWebhook(url, embed, content = null) {
    const bodyObj = content ? { content: content, embeds: [embed] } : { embeds: [embed] };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyObj)
        });
        if (!response.ok) {
            const text = await response.text().catch(() => response.statusText);
            throw new Error(`Błąd sieci: ${response.status} ${response.statusText} — ${text}`);
        }
        return { ok: true, status: response.status, statusText: response.statusText };
    } catch (err) {
        const e = new Error(err.message || String(err));
        e.isNetwork = true;
        throw e;
    }
}

function setStatus(elementId, message, isSuccess) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.classList.remove('status-success', 'status-error');
    if (isSuccess === true) el.classList.add('status-success');
    if (isSuccess === false) el.classList.add('status-error');
}

function escapeNewlinesAsQuote(text) {
    if (!text) return '—';
    return text.split('\n').map(line => `> ${line}`).join('\n');
}
function escapeNewlinesAsList(text) {
    if (!text) return '—';
    return text.split('\n').map(line => `• ${line}`).join('\n');
}

// --- INIT + FORM HANDLERS ---
document.addEventListener('DOMContentLoaded', () => {
    // Mandat – init pola artykułu (jeśli jesteśmy na stronie mandatu)
    pokazPoleArtykulu();

    // Raporty – init (jeśli jesteśmy na stronie raportów)
    toggleRaportType();

    // Wniosek – init (jeśli jesteśmy na stronie wniosku)
    toggleWniosekType();

    // MANDAT
    const mandatForm = document.getElementById('mandatForm');
    if (mandatForm) {
        mandatForm.addEventListener('submit', async e => {
            e.preventDefault();
            setStatus('statusMandat', 'Wysyłam mandat...', null);
            try {
                const imie = document.getElementById('imie').value.trim();
                const nick = document.getElementById('nick').value.trim();
                const dataWystawieniaRaw = document.getElementById('dataWystawienia').value;
                const godzinaZdarzeniaRaw = document.getElementById('godzinaZdarzenia').value;
                const miejsce = document.getElementById('miejsce').value.trim();
                let przyczyna = document.getElementById('przyczyna').value;

                // Pole artykułu wymagane zawsze
                const artykul = document.getElementById('innePrzyczyna').value.trim();
                if (!artykul) {
                    setStatus('statusMandat', 'Proszę wpisać dokładny artykuł (pole wymagane).', false);
                    return;
                }

                if (przyczyna === 'inne') {
                    przyczyna = artykul;
                } else {
                    przyczyna = `${przyczyna} — (${artykul})`;
                }

                const kwota = Number(document.getElementById('kwota').value);
                const punkty = Number(document.getElementById('punkty').value);
                const pojazd = document.getElementById('pojazd').value.trim();
                const funkcjonariusz = document.getElementById('funkcjonariusz').value.trim();

                const dataObj = new Date(dataWystawieniaRaw);
                const dataStr = isNaN(dataObj) ? '—' : (dataObj.toLocaleDateString('pl-PL') + ', godz. ' + dataObj.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }));
                const godzinaZdarzenia = godzinaZdarzeniaRaw || '—';

                const embed = {
                    title: ":money_with_wings: MANDAT KARNY",
                    description: "**Komenda Wojewódzka Policji w Gdańsku – Summer RP**",
                    color: 0xdc143c,
                    fields: [
                        { name: '\u200b', value: `**Dane osoby ukaranej**\n> Imię i nazwisko: **${imie}**\n> Nick (OOC): ${nick}` },
                        { name: '\u200b', value: `**Informacje o zdarzeniu**\n> Data i godzina wystawienia: **${dataStr}**\n> Godzina zdarzenia: **${godzinaZdarzenia}**\n> Miejsce zdarzenia: **${miejsce}**` },
                        { name: '\u200b', value: `**Przyczyna nałożenia mandatu**\n> **${przyczyna}**` },
                        { name: '\u200b', value: `**Wymiar kary**\n> Kwota mandatu: **${kwota.toLocaleString()} PLN**\n> Punkty karne: **${punkty} pkt**` },
                        { name: '\u200b', value: `**Dane pojazdu**\n> Typ: ${pojazd}` },
                        { name: '\u200b', value: `**Funkcjonariusz wystawiający**\n> **${funkcjonariusz}**` },
                        { name: ':warning: Informacja', value: 'Mandat należy uiścić w terminie 7 dni. Brak zapłaty skutkuje wszczęciem postępowania.' },
                    ],
                    footer: { text: "Komenda Wojewódzka Policji w Gdańsku – Summer RP" },
                    timestamp: new Date().toISOString(),
                };

                await wyslijWebhook(webhookMandat, embed);
                setStatus('statusMandat', 'Mandat został wysłany pomyślnie!', true);

                e.target.reset();
                pokazPoleArtykulu();

            } catch (err) {
                const isNetwork = !!err.isNetwork;
                if (isNetwork) {
                    setStatus('statusMandat', 'Błąd sieci/CORS podczas wysyłania mandatu. Jeśli używasz pliku lokalnego, uruchom go z serwera lub użyj prostego proxy. Szczegóły w konsoli.', false);
                    console.error('Mandat - błąd sieci/CORS:', err);
                } else {
                    setStatus('statusMandat', 'Błąd podczas wysyłania mandatu: ' + err.message, false);
                }
            }
        });
    }

    // WNIOSEK (Z WYBOREM)
    const wniosekForm = document.getElementById('wniosekForm');
    if (wniosekForm) {
        wniosekForm.addEventListener('submit', async e => {
            e.preventDefault();
            setStatus('statusWniosek', 'Wysyłam wniosek do sądu...', null);

            try {
                const ukarany = document.getElementById('ukarany').value.trim();
                const nick = document.getElementById('nickWniosek').value.trim() || '—';
                const typWniosku = document.getElementById('typWniosku')?.value || 'odmowa';

                let embed = null;

                if (typWniosku === 'odmowa') {
                    const dataMandatu = document.getElementById('dataMandatu').value || '—';
                    const typMandatu = document.getElementById('typMandatu').value.trim() || '—';
                    const kwotaMandatu = document.getElementById('kwotaMandatu').value
                        ? Number(document.getElementById('kwotaMandatu').value)
                        : '—';
                    const powod = document.getElementById('powodOdmowa').value.trim();

                    if (!powod) {
                        setStatus('statusWniosek', 'Proszę opisać powód odmowy mandatu.', false);
                        return;
                    }

                    embed = {
                        title: ":scroll: WNIOSEK DO SĄDU — ODMOWA MANDATU",
                        description: "**Komenda Wojewódzka Policji w Gdańsku – Summer RP**",
                        color: 0x3b82f6,
                        fields: [
                            { name: '\u200b', value: `**Dane osoby ukaranej**\n> Imię i nazwisko: **${ukarany}**\n> Nick (OOC): ${nick}` },
                            { name: '\u200b', value: `**Szczegóły mandatu**\n> Data wystawienia: **${dataMandatu}**\n> Typ mandatu: **${typMandatu}**\n> Kwota mandatu: **${kwotaMandatu === '—' ? '—' : `${kwotaMandatu.toLocaleString()} PLN`}**` },
                            { name: '\u200b', value: `**Opis sprawy / powód odmowy**\n> ${powod}` },
                            { name: ':information_source: Informacja', value: 'Decyzja sądu zostanie wysłana na odpowiedni kanał Discord.' }
                        ],
                        footer: { text: "Komenda Wojewódzka Policji w Gdańsku – Summer RP" },
                        timestamp: new Date().toISOString(),
                    };
                } else {
                    // SPRAWA PRZEKAZANA DO SĄDU
                    const dataCzas = document.getElementById('dataCzasZdarzeniaSad').value;
                    const dataCzasStr = dataCzas ? (new Date(dataCzas)).toLocaleString('pl-PL') : '—';
                    const miejsce = document.getElementById('miejsceSad').value.trim() || '—';
                    const kwal = document.getElementById('kwalifikacjaSad').value.trim() || '—';
                    const opis = document.getElementById('opisSad').value.trim();
                    const dowody = document.getElementById('dowodySad').value.trim() || 'Brak';

                    if (!opis) {
                        setStatus('statusWniosek', 'Proszę opisać sprawę (pole wymagane).', false);
                        return;
                    }

                    embed = {
                        title: ":scroll: WNIOSEK DO SĄDU — SPRAWA PRZEKAZANA",
                        description: "**Komenda Wojewódzka Policji w Gdańsku – Summer RP**",
                        color: 0x3b82f6,
                        fields: [
                            { name: '\u200b', value: `**Dane osoby / strony**\n> Imię i nazwisko: **${ukarany}**\n> Nick (OOC): ${nick}` },
                            { name: '\u200b', value: `**Dane zdarzenia**\n> Data i godzina: **${dataCzasStr}**\n> Miejsce: **${miejsce}**` },
                            { name: '\u200b', value: `**Kwalifikacja / podstawa**\n> ${kwal}` },
                            { name: '\u200b', value: `**Opis sprawy**\n> ${opis}` },
                            { name: '\u200b', value: `**Dowody / materiały**\n> ${dowody}` },
                            { name: ':information_source: Informacja', value: 'Decyzja sądu zostanie wysłana na odpowiedni kanał Discord.' }
                        ],
                        footer: { text: "Komenda Wojewódzka Policji w Gdańsku – Summer RP" },
                        timestamp: new Date().toISOString(),
                    };
                }

                // wysyłka na oba webhooki sądowe
                let firstOk = false;
                try { await wyslijWebhook(webhookWniosekSad, embed); firstOk = true; } catch (err1) { console.warn('Wniosek - błąd przy pierwszym webhooku:', err1); }

                let secondOk = false;
                try { await wyslijWebhook(webhookSadDecyzja, embed); secondOk = true; } catch (err2) { console.warn('Wniosek - błąd przy drugim webhooku:', err2); }

                if (firstOk || secondOk) {
                    setStatus('statusWniosek', 'Wniosek wysłany! Oczekiwanie na decyzję sądu...', true);
                    e.target.reset();
                    toggleWniosekType();
                } else {
                    setStatus('statusWniosek', 'Błąd wysyłki wniosku: żadna odpowiedź od webhooków. Możliwe: CORS (wysyłanie z przeglądarki zablokowane). Sprawdź konsolę.', false);
                    console.error('Wniosek - nie udało się wysłać na żaden webhook. Możliwe CORS / błąd sieci.');
                }

            } catch (err) {
                const isNetwork = !!err.isNetwork;
                if (isNetwork) {
                    setStatus('statusWniosek', 'Błąd sieci/CORS podczas wysyłania wniosku. Uruchom plik z serwera lub użyj prostego proxy. Szczegóły w konsoli.', false);
                    console.error('Wniosek - błąd sieci/CORS:', err);
                } else {
                    setStatus('statusWniosek', 'Błąd podczas wysyłania wniosku: ' + err.message, false);
                }
            }
        });
    }
});

// RAPORT - PATROL
async function sendPatrolReport() {
    try {
        setStatus('statusRaportPatrol', 'Wysyłam raport patrolu...', null);

        const komenda = document.getElementById('komendaPatrol').value || 'Komenda Wojewódzka Policji w Gdańsku – Summer RP';
        const dataSluzby = document.getElementById('dataSluzby').value || '—';
        const czasTrwania = document.getElementById('czasTrwania').value || '—';
        const sklad = document.getElementById('skladPatrolu').value.trim() || '—';

        const rodzajElems = document.querySelectorAll('#patrolFields input[name="rodzaj"]:checked');
        let rodzaje = Array.from(rodzajElems).map(el => el.value);
        const rodzajInny = document.getElementById('rodzajInny').value.trim();
        if (rodzaje.includes('Inny') && rodzajInny) {
            rodzaje = rodzaje.map(r => r === 'Inny' ? `Inny: ${rodzajInny}` : r);
        }
        if (rodzaje.length === 0) rodzaje = ['—'];

        const obszar = document.getElementById('obszarPatrolu').value.trim() || '—';
        const czynnosci = document.getElementById('czynnosciPatrolu').value.trim() || '—';
        const incydenty = document.getElementById('incydentyPatrolu').value.trim() || 'Brak';
        const uwagi = document.getElementById('uwagiPatrolu').value.trim() || '—';
        const sporadzil = document.getElementById('sporadzilPatrol').value.trim() || '—';
        const dataSporz = document.getElementById('dataSporzadzeniaPatrol').value || (new Date()).toLocaleDateString('pl-PL');

        const embed = {
            title: "📋 RAPORT ZE SŁUŻBY / PATROLU",
            description: `**${komenda}**`,
            color: 3447003,
            fields: [
                { name: 'Data służby', value: dataSluzby, inline: true },
                { name: 'Czas trwania służby', value: czasTrwania, inline: true },
                { name: '\u200b', value: `**Skład patrolu**\n${escapeNewlinesAsQuote(sklad)}` },
                { name: 'Rodzaj patrolu', value: rodzaje.join(', ') },
                { name: 'Obszar patrolu', value: obszar },
                { name: 'Wykonane czynności', value: escapeNewlinesAsList(czynnosci) },
                { name: 'Incydenty i interwencje', value: incydenty },
                { name: 'Uwagi własne', value: uwagi },
                { name: 'Raport sporządził', value: sporadzil },
                { name: 'Data sporządzenia', value: dataSporz }
            ],
            timestamp: new Date().toISOString(),
            footer: { text: komenda }
        };

        await wyslijWebhook(webhookRaport, embed, "**Nowy raport patrolu**");
        setStatus('statusRaportPatrol', 'Raport patrolu wysłany pomyślnie!', true);

        document.getElementById('skladPatrolu').value = '';
        document.querySelectorAll('#patrolFields input[name="rodzaj"]').forEach(i => i.checked = false);
        document.getElementById('rodzajInny').value = '';
        document.getElementById('obszarPatrolu').value = '';
        document.getElementById('czynnosciPatrolu').value = '';
        document.getElementById('incydentyPatrolu').value = '';
        document.getElementById('uwagiPatrolu').value = '';
        document.getElementById('sporadzilPatrol').value = '';
        document.getElementById('dataSporzadzeniaPatrol').value = '';

    } catch (err) {
        const isNetwork = !!err.isNetwork;
        if (isNetwork) {
            setStatus('statusRaportPatrol', 'Błąd sieci/CORS podczas wysyłania raportu patrolu. Sprawdź połączenie / hostowanie pliku.', false);
            console.error('Raport patrolu - błąd sieci/CORS:', err);
        } else {
            setStatus('statusRaportPatrol', 'Błąd podczas wysyłania raportu patrolu: ' + err.message, false);
        }
    }
}

// RAPORT - INTERWENCJA
async function sendInterwReport() {
    try {
        setStatus('statusRaportInterw', 'Wysyłam raport interwencji...', null);

        const komenda = document.getElementById('komendaInterw').value || 'Komenda Wojewódzka Policji w Gdańsku – Summer RP';
        const dataCzas = document.getElementById('dataCzasInterw').value;
        const dataCzasStr = dataCzas ? (new Date(dataCzas)).toLocaleString('pl-PL') : '—';
        const miejsce = document.getElementById('miejsceInterw').value.trim() || '—';
        const zgloszenie = document.getElementById('zgłoszenieInterw').value.trim() || '—';
        const funkcjonariusze = document.getElementById('funkcjonariuszeInterw').value.trim() || '—';
        const opis = document.getElementById('opisInterw').value.trim() || '—';
        const zatrzymane = document.getElementById('zatrzymaneOsoby').value.trim() || 'Brak';
        const dowody = document.getElementById('dowodyInterw').value.trim() || 'Brak';
        const uwagi = document.getElementById('uwagiInterw').value.trim() || '—';
        const sporadzil = document.getElementById('sporadzilInterw').value.trim() || '—';
        const dataSporz = document.getElementById('dataSporzadzeniaInterw').value || (new Date()).toLocaleDateString('pl-PL');

        const embed = {
            title: "📄 RAPORT Z INTERWENCJI",
            description: `**${komenda}**`,
            color: 15105570,
            fields: [
                { name: 'Data i godzina interwencji', value: dataCzasStr },
                { name: 'Miejsce zdarzenia', value: miejsce },
                { name: 'Zgłoszenie', value: zgloszenie },
                { name: 'Funkcjonariusze uczestniczący', value: escapeNewlinesAsQuote(funkcjonariusze) },
                { name: 'Opis przebiegu interwencji', value: opis },
                { name: 'Zatrzymane osoby', value: zatrzymane },
                { name: 'Dowody zabezpieczone', value: escapeNewlinesAsList(dowody) },
                { name: 'Uwagi końcowe', value: uwagi },
                { name: 'Raport sporządził', value: sporadzil },
                { name: 'Data sporządzenia raportu', value: dataSporz }
            ],
            timestamp: new Date().toISOString(),
            footer: { text: komenda }
        };

        await wyslijWebhook(webhookRaport, embed, "**Nowy raport z interwencji**");
        setStatus('statusRaportInterw', 'Raport interwencji wysłany pomyślnie!', true);

        document.getElementById('miejsceInterw').value = '';
        document.getElementById('zgłoszenieInterw').value = '';
        document.getElementById('funkcjonariuszeInterw').value = '';
        document.getElementById('opisInterw').value = '';
        document.getElementById('zatrzymaneOsoby').value = '';
        document.getElementById('dowodyInterw').value = '';
        document.getElementById('uwagiInterw').value = '';
        document.getElementById('sporadzilInterw').value = '';
        document.getElementById('dataSporzadzeniaInterw').value = '';

    } catch (err) {
        const isNetwork = !!err.isNetwork;
        if (isNetwork) {
            setStatus('statusRaportInterw', 'Błąd sieci/CORS podczas wysyłania raportu interwencji. Sprawdź połączenie / hostowanie pliku.', false);
            console.error('Raport interwencji - błąd sieci/CORS:', err);
        } else {
            setStatus('statusRaportInterw', 'Błąd podczas wysyłania raportu interwencji: ' + err.message, false);
        }
    }
}

// PROTOKÓŁ ZATRZYMANIA
async function sendZatrzymanieProtocol() {
    try {
        setStatus('statusZatrzymanie', 'Wysyłam protokół zatrzymania...', null);

        const dataCzasZatrzymaniaRaw = document.getElementById('dataCzasZatrzymania').value;
        const dataCzasZatrzymaniaStr = dataCzasZatrzymaniaRaw ? (new Date(dataCzasZatrzymaniaRaw)).toLocaleString('pl-PL') : '—';

        const funkcjonariusz = document.getElementById('funkcjonariuszZatrzymanie').value.trim() || '—';
        const nickFunc = document.getElementById('nickFuncZatrzymanie').value.trim() || '—';

        const osobaZatrzymanaIC = document.getElementById('osobaZatrzymanaIC').value.trim() || '—';
        const idDowod = document.getElementById('idDowodZatrzymanie').value.trim() || '—';

        const miejsce = document.getElementById('miejsceZatrzymania').value.trim() || '—';
        const powod = document.getElementById('powodZatrzymania').value.trim() || '—';
        const zabezpieczone = document.getElementById('zabezpieczonePrzedmioty').value.trim() || 'Brak';
        const czasTrwania = document.getElementById('czasTrwaniaZatrzymania').value.trim() || '—';
        const uwagi = document.getElementById('uwagiZatrzymanie').value.trim() || 'Brak';
        const dataSporz = document.getElementById('dataSporzadzeniaZatrzymania').value || (new Date()).toLocaleDateString('pl-PL');

        if (!dataCzasZatrzymaniaRaw || !funkcjonariusz || !nickFunc || !osobaZatrzymanaIC || !miejsce || !powod) {
            setStatus('statusZatrzymanie', 'Proszę wypełnić wszystkie wymagane pola (oznaczone gwiazdką).', false);
            return;
        }

        const embed = {
            title: "🚨 PROTOKÓŁ ZATRZYMANIA",
            description: "**Komenda Wojewódzka Policji w Gdańsku – Summer RP**",
            color: 0xed6a5a,
            fields: [
                { name: 'Data i godzina zatrzymania', value: `**${dataCzasZatrzymaniaStr}**` },
                { name: 'Funkcjonariusz dokonujący zatrzymania', value: `> **${funkcjonariusz}**\n> Nick OOC: ${nickFunc}` },
                { name: 'Dane osoby zatrzymanej', value: `> Imię i Nazwisko (IC): **${osobaZatrzymanaIC}**\n> ID / Numer dowodu: ${idDowod}` },
                { name: 'Miejsce zatrzymania', value: miejsce },
                { name: 'Powód zatrzymania', value: `**${powod}**` },
                { name: 'Zabezpieczone przedmioty (jeśli dotyczy)', value: escapeNewlinesAsList(zabezpieczone) },
                { name: 'Czas trwania zatrzymania', value: czasTrwania },
                { name: 'Uwagi', value: uwagi },
                { name: '--- Podpis funkcjonariusza (IC) ---', value: `**${funkcjonariusz}**\nData sporządzenia protokołu: **${dataSporz}**` }
            ],
            timestamp: new Date().toISOString(),
            footer: { text: "Komenda Wojewódzka Policji w Gdańsku – Summer RP" }
        };

        await wyslijWebhook(webhookRaport, embed, "**Nowy protokół zatrzymania**");
        setStatus('statusZatrzymanie', 'Protokół zatrzymania został wysłany pomyślnie!', true);

        document.getElementById('zatrzymanieForm').reset();

    } catch (err) {
        const isNetwork = !!err.isNetwork;
        if (isNetwork) {
            setStatus('statusZatrzymanie', 'Błąd sieci/CORS podczas wysyłania protokołu zatrzymania. Sprawdź hosting lub proxy.', false);
            console.error('Protokół zatrzymania - błąd sieci/CORS:', err);
        } else {
            setStatus('statusZatrzymanie', 'Błąd podczas wysyłania protokołu zatrzymania: ' + err.message, false);
        }
    }
}
