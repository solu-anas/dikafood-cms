import { PiArrowLeft, PiArrowRight, PiCheck, PiCheckCircle, PiClipboardText, PiCopy, PiDetective, PiFunnel, PiHash, PiHourglassLow, PiHouse, PiInfo, PiList, PiMapPin, PiPackage, PiPaperclip, PiSticker, PiTilde, PiTruck, PiUser, PiXBold, PiXCircle } from "react-icons/pi";
import "./orders.scss";
import { useCallback, useEffect, useMemo, useState } from "react";
import TableComp from "../Components/TableComp";
import OrderDetails from "../Components/OrderDetails";
import PopOver from "../Components/PopOver";
import Statuspopover from "../Components/Statuspopover";
import Alert from "../Components/Alert";
import File from "../Components/File";
import Filter from "../Components/Filter";
import config from "../config";
import { getOrders } from "../hooks/orders";
import BurgerOptions from "../Components/BurgerOptions";

export default function Orders() {
    const [orders, setOrders] = useState([])
    const statusList = ["Ordered", "Packed", "In Transit", "Delivered"];
    const [currentStatus, setCurrentStatus] = useState("all");
    const [ordersCounts, setOrdersCounts] = useState({})
    const [page, setPage] = useState(1);
    const orderStatus = [
        { icon: <PiClipboardText size={"20px"} />, status: "ordered" },
        { icon: <PiPackage size={"20px"} />, status: "packed" },
        { icon: <PiTruck size={"20px"} />, status: "inTransit" },
        { icon: <PiHouse size={"20px"} />, status: "delivered" },
        { status: "all" }
    ]
    const [images, setImages] = useState([]);
    const [orderDetails, setOrderDetails] = useState([]);
    const [message, setMessage] = useState("")
    const [refresh, setRefresh] = useState(false);
    const limit = 10;
    const [attachmentInfo, setAttachmentInfo] = useState([]);
    const [attachmentURL, setAttachmentURL] = useState("");
    const [paymentOptionsFilter, setPaymentOptionsFilter] = useState([])
    const [isActiveFilter, setIsActiveFilter] = useState(false)
    const [isOpenFilter, setIsOpenFilter] = useState(false);
    const [isCheckedValues, setIsCheckedValues] = useState([false, false, false])

    const closeAllOpen = () => {
        console.log(`closeAllOpen: all closed`);
        setOrders((prev) => {
            return prev.map((o) => {
                return {
                    ...o,
                    isOpen: {}
                }
            })
        })
    };

    const closeAllToggleOne = ({ event, orderId, isOpen }) => {
        event && event.stopPropagation();
        if (![
            "isOpenOptions",
            "isOpenSuspended",
            "isOpenDelete",
            "isOpenDetails",
            "isOpenStatus",
            "isOpenDeliveryLocation",
            "isOpenPaymentLocation",
            "isOpenPaymentAttachment",
            "isOpenDeliveryAttachment",
            "isOpenMarkAsPaid",
            "isOpenContactInfo",
            "isOpenAttachmentImg",
            "isConfirmMarkAsPaid",
            "isConfirmMarkAsPaidFromList"
        ].includes(isOpen)) {
            return console.log(`closeAllToggleOne: isOpen is invalid`);
        }

        if (!orders.find(o => (o.orderId === orderId))) {
            return console.log(`closeAllToggleOne: no order with specified orderId`);
        }

        console.log(`closeAllToggleOne: all closed except ${isOpen} for order: ${orderId}`);

        setOrders(prev => {
            return prev.map(o => {
                return {
                    ...o,
                    isOpen: {
                        [isOpen]: (o.orderId === orderId) ? !o.isOpen[isOpen] : false,
                    }
                }
            });
        })
    }

    const onSelectOrder = (orderId) => {
        closeAllOpen();
        setOrders(prev => {
            return prev.map(o => {
                return {
                    ...o,
                    isSelected: (o.orderId === orderId) ? !o.isSelected : o.isSelected,
                }
            });
        })
    }

    const onSelectAllOrders = () => {
        closeAllOpen();
        setOrders(prev => {
            const shouldSelectAll = !prev.every(b => b.isSelected);
            return prev.map(b => ({
                ...b,
                isSelected: shouldSelectAll,
            }));
        });
    };

    const [theme, setTheme] = useState("")
    useEffect(() => {
        const allSelected = orders.every(b => b.isSelected);
        const someSelected = orders.some(b => b.isSelected);

        if (allSelected) {
            setTheme("all");
        } else if (someSelected) {
            setTheme("almost");
        } else {
            setTheme("none");
        }
    }, [orders]);

    const onOpenDetials = ({ event, orderId }) => {
        closeAllToggleOne({ event, orderId, isOpen: "isOpenDetails" })
    }

    const onOpenContactInfo = ({ event, orderId }) => {
        closeAllToggleOne({ event, orderId, isOpen: "isOpenContactInfo" })
    }

    const handleClickOrderStatus = (status) => {
        const orderId = orders.find(({ isOpen: { isOpenStatus } }) => isOpenStatus) ? orders.find(({ isOpen: { isOpenStatus } }) => isOpenStatus).orderId : ""

        fetch(config.API_BASE + "/management/orders/order/delivery/status/change", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ orderId: orderId, newStatus: status.replace(/\s+/g, '-').toLowerCase() })
        }).then(res => res.json())
            .then(data => {
                if (data.success) {
                    setMessage(data.success)
                    setTimeout(() => {
                        setMessage("");
                    }, 3000)
                    setRefresh(p => !p)
                }
                else {
                    setMessage(data.error)
                    setTimeout(() => {
                        setMessage("");
                    }, 3000)
                    setRefresh(p => !p)
                }
            })
    }

    const onOpenMarkAsPaid = ({ event, orderId }) => {
        closeAllToggleOne({ event, orderId, isOpen: "isOpenMarkAsPaid" })
    }

    const onMarkAsPaid = () => {
        const orderId = orders.find(({ isOpen: { isConfirmMarkAsPaidFromList } }) => isConfirmMarkAsPaidFromList) ?
            orders.find(({ isOpen: { isConfirmMarkAsPaidFromList } }) => isConfirmMarkAsPaidFromList).orderId
            : (orders.find(({ isOpen: { isConfirmMarkAsPaid } }) => isConfirmMarkAsPaid) ?
                orders.find(({ isOpen: { isConfirmMarkAsPaid } }) => isConfirmMarkAsPaid).orderId
                : "")
        fetch(config.API_BASE + "/management/orders/order/payment/paid", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ orderId: orderId })
        }).then(res => res.json())
            .then(data => {
                if (data.success) {
                    setMessage(data.success)
                    setTimeout(() => {
                        setMessage("");
                    }, 3000)
                    setRefresh(p => !p)
                }
                else {
                    setMessage(data.error)
                    setTimeout(() => {
                        setMessage("");
                    }, 3000)
                    setRefresh(p => !p)
                }

            })
    }

    const onOpenListOptions = ({ event, orderId }) => {
        closeAllToggleOne({ event, orderId, isOpen: "isOpenOptions" })
    }

    const onOpenStatus = ({ event, orderId }) => {
        closeAllToggleOne({ event, orderId, isOpen: "isOpenStatus" })
    }

    const onOpenDeliveryLocation = ({ event, orderId }) => {
        closeAllToggleOne({ event, orderId, isOpen: "isOpenDeliveryLocation" })
    }

    const onOpenPaymentLocation = ({ event, orderId }) => {
        closeAllToggleOne({ event, orderId, isOpen: "isOpenPaymentLocation" })
    }

    const onOpenDeliveryAttachment = ({ event, orderId }) => {
        closeAllToggleOne({ event, orderId, isOpen: "isOpenDeliveryAttachment" })
    }

    const onOpenPaymentAttachment = ({ event, orderId }) => {
        closeAllToggleOne({ event, orderId, isOpen: "isOpenPaymentAttachment" })
    }

    const onOpenFilter = () => {
        setIsOpenFilter(p => !p);
    }

    const onConfirm = ({ event, orderId }) => {
        closeAllToggleOne({ event, orderId, isOpen: "isConfirmMarkAsPaidFromList" })
    }

    const onConfirmPayment = ({ event, orderId }) => {
        closeAllToggleOne({ event, orderId, isOpen: 'isConfirmMarkAsPaid' })
    }

    const onDisplayOrderDetails = async ({ orderId }) => {
        if (!orderId) {
            return;
        }

        const params = new URLSearchParams();
        params.append('orderId', orderId);

        try {
            const res = await fetch(config.API_BASE + "/management/orders/order/details?" + params.toString(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }

            const data = await res.json();
            if (data && data.items) {
                setOrderDetails(data.items);
            } else {
                console.log("No ordered items found.");
                setOrderDetails([]);
            }
        } catch (err) {
            console.error("Error fetching order details:", err);
        }
    }

    const totalPages = useMemo(() => {
        switch (currentStatus) {
            case "all":
                return ordersCounts ? ordersCounts["all"] : 0
            case "ordered":
                return ordersCounts.delivery ? ordersCounts?.delivery["ordered"] : 0
            case "packed":
                return ordersCounts.delivery ? ordersCounts?.delivery["packed"] : 0
            case "delivered":
                return ordersCounts.delivery ? ordersCounts?.delivery["delivered"] : 0
            case "in-transit":
                return ordersCounts.delivery ? ordersCounts?.delivery["inTransit"] : 0
            default:
                break;
        }
    }, [currentStatus, ordersCounts])


    const onGetAttachmentInfo = async () => {
        const orderId = orders.find(({ isOpen: { isOpenPaymentAttachment } }) => isOpenPaymentAttachment) ?
            orders.find(({ isOpen: { isOpenPaymentAttachment } }) => isOpenPaymentAttachment).orderId : ""
        try {
            const params = new URLSearchParams()
            params.append('orderId', orderId)
            params.append('option', "info")
            const response = await fetch(config.API_BASE + `/management/orders/order/attachment?` + params.toString(), {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            const data = await response.json()
            setAttachmentInfo(data)
            const res = await fetch(config.API_BASE + `/management/orders/order/attachment?orderId=${orderId}&option=file`, {
                method: "GET",
                credentials: "include",
            })
            const fileResponse = await res.blob()
            const url = URL.createObjectURL(fileResponse)
            setAttachmentURL(url)
        } catch {
            console.log('Error fetching attachment info')
        }
    }

    const handleDownload = (index) => {
        const link = document.createElement('a')
        link.href = attachmentURL;
        link.target = '_blank';
        link.download = `attachment order number ${index}`;
        link.click();
        setAttachmentURL("")
    };

    const onOpenAttachmentImg = ({ event, orderId }) => {
        closeAllToggleOne({ event, orderId, isOpen: "isOpenAttachmentImg" })
    }

    const fetchImages = useCallback(async () => {
        try {
            const imageFetches = orderDetails.map(async (order) => {
                const response = await fetch(config.API_BASE + `/management/products/media?productId=${order?.main.productId}`, {
                    method: "GET",
                    credentials: "include"
                });
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                return { [order.main.productId]: url };
            });

            const imageObjects = await Promise.all(imageFetches);
            const imageMap = imageObjects.reduce((acc, imageObject) => {
                return { ...acc, ...imageObject };
            }, {});

            setImages(imageMap);
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    }, [orderDetails]);

    useEffect(() => {
        fetchImages()
    }, [fetchImages])

    const fetchAndSetOrders = async ({ page, status, limit, isActiveFilter, filters }) => {
        setOrders([])
        setCurrentStatus(status);
        setPage(page)
        const { orders, counts } = await getOrders({ page, status, limit, isActiveFilter, filters })
        const newTotalPages = Math.ceil(counts[status] / limit)

        if (page > newTotalPages) {
            setPage(newTotalPages)
            fetchAndSetOrders({ page: newTotalPages, status, limit, isActiveFilter, filters })
        }

        setOrders(orders);
        setOrdersCounts(counts);
    }

    const onChangeSuspensionStatus = (status) => {
        fetchAndSetOrders(
            {
                page: 1,
                status: status.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
                limit,
                isActiveFilter, paymentOptionsFilter
            })
    }

    const onChangePage = (page) => {
        fetchAndSetOrders({ page, status: currentStatus, limit, isActiveFilter, paymentOptionsFilter })
    }

    const onAddPage = () => {
        onChangePage(page + 1)
    }
    const onMinusPage = () => {
        onChangePage(page - 1)
    }
    const onActiveFilter = () => {
        setIsActiveFilter(!isActiveFilter)
    }

    const onApplyFilter = useCallback(() => {
        fetchAndSetOrders({ page: 1, status: currentStatus, limit, isActiveFilter: isActiveFilter, filters: paymentOptionsFilter })
    }, [isActiveFilter, paymentOptionsFilter])

    useEffect(() => {
        onApplyFilter()
    }, [onApplyFilter])

    const onCheckOptionsFilter = (index, option) => {
        setIsCheckedValues(p => {
            const values = [...p]
            values[index] = !values[index]
            return values
        });
        setPaymentOptionsFilter(prev => {
            const newValue = [...prev];
            const filterValue = newValue.filter(n => n !== option);
            if (filterValue.length === newValue.length) {
                return [...newValue, option]
            }
            return filterValue;
        });
    }

    const onSelectAllOptionFilter = useCallback((allOptions) => {
        if (!allOptions) {
            return;
        }
        setIsCheckedValues(
            prevState => {
                const allSelected = prevState.every(item => item === true);
                const newSelection = prevState.map(() => !allSelected);

                setPaymentOptionsFilter(prev => {
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
        fetchAndSetOrders({ page: page, status: currentStatus, limit: limit, isActiveFilter: isActiveFilter, filters: paymentOptionsFilter });
    }, [refresh])
    console.log(orders.map((o) => o.isSelected))

    return (
        <div className="orders">
            {
                orders.some(({ isOpen: { isOpenDetails } }) => isOpenDetails) &&
                <div className="overlay">
                    {
                        <OrderDetails
                            onClose={() => closeAllOpen()}
                            options={orderDetails} images={images} />
                    }
                </div>
            }
            {
                orders.some(({ isOpen: { isOpenAttachmentImg } }) => isOpenAttachmentImg) &&
                <div className="overlay">
                    <div className="attachment">
                        <div className="header">
                            <p>Attachment Order N°
                                {orders.find(({ isOpen: { isOpenAttachmentImg } }) => isOpenAttachmentImg).orderId}
                            </p>
                            <span onClick={() => {
                                setAttachmentURL("");
                                closeAllOpen()
                            }}>
                                <PiXBold />
                            </span>
                        </div>
                        <div className="img">
                            <img src={attachmentURL} alt="attachment" />
                        </div>
                    </div>
                </div>
            }
            <div className="header">
                <span>
                    <PiClipboardText size={"28px"} color="var(--dark-grey)" />
                </span>
                <p>Orders</p>
            </div>
            <div className="sub-nav">
                <div className="filter">
                    {
                        orderStatus.map((status, index) => (
                            <div className={currentStatus === status.status.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() ? "filter-item active" : "filter-item"}
                                key={index}
                                onClick={() => onChangeSuspensionStatus(status.status)}>
                                {
                                    status.icon ?
                                        <span>
                                            {status.icon}
                                        </span>
                                        :
                                        <></>
                                }
                                <p>{status.status} <span>({status.status !== "all" ? (ordersCounts.delivery ? ordersCounts?.delivery[status.status] : 0) : ordersCounts?.["all"]})</span></p>
                            </div>
                        ))
                    }
                </div>
                <div className="pagination">
                    <p>{page} / {Math.ceil(totalPages / limit)} <span><PiSticker size={"16px"} /></span></p>
                    <div>
                        <span className={(page <= 1) ? "left disabled" : "left"}
                            onClick={onMinusPage}>
                            <PiArrowLeft />
                        </span>
                        <span className={page >= Math.ceil(totalPages / limit) ? "right disabled" : "right"}
                            onClick={onAddPage}>
                            <PiArrowRight />
                        </span>
                    </div>
                </div>
            </div>
            <TableComp gridTempCol={"repeat(3, 48px) 17px repeat(4, 1fr) 17px repeat(1, 160px)"}
                gridCol={"1 /span 10"}
                active={orders.map((o) => o.isSelected)}
                header={
                    <>
                        <div className="first">
                            <div className="check " onClick={onSelectAllOrders}>
                                {
                                    theme === "all" ?
                                        <span className="all"><PiCheck size={"16px"} color="var(--dark-green-1)" /></span>
                                        :
                                        (
                                            theme === "almost" ?
                                                <span className="almost"><PiTilde size={"16px"} color="var(--dark-green-1)" /></span>
                                                :
                                                <span><PiCheck size={"16px"} color="#CCC" /></span>
                                        )
                                }
                            </div>
                            <div className="list">
                                <span>
                                    <PiList size={"16px"} />
                                </span>
                            </div>
                            <div className="number">
                                <span><PiHash size={"16px"} /></span>
                            </div>
                        </div>
                        <div className="separator">
                            <div></div>
                        </div>
                        <div className="second">
                            <div>
                                <p>Products</p>
                            </div>
                            <div>
                                <p>Delivery</p>
                            </div>
                            <div>
                                <p>Payment</p>
                                <span className={(isOpenFilter || isActiveFilter) ? "active" : ""} onClick={onOpenFilter}>
                                    <PiFunnel />
                                </span>
                                {
                                    isOpenFilter &&
                                    <Filter options={Object.entries(ordersCounts.payment).map(([k, v]) => ({ name: k, count: v }))}
                                        onToggle={onActiveFilter}
                                        isOn={isActiveFilter}
                                        onCheck={onCheckOptionsFilter}
                                        checked={isCheckedValues}
                                        onSeletAll={onSelectAllOptionFilter}
                                        count={ordersCounts["all"]} />
                                }
                            </div>
                            <div>
                                <p>Contact</p>
                            </div>
                        </div>
                        <div className="separator">
                            <div></div>
                        </div>
                        <div className="last">
                            <div>
                                <p>created at</p>
                            </div>
                        </div>
                    </>
                }
                body={
                    <div className="body">
                        {
                            orders.length !== 0 ?
                                orders.map(({ orderId, data: order, isSelected,
                                    isOpen: { isOpenOptions, isOpenStatus, isOpenDeliveryLocation, isOpenPaymentLocation, isOpenDeliveryAttachment,
                                        isOpenPaymentAttachment, isOpenMarkAsPaid, isOpenContactInfo, isConfirmMarkAsPaid, isConfirmMarkAsPaidFromList } }, index) => (
                                    <div className={isSelected ? "row order-line active" : "row order-line"}
                                        key={index}>
                                        <div className="col-group first"
                                            style={{ "--grid-column": "1/ span 3" }}>
                                            <div className="cell" onClick={() => onSelectOrder(orderId)}>
                                                <div className="check">

                                                    <div className="checkbox">
                                                        <PiCheck />
                                                    </div>

                                                </div>
                                            </div>
                                            <div className="cell">
                                                <div className="list">
                                                    <span className={isOpenOptions ? "active" : ""}
                                                        onClick={(e) => onOpenListOptions({ event: e, orderId })}>
                                                        <PiList color={isOpenOptions ? "var(--dark-green-1)" : "var(--dark-grey)"} />
                                                    </span>
                                                    {
                                                        (isOpenOptions || isConfirmMarkAsPaidFromList) &&
                                                        <div className="list-options" onClick={(e) => { e.stopPropagation() }}>
                                                            {
                                                                isOpenOptions &&
                                                                <BurgerOptions options={order.payment.status === 'pending' ?
                                                                    [
                                                                        {
                                                                            title: "Ordered items",
                                                                            Icon: PiInfo,
                                                                            onClick: (e) => {
                                                                                onOpenDetials({ event: e, orderId });
                                                                                onDisplayOrderDetails({ orderId })
                                                                            }
                                                                        },
                                                                        {
                                                                            title: "Mark as Paid",
                                                                            Icon: PiCheckCircle,
                                                                            onClick: (e) => onConfirm({ event: e, orderId, isConfirmMarkAsPaidFromList })
                                                                        }
                                                                    ]
                                                                    :
                                                                    [
                                                                        {
                                                                            title: "Ordered items",
                                                                            Icon: PiInfo,
                                                                            onClick: (e) => {
                                                                                onOpenDetials({ event: e, orderId });
                                                                                onDisplayOrderDetails({ orderId })
                                                                            }
                                                                        }
                                                                    ]} />
                                                            }
                                                            {
                                                                isConfirmMarkAsPaidFromList &&
                                                                order.payment.status === 'pending' &&
                                                                <Alert
                                                                    alertHeader={"Mark as Paid"}
                                                                    alertIcon={<PiCheckCircle size={"16px"} color="#333" />}
                                                                    alertMessage={"Are you sure you want to Mark this order as paid?"}
                                                                    onClose={closeAllOpen}
                                                                    onConfirm={onMarkAsPaid} />
                                                            }
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                            <div className="cell">
                                                <div className="number">
                                                    <span>{order.orderSerialNumber}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-group second" style={{ "--grid-column": "5/ span 4" }}>
                                            <div className="cell">
                                                <div className="info">
                                                    <div className="products-info">
                                                        <p>${order.products.cost}</p>
                                                        <div>
                                                            <p className="count">{order.products.productsCount} Products</p>
                                                            <p>{order.products.unitsCount} units</p>
                                                        </div>
                                                    </div>
                                                    <div className="icons">
                                                        <span className="more-info" onClick={(e) => {
                                                            onOpenDetials({ event: e, orderId })
                                                            onDisplayOrderDetails({ orderId })
                                                        }}>
                                                            <PiInfo size={"24px"} />
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="cell">
                                                <div className="info">
                                                    <div className="products-info">
                                                        {
                                                            order.delivery.totalCost ?
                                                                <p>${order.delivery.totalCost}</p>
                                                                :
                                                                <p>$0</p>
                                                        }
                                                        <div>
                                                            {
                                                                order.delivery.deliveryType ?
                                                                    <p>{order.delivery.deliveryType}</p>
                                                                    :
                                                                    <p>Free</p>
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="icons">
                                                        <span className={isOpenDeliveryLocation ? "more-info active" : "more-info"}
                                                            onClick={(e) => onOpenDeliveryLocation({ event: e, orderId })}>
                                                            <PiMapPin size={"24px"} />
                                                        </span>
                                                        {
                                                            order.delivery.receiptFileId &&
                                                            <span className={isOpenDeliveryAttachment ? "more-info active" : "more-info"}
                                                                onClick={(e) => onOpenDeliveryAttachment({ event: e, orderId })}>
                                                                <PiPaperclip size={"24px"} />
                                                            </span>
                                                        }
                                                        {
                                                            isOpenDeliveryAttachment &&
                                                            <div className="files-list" onClick={(e) => { e.stopPropagation() }}>
                                                                <File />
                                                            </div>

                                                        }
                                                        <span className="status" onClick={(e) => onOpenStatus({ event: e, orderId })}>
                                                            {
                                                                order.delivery.status.toLocaleLowerCase() === "ordered" ? <PiClipboardText size={"24px"} />
                                                                    : (order.delivery.status.toLocaleLowerCase() === "packed" ? <PiPackage size={"24px"} /> :
                                                                        (order.delivery.status.toLocaleLowerCase() === "in-transit" ? <PiTruck size={"24px"} /> : <PiHouse size={"24px"} />))
                                                            }
                                                        </span>
                                                    </div>
                                                    {
                                                        isOpenDeliveryLocation &&
                                                        <PopOver>
                                                            <div>
                                                                <p>Country</p>
                                                                <div>
                                                                    <p>{order.delivery.location.country.name}</p>
                                                                    <span><PiCopy size={"16px"} /></span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p>City</p>
                                                                <div>
                                                                    <p>{order.delivery.location.city}</p>
                                                                    <span><PiCopy size={"16px"} /></span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p>Address</p>
                                                                <div>
                                                                    <p>{order.delivery.location.address}</p>
                                                                    <span><PiCopy size={"16px"} /></span>
                                                                </div>
                                                            </div>
                                                        </PopOver>
                                                    }
                                                    {
                                                        isOpenStatus &&
                                                        <Statuspopover statusList={statusList} orderStatus={order?.delivery.status.replace(/\s+/g, '-').toLowerCase()}
                                                            handleClickStatus={handleClickOrderStatus} />
                                                    }
                                                </div>
                                            </div>
                                            <div className="cell">
                                                <div className="info">
                                                    <div className="products-info">
                                                        <p>${order.payment.totalAmount}</p>
                                                        <div>
                                                            <p>{order.payment.paymentMethod ?
                                                                order.payment.paymentMethod : "Not Paid"}</p>
                                                        </div>
                                                    </div>
                                                    <div className="icons">
                                                        <span className={isOpenPaymentLocation ? "more-info active" : "more-info"}
                                                            onClick={(e) => onOpenPaymentLocation({ event: e, orderId })}>
                                                            <PiMapPin size={"24px"} />
                                                        </span>
                                                        {
                                                            order.payment.attachmentFileId !== "Not Attached Yet" &&
                                                            <span className={isOpenPaymentAttachment ? "more-info active" : "more-info"}
                                                                onClick={(e) => { onOpenPaymentAttachment({ event: e, orderId }); onGetAttachmentInfo() }}>
                                                                <PiPaperclip size={"24px"} />
                                                            </span>
                                                        }
                                                        {
                                                            isOpenPaymentAttachment &&
                                                            <div className="files-list" onClick={(e) => { e.stopPropagation() }}>
                                                                <File fileName={attachmentInfo.fileName}
                                                                    fileType={attachmentInfo.fileType}
                                                                    onDownloadFile={() => handleDownload(order.orderSerialNumber)}
                                                                    onShowFile={(e) => onOpenAttachmentImg({ event: e, orderId })} />
                                                            </div>
                                                        }
                                                        <span className={`status ${order.payment.status}`}
                                                            onClick={(e) => onOpenMarkAsPaid({ event: e, orderId })}>
                                                            {
                                                                order.payment.status === 'paid' ?
                                                                    <PiCheckCircle size={"24px"} />
                                                                    : (
                                                                        order.payment.status === 'pending' ?
                                                                            <PiHourglassLow size={"24px"} />
                                                                            :
                                                                            <PiXCircle size={"24px"} />
                                                                    )
                                                            }
                                                        </span>
                                                        {
                                                            (isOpenMarkAsPaid || isConfirmMarkAsPaid) && order.payment.status === 'pending' &&
                                                            <>
                                                                {
                                                                    isOpenMarkAsPaid &&
                                                                    <div className="mark-as-paid">
                                                                        <BurgerOptions options={[
                                                                            {
                                                                                title: "Mark as Paid",
                                                                                Icon: PiCheckCircle,
                                                                                onClick: (e) => onConfirmPayment({ event: e, orderId, isConfirmMarkAsPaid })
                                                                            }
                                                                        ]} />
                                                                    </div>
                                                                }
                                                                {
                                                                    isConfirmMarkAsPaid &&
                                                                    <Alert
                                                                        alertHeader={"Mark as Paid"}
                                                                        alertIcon={<PiCheckCircle size={"16px"} color="#333" />}
                                                                        alertMessage={"Are you sure you want to Mark this order as paid?"}
                                                                        onClose={closeAllOpen}
                                                                        onConfirm={onMarkAsPaid} />
                                                                }
                                                            </>
                                                        }
                                                    </div>
                                                    {
                                                        isOpenPaymentLocation &&
                                                        <PopOver>
                                                            <div>
                                                                <p>Country</p>
                                                                <div>
                                                                    <p>{order.payment.location.country.name}</p>
                                                                    <span><PiCopy size={"16px"} /></span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p>City</p>
                                                                <div>
                                                                    <p>{order.payment.location.city}</p>
                                                                    <span><PiCopy size={"16px"} /></span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p>Address</p>
                                                                <div>
                                                                    <p>{order.payment.location.address}</p>
                                                                    <span><PiCopy size={"16px"} /></span>
                                                                </div>
                                                            </div>
                                                        </PopOver>
                                                    }
                                                </div>
                                            </div>
                                            <div className="cell">
                                                <div className="info">
                                                    <div className="products-info contact">
                                                        {
                                                            order.contact.type === "customer" ?
                                                                <p>
                                                                    <span>
                                                                        <PiUser size={"16px"} />
                                                                    </span>
                                                                    {order.contact.fullName}
                                                                </p>
                                                                :
                                                                <p>
                                                                    <span>
                                                                        <PiDetective size={"16px"} />
                                                                    </span>
                                                                    visitor
                                                                </p>
                                                        }
                                                    </div>

                                                    <div className="icons">
                                                        {
                                                            order.contact.type === "customer" &&
                                                            <span className="more-info">
                                                                <PiUser size={"16px"} />
                                                            </span>
                                                        }
                                                        <span className={isOpenContactInfo ? "more-info active" : "more-info"}
                                                            onClick={(e) => onOpenContactInfo({ event: e, orderId })}>
                                                            <PiInfo size={"24px"} />
                                                        </span>
                                                    </div>
                                                    {
                                                        isOpenContactInfo &&
                                                        <PopOver>
                                                            <div>
                                                                <p>First Name</p>
                                                                <div>
                                                                    <p>{order.contact.firstName}</p>
                                                                    <span><PiCopy size={"16px"} /></span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p>Last Name</p>
                                                                <div>
                                                                    <p>{order.contact.lastName}</p>
                                                                    <span><PiCopy size={"16px"} /></span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p>Email</p>
                                                                <div>
                                                                    <p>{order.contact.email}</p>
                                                                    <span><PiCopy size={"16px"} /></span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p>Phone</p>
                                                                <div>
                                                                    <p>{order.contact.phone}</p>
                                                                    <span><PiCopy size={"16px"} /></span>
                                                                </div>
                                                            </div>
                                                        </PopOver>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-group last" style={{ "--grid-column": "10/ span 1" }}>
                                            <div className="cell">
                                                <div>
                                                    <p>{order.createdAt}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                                :
                                <div className="row">
                                    <div className="col-group not-found"
                                        style={{ "--grid-column": " 1 / span 11" }}>
                                        <div className="cell container">
                                            <p className="">No orders found</p>
                                        </div>
                                    </div>
                                </div>
                        }
                    </div>
                }
            />
            {
                message && (
                    message.toLowerCase().includes("success") ?
                        <div className="message"><p>{message}</p></div>
                        :
                        <div className="message error"><p>{message}</p></div>
                )
            }
        </div>
    )
}
