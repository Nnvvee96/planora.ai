// src/pages/PastTripsPage.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { PAST_TRIPS_PAGE_CLASSES } from "../utils/constants";

function PastTripsPage() {
  const { user } = useAuth();

  return (
    <div className={PAST_TRIPS_PAGE_CLASSES.container}>
      <Navbar />
      <div className={PAST_TRIPS_PAGE_CLASSES.card}>
        <h2 className={PAST_TRIPS_PAGE_CLASSES.title}>Your Past Trips</h2>
        {user?.trips?.length > 0 ? (
          <div className={PAST_TRIPS_PAGE_CLASSES.tripContainer}>
            {user.trips.map((trip) => (
              <div key={trip.id} className={PAST_TRIPS_PAGE_CLASSES.tripCard}>
                <h3 className={PAST_TRIPS_PAGE_CLASSES.tripTitle}>{trip.destination}</h3>
                <p className={PAST_TRIPS_PAGE_CLASSES.tripText}>
                  {trip.startDate} to {trip.endDate}
                </p>
                <p className={PAST_TRIPS_PAGE_CLASSES.tripText}>Budget: ${trip.budget}</p>
                {trip.notes && (
                  <p className={PAST_TRIPS_PAGE_CLASSES.tripNotes}>Notes: {trip.notes}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className={PAST_TRIPS_PAGE_CLASSES.emptyText}>You haven’t planned any trips yet.</p>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default PastTripsPage;