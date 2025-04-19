import "./order-card.scss"
import { PiCheckCircle, PiClipboardText, PiHourglassLow, PiHouse, PiInfo, PiPackage, PiPaperclip, PiTruck, PiXCircle } from 'react-icons/pi'

export default function OrderCard({ options }) {
    return (
        <>
            {
                options.map((option, index) => (
                    <div className='order-card' key={index}>
                        <div className="header">
                            <p>{option.head.serialNumber}</p>
                            <div>
                                <div className="status">
                                    <span>
                                        {
                                            option.head.deliveryStatus.toLocaleLowerCase() === "ordered" ? <PiClipboardText size={"24px"} />
                                                : (option.head.deliveryStatus.toLocaleLowerCase() === "packed" ? <PiPackage size={"24px"} /> :
                                                    (option.head.deliveryStatus.toLocaleLowerCase() === "in-transit" ? <PiTruck size={"24px"} /> : <PiHouse size={"24px"} />))
                                        }
                                    </span>
                                    <p>{option.head.deliveryStatus}</p>
                                </div>
                                <div className={option.head.paymentStatus === "paid" ? "status" :
                                    (option.head.paymentStatus === "pending" ? "status pending" : "status unpaid")}>
                                    <span>
                                        {
                                            option.head.paymentStatus === "paid" ?
                                                <PiCheckCircle size={"20px"} /> :
                                                (option.head.paymentStatus === "pending" ? <PiHourglassLow size={"20px"} /> : <PiXCircle size={"20px"} />)
                                        }
                                    </span>
                                    <p>{option.head.paymentStatus}</p>
                                </div>
                                <span className='info'>
                                    <PiInfo color='#333' size={"20px"} />
                                    <a href="/manage/products">Details</a>
                                </span>
                                {
                                    window.location.pathname === "/manage/customers"
                                    &&
                                    <span className='attachment'>
                                        <PiPaperclip color='#333' size={"20px"} />
                                    </span>
                                }
                            </div>
                        </div>
                        <div className="body">
                            <div className="left">
                                <div >
                                    <p>Ordered Product units</p>
                                    <p>{option.body.orderedProductUnits}</p>
                                </div>
                                <div >
                                    <p>Product Unit Price</p>
                                    <p>{option.body.productUnitPrice}</p>
                                </div>
                                <div >
                                    <p>Product Total Price</p>
                                    <p>{option.body.productTotalPrice}</p>
                                </div>

                            </div>
                            <div className="right">
                                <div>
                                    <p>ordered at</p>
                                    <p>{option.body.orderedAt}</p>
                                </div>
                                <div>
                                    {
                                        window.location.pathname === "/manage/customers" ?
                                            <>
                                                <p>Estimated Delivery</p>
                                                <p>{option.body.estimatedDelivery}</p>
                                            </>
                                            :
                                            <>
                                                <p>ordered by</p>
                                                <p>{option.body.orderedBy.customerFullName}</p>
                                            </>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            }
        </>

    )
}
