# YAMURA — Dziennik Realizacji

Prywatna aplikacja do prowadzenia realizacji zamówień. Pracownicy YAMURA tworzą realizacje, publikują aktualizacje i zdjęcia, a klient śledzi przebieg przez nieprzewidywalny link bez zakładania konta.

## Jak działa aplikacja

- `/login` — logowanie pracownika przez Supabase Auth,
- `/panel` — chroniona lista realizacji z wyszukiwaniem i filtrowaniem,
- `/panel/nowa` — tworzenie realizacji i bezpiecznego tokena,
- `/panel/realizacje/[id]` — edycja danych, wpisy dziennika i zdjęcia,
- `/r/[token]` — prywatny, tylko do odczytu widok klienta.

Zapisy pracowników korzystają z sesji użytkownika i Supabase RLS. Widok klienta jest renderowany na serwerze po dopasowaniu losowego tokena 256-bitowego. Prywatne zdjęcia mają krótkotrwałe signed URL-e (10 minut). Klucz `service_role` jest używany tylko po stronie serwera.

## Wymagania

- Node.js 20.9 lub nowszy (zalecana aktualna wersja LTS),
- npm,
- konto i projekt w [Supabase](https://supabase.com/),
- Git.

Node.js można pobrać z [nodejs.org](https://nodejs.org/). Po instalacji sprawdź:

```powershell
node --version
npm --version
```

## Uruchomienie lokalne

### 1. Instalacja projektu

W katalogu projektu:

```powershell
npm install
```

### 2. Utworzenie projektu Supabase

1. Zaloguj się do Supabase i wybierz **New project**.
2. Ustaw silne hasło bazy i zapisz je w menedżerze haseł.
3. Poczekaj na uruchomienie projektu.
4. W **Project Settings → API** odczytaj:
   - Project URL,
   - Publishable key,
   - Service role key.

Publishable key może być widoczny w przeglądarce. Service role key jest sekretem i nie wolno go wysyłać klientowi ani wpisywać do zmiennej `NEXT_PUBLIC_*`.

### 3. Zmienne środowiskowe

Skopiuj `.env.example` jako `.env.local`:

```powershell
Copy-Item .env.example .env.local
```

Uzupełnij:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://TWOJ-PROJEKT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
ALLOW_DEMO_SEED=false
```

`.env.local` jest ignorowany przez Git. Nigdy go nie commituj.

### 4. Uruchomienie migracji

Migracja znajduje się w `supabase/migrations/202608190001_initial_schema.sql`. Tworzy tabele, relacje, indeksy, enumy statusów, triggery timestampów, funkcję atomowej publikacji wpisu, RLS oraz prywatny bucket Storage.

Najprościej użyć Supabase CLI bez globalnej instalacji:

```powershell
npx supabase login
npx supabase link --project-ref TWOJ_PROJECT_REF
npx supabase db push
```

`TWOJ_PROJECT_REF` to część adresu projektu przed `.supabase.co`. Polecenie `db push` może poprosić o hasło bazy ustawione przy tworzeniu projektu.

Nie twórz tabel ani bucketa ręcznie w Dashboardzie — robi to migracja.

### 5. Pierwszy administrator

1. W Supabase przejdź do **Authentication → Users**.
2. Wybierz **Add user → Create new user**.
3. Podaj email, silne hasło i zaznacz email jako potwierdzony.
4. Trigger migracji automatycznie utworzy profil z rolą `employee`.
5. W **SQL Editor** uruchom jednorazowo, podając ten sam email:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'twoj-email@yamura.pl'
);
```

Sprawdzenie:

```sql
select u.email, p.role, p.is_active
from public.profiles p
join auth.users u on u.id = p.id;
```

Admin i employee mają w MVP te same uprawnienia do realizacji. Kolumna roli jest gotowa do późniejszego rozdzielenia uprawnień.

### 6. Start aplikacji

```powershell
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000). Wejście na `/panel` bez sesji przekieruje do `/login`.

## Dane demonstracyjne

Seed jest świadomy i domyślnie zablokowany. Używaj go wyłącznie w projekcie developerskim Supabase.

1. W `.env.local` ustaw tymczasowo:

```dotenv
ALLOW_DEMO_SEED=true
```

2. Uruchom:

```powershell
npm run seed:dev
```

3. Przywróć `ALLOW_DEMO_SEED=false`.

Seed tworzy lub odświeża `YAM-TEST-001`, klienta `Jan Testowy`, realizację `Kuchnia + zabudowa` i trzy wpisy. W terminalu pokaże prywatny link klienta. Alternatywna wersja SQL znajduje się w `supabase/seed.sql`.

## Scenariusz testowy od początku do końca

1. Wejdź na `/panel` bez logowania — aplikacja powinna przenieść Cię do `/login`.
2. Zaloguj się utworzonym kontem administratora.
3. Kliknij **Nowa realizacja**.
4. Utwórz zamówienie z unikalnym numerem i poprawnym emailem.
5. Skopiuj wygenerowany link klienta.
6. Otwórz link w prywatnym oknie przeglądarki — nie powinien wymagać logowania.
7. Sprawdź, że błędny lub skrócony token pokazuje bezpieczny komunikat „Ten link nie jest aktywny”.
8. W panelu dodaj aktualizację, nowy status, następny krok, datę oraz 1–4 zdjęcia JPG/PNG/WebP.
9. Odśwież widok klienta. Sprawdź aktualny stan, oś etapów, nowy wpis i galerię.
10. Sprawdź widok klienta na telefonie lub w trybie responsywnym przeglądarki.
11. Wyloguj się i potwierdź, że bez sesji nie można wrócić do panelu.
12. W Supabase sprawdź, że bucket `project-attachments` ma ustawienie **Private**.

## Walidacja kodu

Przed wdrożeniem uruchom:

```powershell
npm run lint
npm run typecheck
npm run build
```

Test produkcyjnego startu:

```powershell
npm start
```

`next start` korzysta z `process.env.PORT`; aplikacja nie wymusza portu 3000.

## Wdrożenie na WEBD.pl (Node.js)

Dokładne nazwy pól zależą od bieżącego panelu hostingu, ale potrzebna konfiguracja jest standardowa dla aplikacji Node.js:

1. Wybierz Node.js co najmniej 20.9 (najlepiej wersję LTS obsługiwaną przez hosting).
2. Ustaw katalog aplikacji na katalog repozytorium.
3. Ustaw produkcyjne zmienne środowiskowe:
   - `NEXT_PUBLIC_SUPABASE_URL`,
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
   - `SUPABASE_SERVICE_ROLE_KEY`,
   - `NEXT_PUBLIC_APP_URL=https://realizacja.yamura.pl`,
   - `NODE_ENV=production`,
   - `ALLOW_DEMO_SEED=false`.
4. `SUPABASE_SERVICE_ROLE_KEY` dodaj jako sekret hostingu, nigdy jako plik publiczny.
5. Skieruj domenę i HTTPS do aplikacji Node.js.
6. W Supabase **Authentication → URL Configuration** ustaw produkcyjny Site URL. Dodaj lokalny URL tylko do listy dozwolonych adresów developerskich.
7. Na serwerze wykonaj:

```sh
npm ci
npm run build
npm prune --omit=dev
npm start
```

8. Jeżeli panel wymaga komendy startowej, ustaw `npm start`.
9. Pozostaw `PORT` ustawiany przez hosting. Nie wpisuj portu 3000 na sztywno.
10. Po nowym buildzie zrestartuj proces Node.js w panelu.

Przed produkcją sprawdź limit żądania i czasu wykonania ustawiony przez proxy hostingu. Aplikacja dopuszcza maksymalnie 4 zdjęcia po 6 MB, a limit Server Action wynosi 28 MB. Hosting może mieć własny niższy limit — wtedy zmniejsz limity aplikacji albo skonfiguruj proxy.

## Co koniecznie sprawdzić przed uruchomieniem produkcji

- domena działa wyłącznie po HTTPS,
- `NEXT_PUBLIC_APP_URL` wskazuje dokładną domenę produkcyjną,
- Node.js ma wersję co najmniej 20.9,
- migracja została zastosowana w produkcyjnym Supabase,
- wszystkie konta pracowników mają poprawny `is_active` i rolę,
- test uploadu i signed URL działa za proxy WEBD,
- sekrety nie znajdują się w repozytorium ani katalogu publicznym,
- backupy PostgreSQL i procedura odtworzenia są skonfigurowane,
- logi procesu Node.js są dostępne, ale nie zawierają sekretów,
- seed demonstracyjny pozostaje wyłączony.

## Struktura danych

- `profiles` — profil i rola pracownika powiązana z `auth.users`,
- `projects` — dane realizacji i losowy, unikalny `access_token`,
- `project_updates` — historia wpisów i opcjonalna zmiana statusu,
- `attachments` — metadane prywatnych plików Storage,
- `project-attachments` — prywatny bucket; ścieżki `projects/{projectId}/{updateId}/{uuid.ext}`.

Anonimowa rola Supabase nie ma polityki odczytu żadnej z tych tabel ani plików. Klient nie może pobrać listy projektów bezpośrednio z Supabase.
