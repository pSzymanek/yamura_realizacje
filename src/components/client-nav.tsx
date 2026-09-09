"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export type ClientNavProject = {
  orderNumber: string;
  title: string;
  token: string;
  status: string;
  isCurrent?: boolean;
};

type ClientNavProps = {
  currentOrderNumber: string;
  currentToken: string;
  serverProjects?: ClientNavProject[];
};

export function ClientNav({
  currentOrderNumber,
  currentToken,
  serverProjects = [],
}: ClientNavProps) {
  const [storedProjects, setStoredProjects] = useState<ClientNavProject[]>([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("yamura_tracked_orders");
      let list: ClientNavProject[] = stored ? JSON.parse(stored) : [];

      const exists = list.some((p) => p.orderNumber === currentOrderNumber);
      if (!exists) {
        list.push({
          orderNumber: currentOrderNumber,
          title: "",
          token: currentToken,
          status: "active",
        });
      }

      for (const sp of serverProjects) {
        if (!list.some((p) => p.orderNumber === sp.orderNumber)) {
          list.push(sp);
        }
      }

      localStorage.setItem("yamura_tracked_orders", JSON.stringify(list));
      setStoredProjects(list);
    } catch {
      setStoredProjects(serverProjects);
    }
  }, [currentOrderNumber, currentToken, serverProjects]);

  const allProjects = storedProjects.length > 0 ? storedProjects : serverProjects;

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    if (!query) return;

    const match = allProjects.find(
      (p) =>
        p.orderNumber.toUpperCase() === query ||
        p.orderNumber.toUpperCase().includes(query) ||
        p.token.toLowerCase() === searchQuery.trim().toLowerCase(),
    );

    if (match) {
      window.location.href = "/r/" + match.token;
      return;
    }

    if (query.length === 64) {
      window.location.href = "/r/" + query.toLowerCase();
      return;
    }

    setSearchError(
      "Nie znaleziono realizacji o numerze „" + query + "”. Upewnij się, że wpisano poprawny numer z umowy.",
    );
  };

  return (
    <nav className="client-top-bar" aria-label="Nawigacja po realizacjach klienta">
      <div className="client-top-bar__inner">
        <div className="client-top-bar__orders">
          <span className="client-top-bar__label">Twoje realizacje:</span>
          <div className="client-top-bar__pills">
            {allProjects.map((proj) => {
              const isCurrent = proj.orderNumber === currentOrderNumber;
              return (
                <Link
                  key={proj.orderNumber}
                  href={"/r/" + proj.token}
                  className={"client-order-pill" + (isCurrent ? " client-order-pill--current" : "")}
                >
                  <span className="client-order-pill__num">{proj.orderNumber}</span>
                  {isCurrent && <span className="client-order-pill__active-tag">(aktywna)</span>}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="client-top-bar__actions">
          <button
            type="button"
            className="client-lookup-btn"
            onClick={() => setShowSearchModal(true)}
          >
            <span>+</span> Dodaj / wyszukaj numer
          </button>
        </div>
      </div>

      {showSearchModal && (
        <div
          className="client-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowSearchModal(false)}
        >
          <div className="client-modal" onClick={(e) => e.stopPropagation()}>
            <div className="client-modal__header">
              <h3>Wyszukaj inną realizację</h3>
              <button
                type="button"
                className="client-modal__close"
                onClick={() => setShowSearchModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleLookup} className="client-modal__form">
              <label htmlFor="orderQuery">
                Wpisz numer zamówienia (np. <code>YMR/2026/084</code>):
              </label>
              <div className="client-modal__input-wrap">
                <input
                  id="orderQuery"
                  type="text"
                  placeholder="np. YMR/2026/084"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchError("");
                  }}
                  autoFocus
                />
                <button type="submit" className="button button--primary button--small">
                  Otwórz
                </button>
              </div>
              {searchError && <p className="client-modal__error">{searchError}</p>}
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}
