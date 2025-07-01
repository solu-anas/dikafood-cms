import { PiArrowLeft, PiArrowRight, PiCheck, PiCheckCircle, PiClipboardText, PiCopy, PiHash, PiInfo, PiList, PiPauseCircle, PiPencilSimple, PiPlus, PiQrCode, PiSticker, PiMinus, PiTrash } from "react-icons/pi";
import "./banks.scss";
import { useEffect, useState } from "react";
import TableComp from "../Components/TableComp";
import PopOver from "../Components/PopOver";
import Alert from "../Components/Alert";
import AddNewBank from "../Components/AddNewBank";
import { getBankAccounts } from "../hooks/banks";
import config from "../config";
import BurgerOptions from "../Components/BurgerOptions";

export default function Banks() {

    const [banks, setBanks] = useState([])
    const [counts, setCounts] = useState([])
    const [page, setPage] = useState(0)
    const limit = 10;
    const [refresh, setRefresh] = useState(false)
    const [message, setMessage] = useState("")
    const [currentStatus, setCurrentStatus] = useState("all");
    const totalPages = Math.ceil(counts[statusToWord(currentStatus)] / limit)

    function statusToWord(status) {
        const map = [
            [true, "suspended"],
            [false, "active"],
            ["all", "all"]
        ]
        const found = map.find(([s]) => s === status);
        return found ? found[1] : "";
    }
    const onSelectBankAccount = (bankAccountId) => {
        closeAllOpen();
        setBanks(prev => {
            return prev.map(b => {
                return {
                    ...b,
                    isSelected: (b.bankAccountId === bankAccountId) ? !b.isSelected : b.isSelected,
                }
            });
        })
    }

    const onSelectAllBanks = () => {
        closeAllOpen();
        setBanks(prev => {
            const shouldSelectAll = !prev.every(b => b.isSelected);
            return prev.map(b => ({
                ...b,
                isSelected: shouldSelectAll,
            }));
        });
    };

    const [theme, setTheme] = useState("")
    useEffect(() => {
        const allSelected = banks.every(b => b.isSelected);
        const someSelected = banks.some(b => b.isSelected);

        if (allSelected) {
            setTheme("all");
        } else if (someSelected) {
            setTheme("almost");
        } else {
            setTheme("none");
        }
    }, [banks]);

    const closeAllOpen = () => {
        console.log(`closeAllOpen: all closed`);
        setBanks((prev) => {
            return prev.map((b) => {
                return {
                    ...b,
                    isOpen: {}
                }
            })
        })
    };

    const closeAllToggleOne = ({ event, bankAccountId, isOpen }) => {
        event && event.stopPropagation();
        if (![
            "isOpenOptions",
            "isOpenQrCode",
            "isOpenDelete",
            "isOpenDetails",
            "isOpenOtherCountries",
            "isOpenListStatus",
            "isOpenEdit",
        ].includes(isOpen)) {
            return console.log(`closeAllToggleOne: isOpen is invalid`);
        }

        if (!banks.find(d => (d.bankAccountId === bankAccountId))) {
            return console.log(`closeAllToggleOne: no bank account with specified bankAccountId`);
        }

        console.log(`closeAllToggleOne: all closed except ${isOpen} for bank account: ${bankAccountId}`);

        setBanks(prev => {
            return prev.map(b => {
                return {
                    ...b,
                    isOpen: {
                        [isOpen]: (b.bankAccountId === bankAccountId) ? !b.isOpen[isOpen] : false,
                    }
                }
            });
        })
    }

    const onOpenListStatus = ({ event, bankAccountId }) => {
        closeAllToggleOne({ event, bankAccountId, isOpen: "isOpenListStatus" })
    }
    const onOpenListOptions = ({ event, bankAccountId }) => {
        closeAllToggleOne({ event, bankAccountId, isOpen: "isOpenOptions" })
    }

    const [isDelete, setIsDelete] = useState(false);
    const onDeleteBankAccount = () => {
        setIsDelete(!isDelete)
    }

    const [isOpenNewBankAccount, setIsNewBankAccount] = useState(false);

    const onOpenOtherCountries = ({ event, bankAccountId }) => {
        closeAllToggleOne({ event, bankAccountId, isOpen: "isOpenOtherCountries" })
    }

    const onOpenDetails = ({ event, bankAccountId }) => {
        closeAllToggleOne({ event, bankAccountId, isOpen: "isOpenDetails" })
    }

    const onOpenQrCode = ({ event, bankAccountId }) => {
        closeAllToggleOne({ event, bankAccountId, isOpen: "isOpenQrCode" })
    }

    const onOpenDelete = ({ event, bankAccountId }) => {
        closeAllToggleOne({ event, bankAccountId, isOpen: "isOpenDelete" })
    }

    const fetchAndSetBankAccounts = async ({ page, status, limit }) => {
        setBanks([]);
        setCurrentStatus(status);
        setPage(page)
        const { banks, counts } = await getBankAccounts({ page, status, limit })
        const newTotalPages = Math.ceil(counts[statusToWord(status)] / limit)

        if (page > newTotalPages) {
            setPage(newTotalPages)
            fetchAndSetBankAccounts({ page: newTotalPages, status, limit })
        }

        setBanks(banks);
        setCounts(counts);
    }

    const onChangeBankSuspension = ({ bankAccountId, isSuspended }) => {
        closeAllOpen();
        // optimistic feedback
        setBanks(prev => {
            const newDeliveryMethods = [...prev];
            const foundDeliveryMethod = newDeliveryMethods.find(d => d.bankAccountId === bankAccountId);
            foundDeliveryMethod.data.isSuspended = isSuspended;
            foundDeliveryMethod.isOpenStatus = false;
            return newDeliveryMethods;
        })
        fetch(config.API_BASE + `/management/bank-accounts/${isSuspended ? "suspend" : "activate"}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ bankAccountId })
        }).then(res => res.json())
            .then(({ success, error }) => {
                setRefresh(p => !p);
                if (success) {
                    setMessage(`Bank account ${isSuspended ? "Suspended" : "Activated"} successfully`);
                    setTimeout(() => {
                        setMessage("");
                    }, 3000)
                }
                else if (error) {
                    setMessage(`Failed to ${isSuspended ? "Suspended" : "Activated"} Bank Account`);
                    setTimeout(() => {
                        setMessage("");
                    }, 3000)
                }
            }).catch(err => {
                console.log(err)
            })
    }

    const changePage = (page) => {
        fetchAndSetBankAccounts({ page, status: currentStatus, limit })
    }

    const onAddPage = () => {
        changePage(page + 1)
    }

    const onMinusPage = () => {
        changePage(page - 1)
    }

    const onChangeSuspensionStatus = (status) => {
        fetchAndSetBankAccounts({ page: 1, status, limit })
    }

    useEffect(() => {
        fetchAndSetBankAccounts({ page: 1, status: currentStatus, limit })
    }, [refresh])
    
    return (
        <div className="banks">
            {
                isOpenNewBankAccount &&
                <div className="overlay">
                    <AddNewBank onClose={() => { setIsNewBankAccount(false) }} setMessage={setMessage} setRefresh={setRefresh} />
                </div>
            }
            <div className="header">
                <span>
                    <PiClipboardText size={"28px"} color="var(--dark-grey)" />
                </span>
                <p>Bank Accounts</p>
            </div>
            <div className="sub-nav">
                <div className="new-prod">
                    <button className="add-new-prod" onClick={() => { setIsNewBankAccount(true) }}>
                        <span><PiPlus size={"16px"} color="white" /></span>
                        Add new banks
                    </button>
                </div>
                <div className="filter">
                    <div className={currentStatus === false ? "filter-item active" : "filter-item"}
                        onClick={() => onChangeSuspensionStatus(false)}>
                        <p>Active<span>({counts?.active})</span></p>
                    </div>
                    <div className={currentStatus === true ? "filter-item active" : "filter-item"}
                        onClick={() => onChangeSuspensionStatus(true)}>
                        <p>Suspended<span>({counts?.suspended})</span></p>
                    </div>
                    <div className={currentStatus === "all" ? "filter-item active" : "filter-item"}
                        onClick={() => onChangeSuspensionStatus("all")}>
                        <p>All<span>({counts?.all})</span></p>
                    </div>
                </div>
                <div className="pagination">
                    <p>{page} / {totalPages} <span><PiSticker size={"16px"} /></span></p>
                    <div>
                        <span className={(page <= 1) ? "left disabled" : "left"}
                            onClick={onMinusPage}>
                            <PiArrowLeft />
                        </span>
                        <span className={page >= totalPages ? "right disabled" : "right"}
                            onClick={onAddPage}>
                            <PiArrowRight />
                        </span>
                    </div>
                </div>
            </div>
            <TableComp gridTempCol={"repeat(3, 48px) 17px repeat(5, 1fr) 17px repeat(2, 160px)"}
                gridCol={"1/ span 12"}
                active={banks.map(b => b.isSelected)}
                header={
                    <>
                        <div className="first">
                            <div className="check " onClick={onSelectAllBanks}>
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
                                <p>Banks</p>
                            </div>
                            <div>
                                <p>Owner</p>
                            </div>
                            <div>
                                <p>Countries</p>
                            </div>
                            <div>
                                <p>Details</p>
                            </div>
                            <div>
                                <p>QR code</p>
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
                            banks.length !== 0 ?
                                banks.map(({ bankAccountId, data: bank,
                                    isOpen: { isOpenOtherCountries, isOpenListStatus, isOpenDetails, isOpenQrCode, isOpenOptions, isOpenDelete } }, index) => (
                                    <div className="row" key={index}>
                                        <div className="col-group first" style={{ gridColumn: "1/ span 3" }}>
                                            <div className="cell" onClick={() => { onSelectBankAccount(bankAccountId) }}>
                                                <div className="check">
                                                    <div className="checkbox">
                                                        <PiCheck size={"16px"} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="cell">
                                                <div className="list">
                                                    <span className={isOpenOptions ? "active" : ""} onClick={(e) => { onOpenListOptions({ event: e, bankAccountId, isOpenOptions }) }}>
                                                        <PiList size={"16px"} color="var(--dark-grey)" />
                                                    </span>
                                                    {
                                                        (isOpenOptions || isOpenDelete) &&
                                                        <div className="list-options" onClick={(e) => { e.stopPropagation() }}>
                                                            <>
                                                                {
                                                                    (isOpenOptions) &&
                                                                    <BurgerOptions options={[
                                                                        {
                                                                            title: "Edit",
                                                                            Icon: PiPencilSimple,
                                                                        },
                                                                        {
                                                                            title: "Delete",
                                                                            Icon: PiTrash,
                                                                            theme: "delete",
                                                                            onClick: (e) => { onOpenDelete({ event: e, bankAccountId }) }
                                                                        },
                                                                    ]} />
                                                                }
                                                            </>
                                                            {
                                                                isOpenDelete &&
                                                                <Alert
                                                                    onClick={onDeleteBankAccount}
                                                                    alertHeader={"Delete"}
                                                                    alertIcon={<PiTrash size={"16px"} color="var(--red)" />}
                                                                    alertMessage={"Are you sure you want to delete this product?"}
                                                                    theme={"delete"}
                                                                    onClose={closeAllOpen}
                                                                />
                                                            }
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                            <div className="cell">
                                                <div className="number">
                                                    <span>{index + 1}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-group second" style={{ gridColumn: "5/ span 5" }}>
                                            <div className="cell">
                                                <div className="info title">
                                                    <div>
                                                        <div className="img">
                                                            <img src={`${config.API_BASE}/management/bank-accounts/logo?bankAccountId=${bankAccountId}`} alt="" />
                                                        </div>
                                                        <p>{bank.bank}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="cell">
                                                <div className="info">
                                                    <div>
                                                        <p>{bank.owner}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="cell">
                                                <div className="info location">
                                                    <div>
                                                        <div className="img">
                                                            <img src={`${config.API_BASE}/management/assets/flag?code=${bank.countries[0].code}`} alt="" />
                                                            <span>+{bank.countries.length - 1}</span>
                                                        </div>
                                                        <div className="icons">
                                                            <span onClick={(e) => onOpenOtherCountries({ event: e, bankAccountId, isOpenOtherCountries })}>
                                                                <PiInfo size={"24px"} /></span>
                                                        </div>
                                                    </div>
                                                    {
                                                        isOpenOtherCountries &&
                                                        <BurgerOptions options={bank.countries.map(c => ({ title: c.name, srcImg: `${config.API_BASE}/management/assets/flag?code=${c.code}` }))} />
                                                    }
                                                </div>
                                            </div>
                                            <div className="cell">
                                                <div className="info">
                                                    <div>
                                                        <p>{Object.entries(bank.details).length}</p>
                                                        <div className="icons">
                                                            <span className={isOpenDetails ? "active" : ""} onClick={(e) => { onOpenDetails({ event: e, bankAccountId, isOpenDetails }) }}><PiInfo size={"24px"} /></span>
                                                        </div>
                                                    </div>
                                                    {
                                                        isOpenDetails &&
                                                        <PopOver>
                                                            <div>
                                                                <p>Numéro de compte</p>
                                                                <div>
                                                                    <p>{bank.details.accountNumber}</p>
                                                                    <span><PiCopy size={"16px"} /></span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p>RIB</p>
                                                                <div>
                                                                    <p>{bank.details.rib}</p>
                                                                    <span><PiCopy size={"16px"} /></span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p>IBAN</p>
                                                                <div>
                                                                    <p>{bank.details.iban}</p>
                                                                    <span><PiCopy size={"16px"} /></span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p>Code SWIFT</p>
                                                                <div>
                                                                    <p>{bank.details.swift}</p>
                                                                    <span><PiCopy size={"16px"} /></span>
                                                                </div>
                                                            </div>
                                                        </PopOver>
                                                    }
                                                </div>
                                            </div>
                                            <div className="cell">
                                                <div className="info qr">
                                                    <div>
                                                        <p>{bank.qrCodeId ? "available" : "none"}</p>
                                                        <div className="icons">
                                                            {
                                                                bank.qrCodeId &&
                                                                <span className={isOpenQrCode ? "active" : ""}
                                                                    onClick={(e) => { onOpenQrCode({ event: e, bankAccountId, isOpenQrCode }) }}>
                                                                    <PiQrCode size={"24px"} /></span>
                                                            }
                                                        </div>
                                                    </div>
                                                    {
                                                        isOpenQrCode && bank.qrCodeId &&
                                                        <div className="popover">
                                                            <img src={`${config.API_BASE}/management/bank-accounts/qrcode?bankAccountId=${bankAccountId}`} alt="" />
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-group last" style={{ gridColumn: "11/ span 2" }}>
                                            <div className="cell">
                                                <div className="status">
                                                    <p>{bank.isSuspended ? "Suspended" : "Active"}</p>
                                                    <span className={bank.isSuspended ? "" : "active"} onClick={(e) => onOpenListStatus({ event: e, bankAccountId, isOpenListStatus })}>
                                                        {
                                                            bank.isSuspended ?
                                                                <PiPauseCircle size={"24px"} />
                                                                :
                                                                <PiCheckCircle size={"24px"} />
                                                        }
                                                    </span>
                                                </div>
                                                {
                                                    isOpenListStatus &&
                                                    <div className="list-status" onClick={(e) => { e.stopPropagation() }}>
                                                        <ul>
                                                            {["Active", "Suspended"].map((status, index) => {
                                                                return (
                                                                    <li key={index} onClick={() => {
                                                                        onChangeBankSuspension({ bankAccountId, isSuspended: status === "Suspended" });
                                                                    }}>
                                                                        <span>
                                                                            <div className={((bank.isSuspended ? "Suspended" : "Active").toLowerCase() === status.toLowerCase()) ? "radio active" : "radio"}>
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
                                                    <p>{bank.createdAt}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                                :
                                <div className="row">
                                    <div className="col-group not-found">
                                        <div className="cell container">
                                            <p className="">No bank account found</p>
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
