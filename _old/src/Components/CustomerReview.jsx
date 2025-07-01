import { PiArrowLeft, PiArrowRight, PiChat, PiFunnel, PiMagnifyingGlass, PiSticker, PiX } from "react-icons/pi"
import { useCallback, useState, useEffect } from "react"
import Filter from "./Filter";
import DropDown from "./DropDown";
import "./reviews-popup.scss"
import config from "../config";
import ItemCard from "./ItemCard";

export default function CustomerReview({ customer, onClose }) {

    const [customerReviews, setCustomerReviews] = useState([])
    const [options, setOptions] = useState([])
    const [counts, setCounts] = useState()
    const statusOptions = [{ name: "active", count: counts?.active || 0 }, { name: 'suspended', count: counts?.suspended || 0 }]
    const [isActive, setisActive] = useState(false)
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [searchValue, setSearchValue] = useState("")
    const totalPages = customerReviews.length;
    const [isOpenFilter, setIsOpenFilter] = useState(false);
    const [isCheckedValues, setIsCheckedValues] = useState(statusOptions.map((_) => false))
    const [page, setPage] = useState(1)
    const limit = 4;
    const skip = (page - 1) * limit
    const filterOptions = ["Product Title", "Product ID", "order ID", "review"]

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };
    useEffect(()=>{
        if (customerReviews.length === 0) {
            setPage(0)
        }
        else {
            setPage(1)
        }
    }, [customerReviews])

    const handleOptionClick = (option) => {
        setSelectedOption(option);
        setIsOpen(false);
    };

    const onActive = () => {
        setisActive(!isActive)
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
        params.set('customerId', customer.customerId)
        params.set('limit', limit)
        if (skip > 0) {
            params.set('skip', skip)
        }
        if (selectedOption && searchValue) {
            if (selectedOption.toLowerCase() === "product title") {
                params.set(
                    'search', JSON.stringify({ productTitle: searchValue })
                )
            }
            else if (selectedOption.toLowerCase() === 'product id') {
                params.set('search', JSON.stringify({ productId: searchValue }))
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
        fetch(config.API_BASE + '/management/customers/customer/reviews?' + params.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include"
        }).then(res => res.json())
            .then(data => {
                setCustomerReviews(data.reviews)
                setCounts(data.counts)
            }).catch(err => console.log(err))
    }, [searchValue, selectedOption, skip, setCounts, isActive, options])

    console.log(selectedOption && selectedOption.toLowerCase())
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
                    Customer Reviews
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
                    customerReviews.length === 0 ?
                        <div className="no-result">
                            <p>
                                No reviews found for this product
                            </p>
                        </div>
                        :
                        <ItemCard options={customerReviews.map((r=>({
                            imgProduct : `${config.API_BASE}/management/products/media?productId=${r.productId}`,
                            productId : r.productSerialNumber,
                            productName : r.productTitle,
                            quantity : r.unitsCount,
                            price : r.price,
                            review : r.review,
                            rating : Math.ceil(r.rating),
                            reviewedAt : r.reviewedAt,
                            orderId : r.orderSerialNumber
                        })))} />

                }
            </div>
        </div>
    )
}