<html lang="pl">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Raporty - PSP Summer RP</title>
    <link rel="icon" href="/PSP.png">
    <link rel="stylesheet" href="style.css">
</head>
<body>
<div class="container">
    <h1>Dokumentacja Państowej Straży Pożarnej</h1>

    <div class="tab-buttons">
        <button class="tab-btn active">Raport z wyjazdu</button>
    </div>

    <form id="raportPSPForm">

        <label>Jednostka:</label>
        <input type="text" id="jednostka" value="Komenda Miejska PSP – Gdańsk (Summer RP)" />

        <div class="row">
            <div>
                <label>Data i godzina alarmowania:</label>
                <input type="datetime-local" id="dataAlarmowania" />
            </div>
            <div>
                <label>Data i godzina zakończenia działań:</label>
                <input type="datetime-local" id="dataZakonczenia" />
            </div>
        </div>

        <label>Miejsce zdarzenia:</label>
        <input type="text" id="miejsceZdarzenia" placeholder="np. ul. Długa 15, Gdańsk" />

        <label>Rodzaj zdarzenia:</label>
        <select id="rodzajZdarzenia">
            <option>Pożar</option>
            <option>Wypadek drogowy</option>
            <option>Miejscowe zagrożenie</option>
            <option>Alarm fałszywy</option>
            <option>Inne</option>
        </select>

        <label>Siły i środki (każdy w nowej linii):</label>
        <textarea id="silySrodki" placeholder="GBA 2,5/16 – JRG 1 Gdańsk&#10;GCBA 5/32 – JRG 1 Gdańsk"></textarea>

        <label>Obsada (stopień + imię i nazwisko):</label>
        <textarea id="obsada" placeholder="ogn. Jan Kowalski&#10;st. str. Piotr Nowak"></textarea>

        <label>Opis przebiegu działań:</label>
        <textarea id="opisDzialan" placeholder="Po przybyciu na miejsce zdarzenia stwierdzono..."></textarea>

        <label>Osoby poszkodowane:</label>
        <textarea id="poszkodowani" placeholder='Jeżeli brak – wpisać "Brak"'></textarea>

        <label>Udzielona pomoc:</label>
        <textarea id="pomoc" placeholder="Kwalifikowana pierwsza pomoc&#10;Zabezpieczenie miejsca zdarzenia"></textarea>

        <label>Straty:</label>
        <textarea id="straty" placeholder="np. Spaleniu uległ pojazd osobowy"></textarea>

        <label>Uwagi końcowe:</label>
        <textarea id="uwagi" placeholder="Np. Działania zakończono bez strat w ludziach"></textarea>

        <label>Dowódca działań ratowniczych:</label>
        <input type="text" id="kdr" placeholder="np. asp. sztab. Marek Wiśniewski" />

        <div class="row">
            <div>
                <label>Data sporządzenia raportu:</label>
                <input type="date" id="dataSporzadzenia" />
            </div>
            <div>
                <label>&nbsp;</label>
                <button type="button" class="send-btn">Wyślij raport PSP</button>
            </div>
        </div>

        <div id="statusRaportPSP"></div>
    </form>
</div>

<script src="app.js"></script>
</body>
</html>
