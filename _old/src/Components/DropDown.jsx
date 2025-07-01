import React, { useCallback, useEffect, useRef } from 'react'
import { PiCaretDown } from 'react-icons/pi';
import "./drop-down.scss"

export default function DropDown({ options, defaultValue, setIsOpen, isOpen, toggleDropdown, handleOptionClick, selectedOption }) {
    

    const dropDownRef = useRef()
    const handleClickOutside = useCallback((event) => {
        if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    }, [setIsOpen]);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);
    return (
        <div className="dropdown" ref={dropDownRef}>
            <div className={isOpen ? "dropdown-toggle open" : "dropdown-toggle"} onClick={toggleDropdown}>
                <span>by </span> <p>{selectedOption || defaultValue}</p>
                <span className={isOpen ? 'arrow Up' : 'arrow'}>
                    <PiCaretDown className='arrow-up' />
                </span>
            </div>
            {isOpen && (
                <ul className="dropdown-menu">
                    {options.map((option, index) => (
                        <li key={index} onClick={() => {
                            handleOptionClick(option);
                        }}>
                        <div className={selectedOption === option ? 'radio active' :'radio'}><span></span></div>
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
