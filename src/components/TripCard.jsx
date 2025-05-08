// src/components/TripCard.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { TRIP_CARD_CLASSES, TRIP_CARD_LINK_TEXT } from "../utils/constants";
import { fadeInVariants } from "../utils/animationUtils"; // Neu hinzugefügt

function TripCard({ trip }) {
  return (
    <motion.div
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
      className={TRIP_CARD_CLASSES.container}
    >
      <h3 className={TRIP_CARD_CLASSES.title}>{trip.destination}</h3>
      <p className={TRIP_CARD_CLASSES.description}>{trip.description}</p>
      <p className={TRIP_CARD_CLASSES.price}>€{trip.price}</p>
      <Link to={`/trip/${trip.id}`} className={TRIP_CARD_CLASSES.link}>
        {TRIP_CARD_LINK_TEXT}
      </Link>
    </motion.div>
  );
}

TripCard.propTypes = {
  trip: PropTypes.shape({
    id: PropTypes.string.isRequired,
    destination: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
};

export default TripCard;