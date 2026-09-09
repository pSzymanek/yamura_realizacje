"use client";

import { useState } from "react";
import Link from "next/link";
import { DemoAdminCustomer } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { CopyInviteButton } from "./copy-invite-button";
import { EditCustomerModal, SimpleProject } from "./edit-customer-modal";

const statusLabels = { active: "Aktywne", invited: "Zaproszone", inactive: "Nieaktywne" } as const;

export function UsersTableClient({
  customers,
  allProjects,
  appUrl,
}: {
  customers: DemoAdminCustomer[];
  allProjects: SimpleProject[];
  appUrl: string;
}) {
  const [editingCustomer, setEditingCustomer] = useState<DemoAdminCustomer | null>(null);

  return (
    <>
      <div className="projects-table-wrap admin-users-table-wrap">
        <table className="projects-table admin-users-table">
          <thead>
            <tr>
              <th>Klient</th>
              <th>Kontakt</th>
              <th>Miejscowość</th>
              <th>Projekty</th>
              <th>Status</th>
              <th>
                <span className="sr-only">Akcje</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => {
              const isInvited = customer.status === "invited" || Boolean(customer.invitation_token);

              return (
                <tr key={customer.id}>
                  <td data-label="Klient">
                    <div className="admin-user-name">
                      <i>{customer.full_name.slice(0, 1).toUpperCase()}</i>
                      <span>
                        <strong>{customer.full_name}</strong>
                        <small>
                          {customer.registered_at
                            ? `dodano ${formatDate(customer.registered_at)}`
                            : "rejestracja w toku"}
                        </small>
                      </span>
                    </div>
                  </td>

                  <td data-label="Kontakt">
                    <strong>{customer.email}</strong>
                    <span>{customer.phone !== "—" ? customer.phone : ""}</span>
                  </td>

                  <td data-label="Miejscowość">
                    <strong>{customer.city}</strong>
                  </td>

                  <td data-label="Projekty">
                    <strong>{customer.project_numbers.length}</strong>
                    <span>{customer.project_numbers.join(", ") || "Brak"}</span>
                  </td>

                  <td data-label="Status">
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-start" }}>
                      <span className={`admin-account-status admin-account-status--${customer.status}`}>
                        <i />
                        {statusLabels[customer.status as keyof typeof statusLabels] || customer.status}
                      </span>
                      {isInvited && customer.invitation_token && (
                        <div style={{ marginTop: "2px" }}>
                          <CopyInviteButton token={customer.invitation_token} appUrl={appUrl} variant="compact" />
                        </div>
                      )}
                    </div>
                  </td>

                  <td>
                    <div className="admin-row-actions">
                      <Link
                        className="button button--secondary button--small"
                        style={{ fontSize: "0.8rem", padding: "5px 10px" }}
                        href={`/panel/realizacje?q=${encodeURIComponent(customer.email !== "—" ? customer.email : customer.full_name)}`}
                      >
                        Projekty
                      </Link>
                      <button
                        type="button"
                        onClick={() => setEditingCustomer(customer)}
                        className="button button--primary button--small"
                        style={{ fontSize: "0.8rem", padding: "5px 12px", cursor: "pointer" }}
                      >
                        Edytuj
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!customers.length && (
          <div className="empty-state">
            <h2>Brak klientów</h2>
            <p>Dodaj pierwszą realizację lub zaproś klienta przez formularz zaproszeń.</p>
          </div>
        )}
      </div>

      {editingCustomer && (
        <EditCustomerModal
          customer={editingCustomer}
          allProjects={allProjects}
          appUrl={appUrl}
          onClose={() => setEditingCustomer(null)}
        />
      )}
    </>
  );
}
