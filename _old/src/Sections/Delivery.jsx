import { PiArrowLeft, PiArrowRight, PiCheck, PiCheckCircle, PiCopy, PiHash, PiInfo, PiList, PiPauseCircle, PiPencilSimple, PiPlus, PiSticker, PiMinus, PiTrash, PiTruck } from "react-icons/pi";
import "./delivery.scss";
import { useEffect, useState } from "react";
import TableComp from '../Components/TableComp';
import Statuspopover from "../Components/Statuspopover";
import Alert from "../Components/Alert";
import PopOver from "../Components/PopOver";
import AddNewDelivery from "../Components/AddNewDelivery";
import { getDeliveryMethods } from "../hooks/delivery";
import config from "../config";
import BurgerOptions from "../Components/BurgerOptions";

export default function Delivery() {

  const [deliveryMethods, setDeliveryMethods] = useState([]);
  const [currentStatus, setCurrentStatus] = useState("all");
  const [counts, setCounts] = useState([]);
  const [page, setPage] = useState(0);
  const limit = 10;
  const totalPages = Math.ceil(counts[statusToWord(currentStatus)] / limit);
  const [isOpenNewDelivery, setIsOpenNewDelivery] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [message, setMessage] = useState("")
  const [isDelete, setIsDelete] = useState(false);

  const onDeleteDeliveryMethod = () => {
    setIsDelete(!isDelete)
  }

  const onOpenNewDelivery = () => {
    setIsOpenNewDelivery(p => !p)
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

  const onSelectDeliveryMethod = (deliveryMethodId) => {
    closeAllOpen();
    setDeliveryMethods(prev => {
      return prev.map(d => {
        return {
          ...d,
          isSelected: (d.deliveryMethodId === deliveryMethodId) ? !d.isSelected : d.isSelected,
        }
      });
    })
  }
  const onSelectAllDeliveryMethod = () => {
    closeAllOpen();
    setDeliveryMethods(prev => {
      const shouldSelectAll = !prev.every(b => b.isSelected);
      return prev.map(b => ({
        ...b,
        isSelected: shouldSelectAll,
      }));
    });
  };

  const [theme, setTheme] = useState("")
  useEffect(() => {
    const allSelected = deliveryMethods.every(b => b.isSelected);
    const someSelected = deliveryMethods.some(b => b.isSelected);

    if (allSelected) {
      setTheme("all");
    } else if (someSelected) {
      setTheme("almost");
    } else {
      setTheme("none");
    }
  }, [deliveryMethods]);

  const closeAllOpen = () => {
    console.log(`closeAllOpen: all closed`);
    setDeliveryMethods((prev) => {
      return prev.map((d) => {
        return {
          ...d,
          isOpen: {}
        }
      })
    })
  };

  const closeAllToggleOne = ({ event, deliveryMethodId, isOpen }) => {
    event && event.stopPropagation();
    if (![
      "isOpenOptions",
      "isOpenSuspended",
      "isOpenDelete",
      "isOpenDetails",
      "isOpenOtherCountries",
      "isOpenStatus",
      "isOpenEdit",
    ].includes(isOpen)) {
      return console.log(`closeAllToggleOne: isOpen is invalid`);
    }

    if (!deliveryMethods.find(d => (d.deliveryMethodId === deliveryMethodId))) {
      return console.log(`closeAllToggleOne: no deliverMethod with specified deliveryMethodId`);
    }

    console.log(`closeAllToggleOne: all closed except ${isOpen} for deliverMethod: ${deliveryMethodId}`);

    setDeliveryMethods(prev => {
      return prev.map(d => {
        return {
          ...d,
          isOpen: {
            [isOpen]: (d.deliveryMethodId === deliveryMethodId) ? !d.isOpen[isOpen] : false,
          }
        }
      });
    })
  }

  const onOpenListOptions = ({ event, deliveryMethodId }) => {
    closeAllToggleOne({ event, deliveryMethodId, isOpen: "isOpenOptions" })
  }

  const onOpenDetails = ({ event, deliveryMethodId }) => {
    closeAllToggleOne({ event, deliveryMethodId, isOpen: "isOpenDetails" })
  }

  const onOpenDelete = ({ event, deliveryMethodId }) => {
    closeAllToggleOne({ event, deliveryMethodId, isOpen: "isOpenDelete" })
  }

  const onOpenOtherCountries = ({ event, deliveryMethodId }) => {
    closeAllToggleOne({ event, deliveryMethodId, isOpen: "isOpenOtherCountries" })
  }

  const onOpenListStatus = ({ event, deliveryMethodId }) => {
    closeAllToggleOne({ event, deliveryMethodId, isOpen: "isOpenStatus" })
  }

  const fetchAndSetDeliveryMethods = async ({ page, status, limit }) => {
    setDeliveryMethods([]);
    setCurrentStatus(status);
    setPage(page)
    const { deliveryMethods, counts } = await getDeliveryMethods({ page, status, limit })
    const newTotalPages = Math.ceil(counts[statusToWord(status)] / limit)

    if (page > newTotalPages) {
      setPage(newTotalPages)
      fetchAndSetDeliveryMethods({ page: newTotalPages, status, limit })
    }

    setDeliveryMethods(deliveryMethods);
    setCounts(counts);
  }

  const onChangeDeliverySuspension = ({ deliveryMethodId, isSuspended }) => {
    closeAllOpen();
    // optimistic feedback
    setDeliveryMethods(prev => {
      const newDeliveryMethods = [...prev];
      const foundDeliveryMethod = newDeliveryMethods.find(d => d.deliveryMethodId === deliveryMethodId);
      foundDeliveryMethod.data.isSuspended = isSuspended;
      foundDeliveryMethod.isOpenStatus = false;
      return newDeliveryMethods;
    })
    fetch(config.API_BASE + `/management/delivery-methods/${isSuspended ? "suspend" : "activate"}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ deliveryMethodId })
    }).then(res => res.json())
      .then(({ success, error }) => {
        setRefresh(p => !p);
        if (success) {
          setMessage(`Delivery Method ${isSuspended ? "Suspended" : "Activated"} successfully`);
          setTimeout(() => {
            setMessage("");
          }, 3000)
        }
        else if (error) {
          setMessage(`Failed to ${isSuspended ? "Suspended" : "Activated"} Delivery Method`);
          setTimeout(() => {
            setMessage("");
          }, 3000)
        }
      }).catch(err => {
        console.log(err)
      })
  }

  const changePage = (page) => {
    fetchAndSetDeliveryMethods({ page, status: currentStatus, limit })
  }

  const onAddPage = () => {
    changePage(page + 1)
  }

  const onMinusPage = () => {
    changePage(page - 1)
  }

  const onChangeSuspensionStatus = (status) => {
    fetchAndSetDeliveryMethods({ page: 1, status, limit })
  }

  useEffect(() => {
    fetchAndSetDeliveryMethods({ page: 1, status: currentStatus, limit })
  }, [refresh])

  return (
    <div className="delivery">
      {
        isOpenNewDelivery &&
        <div className="overlay">
          <AddNewDelivery onClose={() => setIsOpenNewDelivery(false)}
          setMessage={setMessage} setRefresh={setRefresh} />
        </div>
      }
      <div className="header">
        <span>
          <PiTruck size={"28px"} color="var(--dark-grey)" />
        </span>
        <p>Delivery</p>
      </div>
      <div className="sub-nav">
        <div className="new-prod">
          <button className="add-new-prod" onClick={onOpenNewDelivery}>
            <span><PiPlus size={"16px"} color="white" /></span>
            New Delivery Method
          </button>
        </div>
        <div className="filter">
          <div className={currentStatus === false ? "filter-item active" : "filter-item"}
            onClick={() => onChangeSuspensionStatus(false)}>
            <p>Active<span>({counts.active})</span></p>
          </div>
          <div className={currentStatus === true ? "filter-item active" : "filter-item"}
            onClick={() => onChangeSuspensionStatus(true)}>
            <p>Suspended<span>({counts.suspended})</span></p>
          </div>
          <div className={currentStatus === "all" ? "filter-item active" : "filter-item"}
            onClick={() => onChangeSuspensionStatus("all")}>
            <p>All<span>({counts.all})</span></p>
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
        active={deliveryMethods.map(d => d.isSelected)}
        header={
          <>
            <div className="first">
              <div className="check" onClick={onSelectAllDeliveryMethod}>
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
                <p>Title</p>
              </div>
              <div>
                <p>Type</p>
              </div>
              <div>
                <p>Price</p>
              </div>
              <div>
                <p>Estimation</p>
              </div>
              <div>
                <p>Location</p>
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
              deliveryMethods.length !== 0
                ?
                deliveryMethods.map(({ deliveryMethodId, data: d,
                  isOpen: { isOpenOptions, isOpenDetails, isOpenDelete, isOpenOtherCountries, isOpenStatus } }, index) => (
                  <div className="row delivery-line" key={index}>
                    <div className="col-group first" style={{ "--grid-column": "1/ span 3" }}>
                      <div className="cell" onClick={() => { onSelectDeliveryMethod(deliveryMethodId) }}>
                        <div className="check">
                          <div className="checkbox">
                            <PiCheck size={"16px"} />
                          </div>
                        </div>
                      </div>
                      <div className="cell">
                        <div className="list">
                          <span className={isOpenOptions ? "active" : ""} onClick={(e) => { onOpenListOptions({ event: e, deliveryMethodId, isOpenOptions }) }}>
                            <PiList size={"16px"} color={isOpenOptions ? 'var(--dark-green-1)' : "var(--dark-grey)"} />
                          </span>
                          {
                            (isOpenOptions || isOpenDelete || isOpenDetails) &&
                            <div className="list-options" onClick={(e) => { e.stopPropagation() }}>
                              <>
                                {
                                  (isOpenOptions || isOpenDetails) &&
                                  <BurgerOptions options={[
                                    {
                                      title: "Edit",
                                      Icon: PiPencilSimple,
                                    },
                                    {
                                      title: "Details",
                                      Icon: PiInfo,
                                      onClick: (e) => { onOpenDetails({ event: e, deliveryMethodId, isOpenDetails }) },
                                      isActive: isOpenDetails
                                    },
                                    {
                                      title: "Delete",
                                      Icon: PiTrash,
                                      theme: "delete",
                                      onClick: (e) => { onOpenDelete({ event: e, deliveryMethodId }) }
                                    },
                                  ]} />
                                }
                              </>
                              {
                                isOpenDelete &&
                                <Alert
                                  onClick={onDeleteDeliveryMethod}
                                  alertHeader={"Delete"}
                                  alertIcon={<PiTrash size={"16px"} color="var(--red)" />}
                                  alertMessage={"Are you sure you want to delete this product?"}
                                  theme={"delete"}
                                  onClose={closeAllOpen}
                                />
                              }
                            </div>
                          }
                          {
                            isOpenDetails &&
                            <PopOver>
                              <div className="popover-header">
                                <span><PiInfo /></span>
                                <p>Details</p>
                              </div>
                              <div>
                                <p>City</p>
                                <div>
                                  <p>Rabat</p>
                                  <span><PiCopy size={"16px"} /></span>
                                </div>
                              </div>
                            </PopOver>
                          }
                        </div>
                      </div>
                      <div className="cell">
                        <div className="number">
                          <span>{d.serialNumber}</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-group second" style={{ "--grid-column": "5/ span 5" }}>
                      <div className="cell">
                        <div className="info title">
                          <div>
                            <div className="img">
                              <img src={`${config.API_BASE}/management/delivery-methods/logo?deliveryMethodId=${deliveryMethodId}&preset=profile`} alt="logo" />
                            </div>
                            <p>{d.title}</p>
                          </div>
                        </div>
                      </div>
                      <div className="cell">
                        <div className="info">
                          <div>
                            <p>{d.type}</p>
                          </div>
                        </div>
                      </div>
                      <div className="cell">
                        <div className="info">
                          <div>
                            <p>{d.price}</p>
                          </div>
                        </div>
                      </div>
                      <div className="cell">
                        <div className="info">
                          <div>
                            <p>{d.estimation}</p>
                          </div>
                        </div>
                      </div>
                      <div className="cell">
                        <div className="info location">
                          <div>
                            <div className="img">
                              <img src={`${config.API_BASE}/management/assets/flag?code=${d.location[0].code}`} alt="" />
                              <span>+{d.location.length - 1}</span>
                            </div>
                            <div className="icons">
                              <span className={isOpenOtherCountries ? "active" : ""}
                                onClick={(e) => onOpenOtherCountries({ event: e, deliveryMethodId, isOpenOtherCountries })}>
                                <PiInfo />
                              </span>
                            </div>
                          </div>
                        </div>
                        {
                          isOpenOtherCountries &&
                          <BurgerOptions options={d.location.map(l => ({ title: l.name, srcImg: `${config.API_BASE}/management/assets/flag?code=${l.code}` }))} />
                        }
                      </div>
                    </div>
                    <div className="col-group last" style={{ "--grid-column": "11/ span 2" }}>
                      <div className="cell">
                        <div className="status">
                          <p>{d.isSuspended ? "Suspended" : "Active"}</p>
                          <span className={d.isSuspended === false ? "active" : ""}
                            onClick={(e) => onOpenListStatus({ event: e, deliveryMethodId, isOpenStatus })}>
                            {
                              d.isSuspended ?
                                <PiPauseCircle size={"24px"} />
                                :
                                <PiCheckCircle size={"24px"} />
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
                                    onChangeDeliverySuspension({ deliveryMethodId, isSuspended: status === "Suspended" });
                                  }}>
                                    <span>
                                      <div className={((d.isSuspended ? "Suspended" : "Active").toLowerCase() === status.toLowerCase()) ? "radio active" : "radio"}>
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
                          <p>{d.createdAt}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )) :
                <div className="row">
                  <div className="col-group not-found">
                    <div className="cell container">
                      <p className="">No delivery method found</p>
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
