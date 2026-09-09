# Docelowy model Supabase dla panelu YAMURA

Ten dokument opisuje mapowanie obecnego demonstratora na docelową bazę. Nie jest migracją i nie zmienia bieżącego projektu Supabase.

## Zasada główna

`projects` jest jedynym źródłem prawdy. Numer `project_number` w formacie `YMR/rok/numer` powstaje przy pierwszym zapytaniu i nie zmienia się po akceptacji wyceny. Widok „Realizacje” jest filtrem projektów, których status osiągnął etap `quote_accepted` lub dalszy.

## Proponowane tabele

- `profiles` — dane użytkowników i rola: `admin`, `employee`, `customer`.
- `projects` — numer YMR, klient, etap, status, priorytet, opiekun, następne działanie i terminy.
- `project_participants` — wielu klientów i pracowników przypiętych do jednego projektu.
- `quotes` — kolejne, nieusuwalne wersje wyceny wraz z kwotą, ważnością i decyzją klienta.
- `project_events` — dopisywany dziennik zdarzeń; wpisy publiczne i wewnętrzne.
- `project_documents` — metadane plików, wersja, kategoria i widoczność dla klienta.
- `project_tasks` — działania, termin, właściciel, odbiorca oraz stan wykonania.
- `appointments` — konsultacje, pomiary, montaże i odbiory.
- `project_checklist_items` — kontrola kompletności etapów.
- `project_notes` — notatki widoczne wyłącznie dla zespołu.
- `payments` — harmonogram i status płatności; bez zastępowania programu księgowego.
- `conversations` oraz `messages` — rozmowy zawsze powiązane z projektem YMR.
- `customer_invitations` — jednorazowe zaproszenia wiążące zweryfikowane konto z projektem.

## Dostęp i RLS

- Klient odczytuje tylko projekty, w których znajduje się jako aktywny uczestnik.
- Klient widzi tylko zdarzenia i dokumenty oznaczone jako publiczne.
- Pracownik odczytuje projekty przypisane do niego lub do jego zespołu.
- Administrator zarządza całością, rolami i zaproszeniami.
- Decyzje dotyczące wycen zapisuje funkcja serwerowa, która blokuje ponowną zmianę zaakceptowanej wersji bez utworzenia nowej wersji.
- Dziennik zdarzeń jest dopisywany, a nie nadpisywany.
- Konto nie otrzymuje dostępu do historycznych projektów wyłącznie na podstawie zgodnego adresu e-mail.

## Storage

Prywatny bucket `project-attachments` powinien przechowywać pliki pod ścieżką `project_id/category/document_id/version`. Pobieranie odbywa się przez krótkotrwałe podpisane adresy po ponownym sprawdzeniu uprawnień do projektu.

## Kolejność wdrożenia

1. Tabele `projects`, `project_participants`, `project_events`, `quotes` i `project_tasks`.
2. RLS oraz testy dostępu klient/pracownik/administrator.
3. Dokumenty i prywatny Storage.
4. Zaproszenia klientów i decyzje wycen.
5. Kalendarz, wiadomości, checklisty i płatności.
6. Migracja demonstracyjnych rekordów do seeda testowego.
