import { PiX } from "react-icons/pi"
import "./order-details.scss"
import ItemCard from "./ItemCard"

export default function OrderDetails({ onClose, options, images }) {
    return (
        <div className="order-details">
            <div className="header">
                <p>Order Details</p>
                <span onClick={onClose}>
                    <PiX size={"18px"} />
                </span>
            </div>
            <div className="items">
                <p>Ordered items</p>
                <div className="items-container">
                    <ItemCard options={options.map((order) => (
                        {
                            imgProduct: images[order.main.productId],
                            productName: order.main.productTitle,
                            productId: order.main.productSerialNumber,
                            quantity: order.main.quantity,
                            price: order.main.price,
                            properties: order.main.properties,
                            review: order.productReview.review,
                            rating: order.productReview.rating,
                            reviewedAt: order.productReview.reviewedAt
                        }
                    ))} />
                </div>
            </div>
        </div>
    )
}
