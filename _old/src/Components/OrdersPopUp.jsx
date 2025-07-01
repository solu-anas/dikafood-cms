import { useCallback, useEffect, useState } from "react";
import Filter from "./Filter"
import OrderCard from "./OrderCard"
import "./orders-popup.scss"
import { PiArrowLeft, PiArrowRight, PiClipboardText, PiFunnel, PiSticker, PiX } from "react-icons/pi"
import config from "../config";

export default function OrdersPopUp({ onClose, option, title }) {

    const [orders, setOrders] = useState([])
    const [paymentOptionsFilter, setPaymentOptionsFilter] = useState([])
    const [deliveryValues, setDeliveryOptionsFilter] = useState([])
    const [isActivePayemntFilter, setIsActivePayemntFilter] = useState(false);
    const [isActiveDeliveryFilter, setIsActiveDeliveryFilter] = useState(false);
    const [paymentOptions, setPaymentOptions] = useState([])
    const [deliveryOptions, setDeliveryOptions] = useState([]);
    const [countAll, setCountAll] = useState();
    const totalPages = countAll
    const [page, setPage] = useState(1)
    const limit = 3;
    const orderSkip = (page - 1) * limit;
    const [isOpenFilter, setIsOpenFilter] = useState([false, false])
    const [isCheckedPaymentOptions, setIsCheckedPaymentOptions] = useState([]);
    const [isCheckedDeliveryOptions, setIsCheckedDeliveryOptions] = useState([]);

    useEffect(() => {
        if (orders.length === 0) {
            setPage(0)
        }
        else {
            setPage(1)
        }
    }, [orders])


    useEffect(() => {
        setIsCheckedDeliveryOptions(new Array(4).fill(false))
        setIsCheckedPaymentOptions(new Array(3).fill(false))
    }, [])

    const onOpenFilter = (index) => {
        setIsOpenFilter(prev => {
            const newValues = new Array(prev.length).fill(false)
            newValues[index] = !prev[index]
            return newValues
        })
    }

    const onActivateFilter = (setter, value) => {
        setter(!value);
    }

    const onCheckOptionsFilter = (index, option, setIsCheckValues, setOptions) => {
        setIsCheckValues(p => {
            const values = [...p]
            values[index] = !values[index]
            return values
        });
        setOptions(prev => {
            const newValue = [...prev];
            const filterValue = newValue.filter(n => n !== option);
            if (filterValue.length === newValue.length) {
                return [...newValue, option]
            }
            return filterValue;
        });
    }

    const onSelectOptionsFilter = useCallback((allOptions, setIsCheckedValues, setOptions) => {
        if (!allOptions) {
            return;
        }
        setIsCheckedValues(
            prevState => {
                const allSelected = prevState.every(item => item === true);
                const newSelection = prevState.map(() => !allSelected);

                setOptions(prev => {
                    const newValue = [...prev];
                    if (allSelected) {
                        return newValue.filter(option => !allOptions.includes(option));
                    } else {
                        return [...newValue, ...allOptions.filter(option => !newValue.includes(option))];
                    }
                });
                return newSelection;
            }
        )
    }, [])

    useEffect(() => {
        if (!option.productId && !option.customerId) {
            return;
        }
        else if (option.productId) {
            const params = new URLSearchParams()
            params.set('productId', option.productId)
            params.set('limit', limit)
            if (orderSkip > 0) {
                params.set('skip', orderSkip)
            }
            if (isActivePayemntFilter && paymentOptions.length !== 0) {
                params.set("filters", JSON.stringify({ "payment": paymentOptions }))
            }
            if (isActiveDeliveryFilter && deliveryOptions.length !== 0) {
                params.set("filters", JSON.stringify({ "delivery": deliveryOptions }))
            }
            fetch(config.API_BASE + `/management/products/product/orders?` + params.toString(), {
                method: 'GET',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json())
                .then(data => {
                    setOrders(data.orders)
                    setPaymentOptionsFilter(() => {
                        const paymentArray = Object.entries(data.counts.payment).map(([key, value]) => {
                            return { name: key, count: value };
                        });
                        return paymentArray
                    })
                    setDeliveryOptionsFilter(() => {
                        const deliveryArray = Object.entries(data.counts.delivery).map(([key, value]) => {
                            return { name: key.replace(/([A-Z])/g, '-$1').toLowerCase(), count: value };
                        });
                        return deliveryArray
                    })
                    setCountAll(data.counts.all)
                }).catch(err => console.log(err))
        }
        else if (option.customerId) {
            const params = new URLSearchParams()
            params.set('customerId', option.customerId)
            params.set('limit', limit)
            if (orderSkip > 0) {
                params.set('skip', orderSkip)
            }
            if (isActivePayemntFilter && paymentOptions.length !== 0) {
                params.set("filters", JSON.stringify({ "payment": paymentOptions }))
            }
            if (isActiveDeliveryFilter && deliveryOptions.length !== 0) {
                params.set("filters", JSON.stringify({ "delivery": deliveryOptions }))
            }
            fetch(config.API_BASE + `/management/customers/customer/orders?` + params.toString(), {
                method: 'GET',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json())
                .then(data => {
                    setOrders(data.orders)
                    setPaymentOptionsFilter(() => {
                        const paymentArray = Object.entries(data.counts.payment).map(([key, value]) => {
                            return { name: key, count: value };
                        });
                        return paymentArray
                    })
                    setDeliveryOptionsFilter(() => {
                        const deliveryArray = Object.entries(data.counts.delivery).map(([key, value]) => {
                            return { name: key.replace(/([A-Z])/g, '-$1').toLowerCase(), count: value };
                        });
                        return deliveryArray
                    })
                    setCountAll(data.counts.all)
                }).catch(err => console.log(err))
        }

    }, [isActiveDeliveryFilter, isActivePayemntFilter, paymentOptions, deliveryOptions, option, orderSkip])

    const onAddPage = () => {
        setPage(page + 1)
    }
    const onMinusPage = () => {
        setPage(page - 1)
    }

    return (
        <div className="orders-popup">
            <div className="header">
                <p><span><PiClipboardText size={"24px"} /></span>{title} orders</p>
                <span onClick={onClose}>
                    <PiX size={"18px"} />
                </span>
            </div>
            <div className="sub-nav">
                <div className="filter">
                    <div className="filter-item-container">
                        <div className={isActivePayemntFilter ? 'filter-item active' : "filter-item"}
                            onClick={() => onOpenFilter(0)}>
                            <span><PiFunnel /></span>
                            <p>Payment <span>({paymentOptions.length})</span></p>
                        </div>
                        {
                            isOpenFilter[0]
                            &&
                            <Filter options={paymentOptionsFilter}
                                isOn={isActivePayemntFilter}
                                count={countAll}
                                onToggle={() => onActivateFilter(setIsActivePayemntFilter, isActivePayemntFilter)}
                                onCheck={(index, option) => onCheckOptionsFilter(index, option,
                                    setIsCheckedPaymentOptions, setPaymentOptions)}
                                checked={isCheckedPaymentOptions}
                                onSeletAll={(allOptions) => onSelectOptionsFilter(allOptions, setIsCheckedPaymentOptions, setPaymentOptions)} />
                        }
                    </div>
                    <div className="filter-item-container">
                        <div className={isActiveDeliveryFilter ? 'filter-item active' : "filter-item"}
                            onClick={() => onOpenFilter(1)}>
                            <span><PiFunnel /></span>
                            <p>Delivery <span>({deliveryOptions.length})</span></p>
                        </div>
                        {
                            isOpenFilter[1] &&
                            <Filter options={deliveryValues} isOn={isActiveDeliveryFilter} count={countAll}
                                onToggle={() => onActivateFilter(setIsActiveDeliveryFilter, isActiveDeliveryFilter)}
                                onCheck={(index, option) => onCheckOptionsFilter(index, option,
                                    setIsCheckedDeliveryOptions, setDeliveryOptions)}
                                checked={isCheckedDeliveryOptions}
                                onSeletAll={(allOptions) => onSelectOptionsFilter(allOptions, setIsCheckedDeliveryOptions, setDeliveryOptions)}
                            />
                        }
                    </div>
                </div>
                <div className="pagination">
                    <p>{page} / {Math.ceil(totalPages / limit)} <span><PiSticker size={"16px"} /></span></p>
                    <div>
                        <span className={(page <= 0 || page === 1) ? "left disabled" : "left"}
                            onClick={onMinusPage}>
                            <PiArrowLeft />
                        </span>
                        <span className={page === Math.ceil(totalPages / limit) ? "right disabled" : "right"}
                            onClick={onAddPage}>
                            <PiArrowRight />
                        </span>
                    </div>
                </div>
            </div>
            <div className="body">
                {
                    orders.length === 0 ?
                        <div className="no-result">
                            <p>
                                No orders found for this {title}
                            </p>
                        </div>
                        :
                        <OrderCard options={orders} />
                }
            </div>
        </div>
    )
}
