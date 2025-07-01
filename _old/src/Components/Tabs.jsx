import "./tabs.scss";
import { useContext, useEffect, useState } from "react";
import { PiArrowLeft, PiGearSix, PiGlobeSimple, PiPencilSimple, PiSignOut, PiUserCircle } from "react-icons/pi"
import ToggleMode from "./ToggleMode";
import config from "../config";
import { useNavigate } from "react-router-dom";
import { Context } from "../App"
// import Input from "./Input";

export default function Tabs({ titles }) {
    const [isActiveTab, setIsActiveTab] = useState("");
    // const [refresh, setRefresh] = useState(false)
    const [isOpenSettings, setIsOpenSettings] = useState(false);
    const [isOpenProfile, setIsOpenProfile] = useState(false);
    const { setIsAuthenticated } = useContext(Context);
    // const [userInfo, setUserInfo] = useState();
    const navigate = useNavigate();
    // const [newEmail, setNewEmail] = useState("");
    // const [oldPassword, setOldPassword] = useState("");
    // const [newPassword, setNewPassword] = useState("");
    // const [confirmNewPassword, setConfirmNewPassword] = useState("");
    // const [isOpenInputEmail, setIsOpenInputEmail] = useState(false);
    // const [isOpenInputPassword, setIsOpenInputPassword] = useState(false);
    // const [message, setMessage] = useState("")
    const pathname = window.location.pathname;
    useEffect(() => {
        setIsActiveTab(pathname)
    }, [pathname])

    const onOpenSettings = () => {
        setIsOpenSettings(!isOpenSettings);
        setIsOpenProfile(false)
    }

    const onClose = () => {
        setIsOpenSettings(false);
        setIsOpenProfile(false);
    }

    const onOpenProfile = () => {
        setIsOpenProfile(!isOpenProfile);
        setIsOpenSettings(false)
    }

    const onLogOut = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(config.API_BASE + "/auth/logout", {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ agentType: "manager" })
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setIsAuthenticated(false);
                    navigate('/login');
                }
            } else {
                const errorData = await response.json();
                console.log(errorData)
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    // useEffect(() => {
    //     fetch(config.API_BASE + "/me", {
    //         method: "GET",
    //         credentials: "include",
    //         headers: {
    //             "Content-Type": "application/json",
    //         }
    //     })
    //         .then(res => res.json())
    //         .then(data => {
    //             setUserInfo(data)
    //         })
    //         .catch(err => {
    //             console.log(err)
    //         })
    // }, [refresh])

    // useEffect(() => {
    //     setNewEmail(userInfo?.email)
    // }, [userInfo])

    // const onOpenInputEmail = () => {
    //     setIsOpenInputEmail(true);
    //     setIsOpenInputPassword(false)
    // }

    // const onOpenInputPassword = () => {
    //     setIsOpenInputPassword(true);
    //     setIsOpenInputEmail(false)
    // }

    // const onCloseInput = () => {
    //     setIsOpenInputEmail(false);
    //     setIsOpenInputPassword(false)
    // }

    // const onEditEmail = () => {
    //     fetch(config.API_BASE + "/me/email/change", {
    //         method: "POST",
    //         credentials: "include",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({ email: newEmail })
    //     })
    //         .then(res => res.json())
    //         .then(data => {
    //             console.log(data.success)
    //             setMessage("email updated successfully")
    //             setTimeout(() => {
    //                 setMessage("");
    //             }, 3000)
    //             setRefresh(!refresh)
    //             setIsOpenInputEmail(false)
    //         })
    // }

    // const onEditPassword = () => {
    //     fetch(config.API_BASE + "/me/password/change", {
    //         method: "POST",
    //         credentials: "include",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({ oldPassword: oldPassword, newPassword: newPassword })
    //     })
    //         .then(res => res.json())
    //         .then(data => {

    //             if (data.success) {
    //                 console.log(data.success)
    //                 setMessage("password updated successfully")
    //                 setTimeout(() => {
    //                     setMessage("");
    //                 }, 3000)
    //                 setRefresh(!refresh)
    //                 setIsOpenInputPassword(false)
    //                 setNewPassword("")
    //                 setOldPassword("")
    //             }
    //             else {
    //                 setMessage(data.error)
    //                 setTimeout(() => {
    //                     setMessage("")
    //                 }, 3000)
    //             }
    //         })
    // }

    // const [confirmation, setConfirmation] = useState("");

    // useEffect(() => {
    //     if (newPassword === confirmNewPassword) {
    //         setConfirmation("")
    //     }
    //     else {
    //         setConfirmation("Passwords do not match")
    //     }
    // }, [confirmNewPassword, newPassword])
    // const [isVisiblePass, setIsVisiblePass] = useState([false, false, false])
    return (
        <div className="tabs">
            <div className="tabs-container">
                <div className="top">
                    {
                        titles.map((title, index) => {
                            return (
                                <div key={index} className={title.link === isActiveTab ? "tab active" : "tab"}>
                                    <a href={title.link}>
                                        <span>
                                            {title.icon}
                                        </span>
                                        <p>{title.tabName}</p>
                                    </a>
                                </div>
                            )
                        })
                    }
                </div>
                <div className="bottom">
                    <div className={isOpenSettings ? "tab active" : "tab"} onClick={onOpenSettings}>
                        <span>
                            <PiGearSix size={"24px"} color={isOpenSettings ? "var(--dark-green-1)" : "var(--dark-grey)"} />
                        </span>
                        <p>
                            Settings
                        </p>
                    </div>
                    <div className={isOpenProfile ? "tab active" : "tab"} onClick={onOpenProfile}>
                        <span>
                            <PiUserCircle size={"24px"} color={isOpenProfile ? "var(--dark-green-1)" : "var(--dark-grey)"} />
                        </span>
                        <p>
                            Profile
                        </p>
                    </div>
                    <div className={window.location.pathname === "/manage/sessions" ? "tab active" : "tab"}>
                        <a href="/manage/sessions">
                            <span>
                                <PiGlobeSimple size={"24px"} color={window.location.pathname === "/manage/sessions" ? "var(--dark-green-1)" : "var(--dark-grey)"} />
                            </span>
                            <p>
                                Sessions
                            </p>
                        </a>
                    </div>
                    {
                        isOpenSettings &&
                        <div className="settings">
                            <div className="header">
                                <div>
                                    <span>
                                        <PiGearSix size={"16px"} color="var(--dark-grey)" />
                                    </span>
                                    <p>Settings</p>
                                </div>
                                <div>
                                    <span onClick={onClose}>
                                        <PiArrowLeft size={"12px"} color="#000" />
                                    </span>
                                </div>
                            </div>
                            <div className="body">
                                <div>
                                    <p>Display mode</p>
                                    <ToggleMode
                                        modes={["Light", "Dark"]}
                                    />
                                </div>
                                <div>
                                    <p>Language</p>
                                    <ToggleMode
                                        modes={["Frensh", "English"]}
                                    />
                                </div>
                            </div>
                        </div>
                    }
                    {
                        isOpenProfile &&
                        <div className="profile">
                            <div className="header">
                                <div>
                                    <span>
                                        <PiUserCircle size={"16px"} color="var(--dark-grey)" />
                                    </span>
                                    <p>Profile</p>
                                </div>
                                <div>
                                    <span onClick={onClose}>
                                        <PiArrowLeft size={"12px"} color="#000" />
                                    </span>
                                </div>
                            </div>
                            <div className="body">
                                {/* {
                                    message && (
                                        message.includes("WRONG") ?
                                            <div className="message error"><p>{message}</p></div>
                                            :
                                            <div className="message"><p>{message}</p></div>
                                    )

                                } */}
                                <div>
                                    <p>Email</p>
                                    <div>
                                        <p>mery</p>
                                        <span>
                                            <PiPencilSimple size={"12px"} color="var(--dark-grey)" />
                                        </span>
                                    </div>
                                </div>
                                <div className="change-password">
                                    <p>Password</p>
                                    <div>
                                        <p>**********</p>
                                        <span>
                                            <PiPencilSimple size={"12px"} color="var(--dark-grey)" />
                                        </span>
                                    </div>

                                </div>
                                <button onClick={(e) => { onLogOut(e) }}>
                                    <PiSignOut />
                                    Log out
                                </button>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}
