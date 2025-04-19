import { PiCaretDown, PiCaretUp, PiCheck, PiImage, PiMagnifyingGlass, PiPencilSimple, PiPlusBold, PiTrashSimple, PiX } from "react-icons/pi"
import "./add-new-bank.scss"
import Category from "./Category";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import UploadImage from "./UploadImage";
import config from "../config";
import io from 'socket.io-client';

export default function AddNewBank({ onClose, setMessage, setRefresh }) {

    const [countriesList, setCountriesList] = useState();
    const [newCategories, setNewCategories] = useState([]);
    const [room, setRoom] = useState("")
    const barRef = useRef();
    const [file, setFile] = useState();
    const socketRef = useRef(null);
    const [owner, setOwner] = useState("")
    const [bankName, setBankName] = useState('')
    const [detailsArray, setDetailsArray] = useState({
        accountNumber: "",
        swift: "",
        iban: "",
        rib: "",
    });
    // const [logoId, setLogoId] = useState("");
    const [logoDetails, setLogoDetails] = useState({});
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

        fetch(config.API_BASE + "/management/bank-accounts/logo/upload", {
            method: "POST",
            credentials: "include",
            body: formData
        }).then(res => res.json())
            .then(data => {
                console.log(data);
                setFile()
                fetch(`${config.API_BASE}/management/logo?logoId=${data.data.bankLogoId}&option=details`, {
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDetailsArray({
            ...detailsArray,
            [name]: value
        });
    };
    const [errors, setErrors] = useState({
        accountNumber: '',
        swift: '',
        rib: '',
        iban: ''
    });

    const validate = () => {
        let newErrors = { accountNumber: '', swift: "", rib: "", iban: "" };
        let isValid = true;

        // Account Number (16 digits)
        const accountNumber = /^\d{16}$/;
        if (!accountNumber.test(detailsArray.accountNumber)) {
            newErrors.accountNumber = 'Account number must be exactly 16 digits.';
            isValid = false;
        }

        // SWIFT Code (8 or 11 alphanumeric characters)
        const swift = /^[A-Za-z]{4}[A-Za-z]{2}[A-Za-z0-9]{2}([A-Za-z0-9]{3})?$/;
        if (!swift.test(detailsArray.swift)) {
            newErrors.swift = 'Invalid SWIFT code.';
            isValid = false;
        }

        // RIB (Exactly 24 digits)
        const rib = /^\d{24}$/;
        if (!rib.test(detailsArray.rib)) {
            newErrors.rib = 'RIB must be exactly 24 digits.';
            isValid = false;
        }

        // IBAN (Variable length but with a general structure)
        const iban = /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/;
        if (!iban.test(detailsArray.iban)) {
            newErrors.iban = 'Invalid IBAN format.';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };
    const [isSubmitting, setIsSubmitting] = useState(false);
    const onCreateBankAccount = () => {
        if (validate()) {
            setIsSubmitting(true);
            const body = {
                bankName: bankName,
                ownerName: owner,
                countries: newCategories.filter(c => c.status === "chosen").map(c => c.code),
                details: detailsArray,
                bankLogoFileId: logoDetails.logoId
            }
            fetch(config.API_BASE + '/management/bank-accounts/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(body)
            }).then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setMessage("Bank Account created successfully")
                        setTimeout(() => {
                            setMessage("")
                        }, 3000)
                        setRefresh(p => !p)
                        onClose();
                    }
                    else {
                        setMessage("Error creating Bank Account")
                        setTimeout(() => {
                            setMessage("")
                        }, 3000)
                        onClose();
                    }
                }).catch(err => console.log(err))
        }
    }

    return (
        <div className="add-new-bank">
            <div className="header">
                <p>Add Bank Account</p>
                <span onClick={onClose}>
                    <PiX size={"18px"} />
                </span>
            </div>
            <div className="body">
                <div className="info-container">
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
                    <input
                        type="text"
                        name="bankName"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder={`Bank name`} />
                    <input
                        type="text"
                        name="owner"
                        value={owner}
                        onChange={(e) => setOwner(e.target.value)}
                        placeholder={`Account Owner`} />
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
                                newCategories?.filter(c => c.status === "chosen").map((categ) => (
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
                <div className="details">
                    <p>Details</p>
                    <div className="input-container">
                        <input
                            type="text"
                            name="accountNumber"
                            value={detailsArray.accountNumber}
                            onChange={(e) => handleChange(e)}
                            placeholder={`Account Number`} />
                        <input
                            type="text"
                            name="swift"
                            value={detailsArray.swift}
                            onChange={(e) => handleChange(e)}
                            placeholder={`Swift`} />
                        <input
                            type="text"
                            name="iban"
                            value={detailsArray.iban}
                            onChange={(e) => handleChange(e)}
                            placeholder={`IBAN`} />
                        <input
                            type="text"
                            name="rib"
                            value={detailsArray.rib}
                            onChange={(e) => handleChange(e)}
                            placeholder={`RIB`} />

                        {(errors.accountNumber || errors.swift || errors.rib || errors.iban) && (
                            <div className="errors">
                                {Object.entries(errors).map(([key, value], index) => (
                                    value && <p key={index}>{value}</p>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="footer">
                <button className="cancel" onClick={onClose}>Cancel</button>
                <button className="add" onClick={onCreateBankAccount} disabled={isSubmitting}>Add Bank</button>
            </div>
        </div>
    )
}
