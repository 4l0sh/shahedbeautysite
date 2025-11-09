"use client";

import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { saveAppointmentToDatabase } from "../utils/saveAppointment";
import "./booking.css";

export default function Booking() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [bookingData, setBookingData] = useState({
    pkg: "",
    date: null,
    time: "",
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  // Static options memoized to avoid re-creating each render
  const packages = useMemo(
    () => [
      {
        id: "oks-bik-ben",
        name: "Oksel, bikini en onder benen",
        price: "€100",
        description: "Oksel, bikini en onderbenen behandeling",
        icon: "🦵",
        isSpecial: false,
      },
      {
        id: "hele-lichaam",
        name: "Hele lichaam",
        price: "€199",
        description: "Volledig lichaam behandeling",
        icon: "💎",
        isSpecial: true,
      },
      {
        id: "oks-bik",
        name: "Oksel en bikini",
        price: "€75",
        description: "Oksel en bikini behandeling",
        icon: "👙",
        isSpecial: false,
      },
    ],
    []
  );

  const timeSlots = useMemo(
    () => ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"],
    []
  );

  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      date.setHours(0, 0, 0, 0);
      dates.push(date);
    }
    return dates;
  }, []);

  const updateBookingData = useCallback((field, value) => {
    setBookingData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const canContinue = () => {
    if (step === 1) return bookingData.pkg !== "";
    if (step === 2) return bookingData.date !== null && bookingData.time !== "";
    if (step === 3)
      return (
        bookingData.name.length > 1 &&
        /\S+@\S+\.\S+/.test(bookingData.email) &&
        bookingData.phone.length >= 7
      );
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

      // First create the appointment and get the payment URL
      const response = await fetch(`${apiUrl}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error("Failed to create appointment");
      }

      const data = await response.json();

      // Redirect to Mollie payment page
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No payment URL received");
      }
    } catch (error) {
      console.error("Failed to process booking:", error);
      alert("Er is een fout opgetreden. Probeer het opnieuw.");
      setSubmitting(false);
    }
  };

  const downloadCalendar = () => {
    if (!bookingData.date || !bookingData.time) return;

    const [hours, minutes] = bookingData.time.split(":").map(Number);
    const startDate = new Date(bookingData.date);
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + 45 * 60 * 1000);

    const formatDate = (date) =>
      date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ICONIC Diamond Diode Laser//Booking//EN",
      "BEGIN:VEVENT",
      `UID:${Date.now()}@iconic-laser`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:Laser Ontharing — ${
        packages.find((p) => p.id === bookingData.pkg)?.name
      }`,
      "LOCATION:ICONIC Diamond Diode Laser Kliniek",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\n");

    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "afspraak.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const [instructionsChecked, setInstructionsChecked] = useState(false);
  const [showCareInfo, setShowCareInfo] = useState(false);

  if (confirmed) {
    return (
      <div className="booking-page">
        <div className="booking-container">
          <div className="booking-confirmed">
            <div className="confirmed-icon">✅</div>
            <h1 className="confirmed-title">Afspraak Bevestigd!</h1>
            <p className="confirmed-text">
              We hebben een bevestiging naar uw e-mail gestuurd. Voeg het toe
              aan uw agenda hieronder, of stuur ons een bericht bij vragen.
            </p>
            <div className="confirmed-actions">
              <button onClick={downloadCalendar} className="confirmed-btn">
                📅 Toevoegen aan Agenda
              </button>
              <a
                href="https://wa.me/31612345678?text=Hallo%20ICONIC%20Laser%2C%20ik%20heb%20een%20vraag%20over%20mijn%20afspraak."
                target="_blank"
                rel="noopener noreferrer"
                className="confirmed-btn"
              >
                💬 Chat via WhatsApp
              </a>
            </div>
            <button
              onClick={() => navigate("/")}
              className="confirmed-home-btn"
            >
              Terug naar Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-container">
        <div className="booking-header">
          <h1 className="booking-title">Boek Je Speciale Aanbieding</h1>
          <p className="booking-subtitle">
            Volledig lichaam behandeling voor slechts €200 (normaal €300).
            Beperkte tijd aanbieding!
          </p>

          <div className="callout callout--info">
            <div className="callout-row">
              <span>ℹ️ Voorzorg & nazorg instructies</span>
              <button
                type="button"
                className="link-btn"
                onClick={() => setShowCareInfo((v) => !v)}
              >
                {showCareInfo ? "Verberg" : "Bekijk"}
              </button>
            </div>
            {showCareInfo && (
              <div className="care-body">
                <h3>Voor de behandeling</h3>
                <ul>
                  <li>Scheer het behandelgebied 12–24 uur vooraf</li>
                  <li>Vermijd zon/zelfbruiners (minimaal 2 weken)</li>
                  <li>Geen harsen/epileren (4 weken voorafgaand)</li>
                  <li>
                    Huid schoon, droog en zonder lotions op de behandeldag
                  </li>
                </ul>
                <h3>Na de behandeling</h3>
                <ul>
                  <li>Vermijd hitte/warme douches 1–2 dagen</li>
                  <li>Vermijd sporten/sauna/spa 5 dagen</li>
                  <li>Dagelijks SPF, 2 weken zon vermijden</li>
                  <li>
                    Niet wrijven of krabben; na 5 dagen mag je handmatig
                    scrubben
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="booking-stepper">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="stepper-item">
              <div
                className={`stepper-number ${
                  step >= s ? "stepper-active" : ""
                }`}
              >
                {step > s ? "✓" : s}
              </div>
              <span
                className={`stepper-label ${
                  step >= s ? "stepper-label-active" : ""
                }`}
              >
                {s === 1 && "Pakket"}
                {s === 2 && "Datum & Tijd"}
                {s === 3 && "Gegevens"}
                {s === 4 && "Bevestigen"}
              </span>
            </div>
          ))}
        </div>

        <div className="booking-content">
          {step === 1 && (
            <div className="step-content">
              <h2 className="step-title">Jouw Speciale Aanbieding</h2>
              <div className="packages-grid single-package-booking">
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => updateBookingData("pkg", pkg.id)}
                    className={`package-option ${
                      bookingData.pkg === pkg.id ? "package-selected" : ""
                    } ${pkg.isSpecial ? "package-special" : ""}`}
                  >
                    <div className="package-icon">{pkg.icon}</div>
                    <div className="package-name">{pkg.name}</div>
                    <div className="package-pricing">
                      <div className="package-price">{pkg.price}</div>
                      {pkg.originalPrice && (
                        <div className="package-original-price">
                          {pkg.originalPrice}
                        </div>
                      )}
                    </div>
                    <div className="package-desc">{pkg.description}</div>
                  </button>
                ))}
              </div>
              <div className="special-offer-note">
                <p>
                  🔥 Beperkte tijd aanbieding - Bespaar €100 op onze volledige
                  lichaam behandeling!
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <h2 className="step-title">Selecteer Datum & Tijd</h2>
              <div className="datetime-grid">
                <div className="date-selection">
                  <h3 className="selection-title">Beschikbare Data</h3>
                  <div className="dates-grid">
                    {availableDates.map((date, index) => (
                      <button
                        key={index}
                        onClick={() => updateBookingData("date", date)}
                        className={`date-option ${
                          bookingData.date?.toDateString() ===
                          date.toDateString()
                            ? "date-selected"
                            : ""
                        }`}
                      >
                        <div className="date-day">
                          {date.toLocaleDateString("nl-NL", {
                            weekday: "short",
                          })}
                        </div>
                        <div className="date-date">
                          {date.toLocaleDateString("nl-NL", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="time-selection">
                  <h3 className="selection-title">Beschikbare Tijden</h3>
                  <div className="times-grid">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => updateBookingData("time", time)}
                        className={`time-option ${
                          bookingData.time === time ? "time-selected" : ""
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                  <div className="booking-info">
                    <div className="info-item">
                      <span>⏱️</span>
                      <span>Gemiddelde behandeling: 30–60 minuten</span>
                    </div>
                    <div className="info-item">
                      <span>❄️</span>
                      <span>Pijnloze behandeling bij -24°</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content">
              <h2 className="step-title">Uw Gegevens</h2>
              <div className="details-form">
                <div className="form-left">
                  <div className="form-group">
                    <label className="form-label">Volledige Naam</label>
                    <input
                      type="text"
                      value={bookingData.name}
                      onChange={(e) =>
                        updateBookingData("name", e.target.value)
                      }
                      placeholder="Jan Jansen"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">E-mail</label>
                    <input
                      type="email"
                      value={bookingData.email}
                      onChange={(e) =>
                        updateBookingData("email", e.target.value)
                      }
                      placeholder="jan@voorbeeld.nl"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Telefoon</label>
                    <input
                      type="tel"
                      value={bookingData.phone}
                      onChange={(e) =>
                        updateBookingData("phone", e.target.value)
                      }
                      placeholder="+31 6 1234 5678"
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-right">
                  <div className="form-group">
                    <label className="form-label">
                      Opmerkingen (Optioneel)
                    </label>
                    <textarea
                      value={bookingData.notes}
                      onChange={(e) =>
                        updateBookingData("notes", e.target.value)
                      }
                      placeholder="Vertel ons over uw doelen, gevoelige gebieden, of eventuele vragen."
                      rows={8}
                      className="form-textarea"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="step-content">
              <h2 className="step-title">Controleren & Bevestigen</h2>
              <div
                className="callout callout--warning"
                style={{ marginBottom: 20 }}
              >
                <p style={{ margin: 0 }}>
                  <strong>💰 Betaling:</strong> Bij bevestigen wordt een borg
                  van €20 betaald. Dit bedrag wordt verrekend met de
                  behandeling. Na betaling is uw afspraak definitief bevestigd.
                </p>
              </div>
              <div className="booking-summary">
                <h3 className="summary-title">Afspraak Overzicht</h3>
                <div className="summary-details">
                  <div className="summary-row">
                    <span>Pakket:</span>
                    <span>
                      {packages.find((p) => p.id === bookingData.pkg)?.name}
                    </span>
                  </div>
                  <div className="summary-row">
                    <span>Datum:</span>
                    <span>{bookingData.date?.toLocaleDateString("nl-NL")}</span>
                  </div>
                  <div className="summary-row">
                    <span>Tijd:</span>
                    <span>{bookingData.time}</span>
                  </div>
                  <div className="summary-row">
                    <span>Naam:</span>
                    <span>{bookingData.name}</span>
                  </div>
                  <div className="summary-row">
                    <span>E-mail:</span>
                    <span>{bookingData.email}</span>
                  </div>
                  <div className="summary-row">
                    <span>Telefoon:</span>
                    <span>{bookingData.phone}</span>
                  </div>
                  {bookingData.notes && (
                    <div className="summary-notes">
                      <span>Opmerkingen:</span>
                      <span>{bookingData.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="booking-actions">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="action-btn action-btn-secondary"
            >
              ← Terug
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canContinue()}
              className="action-btn action-btn-primary"
            >
              {step === 1 && "Volgende: Datum & Tijd →"}
              {step === 2 && "Volgende: Uw Gegevens →"}
              {step === 3 && "Controleren & Bevestigen →"}
            </button>
          ) : (
            <div>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 500,
                    color: "#db2777",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={instructionsChecked}
                    onChange={(e) => setInstructionsChecked(e.target.checked)}
                    style={{ marginRight: 8, accentColor: "#db2777" }}
                  />
                  Ik heb de voorzorg & nazorg instructies gelezen en begrepen
                </label>
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting || !instructionsChecked}
                className="action-btn action-btn-primary"
              >
                {submitting ? (
                  <>
                    <span className="loading-spinner">⏳</span>
                    Bezig met boeken...
                  </>
                ) : (
                  "Afspraak Bevestigen"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
