import { PiArrowLeft, PiArrowRight, PiChatText, PiXCircle, PiCheck, PiCheckCircle, PiClipboardText, PiHash, PiList, PiPauseCircle, PiPlus, PiSticker, PiUserList, PiMinus } from 'react-icons/pi'
import './customers.scss'
import { useEffect, useState } from 'react';
import TableComp from '../Components/TableComp';
import AddNewCustomer from '../Components/AddNewCustomer';
import OrdersPopUp from '../Components/OrdersPopUp';
// import ReviewsPopup from '../Components/ProductReviews';
import CustomerReview from '../Components/CustomerReview';
// import Filter from '../Components/Filter';
import config from '../config';
import { getCustomers } from '../hooks/customers';
import BurgerOptions from '../Components/BurgerOptions';

export default function Customers() {
    const [customers, setCustomers] = useState([])
    const [customersCounts, setCustomersCounts] = useState([])
    const [currentStatus, setCurrentStatus] = useState("all");
    const [refresh, setRefresh] = useState(false);
    const [message, setMessage] = useState("");
    const limit = 10
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [page, setPage] = useState(1)
    const totalPages = Math.ceil(customersCounts[statusToWord(currentStatus)] / limit);

    function statusToWord(status) {
        const map = [
            [true, "suspended"],
            [false, "active"],
            ["all", "all"]
        ]
        const found = map.find(([s]) => s === status);
        return found ? found[1] : "";
    }
    const onSelectCustomer = (customerId) => {
        closeAllOpen();
        setCustomers(prev => {
            return prev.map(b => {
                return {
                    ...b,
                    isSelected: (b.customerId === customerId) ? !b.isSelected : b.isSelected,
                }
            });
        })
    }

    const onSelectAllCustomers = () => {
        closeAllOpen();
        setCustomers(prev => {
            const shouldSelectAll = !prev.every(b => b.isSelected);
            return prev.map(b => ({
                ...b,
                isSelected: shouldSelectAll,
            }));
        });
    };

    const [theme, setTheme] = useState("")
    useEffect(() => {
        const allSelected = customers.every(b => b.isSelected);
        const someSelected = customers.some(b => b.isSelected);

        if (allSelected) {
            setTheme("all");
        } else if (someSelected) {
            setTheme("almost");
        } else {
            setTheme("none");
        }
    }, [customers]);

    const closeAllOpen = () => {
        console.log(`closeAllOpen: all closed`);
        setCustomers((prev) => {
            return prev.map((c) => {
                return {
                    ...c,
                    isOpen: {}
                }
            })
        })
    };

    const closeAllToggleOne = ({ event, customerId, isOpen }) => {
        event && event.stopPropagation();
        if (![
            "isOpenOptions",
            "isOpenSuspended",
            "isOpenReviews",
            "isOpenOrders",
            "isOpenStatus",
        ].includes(isOpen)) {
            return console.log(`closeAllToggleOne: isOpen is invalid`);
        }

        if (!customers.find(c => (c.customerId === customerId))) {
            return console.log(`closeAllToggleOne: no customer with specified customerId`);
        }

        console.log(`closeAllToggleOne: all closed except ${isOpen} for customer: ${customerId}`);

        setCustomers(prev => {
            return prev.map(c => {
                return {
                    ...c,
                    isOpen: {
                        [isOpen]: (c.customerId === customerId) ? !c.isOpen[isOpen] : false,
                    }
                }
            });
        })
    }

    const onOpenListOptions = ({ event, customerId }) => {
        closeAllToggleOne({ event, customerId, isOpen: "isOpenOptions" })
    }

    const onOpenListStatus = ({ event, customerId }) => {
        closeAllToggleOne({ event, customerId, isOpen: "isOpenStatus" })
    }

    const onOpenCustomerReviews = ({ event, customerId }) => {
        closeAllToggleOne({ event, customerId, isOpen: "isOpenReviews" })
    }

    const onOpenCustomerOrders = ({ event, customerId }) => {
        closeAllToggleOne({ event, customerId, isOpen: "isOpenOrders" })
    }

    const fetchAndSetCustomers = async ({ page, status, limit }) => {
        setCustomers([])
        setCurrentStatus(status);
        setPage(page)
        const { customers, counts } = await getCustomers({ page, status, limit })
        const newTotalPages = Math.ceil(counts[statusToWord(status)] / limit)

        if (page > newTotalPages) {
            setPage(newTotalPages)
            fetchAndSetCustomers({ page: newTotalPages, status, limit })
        }

        setCustomers(customers);
        setCustomersCounts(counts);
    }

    const onChangeSuspensionStatus = (status) => {
        fetchAndSetCustomers(
            {
                page: 1,
                status: status,
                limit
            })
        setRefresh(p => !p)
    }

    const onChangeCustomerSuspension = ({ customerId, isSuspended }) => {
        closeAllOpen();
        // optimistic feedback
        setCustomers(prev => {
            const newCustomers = [...prev];
            const foundCustomer = newCustomers.find(p => p.customerId === customerId);
            foundCustomer.data.isSuspended = isSuspended;
            foundCustomer.isOpenStatus = false;
            return newCustomers;
        })
        fetch(config.API_BASE + `/management/customers/customer/${isSuspended ? "suspend" : "activate"}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ customerId })
        }).then(res => res.json())
            .then(({ success, error }) => {
                setRefresh(p => !p);
                if (success) {
                    setMessage(`Customer ${isSuspended ? "Suspended" : "Activated"} successfully`);
                    setTimeout(() => {
                        setMessage("");
                    }, 3000)
                }
                else if (error) {
                    setMessage(`Failed to ${isSuspended ? "Suspended" : "Activated"} Customer`);
                    setTimeout(() => {
                        setMessage("");
                    }, 3000)
                }
            }).catch(err => {
                console.log(err)
            })
    }

    const onChangePage = (page) => {
        fetchAndSetCustomers({ page, status: currentStatus, limit })
    }

    const onAddPage = () => {
        onChangePage(page + 1)
    }

    const onMinusPage = () => {
        onChangePage(page - 1)
    }

    useEffect(() => {
        fetchAndSetCustomers({ page: page, status: currentStatus, limit });
    }, [refresh])

    return (
        <div className='customers'>
            {
                isNewCustomer &&
                <div className="overlay">
                    {
                        isNewCustomer &&
                        <AddNewCustomer onClose={() => setIsNewCustomer(false)}
                            setMessage={setMessage} setRefresh={setRefresh} />
                    }
                </div>
            }
            {

                customers.some(({ isOpen: { isOpenOrders } }) => isOpenOrders) &&
                <div className="overlay">
                    <OrdersPopUp
                        title={"Customer"}
                        onClose={closeAllOpen}
                        option={customers.find(({ isOpen: { isOpenOrders } }) => isOpenOrders)}
                    />
                </div>
            }
            {
                customers.some(({ isOpen: { isOpenReviews } }) => isOpenReviews) &&
                <div className="overlay">
                    <CustomerReview onClose={closeAllOpen}
                        customer={customers.find(({ isOpen: { isOpenReviews } }) => isOpenReviews)}
                    />
                </div>
            }
            <div className="header">
                <span>
                    <PiUserList size={"28px"} color="var(--dark-grey)" />
                </span>
                <p>Customers</p>
            </div>
            <div className="sub-nav">
                <div className="new-prod">
                    <button className="add-new-prod" onClick={() => { setIsNewCustomer(true) }}>
                        <span><PiPlus size={"16px"} color="white" /></span>
                        Add new customer
                    </button>
                </div>
                <div className="filter">
                    <div className={currentStatus === "all" ? "filter-item active" : "filter-item"}
                        onClick={() => onChangeSuspensionStatus("all")}>
                        <p>All <span>({customersCounts["all"]})</span></p>
                    </div>
                    <div className={currentStatus === false ? "filter-item active" : "filter-item"}
                        onClick={() => onChangeSuspensionStatus(false)}>
                        <p>Active <span>({customersCounts["active"]})</span></p>
                    </div>
                    <div className={currentStatus === true ? "filter-item active" : "filter-item"}
                        onClick={() => onChangeSuspensionStatus(true)}>
                        <p>Blocked <span>({customersCounts["suspended"]})</span></p>
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
            <TableComp gridTempCol={"repeat(3, 48px) 17px repeat(4, 1fr) 17px repeat(1, 160px)"}
                gridCol={"1 /span 11"}
                active={customers.map(c => c.isSelected)}
                header={
                    <>
                        <div className="first">
                            <div className="check " onClick={onSelectAllCustomers}>
                                {
                                    theme === "all" ?
                                        <span className="all"><PiCheck size={"16px"} color="var(--dark-green-1)" /></span>
                                        :
                                        (
                                            theme === "almost" ?
                                                <span className="almost"><PiMinus size={"16px"} color="var(--dark-green-1)" /></span>
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
                                <p>first name</p>
                            </div>
                            <div>
                                <p>Last name</p>
                            </div>
                            <div>
                                <p>Email</p>
                            </div>
                            <div>
                                <p>Phone</p>
                            </div>
                        </div>
                        <div className="separator">
                            <div></div>
                        </div>
                        <div className="last">
                            <div className="status">
                                <p>Status</p>
                            </div>
                            <div>
                                <p>created at</p>
                            </div>
                        </div>
                    </>
                }
                body={
                    <div className='body'>
                        {
                            customers.length !== 0 ?
                                customers.map(({ customerId, data: cust,
                                    isOpen: { isOpenOptions, isOpenStatus, isOpenOrders, isOpenReviews } },
                                    index) => (
                                    <div className="row customer-line" key={index}>
                                        <div className="col-group first" style={{ "--grid-column": "1/ span 3" }}>
                                            <div className="cell" onClick={()=>onSelectCustomer(customerId)}>
                                                <div className="check">
                                                    <div className="checkbox">
                                                        <PiCheck size={"16px"} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="cell">
                                                <div className="list">
                                                    <span className={isOpenOptions ? "active" : ""}
                                                        onClick={(e) => onOpenListOptions({ event: e, customerId })}>
                                                        <PiList size={"16px"} color={isOpenOptions ? "var(--dark-green-1)" : "var(--dark-grey)"} />
                                                    </span>
                                                    {
                                                        (isOpenOptions) &&
                                                        <div className="list-options" onClick={(e) => { e.stopPropagation() }}>
                                                            <>
                                                                {
                                                                    isOpenOptions &&
                                                                    <>
                                                                        <BurgerOptions options={[
                                                                            {
                                                                                title: "Orders",
                                                                                Icon: PiClipboardText,
                                                                                onClick: (e) => { onOpenCustomerOrders({ event: e, customerId, isOpenOrders }) }
                                                                            },
                                                                            {
                                                                                title: "Reviews",
                                                                                Icon: PiChatText,
                                                                                onClick: (e) => { onOpenCustomerReviews({ event: e, customerId, isOpenReviews }) }
                                                                            }
                                                                        ]} />
                                                                    </>
                                                                }
                                                            </>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                            <div className="cell">
                                                <div className="number">
                                                    <span><PiHash size={"16px"} /></span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-group second" style={{ "--grid-column": "5/ span 4" }}>
                                            <div className="cell">
                                                <div className="info">
                                                    <div>
                                                        <p>{cust.firstName}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="cell">
                                                <div className="info">
                                                    <div>
                                                        <p>{cust.lastName}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="cell">
                                                <div className="info email">
                                                    <div>
                                                        <p>{cust.email}</p>
                                                        <div className="icons">
                                                            {
                                                                cust.isVerified ?
                                                                    <span className='verify'><PiCheckCircle size={"24px"} /></span>
                                                                    :
                                                                    <span className='inVerify'><PiXCircle size={"24px"} /></span>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="cell">
                                                <div className="info">
                                                    <div>
                                                        <p>{cust.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-group last" style={{ "--grid-column": "10/ span 2" }}>
                                            <div className="cell">
                                                <div className="status">
                                                    <p>{cust.isSuspended ? "isSuspended" : "Active"}</p>
                                                    <span className={cust.isSuspended ? "" : "active"}
                                                        onClick={(e) => onOpenListStatus({ event: e, customerId, isOpenStatus })}>
                                                        {
                                                            cust.isSuspended ?
                                                                <PiPauseCircle size={"24px"} />
                                                                :
                                                                <PiCheckCircle size={"24px"} />
                                                        }
                                                    </span>
                                                    {
                                                        isOpenStatus &&
                                                        <div className="list-status" onClick={(e) => { e.stopPropagation() }}>
                                                            <ul>
                                                                {["Active", "Suspended"].map((status, index) => {
                                                                    return (
                                                                        <li key={index} onClick={() => {
                                                                            onChangeCustomerSuspension({ customerId, isSuspended: status === "Suspended" });
                                                                        }}>
                                                                            <span>
                                                                                <div className={((cust.isSuspended ? "Suspended" : "Active").toLowerCase() === status.toLowerCase()) ? "radio active" : "radio"}>
                                                                                    <div></div>
                                                                                </div>
                                                                            </span>
                                                                            {status}
                                                                        </li>
                                                                    )
                                                                })}
                                                            </ul>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                            <div className="cell">
                                                <div className="created-at">
                                                    <p>{cust.createdAt}</p>
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
                                            <p className="">No customer found</p>
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
