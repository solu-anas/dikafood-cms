import React from 'react'
import { PiCheck, PiX } from 'react-icons/pi'
import "./styles.scss"

const Alert = ({ onConfirm, onClose, alertHeader, alertMessage, alertIcon, theme}) => {
    const classList = ["item", theme]
    return (
        <div className={"alert"}>
            <div className={classList.join(" ")}>
                <span>
                    {alertIcon}
                </span>
                <p>{alertHeader}</p>
            </div>
            <div className="confirmation">
                <p>
                    {alertMessage}
                </p>
                <div className="buttons">
                    <button className="confirm" onClick={onConfirm}>
                        <span>
                            <PiCheck />
                        </span>
                        Confirm
                    </button>
                    <button className="cancel" onClick={onClose}>
                        <span><PiX /></span>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Alert