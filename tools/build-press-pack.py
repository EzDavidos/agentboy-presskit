#!/usr/bin/env python3
"""Build assets/press/agentboy-press-pack.zip from what the site already serves.

Promoters download this to make a poster: photos, the label logo and the bio
as plain text. Re-run it after changing anything in assets/img/.

    python3 tools/build-press-pack.py

Timestamps are pinned so an unchanged pack produces an identical file and does
not show up as a diff on every run.
"""

import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets/press/agentboy-press-pack.zip"
STAMP = (2026, 1, 1, 0, 0, 0)

PHOTOS = ["assets/img/hero.jpg", "assets/img/bio.jpg"] + sorted(
    str(p.relative_to(ROOT)) for p in (ROOT / "assets/img/gallery").glob("*.jpg")
)

BIO_EN = """AGENTBOY — DJ & producer
========================

ONE LINE
AGENTBOY — DJ and producer. Progressive house, indie dance, melodic techno.
Currently in Nha Trang, Vietnam. Available worldwide.

SHORT BIO
AGENTBOY (Andrii Smoliar) is a DJ and producer from Kyiv, Ukraine, currently
in Nha Trang, Vietnam and available worldwide. He plays progressive house, indie dance and melodic
techno at 122-128 BPM, and has performed across Greece, Vietnam, Thailand,
Austria and the Czech Republic — from clubs and beach bars to rooftops,
open-air festivals and private villa and yacht parties. Founder of the Impera
Casa event series, artist on Alveda Music.

BILLING NAME
AGENTBOY

GENRES
Progressive house, indie dance, melodic techno — 122-128 BPM

FORMATS
Club night, beach bar, rooftop and sunset, open-air festival, private villa
and yacht party, foam party show.

VENUES
Greece — Marmelda Bar, Bel Air 1992 Club, Tucan Beach Bar (opening), Kageles
Beach Bar, SOHO Beach Bar, Wine Law, Matute Rooftop, Brettos Bar, 7 Times.
Vietnam — NEXT LEVEL Club, Time House Bar, BOTON Rooftop, Lume Sky Bar,
Zone 86, The Garden, Madison Red Rooftop, Malibu Beach Bar.
Thailand — Shaman Club, YOOHI Club, AETHERT Rooftop.
Austria — K12 Club. Czech Republic — Ankali, Le Valmont Club.

LINKS
Press kit  https://ezdavidos.github.io/agentboy-presskit/
Spotify    https://open.spotify.com/artist/2LTT8rloXK8dqXhueuWkZp
Beatport   https://www.beatport.com/artist/agentboy/1184864
YouTube    https://www.youtube.com/@agentboymusic
Instagram  https://www.instagram.com/agentboy_ofc/
All links  https://linktr.ee/agentboymusic
"""

BIO_RU = """AGENTBOY — диджей и продюсер
============================

ОДНОЙ СТРОКОЙ
AGENTBOY — диджей и продюсер. Progressive house, indie dance, melodic techno.
Сейчас в Нячанге, Вьетнам. Готов ехать в любую точку мира.

КОРОТКОЕ БИО
AGENTBOY (Андрей Смоляр) — диджей и продюсер из Киева, сейчас в Нячанге,
Вьетнам, готов ехать в любую точку мира. Играет progressive house, indie dance и melodic techno в
диапазоне 122-128 BPM. Выступал в Греции, Вьетнаме, Таиланде, Австрии и
Чехии — от клубов и пляжных баров до руфтопов, опен-эйр фестивалей и
приватных вечеринок на виллах и яхтах. Основатель серии вечеринок Impera
Casa, артист лейбла Alveda Music.

ИМЯ НА АФИШЕ
AGENTBOY

ЖАНРЫ
Progressive house, indie dance, melodic techno — 122-128 BPM

ФОРМАТЫ
Клубная ночь, пляжный бар, руфтоп и закат, опен-эйр фестиваль, приватная
вечеринка на вилле или яхте, пенная вечеринка.

ПЛОЩАДКИ
Греция — Marmelda Bar, Bel Air 1992 Club, Tucan Beach Bar (открытие),
Kageles Beach Bar, SOHO Beach Bar, Wine Law, Matute Rooftop, Brettos Bar,
7 Times.
Вьетнам — NEXT LEVEL Club, Time House Bar, BOTON Rooftop, Lume Sky Bar,
Zone 86, The Garden, Madison Red Rooftop, Malibu Beach Bar.
Таиланд — Shaman Club, YOOHI Club, AETHERT Rooftop.
Австрия — K12 Club. Чехия — Ankali, Le Valmont Club.

ССЫЛКИ
Пресс-кит  https://ezdavidos.github.io/agentboy-presskit/
Spotify    https://open.spotify.com/artist/2LTT8rloXK8dqXhueuWkZp
Beatport   https://www.beatport.com/artist/agentboy/1184864
YouTube    https://www.youtube.com/@agentboymusic
Instagram  https://www.instagram.com/agentboy_ofc/
Все ссылки https://linktr.ee/agentboymusic
"""

CONTACTS = """AGENTBOY — booking & press

Email      agentboymusic@gmail.com
WhatsApp   +30 694 693 8249
Telegram   @agen1boy
Instagram  @agentboy_ofc

Press kit  https://ezdavidos.github.io/agentboy-presskit/
"""


def add_text(zf, name, text):
    info = zipfile.ZipInfo(name, date_time=STAMP)
    info.compress_type = zipfile.ZIP_DEFLATED
    zf.writestr(info, text)


def add_file(zf, name, path):
    info = zipfile.ZipInfo(name, date_time=STAMP)
    info.compress_type = zipfile.ZIP_DEFLATED
    zf.writestr(info, path.read_bytes())


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUT, "w") as zf:
        for rel in PHOTOS:
            add_file(zf, f"photos/{Path(rel).name}", ROOT / rel)
        add_file(zf, "logo/impera-casa.jpg", ROOT / "assets/img/logo/impera-casa.jpg")
        add_text(zf, "bio-en.txt", BIO_EN)
        add_text(zf, "bio-ru.txt", BIO_RU)
        add_text(zf, "contacts.txt", CONTACTS)

    print(f"{OUT.relative_to(ROOT)} — {OUT.stat().st_size / 1024 / 1024:.1f} MB")


if __name__ == "__main__":
    main()
