import { PiArrowLeft, PiArrowRight, PiArrowSquareOut, PiChatText, PiCheck, PiCheckCircle, PiCopy, PiHash, PiList, PiPauseCircle, PiStarFill, PiSticker, PiMinus, PiUser } from "react-icons/pi"
import "./reviews.scss"
import { useCallback, useEffect, useState } from "react";
import TableComp from "../Components/TableComp";
import Statuspopover from "../Components/Statuspopover";
import config from "../config";
import { getReviews } from "../hooks/reviews";

export default function Reviews() {
    const [reviews, setReviews] = useState([]);
    const [counts, setCounts] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [message, setMessage] = useState("")
    const [currentStatus, setCurrentStatus] = useState("all");
    const limit = 10;
    const [page, setPage] = useState(0);
    const totalPages = Math.ceil(counts[statusToWord(currentStatus)] / limit);

    const closeAllOpen = () => {
        console.log(`closeAllOpen: all closed`);
        setReviews((prev) => {
            return prev.map((r) => {
                return {
                    ...r,
                    isOpen: {}
                }
            })
        })
    };
    const onSelectReview = (reviewId) => {
        closeAllOpen();
        setReviews(prev => {
            return prev.map(r => {
                return {
                    ...r,
                    isSelected: (r.reviewId === reviewId) ? !r.isSelected : r.isSelected,
                }
            });
        })
    }
    const onSelectAllReviews = () => {
        closeAllOpen();
        setReviews(prev => {
            const shouldSelectAll = !prev.every(b => b.isSelected);
            return prev.map(b => ({
                ...b,
                isSelected: shouldSelectAll,
            }));
        });
    };

    const [theme, setTheme] = useState("")
    useEffect(() => {
        const allSelected = reviews.every(b => b.isSelected);
        const someSelected = reviews.some(b => b.isSelected);

        if (allSelected) {
            setTheme("all");
        } else if (someSelected) {
            setTheme("almost");
        } else {
            setTheme("none");
        }
    }, [reviews]);

    useEffect(() => {
        if (reviews.length === 0) {
            setPage(0)
        }
        else {
            setPage(1)
        }
    }, [reviews])

    const OnSuspendReview = () => {
        const reviewId = (reviews.find(({ isOpen: { isOpenListStatus } }) => isOpenListStatus) ?
            reviews.find(({ isOpen: { isOpenListStatus } }) => isOpenListStatus).reviewId : null)
        fetch(config.API_BASE + "/management/reviews/suspend", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ reviewId: reviewId })
        }).then(res => res.json())
            .then(data => {
                if (data.success) {
                    setMessage("Review suspend successfully")
                    setTimeout(() => {
                        setMessage("")
                    }, 3000)
                    setRefresh(p => !p)
                }
                else {
                    setMessage("Failed to suspend review")
                    setTimeout(() => {
                        setMessage("")
                    }, 3000)
                    setRefresh(p => !p)
                }
            }).catch(err => {
                console.log(err)
            })
    }

    const OnActivateReview = () => {
        const reviewId = (reviews.find(({ isOpen: { isOpenListStatus } }) => isOpenListStatus) ?
            reviews.find(({ isOpen: { isOpenListStatus } }) => isOpenListStatus).reviewId : null)

        fetch(config.API_BASE + "/management/reviews/activate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ reviewId: reviewId })
        }).then(res => res.json())
            .then(data => {
                if (data.success) {
                    setMessage("Review suspend successfully")
                    setTimeout(() => {
                    }, 3000)
                    setRefresh(p => !p)
                }
                else {
                    setMessage("Failed to suspend review")
                    setTimeout(() => {
                        setMessage("")
                    }, 3000)
                    setRefresh(p => !p)
                }
            }).catch(err => {
                console.log(err)
            })
    }

    const handleCopy = async (e, textToCopy) => {
        e.stopPropagation()
        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopySuccess(true);
            setTimeout(() => {
                setCopySuccess(false)
            }, 3000)
        } catch (err) {
            setCopySuccess(false);
        }
    };


    const closeAllToggleOne = ({ event, reviewId, isOpen }) => {
        event && event.stopPropagation();
        if (![
            "isOpenOptions",
            "isOpenSuspended",
            "isOpenListStatus",
            "isOpenReview"
        ].includes(isOpen)) {
            return console.log(`closeAllToggleOne: isOpen is invalid`);
        }

        if (!reviews.find(p => (p.reviewId === reviewId))) {
            return console.log(`closeAllToggleOne: no review with specified reviewId`);
        }

        console.log(`closeAllToggleOne: all closed except ${isOpen} for review: ${reviewId}`);

        setReviews(prev => {
            return prev.map(r => {
                return {
                    ...r,
                    isOpen: {
                        [isOpen]: (r.reviewId === reviewId) ? !r.isOpen[isOpen] : false,
                    }
                }
            });
        })
    }

    const onOpenReview = ({ event, reviewId }) => {
        closeAllToggleOne({ event, reviewId, isOpen: "isOpenReview" })
    }
    const onOpenListStatus = ({ event, reviewId }) => {
        closeAllToggleOne({ event, reviewId, isOpen: "isOpenListStatus" })
    }

    function statusToWord(status) {
        const map = [
            [true, "suspended"],
            [false, "active"],
            ["all", "all"]
        ]
        const found = map.find(([s]) => s === status);
        return found ? found[1] : "";
    }

    const fetchAndSetReviews = async ({ page, status, limit }) => {
        setReviews([]);
        setCurrentStatus(status);
        setPage(page)
        const { reviews, counts } = await getReviews({ page, status, limit })
        const newTotalPages = Math.ceil(counts[statusToWord(status)] / limit)

        if (page > newTotalPages) {
            setPage(newTotalPages)
            fetchAndSetReviews({ page: newTotalPages, status, limit })
        }

        setReviews(reviews);
        setCounts(counts);
    }

    const onChangeSuspensionStatus = (status) => {
        fetchAndSetReviews({ page: 1, status, limit })
    }

    useEffect(() => {
        fetchAndSetReviews({ page, status: currentStatus, limit })
    }, [refresh])

    return (
        <div className="reviews">
            <div className="header">
                <span>
                    <PiChatText size={"28px"} color="var(--dark-grey)" />
                </span>
                <p>Reviews</p>
            </div>
            <div className="sub-nav">
                <div className="filter">
                    <div className={currentStatus === false ? "filter-item active" : "filter-item"}
                        onClick={() => onChangeSuspensionStatus(false)}>
                        <p> Active<span>({counts?.["active"]})</span></p>
                    </div>
                    <div className={currentStatus === true ? "filter-item active" : "filter-item"}
                        onClick={() => onChangeSuspensionStatus(true)}>
                        <p>Suspended<span>({counts?.["suspended"]})</span></p>
                    </div>
                    <div className={currentStatus === "all" ? "filter-item active" : "filter-item"}
                        onClick={() => onChangeSuspensionStatus("all")}>
                        <p>All<span>({counts?.["all"]})</span></p>
                    </div>
                </div>
                <div className="pagination">
                    <p>{page} / {Math.ceil(totalPages / limit)} <span><PiSticker size={"16px"} /></span></p>
                    <div>
                        <span className={(page <= 0 || page === 1) ? "left disabled" : "left"}>
                            <PiArrowLeft />
                        </span>
                        <span className={page === Math.ceil(totalPages / limit) ? "right disabled" : "right"}>
                            <PiArrowRight />
                        </span>
                    </div>
                </div>
            </div>
            <TableComp gridTempCol={"repeat(3, 48px) 17px repeat(5, 1fr) 17px repeat(2, 160px)"}
                gridCol={"1 /span 12"}
                active={reviews.map((r) => r.isSelected)}
                header={
                    <>
                        <div className="first">
                        <div className="check " onClick={onSelectAllReviews}>
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
                                <p>Reviewer</p>
                            </div>
                            <div>
                                <p>Order ID</p>
                            </div>
                            <div>
                                <p>Product</p>
                            </div>
                            <div>
                                <p>Review</p>
                            </div>
                            <div>
                                <p>Rating</p>
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
                    <div className="body">
                        {
                            reviews.length !== 0 ?
                                reviews.map(({ reviewId, data: review,
                                    isOpen: { isOpenReview, isOpenListStatus } }, index) => (
                                    <div key={index}
                                        className="row review-line">
                                        <div className="col-group first" style={{ "--grid-column": "1/ span 3" }}>
                                            <div className="cell" onClick={() => onSelectReview(reviewId)}>
                                                <div className="check">
                                                    <div className="checkbox">
                                                        <PiCheck size={"16px"} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="cell">
                                                <div className="list">
                                                    <span>
                                                        <PiList size={"16px"} color="var(--dark-grey)" />
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="cell">
                                                <div className="number">
                                                    <span>{review.reviewSerialNumber}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-group second" style={{ "--grid-column": "5/ span 5" }}>
                                            <div className="cell" >
                                                <div className="info reviewer">
                                                    <div>
                                                        <div className="detail">
                                                            <PiUser />
                                                            <p>{review.reviewer.fullName}</p>
                                                        </div>
                                                        <div className="icons">
                                                            <span>
                                                                <PiUser />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="cell">
                                                <div className="info order-id">
                                                    <div>
                                                        <p>{review.order.orderSerialNumber}</p>
                                                        <div className="icons">
                                                            <span>
                                                                <PiArrowSquareOut />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="cell">
                                                <div className="info product-info">
                                                    <div>
                                                        <div className="product-img">
                                                            <img src={`${config.API_BASE}/management/products/media?productId=${review.product.productId}`} alt="" />
                                                            <span><PiArrowSquareOut /></span>
                                                        </div>
                                                        <p>{review.product.productName}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="cell">
                                                <div className="info review">
                                                    <div>
                                                        <p>{review.review.summary}</p>
                                                        <div className="icons">
                                                            <span className={isOpenReview ? "active" : ""}
                                                                onClick={(e) => { onOpenReview({ event: e, reviewId, isOpenReview }) }}>
                                                                <PiChatText size={"18px"} />
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {
                                                        isOpenReview &&
                                                        <div className="review-conatiner">
                                                            <p>Review</p>
                                                            <div className="parag">
                                                                <p>{review.review.comment}</p>
                                                                <span className={copySuccess ? "active" : ""}
                                                                    onClick={(e) => { handleCopy(e, review.review.comment) }}>
                                                                    <PiCopy color={copySuccess ? "var(--dark-green-1)" : "#333"} />
                                                                </span>
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                            <div className="cell">
                                                <div className="info rating">
                                                    <div>
                                                        <p>{Math.ceil(review.rating)}/5</p>
                                                        <PiStarFill color="var(--dark-green-1)" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-group last" style={{ "--grid-column": "11/ span 2" }}>
                                            <div className="cell">
                                                <div className="status">
                                                    <p>{review.isSuspended === true ? "Suspended" : "Active"}</p>
                                                    <span className={review.isSuspended === false ? "active" : ""}
                                                        onClick={(e) => onOpenListStatus({ event: e, reviewId, isOpenListStatus })}>
                                                        {
                                                            review.isSuspended === false ?
                                                                <PiCheckCircle size={"24px"} />
                                                                :
                                                                <PiPauseCircle size={"24px"} />
                                                        }
                                                    </span>
                                                </div>
                                                {
                                                    isOpenListStatus &&
                                                    <Statuspopover statusList={["Active", "Suspended"]} orderStatus={review.isSuspended === true ? "Suspended" : "Active"}
                                                        handleClickStatus={review.isSuspended === true ? OnActivateReview : OnSuspendReview} />
                                                }
                                            </div>
                                            <div className="cell">
                                                <div className="created-at">
                                                    <p>{review.createdAt}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                                :
                                <div className="row">
                                    <div className="col-group not-found">
                                        <div className="cell container">
                                            <p className="">No review found</p>
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
