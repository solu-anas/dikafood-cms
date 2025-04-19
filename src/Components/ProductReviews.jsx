import { PiArrowLeft, PiArrowRight, PiChat, PiChatTextThin, PiCheckCircle, PiCopy, PiFunnel, PiMagnifyingGlass, PiSticker, PiX } from "react-icons/pi"
import { useCallback, useState, useEffect } from "react"
import Filter from "./Filter";
import DropDown from "./DropDown";
import "./reviews-popup.scss"
import config from "../config";
import StarRating from "./StarRating";

export default function ProductReviews({ product, onClose }) {

    const [productReviews, setProductReviews] = useState([])
    const [isOpenReviewDetails, setIsOpenReviewDetails] = useState(false);
    const [options, setOptions] = useState([])
    const [counts, setCounts] = useState()
    const statusOptions = [{ name: "active", count: counts?.active || 0 }, { name: 'suspended', count: counts?.suspended || 0 }]
    const [isActive, setisActive] = useState(false)
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [searchValue, setSearchValue] = useState("")
    const totalPages = productReviews.length;
    const [isOpenFilter, setIsOpenFilter] = useState(false);
    const [isCheckedValues, setIsCheckedValues] = useState(statusOptions.map((_) => false))
    const [page, setPage] = useState(0)
    const limit = 4;
    const skip = (page - 1) * limit
    const filterOptions = ["Reviewer", "order ID", "review"]

    useEffect(()=>{
        if (productReviews.length === 0) {
            setPage(0)
        }
        else{
            setPage(1)
        }
    }, [productReviews])
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (option) => {
        setSelectedOption(option);
        setIsOpen(false);
    };

    const onActive = () => {
        setisActive(!isActive)
    }

    const onOpenReviewDetails = (index) => {
        setIsOpenReviewDetails(prev => {
            const newValues = new Array(prev.length).fill(false);
            newValues[index] = !prev[index];
            return newValues;
        })
    }

    const onOpenFilter = () => {
        setIsOpenFilter(!isOpenFilter)
    }

    const onCheckOptionsFilter = (index, option) => {
        setIsCheckedValues(p => {
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

    const onSelectOptionsFilter = useCallback((allOptions) => {
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
    }, [setOptions])

    // get reviews list
    useEffect(() => {
        const params = new URLSearchParams()
        params.set('productId', product.productId)
        params.set('limit', limit)
        if (skip > 0) {
            params.set('skip', skip)
        }
        if (selectedOption && searchValue) {
            if (selectedOption.toLowerCase() === "reviewer") {
                params.set(
                    'search', JSON.stringify({ reviewer: searchValue })
                )
            }
            else if (selectedOption.toLowerCase() === 'order id') {
                params.set('search', JSON.stringify({ orderId: searchValue }))
            }

            else if (selectedOption.toLowerCase() === 'review') {
                params.set('search', JSON.stringify({ review: searchValue }))
            }
        }
        if (isActive && options.length !== 0) {
            params.set("filters", JSON.stringify({ "status": options }))
        }
        fetch(config.API_BASE + '/management/products/product/reviews?' + params.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include"
        }).then(res => res.json())
            .then(data => {
                setProductReviews(data.reviews)
                setCounts(data.counts)
            }).catch(err => console.log(err))
    }, [searchValue, selectedOption, skip, setCounts, isActive])

    const onAddPage = () => {
        setPage(page + 1)
    }
    const onMinusPage = () => {
        setPage(page - 1)
    }

    return (

        <div className="reviews-popup">
            <div className="header">
                <p>
                    <span>{<PiChat />}</span>
                    {"Product Reviews"}
                </p>
                <span onClick={onClose}>
                    <PiX size={"18px"} />
                </span>
            </div>
            <div className="sub-nav">
                <div className="search-bar">
                    <div className="input-search">
                        <PiMagnifyingGlass size={"16px"} />
                        <input type="text" placeholder="Search ..." value={searchValue} onChange={(e) => { setSearchValue(e.target.value) }} />
                    </div>
                    <DropDown
                        defaultValue={"filter"}
                        options={filterOptions}
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                        handleOptionClick={handleOptionClick}
                        toggleDropdown={toggleDropdown}
                        selectedOption={selectedOption}
                    />
                </div>
                <div className="filter">
                    <div className="filter-item-container">
                        <div className={isActive ? 'filter-item active' : "filter-item"}
                            onClick={onOpenFilter}>
                            <span><PiFunnel /></span>
                            <p>Status <span>({options?.length})</span></p>
                        </div>
                        {
                            isOpenFilter
                            &&
                            <Filter options={statusOptions}
                                count={counts["all"]}
                                isOn={isActive}
                                onToggle={onActive}
                                onCheck={onCheckOptionsFilter}
                                checked={isCheckedValues}
                                onSeletAll={onSelectOptionsFilter}
                            />
                        }
                    </div>
                </div>
                <div className="pagination">
                    <p>{page} / {Math.ceil(totalPages / limit)} <span><PiSticker size={"16px"} /></span></p>
                    <div>
                        <span className={(page <= 0 || page === 1) ? "left disabled" : "left"}
                            onClick={onAddPage}>
                            <PiArrowLeft />
                        </span>
                        <span className={page === Math.ceil(totalPages / limit) ? "right disabled" : "right"}
                            onClick={onMinusPage}>
                            <PiArrowRight />
                        </span>
                    </div>
                </div>
            </div>
            <div className="body">
                {
                    productReviews.length === 0 ?
                        <div className="no-result">
                            <p>
                                No reviews found for this product
                            </p>
                        </div>
                        :
                        productReviews.map((review, index) => (
                            <div className="review" key={index}>
                                <div className="review-header">
                                    <div className="info">
                                        <div className="left">
                                            <div>
                                                <p>Reviewer</p>
                                                <p>{review.reviewer}</p>
                                            </div>
                                            <div>
                                                <p>Order ID</p>
                                                <p>{review.orderSerialNumber}</p>
                                            </div>
                                        </div>
                                        <div className="right">
                                            <div>
                                                <p>Units</p>
                                                <p>{review.units}</p>
                                            </div>
                                            <div>
                                                <p>Price</p>
                                                <p>${review.price}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="icons">
                                        <span className="status">
                                            <PiCheckCircle size={"24px"} />
                                        </span>
                                        <span className={isOpenReviewDetails[index] ? "icon active" : "icon"} onClick={() => onOpenReviewDetails(index)}>
                                            <PiChatTextThin size={"24px"} />
                                        </span>
                                    </div>
                                </div>
                                {
                                    isOpenReviewDetails[index] &&
                                    <div className="body-reviews">
                                        <div className="review">
                                            <p>Review</p>
                                            <div className="parag">
                                                <p>{review.review}</p>
                                                <span>
                                                    <PiCopy />
                                                </span>
                                            </div>
                                        </div>
                                        <div className="rating">
                                            <div>
                                                <p>Rating</p>
                                                <StarRating rating={review.rating} />
                                            </div>
                                            <div>
                                                <p>Reviewed at</p>
                                                <div><p>{review.reviewedAt}</p></div>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>
                        ))
                }
            </div>
        </div>
    )
}