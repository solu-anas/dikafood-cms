import { PiArrowSquareOut, PiChatText, PiHandPointing } from "react-icons/pi"
import "./item-card.scss"
import { useEffect, useState } from "react"
import StarRating from "./StarRating";

export default function ItemCard({ options }) {
    const [isOpenDetails, setIsOpenDetails] = useState([]);
    const [isOpenReviews, setIsOpenReviews] = useState([]);
    useEffect(() => {
        setIsOpenDetails(options.map((_) => false));
        setIsOpenReviews(options.map((_) => false));
    }, [options])
    const onOpenDetials = (index) => {
        setIsOpenDetails(prev => {
            const newArr = new Array(prev.length).fill(false);
            newArr[index] = !prev[index];
            return newArr;
        })
        setIsOpenReviews(options.map((_) => false));
    }
    const onOpenReviews = (index) => {
        setIsOpenReviews(prev => {
            const newArr = new Array(prev.length).fill(false);
            newArr[index] = !prev[index];
            return newArr;
        })
        setIsOpenDetails(options.map((_) => false));
    }
    return (
        <>
            {
                options.map((option, index) => (
                    <div className={(isOpenDetails[index] || isOpenReviews[index]) ? "item-card active" : "item-card"} key={index}>
                        <div className="header">
                            <div className="item-img">
                                <img src={option?.imgProduct} alt="" />
                                <span><PiArrowSquareOut size={'16px'} /></span>
                            </div>
                            <div className="infos">
                                <div className="item-info">
                                    <p>{option.productName}</p>
                                    <div>
                                        <div>ID<span>{option.productId}</span></div>
                                        <div>Quantity<span>{option.quantity}</span></div>
                                        <div>Price<span>${option.price}</span></div>
                                    </div>
                                </div>
                                <div className="actions">
                                    <span className={isOpenReviews[index] ? "active" : ""} onClick={() => onOpenReviews(index)}><PiChatText size={'24px'} /></span>
                                    {
                                        window.location.pathname === "/manage/orders" &&
                                        <span className={isOpenDetails[index] ? "active" : ""} onClick={() => onOpenDetials(index)}><PiHandPointing size={'24px'} /></span>
                                    }
                                </div>
                            </div>
                        </div>
                        {
                            isOpenDetails[index] && window.location.pathname === "/manage/orders" &&
                            <div className="body-details">
                                {
                                    Object.entries(option.properties).length !== 0 ?
                                        <>
                                            <p>Properties</p>
                                            <div className="properties">
                                                {
                                                    Object.entries(option.properties).map(([key, value]) => (
                                                        <div className="property" key={key}>
                                                            <p>{key}</p>
                                                            <p>{value}</p>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </>
                                        :
                                        <p>this product has no properties</p>
                                }
                            </div>
                        }
                        {
                            isOpenReviews[index] &&
                            <div className="body-reviews">
                                <div className="review">
                                    <p>Review</p>
                                    <div className="parag">
                                        <p>{option.review}</p>
                                    </div>
                                </div>
                                <div className="rating">
                                    {
                                        window.location.pathname === "/manage/customers" &&
                                        <div>
                                            <p>Order ID</p>
                                            <div><p>{option.orderId}</p></div>
                                        </div>
                                    }
                                    <div>
                                        <p>Rating</p>
                                        <StarRating rating={option.rating} />
                                    </div>
                                    <div>
                                        <p>Reviewed at</p>
                                        <div><p>{option.reviewedAt}</p></div>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                ))
            }
        </>

    )
}
