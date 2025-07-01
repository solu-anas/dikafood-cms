import "./styles.scss";
import { useContext, useEffect, useState } from "react";
import { PiArrowLeft, PiGearSix, PiGlobeSimple, PiPencilSimple, PiSignOut, PiUserCircle, PiArrowsClockwiseDuotone } from "react-icons/pi"
import ToggleMode from "../../ui/ToggleMode";
import config from "../../../config";
import { useNavigate } from "react-router-dom";
import { Context } from "../../../App"

const Tabs = ({ titles, onRefresh }) => {
    const [isActiveTab, setIsActiveTab] = useState("");
    const [isOpenSettings, setIsOpenSettings] = useState(false);
    const [isOpenProfile, setIsOpenProfile] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { setIsAuthenticated } = useContext(Context);
    const navigate = useNavigate();
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

    const handleRefresh = () => {
        if (onRefresh && typeof onRefresh === 'function') {
            setIsRefreshing(true);
            onRefresh().finally(() => {
                setTimeout(() => {
                    setIsRefreshing(false);
                }, 1000);
            });
        }
    };

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
                                        {title.link === isActiveTab && title.refreshable && (
                                            <button 
                                                className="tab-refresh-btn" 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleRefresh();
                                                }}
                                                aria-label="Refresh data"
                                            >
                                                <PiArrowsClockwiseDuotone 
                                                    size={16} 
                                                    className={isRefreshing ? "rotating" : ""} 
                                                />
                                            </button>
                                        )}
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
                                <div className="logout">
                                    <button onClick={onLogOut}>
                                        <span>
                                            <PiSignOut size={"12px"} />
                                        </span>
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default Tabs