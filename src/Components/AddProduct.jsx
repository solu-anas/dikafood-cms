import { PiCaretDown, PiCaretUp, PiCheck, PiImage, PiMagnifyingGlass, PiMinus, PiPlus, PiPlusBold, PiTrashSimple, PiX, PiXBold } from "react-icons/pi";
import "./add-product.scss";
import Category from "./Category";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Image from "./Image";
import GapInput from "./GapInput";
import Accordion from "./Accordion";
import config from "../config";
import io from 'socket.io-client';

export default function AddProduct({ onClose, setRefresh, setMessage }) {
    const [categories, setCategories] = useState([]);
    const [detailsArray, setDetailsArray] = useState([]);
    const [detailProp, setDetailProp] = useState("");
    const [detailValue, setDetailValue] = useState("");
    const [isOpenNewDetailBetween, setIsOpenNewDetailBetween] = useState(new Array(detailsArray.length === 0 ? 0 : (detailsArray)?.length - 1).fill(false));
    const [isOpenNewDetail, setIsOpenNewDetail] = useState(false);
    const [propertyOption, setPropertyOption] = useState("");
    const [propertiesArray, setPropertiesArray] = useState([]);
    const [options, setOptions] = useState([])
    const [isOpenNewOptionBetween, setIsOpenNewOptionBetween] = useState(new Array(options?.length === 0 ? 0 : (options)?.length - 1).fill(false));
    const [isOpenNewOption, setIsOpenNewOption] = useState(false);
    const [title, setTitle] = useState("");
    const [descp, setDescp] = useState("")
    const [unit, setUnit] = useState(1);
    const [quantity, setQuantity] = useState(1);
    const [mediaIds, setMediaIds] = useState([]);
    const [imagesUploaded, setImagesUploaded] = useState([])
    const [productImages, setProductImages] = useState([])
    const [imagesDetails, setImagesDetails] = useState([]);
    const [room, setRoom] = useState();
    const barRef = useRef();
    const [file, setFile] = useState();
    const socketRef = useRef(null);
    const [refreshImages, setIsRefreshImages] = useState(false);
    const [deletedImageIds, setDeletedImageIds] = useState([]);
    const [newCategories, setNewCategories] = useState([]);
    const [isOpenNewProperty, setIsOpenNewProperty] = useState(false);
    const [propertyName, setPropertyName] = useState("");
    const [optionToProperty, setOptionToProperty] = useState("")

    const onOpenNewDetailsBetween = (index) => {
        setIsOpenNewDetailBetween(p => {
            const newValues = new Array(p.length).fill(false)
            newValues[index] = true
            return newValues;
        })
    }
    const onOpenNewOptionBetween = (index) => {
        setIsOpenNewOptionBetween(p => {
            const newValues = new Array(p.length).fill(false)
            newValues[index] = true
            return newValues;
        })
    }

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

    const handleCategories = useCallback(() => {
        setNewCategories(categories.map(c => ({ categName: c, status: "unchosen" })));
    }, [categories])

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

    const plus = (setter, value) => {
        setter(parseInt(value) + 1);
    }

    const minus = (value, setter) => {
        if (parseInt(value) > 1) {
            setter(parseInt(value) - 1)
        };
    }

    const OnAddDetails = () => {
        if (detailProp && detailValue) {
            setDetailsArray([...detailsArray, { name: detailProp, title: detailProp, value: detailValue }]);
        }
        setIsOpenNewDetail(false)
        setIsOpenNewDetailBetween(new Array(detailsArray.length === 0 ? 0 : (detailsArray)?.length - 1).fill(false))
        setDetailProp("")
        setDetailValue("")
    }

    const onAddOption = () => {
        if (propertyOption) {
            setOptions([...options, { title: propertyOption, name: propertyOption }])
        }
        setIsOpenNewOption(false)
        setIsOpenNewOptionBetween(new Array(options.length === 0 ? 0 : (options)?.length - 1).fill(false))
        setPropertyOption("")
    }

    const onAddOptionToProperty = (propertyName) => {
        if (optionToProperty) {
            setPropertiesArray((prevPropertiesArray) =>
                prevPropertiesArray.map((property) =>
                    property.name === propertyName
                        ? { ...property, options: [...property.options, { title: optionToProperty, name: optionToProperty }] }
                        : property
                )
            );
            setOptionToProperty("");
            setIsOpenNewOption(false)
            setIsOpenNewOptionBetween(new Array(options?.length === 0 ? 0 : (options)?.length - 1).fill(false))
        }
    };

    const onAddProperty = () => {
        if (propertyName && options) {
            setPropertiesArray([...propertiesArray,
            { title: propertyName, name: propertyName, options: options }
            ])
        }
        setIsOpenNewProperty(false)
        setOptions([])
        setPropertyName("")
    }

    const onDeleteDetail = (indexToDelete) => {
        setDetailsArray(prevDetails => {
            return prevDetails.filter((_, index) => index !== indexToDelete);
        });

        setIsOpenNewDetailBetween(prevState => {
            return prevState.filter((_, index) => index !== indexToDelete);
        });

        setDetailProp("");
        setDetailValue("");
        setIsOpenNewDetail(false);
    };

    const onDeleteOption = (indexToDelete) => {
        setOptions(prevOptions => {
            return prevOptions.filter((_, index) => index !== indexToDelete);
        });
        setIsOpenNewOptionBetween(prevState => {
            return prevState.filter((_, index) => index !== indexToDelete);
        })
        setPropertyOption("")
        setIsOpenNewOption(false);
    }

    const onCreateProduct = () => {
        const body =
        {
            title: title,
            descp: descp || "empty description",
            unitPrice: unit,
            stockQuantity: quantity || 0,
            categories: newCategories.filter(c => c.status === "chosen").map(c => c.categName),
        }
        if (detailsArray.length !== 0) {
            body.details = detailsArray
        }
        if (productImages.length !== 0) {
            body.images = productImages
        }
        if (propertiesArray.length !== 0) {
            body.properties = propertiesArray
        }
        fetch(config.API_BASE + "/management/products/create", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify(body)
        }).then(res => res.json())
            .then(data => {
                // console.log(data)
                setRefresh(p => !p)
                if (data.success) {
                    setMessage("Product Created successfully")
                    setTimeout(() => {
                        setMessage("");
                    }, 3000)
                    onClose();
                }
                else {
                    setMessage("Faild to create product")
                    setTimeout(() => {
                        setMessage("");
                    }, 3000)
                    onClose()
                }
            })
            .catch(err => console.log(err))
    }

    useEffect(() => {
        fetch(config.API_BASE + "/management/products/categories", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include"
        }).then(res => res.json())
            .then(data => {
                setCategories(data)
            }).catch(err => console.log(err))
    }, [])

    const onFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const onUploadImage = () => {
        if (!file || !room) return;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("room", room);

        fetch(config.API_BASE + "/management/products/media/upload", {
            method: "POST",
            credentials: "include",
            body: formData
        }).then(res => res.json())
            .then(data => {
                console.log(data);
                // setProgress(0)
                setIsRefreshImages(p => !p)
                setFile()
            })
            .catch(err => {
                console.log('Error uploading image:', err);
            });
    };

    useEffect(() => {
        fetch(config.API_BASE + "/management/products/media/list?option=all", {
            method: "GET",
            credentials: "include"
        }).then(response => response.json())
            .then(data => {
                setMediaIds(data.existingFiles)
            }).catch(err => console.log(err))
    }, [refreshImages])

    useEffect(() => {
        const updatedProductImages = mediaIds
            .filter(id => !deletedImageIds.includes(id))
            .map((d, index) => ({
                mediaId: d,
                isMain: index === 0,
                position: index
            }));

        setProductImages(updatedProductImages);
        setProductImages((prev) => {
            return prev.map((p, i) => ({ mediaId: p.mediaId, isMain: i === 0 }))
        })
    }, [mediaIds, deletedImageIds]);

    const fetchImagesUploaded = useCallback(async () => {
        try {
            if (!mediaIds?.length) return;

            const imageFetches = mediaIds?.map((mediaId) =>
                fetch(`${config.API_BASE}/management/media?mediaId=${mediaId}`, {
                    method: "GET",
                    credentials: "include",
                }).then(res => res.blob())
                    .then(blob => ({
                        [mediaId]: URL.createObjectURL(blob)
                    }))
            );

            const detailsImageFetches = mediaIds?.map((mediaId) =>
                fetch(`${config.API_BASE}/management/media?mediaId=${mediaId}&option=details`, {
                    method: "GET",
                    credentials: "include",
                }).then(res => res.json())
                    .then(data => ({
                        [mediaId]: data
                    }))
            );

            const [imageObjects, imageDetailsObjects] = await Promise.all([
                Promise.all(imageFetches),
                Promise.all(detailsImageFetches),
            ]);

            const imageMap = imageObjects.reduce((acc, imageObject) => {
                return { ...acc, ...imageObject };
            }, {});

            const imageDetailsMap = imageDetailsObjects.reduce((acc, imageObject) => {
                return { ...acc, ...imageObject };
            }, {});

            setImagesUploaded(imageMap);
            setImagesDetails(imageDetailsMap);

        } catch (error) {
            console.error('Error fetching images:', error);
        }
    }, [mediaIds]);


    useEffect(() => {
        fetchImagesUploaded()
    }, [fetchImagesUploaded])

    const onDeleteImage = (mediaIdToDelete) => {

        setDeletedImageIds(prev => [...prev, mediaIdToDelete]);
        setProductImages(prevProductImages => {
            const updatedProductImages = prevProductImages.filter(img => img.mediaId !== mediaIdToDelete);

            if (updatedProductImages.length > 0) {
                updatedProductImages[0].isMain = true;
                for (let i = 1; i < updatedProductImages.length; i++) {
                    updatedProductImages[i].isMain = false;
                }
            }

            return updatedProductImages;
        });

        setImagesUploaded(prevImagesUploaded => {
            const updatedImages = { ...prevImagesUploaded };
            delete updatedImages[mediaIdToDelete];
            return updatedImages;
        });

        setImagesDetails(prevImagesDetails => {
            const updatedDetails = { ...prevImagesDetails };
            delete updatedDetails[mediaIdToDelete];
            return updatedDetails;
        });
    }

    const [isActiveproperty, setIsActiveProperty] = useState(null);

    const handleAccordionClick = (index) => {
        setIsActiveProperty((prevIndex) => (prevIndex === index ? null : index));
    };
    return (
        <div className="add-product">
            <div className="header">
                <p>Add new product</p>
                <span onClick={onClose}>
                    <PiX size={"18px"} />
                </span>
            </div>
            <div className="body">
                <div className="product-info">
                    <input type="text" name="name" placeholder="Name *" id="name" value={title}
                        onChange={e => setTitle(e.target.value)} />
                    <textarea type="text" className="descp"
                        placeholder="Description" value={descp} onChange={(e) => { setDescp(e.target.value) }} />
                    <div className="container">
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
                            <p>Stock</p>
                            <div>
                                <input type="number" value={quantity} onChange={(e) => { setQuantity(e.target.value) }} />
                                <div className="spans">
                                    <span onClick={() => minus(quantity, setQuantity)}>
                                        <PiMinus />
                                    </span>
                                    <span onClick={() => plus(setQuantity, quantity)}>
                                        <PiPlus />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="categories">
                    <p>Categories</p>
                    <div className="categories-container">
                        <div className="search">
                            <span>
                                <PiMagnifyingGlass />
                            </span>
                            <input type="text" placeholder="search category..." />
                        </div>
                        <div className="unchosen-categ">
                            <p>Search results</p>
                            {
                                newCategories.filter(c => c.status === "unchosen").length !== 0 &&
                                <div className="unchosen-categ-container">
                                    {
                                        newCategories.filter(c => c.status === "unchosen").map((categ, index) => (
                                            <Category
                                                key={index}
                                                categName={categ.categName}
                                                isActive={categ.status === "chosen"}
                                                onClick={() => handleCategoryClick(newCategories.findIndex(cat => cat.categName === categ.categName))}
                                            />
                                        ))
                                    }
                                </div>
                            }
                        </div>
                        <div className="chosen-categ">
                            <p>Selected Categories</p>
                            {
                                newCategories.filter(c => c.status === "chosen").length !== 0 &&
                                <div className="chosen-categ-container">
                                    {
                                        newCategories.filter(c => c.status === "chosen").map((categ, index) => (
                                            <Category
                                                key={index}
                                                categName={categ.categName}
                                                isActive={categ.status === "chosen"}
                                                onClick={() => handleCategoryClick(newCategories.findIndex(cat => cat.categName === categ.categName))}
                                            />
                                        ))
                                    }
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <div className="images">
                    <p>Images</p>
                    <div className="images-container">
                        {
                            productImages?.map((productImage, index) => (
                                <Fragment key={index}>
                                    <Image
                                        img={imagesUploaded[productImage.mediaId]}
                                        name={imagesDetails[productImage.mediaId]?.name}
                                        onDelete={() => { onDeleteImage(productImage.mediaId) }}
                                        isMain={productImage.isMain} />
                                    {
                                        index !== productImages.length - 1 &&
                                        <GapInput onChange={onFileChange} />
                                    }
                                </Fragment>
                            ))
                        }
                    </div>
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
                                    <span className="check" onClick={onUploadImage}><PiCheck /></span>
                                    <span className="close" onClick={() => { setFile() }}><PiX /></span>
                                </div>
                            </div>
                        </div>
                    }
                    <button className="button">
                        <input type="file" onChange={onFileChange} />
                        <span><PiPlusBold size={"12px"} /></span>
                        Add new image
                    </button>
                </div>
                <div className="details">
                    <p>Details</p>
                    {
                        detailsArray.length !== 0 &&
                        <div className="details-container">
                            {
                                detailsArray.map((d, index) => (
                                    <Fragment key={index}>
                                        <div className="detail">
                                            <p className="prop">{d.title}</p>
                                            <p className="value">{d.value}</p>
                                            <div className="delete">
                                                <span onClick={() => onDeleteDetail(index)}><PiTrashSimple size={"16px"} /></span>
                                            </div>
                                            <div className="arrows">
                                                <span><PiCaretUp /></span>
                                                <span><PiCaretDown /></span>
                                            </div>
                                        </div>

                                        {index !== detailsArray.length - 1 && (
                                            <div className="gap" onClick={() => {
                                                onOpenNewDetailsBetween(index)
                                                setIsOpenNewDetail(false);
                                            }}>
                                                <div className="line"></div>
                                                <span><PiPlusBold size={"14px"} /></span>
                                            </div>
                                        )}

                                        {isOpenNewDetailBetween[index] && (
                                            <div className="new-detail" style={{ marginBottom: "16px" }}>
                                                <div className="prop">
                                                    <input type="text" placeholder="property" value={detailProp}
                                                        onChange={(e) => { setDetailProp(e.target.value) }} />
                                                </div>
                                                <div className="value">
                                                    <input type="text" placeholder="value" value={detailValue}
                                                        onChange={(e) => { setDetailValue(e.target.value) }} />
                                                    <div className="spans">
                                                        <span className="check" onClick={() => {
                                                            OnAddDetails();
                                                            setIsOpenNewDetailBetween(new Array(detailsArray.length === 0 ? 0 : (detailsArray)?.length - 1).fill(false));
                                                        }}><PiCheck /></span>
                                                        <span className="close" onClick={() => {
                                                            setIsOpenNewDetailBetween(new Array(detailsArray.length === 0 ? 0 : (detailsArray)?.length - 1).fill(false));
                                                        }}><PiX /></span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Fragment>
                                ))
                            }
                        </div>
                    }
                    {isOpenNewDetail && (
                        <div className="new-detail">
                            <div className="prop">
                                <input type="text" placeholder="property" value={detailProp}
                                    onChange={(e) => { setDetailProp(e.target.value) }} />
                            </div>
                            <div className="value">
                                <input type="text" placeholder="value" value={detailValue}
                                    onChange={(e) => { setDetailValue(e.target.value) }} />
                                <div className="spans">
                                    <span className="check" onClick={OnAddDetails}><PiCheck /></span>
                                    <span className="close" onClick={() => {
                                        setIsOpenNewDetail(false);
                                        setDetailProp("");
                                        setDetailValue("");
                                    }}><PiX /></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <button className="button" onClick={() => {
                        setIsOpenNewDetail(true);
                        setIsOpenNewDetailBetween(new Array(detailsArray.length === 0 ? 0 : (detailsArray)?.length - 1).fill(false))
                    }}>
                        <span><PiPlusBold size={"12px"} /></span>
                        Add new detail
                    </button>
                </div>
                <div className="properties">
                    <p>Properties</p>
                    <div className="properties-container">
                        {
                            propertiesArray.map((prop, index) => (
                                <Accordion propertyName={prop.title} key={index}
                                    activeIndex={isActiveproperty === index} handleClick={() => handleAccordionClick(index)}>
                                    <div className="accordion-content">
                                        {
                                            prop.options.length !== 0 &&
                                            <div className="options-container">
                                                {
                                                    prop.options.map((option, index) => (
                                                        <>
                                                            <div className="option" key={index}>
                                                                <p className="value">{option.title}</p>
                                                                <div className="delete">
                                                                    <span onClick={() => onDeleteOption(index)}><PiTrashSimple size={"16px"} /></span>
                                                                </div>
                                                                <div className="arrows">
                                                                    <span><PiCaretUp /></span>
                                                                    <span><PiCaretDown /></span>
                                                                </div>
                                                            </div>
                                                            {
                                                                index !== prop.options.length - 1 &&
                                                                <>
                                                                    <div className="gap"
                                                                        onClick={() => {
                                                                            onOpenNewOptionBetween(index);
                                                                            setIsOpenNewOption(false)
                                                                        }}>
                                                                        <div className="line"></div>
                                                                        <span><PiPlusBold size={"14px"} /></span>
                                                                    </div>
                                                                    {
                                                                        isOpenNewOptionBetween[index] &&
                                                                        <div className="new-option" style={{ marginBottom: "16px" }}>
                                                                            <div className="value">
                                                                                <input type="text" placeholder="option"
                                                                                    value={optionToProperty} onChange={(e) => { setOptionToProperty(e.target.value) }} />
                                                                                <div className="spans">
                                                                                    <span className="check" onClick={() => { onAddOptionToProperty(prop.title) }}><PiCheck /></span>
                                                                                    <span className="cancel"
                                                                                        onClick={() => {
                                                                                            setIsOpenNewOptionBetween(new Array(options?.length === 0 ? 0 : (options)?.length - 1).fill(false))
                                                                                        }}><PiXBold /></span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    }
                                                                </>
                                                            }
                                                        </>
                                                    ))
                                                }
                                            </div>
                                        }
                                        {
                                            isOpenNewOption &&
                                            <div className="new-option">
                                                <div className="value">
                                                    <input type="text" placeholder="option"
                                                        value={optionToProperty} onChange={(e) => setOptionToProperty(e.target.value)} />
                                                    <div className="spans">
                                                        <span className="check" onClick={() => onAddOptionToProperty(prop.title)}><PiCheck /></span>
                                                        <span className="cancel" onClick={() => { setIsOpenNewOption(false) }}>
                                                            <PiX /></span>
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                        <button className="button"
                                            onClick={() => {
                                                setIsOpenNewOption(true);
                                                setIsOpenNewOptionBetween(new Array(options?.length === 0 ? 0 : (options)?.length - 1).fill(false))
                                            }}>
                                            <span><PiPlusBold size={"12px"} /></span>
                                            Add new option
                                        </button>
                                    </div>
                                </Accordion>
                            ))
                        }
                    </div>
                    {
                        isOpenNewProperty &&
                        <div className="new-property">
                            <div className="property-name">
                                <input type="text" name="property-name"
                                    value={propertyName} onChange={(e) => { setPropertyName(e.target.value) }} />
                                <div className="spans">
                                    <span className="check" onClick={onAddProperty}><PiCheck /></span>
                                    <span className="cancel"
                                        onClick={() => { setIsOpenNewProperty(false) }}>
                                        <PiX /></span>
                                </div>
                            </div>
                            <div className="property-options">
                                {
                                    options.length !== 0 &&
                                    <div className="options-container">
                                        {
                                            options.map((option, index) => (
                                                <>
                                                    <div className="option" key={index}>
                                                        <p className="value">{option.title}</p>
                                                        <div className="delete">
                                                            <span onClick={() => onDeleteOption(index)}><PiTrashSimple size={"16px"} /></span>
                                                        </div>
                                                        <div className="arrows">
                                                            <span><PiCaretUp /></span>
                                                            <span><PiCaretDown /></span>
                                                        </div>
                                                    </div>
                                                    {
                                                        index !== options.length - 1 &&
                                                        <>
                                                            <div className="gap"
                                                                onClick={() => {
                                                                    onOpenNewOptionBetween(index);
                                                                    setIsOpenNewOption(false)
                                                                }}>
                                                                <div className="line"></div>
                                                                <span><PiPlusBold size={"14px"} /></span>
                                                            </div>
                                                            {
                                                                isOpenNewOptionBetween[index] &&
                                                                <div className="new-option" style={{ marginBottom: "16px" }}>
                                                                    <div className="value">
                                                                        <input type="text" placeholder="option"
                                                                            value={propertyOption} onChange={(e) => { setPropertyOption(e.target.value) }} />
                                                                        <div className="spans">
                                                                            <span className="check" onClick={onAddOption}><PiCheck /></span>
                                                                            <span className="cancel"
                                                                                onClick={() => {
                                                                                    setIsOpenNewOptionBetween(new Array(options?.length === 0 ? 0 : (options)?.length - 1).fill(false))
                                                                                }}><PiXBold /></span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            }
                                                        </>
                                                    }
                                                </>
                                            ))
                                        }
                                    </div>
                                }
                                {
                                    isOpenNewOption &&
                                    <div className="new-option">
                                        <div className="value">
                                            <input type="text" placeholder="option"
                                                value={propertyOption} onChange={(e) => setPropertyOption(e.target.value)} />
                                            <div className="spans">
                                                <span className="check" onClick={onAddOption}><PiCheck /></span>
                                                <span className="cancel" onClick={() => { setIsOpenNewOption(false) }}>
                                                    <PiX /></span>
                                            </div>
                                        </div>
                                    </div>
                                }
                                <button className="button"
                                    onClick={() => {
                                        setIsOpenNewOption(true);
                                        setIsOpenNewOptionBetween(new Array(options?.length === 0 ? 0 : (options)?.length - 1).fill(false))
                                    }}>
                                    <span><PiPlusBold size={"12px"} /></span>
                                    Add new option
                                </button>
                            </div>
                        </div>
                    }
                    <button className="button" onClick={() => { setIsOpenNewProperty(true) }}>
                        <span><PiPlusBold size={"12px"} /></span>
                        Add new property
                    </button>
                </div>
            </div>
            <div className="footer">
                <button className="cancel" onClick={onClose}>Cancel</button>
                <button className="add" onClick={onCreateProduct}>Add new product</button>
            </div>
        </div>
    );
}
