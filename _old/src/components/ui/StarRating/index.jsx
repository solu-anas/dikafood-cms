import { PiStarFill, PiStar } from "react-icons/pi";
import "./styles.scss";

const StarRating = ({ rating }) => {
    const maxStars = 5;

    return (
        <div className="star-rating">
            <div className="stars">
                {[...Array(maxStars)].map((_, index) => (
                    index < rating
                        ? <PiStarFill key={index} size={"16px"} color="var(--dark-green-1)" />
                        : <PiStar key={index} size={"16px"} color="var(--dark-green-1)" />
                ))}
            </div>
            <p>{rating}/{maxStars} stars</p>
        </div>
    );
};

export default StarRating;