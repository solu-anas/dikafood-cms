import { PiCaretDown, PiCaretUp, PiCheck, PiImage, PiMagnifyingGlass, PiMinus, PiPencilSimple, PiPlus, PiPlusBold, PiTrashSimple, PiX } from "react-icons/pi"
import "./add-new-delivery.scss"
import Card from "./Card"
import { useCallback, useEffect, useRef, useState } from "react";
import Category from "./Category";
import UploadImage from "./UploadImage";
import config from "../config";
import io from 'socket.io-client';

export default function AddNewDelivery({ onClose, setMessage, setRefresh }) {
    const shippingType = [{
        title: "Type",
        options: ["Free", "Express", "Premium"]
    }]
    const [unit, setUnit] = useState(1);
    const [estimationDays, setEstimationDays] = useState(1);
    const [room, setRoom] = useState("")
    const barRef = useRef();
    const [file, setFile] = useState();
    const socketRef = useRef(null);
    const [logoDetails, setLogoDetails] = useState({})
    const [title, setTitle] = useState("")
    const [type, setType] = useState("");
    const plus = (setter, value) => {
        setter(parseInt(value) + 1);
    }
    const minus = ({ value, setter }) => {
        if (parseInt(value) > 1) setter(parseInt(value) - 1);
    }

    const [countriesList, setCountriesList] = useState();
    useEffect(() => {
        fetch(config.API_BASE + "/management/countries", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        }).then(res => res.json())
            .then(data => {
                setCountriesList(() => {
                    return Object.entries(data).map(([k, v]) => ({ code: k, name: v }))
                })
            }).catch(err => console.log(err))
    }, [])

    const [newCategories, setNewCategories] = useState([]);
    const handleCategories = useCallback(() => {
        setNewCategories(countriesList?.map(c => ({ categName: c.name, code: c.code, status: "unchosen" })));
    }, [countriesList])
    useEffect(() => {
        handleCategories();
    }, [handleCategories]);

    const handleCategoryClick = (index) => {
        setNewCategories(prevCategories =>
            prevCategories.map((cat, i) =>
                i === index ? { ...cat, status: cat.status === "unchosen" ? "chosen" : "unchosen" } : cat
            )
        );
    };

    useEffect(() => {
        socketRef.current = io(config.API_BASE, {
            withCredentials: true,
        });

        socketRef.current.on('connect', () => { });

        socketRef.current.on('init', (room) => {
            setRoom(room);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.off('init');
                socketRef.current.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        const handleUploadProgress = ({ progress }) => {
            if (barRef.current) {
                barRef.current.style.width = `${progress}%`;
            }
        };

        if (socketRef.current) {
            socketRef.current.on("product-media:success", handleUploadProgress);
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.off("product-media:success", handleUploadProgress);
            }
        };
    }, []);

    const onFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const onUploadLogo = () => {
        if (!file || !room) return;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("room", room);

        fetch(config.API_BASE + "/management/delivery-methods/logo/upload", {
            method: "POST",
            credentials: "include",
            body: formData
        }).then(res => res.json())
            .then(data => {
                console.log(data);
                setFile()
                fetch(`${config.API_BASE}/management/logo?logoId=${data.data.logoFileId}&option=details`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }).then(res => res.json())
                    .then(data => {
                        setLogoDetails(data)
                    }).catch(err => console.log(err))
            })
            .catch(err => {
                console.log('Error uploading image:', err);
            });
    };

    const onCreateDeliveryMethod = () => {
        const body = {
            type: type.toLowerCase(),
            title: title,
            countryCodes: newCategories.filter(c => c.status === "chosen").map(c => c.code),
            logoFileId: logoDetails.logoId,
            estimation: parseInt(estimationDays),
            unitPrice: parseInt(unit)
        }
        fetch(config.API_BASE + "/management/delivery-methods/add", {
            method: "POST",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        }).then(res => res.json())
        .then(data => {
            if (data.success) {
                setMessage("Delivery Method created successfully")
                setTimeout(() => {
                    setMessage("")
                }, 3000)
                setRefresh(p => !p)
                onClose();
            }
            else {
                setMessage("Error creating Delivery Method")
                setTimeout(() => {
                    setMessage("")
                }, 3000)
                onClose();
            }
        }).catch(err=>console.log(err))
    }
    console.log(type)
    return (
        <div className="add-new-delivery">
            <div className="header">
                <p>New delivery method</p>
                <span onClick={onClose}>
                    <PiX size={"18px"} />
                </span>
            </div>
            <div className="body">
                <Card options={shippingType} setType={setType} />
                <div className="img">
                    <UploadImage
                        img={logoDetails.logoId ? `${config.API_BASE}/management/logo?logoId=${logoDetails.logoId}&option=image` : "/images/placeholder.png"}
                        name={logoDetails.name} onUpload={onFileChange} />
                    {
                        file &&
                        <div className="file-container">
                            <div className="img">
                                <PiImage />
                            </div>
                            <div className="info">
                                <p>{file.name}</p>
                                <div className="progress" style={{ width: "100%", height: "100%", backgroundColor: "transparent", }}>
                                    <div className="bar-container" ref={barRef}
                                        style={{ width: "0%", height: "100%", backgroundColor: 'var(--light-green-1)' }}></div>
                                </div>
                                <div className="spans">
                                    <span className="check" onClick={onUploadLogo}><PiCheck /></span>
                                    <span className="close" onClick={() => { setFile() }}><PiX /></span>
                                </div>
                            </div>
                        </div>
                    }
                </div>
                <div className="info-container">
                    <input type="text" className="title"
                        placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <div className="inputs-container">
                        <div className="card unit">
                            <p>Unit price</p>
                            <div>
                                <input type="number" value={unit} onChange={(e) => { setUnit(e.target.value) }} />
                                <div className="spans">
                                    <span onClick={() => minus(unit, setUnit)}>
                                        <PiMinus />
                                    </span>
                                    <span onClick={() => plus(setUnit, unit)}>
                                        <PiPlus />
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="card unit">
                            <p>Estimation in days</p>
                            <div>
                                <input type="number" value={estimationDays} onChange={(e) => { setEstimationDays(e.target.value) }} />
                                <div className="spans">
                                    <span onClick={() => minus(estimationDays, setEstimationDays)}>
                                        <PiMinus />
                                    </span>
                                    <span onClick={() => plus(setEstimationDays, estimationDays)}>
                                        <PiPlus />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="countries">
                    <p>Location</p>
                    <div className="buttons-conatiner">
                        <button className="active">
                            Countries <span>({newCategories?.filter(c => c.status === "chosen").length})</span>
                        </button>
                    </div>
                    <div className="countries-container">
                        <div className="search">
                            <span>
                                <PiMagnifyingGlass />
                            </span>
                            <input type="text" placeholder="search country..." />
                        </div>
                        <div className="unchosen-countries">
                            {
                                newCategories?.filter(c => c.status === "unchosen").map((categ) => (
                                    <Category
                                        key={categ.categName}
                                        categName={categ.categName}
                                        isActive={categ.status === "chosen"}
                                        onClick={() => handleCategoryClick(newCategories?.findIndex(cat => cat.categName === categ.categName))}
                                    />
                                ))
                            }
                        </div>
                        <div className="chosen-countries">
                            {
                                newCategories?.filter(c => c.status === "chosen")?.map((categ) => (
                                    <Category
                                        key={categ.categName}
                                        categName={categ.categName}
                                        isActive={categ.status === "chosen"}
                                        onClick={() => handleCategoryClick(newCategories?.findIndex(cat => cat.categName === categ.categName))}
                                    />
                                ))
                            }
                        </div>
                    </div>
                </div>
                {/* <div className="details">
                    <p>Details</p>
                    <div className="details-container">
                        <div className="detail">
                            <p className="prop">prop</p>
                            <p className="value">value</p>
                            <div className="delete">
                                <span><PiPencilSimple size={"16px"} /></span>
                                <span><PiTrashSimple size={"16px"} /></span>
                            </div>
                            <div className="arrows">
                                <span><PiCaretUp /></span>
                                <span><PiCaretDown /></span>
                            </div>
                        </div>
                        <div className="gap" onClick={() => { setIsOpenNewDetailBetween(p => !p); setIsOpenNewDetail(false) }}>
                            <div className="line"></div>
                            <span><PiPlusBold size={"14px"} /></span>
                        </div>
                        {
                            isOpenNewDetailBetween &&
                            <div className="new-detail" style={{ marginBottom: "16px" }}>
                                <div className="prop">
                                    <input type="text" placeholder="property" />
                                </div>
                                <div className="value">
                                    <input type="text" placeholder="value" />
                                    <div className="spans">
                                        <span className="check"><PiCheck /></span>
                                        <span className="close" onClick={() => { setIsOpenNewDetailBetween(false) }}><PiX /></span>
                                    </div>
                                </div>
                            </div>
                        }
                        <div className="detail">
                            <p className="prop">prop</p>
                            <p className="value">Value</p>
                            <div className="delete">
                                <span><PiPencilSimple size={"16px"} /></span>
                                <span><PiTrashSimple size={"16px"} /></span>
                            </div>
                            <div className="arrows">
                                <span><PiCaretUp /></span>
                                <span><PiCaretDown /></span>
                            </div>
                        </div>
                        {
                            isOpenNewDetail &&
                            <div className="new-detail" style={{ marginTop: "16px" }}>
                                <div className="prop">
                                    <input type="text" placeholder="property" />
                                </div>
                                <div className="value">
                                    <input type="text" placeholder="value" />
                                    <div className="spans">
                                        <span className="check"><PiCheck /></span>
                                        <span className="close" onClick={() => { setIsOpenNewDetail(false) }}><PiX /></span>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                    <button className="button" onClick={() => { setIsOpenNewDetail(p => !p); setIsOpenNewDetailBetween(false) }}>
                        <span><PiPlusBold size={"12px"} /></span>
                        Add new detail
                    </button>
                </div> */}
            </div>
            <div className="footer">
                <button className="cancel" onClick={onClose}>Cancel</button>
                <button className="add" onClick={onCreateDeliveryMethod}>Add Delivery method</button>
            </div>
        </div>
    )
}
