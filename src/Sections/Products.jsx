import { PiArrowLeft, PiArrowRight, PiChatText, PiCheck, PiCheckCircle, PiClipboardText, PiCopy, PiHash, PiImage, PiList, PiPauseCircle, PiPencilSimple, PiPlus, PiStar, PiSticker, PiMinus, PiTrash } from "react-icons/pi";
import "./products.scss";
import BurgerOptions from "../Components/BurgerOptions";
import { useEffect, useState } from "react";
import TableComp from "../Components/TableComp";
import Alert from "../Components/Alert";
import AddProduct from "../Components/AddProduct";
import OrdersPopUp from "../Components/OrdersPopUp";
import ProductReviews from "../Components/ProductReviews";
import config from "../config";
import Input from "../Components/Input";
import EditProduct from "../Components/EditProduct";
import { getProducts } from "../hooks/products";

export default function Products() {
    const [products, setProducts] = useState([])
    const [suspensionStatus, setSuspensionStatus] = useState("all")
    const [productsCount, setProductsCount] = useState({});
    const [refresh, setRefresh] = useState(false);
    const [editField, setEditField] = useState({});
    const [isOpenNewProduct, setIsOpenNewProduct] = useState(false)
    const [message, setMessage] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemPerPage = 2;
    const totalPages = Math.ceil(productsCount[statusToWord(suspensionStatus)] / itemPerPage);

    function statusToWord(status) {
        const map = [
            [true, "suspended"],
            [false, "active"],
            ["all", "all"]
        ]
        const found = map.find(([s]) => s === status);
        return found ? found[1] : "";
    }

    // closes all open
    const closeAllOpen = () => {
        console.log(`closeAllOpen: all closed`);
        setProducts((prev) => {
            return prev.map((p) => {
                return {
                    ...p,
                    isOpen: {}
                }
            })
        })
    };

    // closes all open and toggles one (depending on isOpen)
    const closeAllToggleOne = ({ event, productId, isOpen }) => {
        event && event.stopPropagation();
        if (![
            "isOpenOptions",
            "isOpenSuspended",
            "isOpenDelete",
            "isOpenReviews",
            "isOpenOrders",
            "isOpenStatus",
            "isOpenEdit",
        ].includes(isOpen)) {
            return console.log(`closeAllToggleOne: isOpen is invalid`);
        }

        if (!products.find(p => (p.productId === productId))) {
            return console.log(`closeAllToggleOne: no product with specified productId`);
        }

        console.log(`closeAllToggleOne: all closed except ${isOpen} for product: ${productId}`);

        setProducts(prev => {
            return prev.map(p => {
                return {
                    ...p,
                    isOpen: {
                        [isOpen]: (p.productId === productId) ? !p.isOpen[isOpen] : false,
                    }
                }
            });
        })
    }

    const onSelectProduct = (productId) => {
        closeAllOpen();
        setProducts(prev => {
            return prev.map(p => {
                return {
                    ...p,
                    isSelected: (p.productId === productId) ? !p.isSelected : p.isSelected,
                }
            });
        })
    }

    const onSelectAllProducts = () => {
        closeAllOpen();
        setProducts(prev => {
            const shouldSelectAll = !prev.every(b => b.isSelected);
            return prev.map(b => ({
                ...b,
                isSelected: shouldSelectAll,
            }));
        });
    };

    const [theme, setTheme] = useState("")
    useEffect(() => {
        const allSelected = products.every(b => b.isSelected);
        const someSelected = products.some(b => b.isSelected);

        if (allSelected) {
            setTheme("all");
        } else if (someSelected) {
            setTheme("almost");
        } else {
            setTheme("none");
        }
    }, [products]);

    const onOpenEditField = ({ event, productId, field }) => {
        event.stopPropagation();
        closeAllOpen();
        const newEditField = { productId, field, value: products.find(p => p.productId === productId)?.data[field] };
        setEditField(newEditField)
    }

    const onOpenProductReviews = ({ event, productId }) => {
        closeAllToggleOne({ event, productId, isOpen: "isOpenReviews" })
    }

    const onOpenStatus = ({ event, productId }) => {
        closeAllToggleOne({ event, productId, isOpen: "isOpenStatus" })
    }

    const onOpenOptions = ({ event, productId }) => {
        closeAllToggleOne({ event, productId, isOpen: "isOpenOptions" })
    }

    const onOpenProductOrders = ({ event, productId }) => {
        closeAllToggleOne({ event, productId, isOpen: "isOpenOrders" })
    }
    const onOpenEditProduct = ({ event, productId }) => {
        closeAllToggleOne({ event, productId, isOpen: "isOpenEdit" })
    }

    const onOpenDelete = ({ event, productId }) => {
        closeAllToggleOne({ event, productId, isOpen: "isOpenDelete" })
    }

    const onDeleteProduct = ({ productId }) => {
        // optimistic feedback
        setProducts(prev => {
            const newProducts = [...prev];
            newProducts.find(p => p.productId === productId).isToBeDeleted = true;
            return newProducts;
        })
        fetch(config.API_BASE + "/management/products/delete", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ productId })
        }).then(res => res.json())
            .then(data => {
                if (data.success) {
                    setMessage("Product deleted successfully")
                    setTimeout(() => {
                        setMessage(null)
                    }, 3000)
                    setRefresh(p => !p)
                }
                else {
                    setMessage("Failed to delete product")
                    setTimeout(() => {
                        setMessage(null)
                    }, 3000)
                    setRefresh(p => !p)
                }
            })
    }

    const onChangeProductSuspension = ({ productId, isSuspended }) => {
        closeAllOpen();
        // optimistic feedback
        setProducts(prev => {
            const newProducts = [...prev];
            const foundProduct = newProducts.find(p => p.productId === productId);
            foundProduct.data.isSuspended = isSuspended;
            foundProduct.isOpenStatus = false;
            return newProducts;
        })
        fetch(config.API_BASE + `/management/products/${isSuspended ? "suspend" : "activate"}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ productId })
        }).then(res => res.json())
            .then(({ success, error }) => {
                setRefresh(p => !p);
                if (success) {
                    setMessage(`Product ${isSuspended ? "Suspended" : "Activated"} successfully`);
                    setTimeout(() => {
                        setMessage("");
                    }, 3000)
                }
                else if (error) {
                    setMessage(`Failed to ${isSuspended ? "Suspended" : "Activated"} product`);
                    setTimeout(() => {
                        setMessage("");
                    }, 3000)
                }
            }).catch(err => {
                console.log(err)
            })
    }

    const onConfirmFieldEdit = () => {
        // optimistic ui feedback: show value before receiving success response
        setProducts(prev => {
            prev.find(p => p.productId === editField.productId).data[editField.field] = editField.value
            return prev;
        })
        setEditField({});

        fetch(config.API_BASE + "/management/products/edit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                productId: editField.productId,
                changes: {
                    [editField.field]: editField.value,
                }
            })
        }).then(
            response => response.json()
        )
            .then(data => {
                if (data.success) {
                    setMessage(`PRODUCT ${editField.field.toUpperCase()} UPDATED SUCCESSFULLY`)
                    setTimeout(() => {
                        setMessage(null)
                    }, 3000)
                }
                else {
                    setRefresh(r => !r);
                    setMessage(`PRODUCT ${editField.field.toUpperCase()} UPDATE FAILED`)
                    setTimeout(() => {
                        setMessage(null)
                    }, 3000)
                }
            })
            .catch(err => console.log(err))
    }

    const fetchAndSetProducts = async ({ page, status, itemPerPage }) => {
        setProducts([]);
        setSuspensionStatus(status);
        setCurrentPage(page)
        const { products, counts } = await getProducts({ page, status, itemPerPage })
        const newTotalPages = Math.ceil(counts[statusToWord(status)] / itemPerPage)

        if (page > newTotalPages) {
            setCurrentPage(newTotalPages)
            fetchAndSetProducts({ page: newTotalPages, status, itemPerPage })
        }

        setProducts(products);
        setProductsCount(counts);
    }

    // fetch products on page change
    const changePage = (page) => {
        fetchAndSetProducts({ page, status: suspensionStatus, itemPerPage })
    }

    const onAddPage = () => {
        changePage(currentPage + 1)
    }
    const onMinusPage = () => {
        changePage(currentPage - 1)
    }

    // fetch on suspensionStatusChange
    const onChangeSuspensionStatus = (status) => {
        fetchAndSetProducts({ page: 1, status, itemPerPage })
    }

    // fetch products on first render
    // fetch products on refresh
    useEffect(() => {
        fetchAndSetProducts({ page: currentPage, status: suspensionStatus, itemPerPage });
    }, [refresh])

    console.log(products.map(r => r.isSelected))
    return (
        <div className="products">
            {
                isOpenNewProduct &&
                <div className="overlay">
                    <AddProduct
                        onClose={() => setIsOpenNewProduct(false)}
                        setMessage={setMessage}
                        setRefresh={setRefresh}
                    />
                </div>
            }
            {
                products.some(({ isOpen: { isOpenOrders } }) => isOpenOrders) &&
                <div className="overlay">
                    <OrdersPopUp
                        title={"Product"}
                        onClose={() => closeAllOpen()}
                        option={products.find(({ isOpen: { isOpenOrders } }) => isOpenOrders)}
                    />
                </div>
            }
            {
                products.some(({ isOpen: { isOpenReviews } }) => isOpenReviews) &&
                <div className="overlay">
                    <ProductReviews
                        product={products.find(({ isOpen: { isOpenReviews } }) => isOpenReviews)}
                        onClose={() => { closeAllOpen() }} />
                </div>
            }
            {
                products.some(({ isOpen: { isOpenEdit } }) => isOpenEdit) &&
                <div className="overlay">
                    <EditProduct onClose={() => { closeAllOpen() }}
                        productId={products.find(({ isOpen: { isOpenEdit } }) => isOpenEdit).productId}
                        setMessage={setMessage} setRefresh={setRefresh} />
                </div>
            }

            <div className="header">
                <span>
                    <PiClipboardText size={"28px"} color="var(--dark-grey)" />
                </span>
                <p>Products</p>
            </div>
            <div className="sub-nav">
                <div className="new-prod">
                    <button className="add-new-prod" onClick={() => { setIsOpenNewProduct(true) }}>
                        <span><PiPlus size={"16px"} color="white" /></span>
                        Add new product
                    </button>
                </div>
                <div className="filter">
                    <div className={suspensionStatus === false ? 'filter-item active' : "filter-item"}
                        onClick={() => { onChangeSuspensionStatus(false) }}>
                        <p>Active <span>({productsCount.active})</span></p>
                    </div>
                    <div className={suspensionStatus === true ? 'filter-item active' : "filter-item"}
                        onClick={() => { onChangeSuspensionStatus(true) }}>
                        <p>Suspended <span>({productsCount.suspended})</span></p>
                    </div>
                    <div className={suspensionStatus === "all" ? 'filter-item active' : "filter-item"}
                        onClick={() => { onChangeSuspensionStatus("all") }}>
                        <p>All <span>({productsCount.all})</span></p>
                    </div>
                </div>
                <div className="pagination">
                    <p>{currentPage} / {totalPages} <span><PiSticker size={"16px"} /></span></p>
                    <div>
                        <span className={(currentPage <= 1) ? "left disabled" : "left"}
                            onClick={onMinusPage}>
                            <PiArrowLeft />
                        </span>
                        <span className={currentPage >= totalPages ? "right disabled" : "right"}
                            onClick={onAddPage}>
                            <PiArrowRight />
                        </span>
                    </div>
                </div>
            </div>
            <TableComp gridTempCol={"repeat(3, 48px) 17px repeat(4, 1fr) 17px repeat(2, 160px)"}
                gridCol={"1 /span 11"} active={products.map(r => r.isSelected)}
                header={
                    <>
                        <div className="first">
                            <div className="check " onClick={onSelectAllProducts}>
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
                                <p>Product</p>
                            </div>
                            <div>
                                <p>Unit price</p>
                            </div>
                            <div>
                                <p>Stock</p>
                            </div>
                            <div>
                                <p>Orders</p>
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
                            products.length !== 0 &&
                            products
                                .filter(p => !p.isToBeDeleted)
                                .map(({ productId,
                                    data: { title, isSuspended, unitPrice, stock, orders, reviews, rating, serialNumber, createdAt },
                                    isOpen: { isOpenOptions, isOpenStatus, isOpenSuspended, isOpenDelete } }) => (
                                    <div key={productId} className="row product-line">
                                        <div className="col-group first" style={{ "--grid-column": "1/ span 3" }}>
                                            <div className="cell" onClick={() => onSelectProduct(productId)}>
                                                <div className="check">
                                                    <div className="checkbox">
                                                        <PiCheck size={"16px"} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="cell">
                                                <div className="list">
                                                    <span className={isOpenOptions ? "active" : ""}
                                                        onClick={(e) => onOpenOptions({ event: e, productId })}>
                                                        <PiList size={"16px"} color={isOpenOptions ? "var(--dark-green-1)" : "var(--dark-grey)"} />
                                                    </span>
                                                </div>
                                                {
                                                    (isOpenOptions || isOpenDelete || isOpenSuspended) &&
                                                    <div className="list-options" onClick={(e) => { e.stopPropagation() }}>
                                                        {
                                                            isOpenOptions &&
                                                            <BurgerOptions options={[
                                                                {
                                                                    title: "Edit",
                                                                    Icon: PiPencilSimple,
                                                                    onClick: (e) => {
                                                                        onOpenEditProduct({ event: e, productId })
                                                                    }
                                                                },
                                                                {
                                                                    title: "Orders",
                                                                    Icon: PiClipboardText,
                                                                    onClick: (e) => {
                                                                        onOpenProductOrders({ event: e, productId });
                                                                    }
                                                                },
                                                                {
                                                                    title: "Reviews",
                                                                    Icon: PiChatText,
                                                                    onClick: (e) => {
                                                                        onOpenProductReviews({ event: e, productId });
                                                                    }
                                                                },
                                                                {
                                                                    title: "Delete",
                                                                    Icon: PiTrash,
                                                                    theme: "delete",
                                                                    onClick: (e) => {
                                                                        onOpenDelete({ event: e, productId })
                                                                    }
                                                                },
                                                            ]} />
                                                        }
                                                        {
                                                            isOpenDelete &&
                                                            <Alert
                                                                alertHeader={"Delete"}
                                                                alertIcon={<PiTrash size={"16px"} color="var(--red)" />}
                                                                alertMessage={"Are you sure you want to delete this product?"}
                                                                theme={"delete"}
                                                                onClose={() => closeAllOpen()}
                                                                onConfirm={() => onDeleteProduct({ productId })}
                                                            />
                                                        }

                                                    </div>
                                                }
                                            </div>
                                            <div className="cell">
                                                <div className="number">
                                                    <span>{serialNumber}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-group second" style={{ "--grid-column": "5/ span 4" }}>
                                            {
                                                editField.productId === productId &&
                                                editField.field === "title" &&
                                                <div className="cell">
                                                    <div className="info">
                                                        <Input
                                                            onClick={(e) => { e.stopPropagation() }}
                                                            onClose={() => { setEditField({}) }}
                                                            value={editField.value || ""}
                                                            onchange={(e) => setEditField(f => ({ ...f, value: e.target.value }))}
                                                            onConfirm={(e) => { onConfirmFieldEdit({ event: e, productId }) }}
                                                        />
                                                    </div>
                                                </div>
                                            }
                                            {
                                                (
                                                    editField.productId !== productId ||
                                                    editField.field !== "title"
                                                ) &&
                                                <div className="cell">
                                                    <div className="info">
                                                        <div className="product-info">
                                                            <div className="product-img">
                                                                <span>
                                                                    <PiPencilSimple />
                                                                </span>
                                                                {/* {
                                                                    images[productId] ?
                                                                        <img src={images[productId]} alt="" />
                                                                        : <PiImage />
                                                                        } */}
                                                                <img src={`${config.API_BASE}/management/products/media?productId=${productId}`} alt={`Product Image: ${title}`} />
                                                            </div>
                                                            <p>{title}</p>
                                                        </div>
                                                        <div className="icons">
                                                            <span onClick={(e) => onOpenEditField({ event: e, productId, field: "title" })}>
                                                                <PiPencilSimple />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                            {
                                                editField.productId === productId &&
                                                editField.field === "unitPrice" &&
                                                <div className="cell">
                                                    <div className="info">
                                                        <Input
                                                            onClick={(e) => { e.stopPropagation() }}
                                                            onClose={() => { setEditField({}) }}
                                                            value={editField.value || 0}
                                                            onchange={(e) => setEditField(f => ({ ...f, value: parseInt(e.target.value) }))}
                                                            onConfirm={(e) => { onConfirmFieldEdit({ event: e, productId }) }}
                                                        />
                                                    </div>
                                                </div>
                                            }
                                            {
                                                (
                                                    editField.productId !== productId ||
                                                    editField.field !== "unitPrice"
                                                ) &&
                                                <div className="cell">
                                                    <div className="info">
                                                        <p>${unitPrice}</p>
                                                        <div className="icons">
                                                            <span onClick={(e) => onOpenEditField({ event: e, productId, field: "unitPrice" })}>
                                                                <PiPencilSimple />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                            {
                                                editField.productId === productId &&
                                                editField.field === "stock" &&
                                                <div className="cell">
                                                    <div className={stock === 0 ? "info stock" : "info"}>
                                                        <Input
                                                            onClick={(e) => { e.stopPropagation() }}
                                                            onClose={() => { setEditField({}) }}
                                                            value={editField.value || 0}
                                                            onchange={(e) => setEditField(f => ({ ...f, value: parseInt(e.target.value) }))}
                                                            onConfirm={(e) => { onConfirmFieldEdit({ event: e, productId }) }}
                                                        />
                                                    </div>
                                                </div>
                                            }
                                            {
                                                (
                                                    editField.productId !== productId ||
                                                    editField.field !== "stock"
                                                ) &&
                                                <div className="cell">
                                                    <div className="info">
                                                        <p>{stock === 0 ? "out of stock" : stock}</p>
                                                        <div className="icons">
                                                            <span onClick={(e) => onOpenEditField({ event: e, productId, field: "stock" })}>
                                                                <PiPencilSimple />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                            <div className="cell">
                                                <div className="info">
                                                    <div className="order-info">
                                                        <p>{orders}</p>
                                                        <div>
                                                            <p className="count">{reviews === "hasn't been reviewed yet" ? 0 : reviews}<PiChatText size={'16px'} /></p>
                                                            <p>{rating === "hasn't been reviewed yet" ? 0 : <>{Math.ceil(rating)}<PiStar size={'16px'} /></>}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-group last" style={{ "--grid-column": "10/ span 2" }}>
                                            <div className="cell">
                                                <div className="status">
                                                    <p>{isSuspended ? "Suspended" : "Active"}</p>
                                                    <span className={isSuspended ? "" : "active"} onClick={(e) => onOpenStatus({ event: e, productId })}>
                                                        {
                                                            isSuspended === false ?
                                                                <PiCheckCircle size={"24px"} />
                                                                :
                                                                <PiPauseCircle size={"24px"} />
                                                        }
                                                    </span>
                                                </div>
                                                {
                                                    isOpenStatus &&
                                                    <div className="list-status" onClick={(e) => { e.stopPropagation() }}>
                                                        <ul>
                                                            {["Active", "Suspended"].map((status, index) => {
                                                                return (
                                                                    <li key={index} onClick={() => {
                                                                        onChangeProductSuspension({ productId, isSuspended: status === "Suspended" });
                                                                    }}>
                                                                        <span>
                                                                            <div className={((isSuspended ? "Suspended" : "Active").toLowerCase() === status.toLowerCase()) ? "radio active" : "radio"}>
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
                                            <div className="cell">
                                                <div className="created-at">
                                                    <p>{createdAt}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                        }
                        {
                            products.length === 0 &&
                            <div className="row">
                                <div className="col-group not-found">
                                    <div className="cell container">
                                        <p className="">No products found</p>
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