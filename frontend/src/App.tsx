import { Navigate, Route, Routes } from "react-router-dom";

import { ParticipantLayout } from "./layouts/ParticipantLayout";
import { OrganizerLayout } from "./layouts/OrganizerLayout";

import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { CadastroPage } from "./pages/auth/CadastroPage";

import { HomePage } from "./pages/participant/HomePage";
import { SearchPage } from "./pages/participant/SearchPage";
import { EventoPage } from "./pages/participant/EventoPage";
import { CheckoutPage } from "./pages/participant/CheckoutPage";
import { TicketsPage } from "./pages/participant/TicketsPage";
import { MyTicketsPage } from "./pages/participant/MyTicketsPage";

import { DashboardPage } from "./pages/organizer/DashboardPage";
import { OrgEventoPage } from "./pages/organizer/OrgEventoPage";
import { LotesPage } from "./pages/organizer/LotesPage";
import { CheckinPage } from "./pages/organizer/CheckinPage";
import { CreateEventPage } from "./pages/organizer/CreateEventPage";
import { FinancePage } from "./pages/organizer/FinancePage";
import { AttendeesPage } from "./pages/organizer/AttendeesPage";

export const App = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/cadastro" element={<CadastroPage />} />

    {/* Participante (tema escuro) */}
    <Route path="/app" element={<ParticipantLayout />}>
      <Route index element={<HomePage />} />
      <Route path="explorar" element={<SearchPage />} />
      <Route path="eventos/:id" element={<EventoPage />} />
      <Route path="eventos/:id/checkout" element={<CheckoutPage />} />
      <Route path="eventos/:id/ingressos" element={<TicketsPage />} />
      <Route path="meus-ingressos" element={<MyTicketsPage />} />
    </Route>

    {/* Organizador (tema claro) */}
    <Route path="/org" element={<OrganizerLayout />}>
      <Route index element={<DashboardPage />} />
      <Route path="evento" element={<OrgEventoPage />} />
      <Route path="lotes" element={<LotesPage />} />
      <Route path="checkin" element={<CheckinPage />} />
      <Route path="novo-evento" element={<CreateEventPage />} />
      <Route path="financeiro" element={<FinancePage />} />
      <Route path="participantes" element={<AttendeesPage />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
