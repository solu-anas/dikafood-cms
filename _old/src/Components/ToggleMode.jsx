import { useEffect, useState } from "react";
import "./toggle-mode.scss";

export default function ToggleMode({modes}) {
    const [toggleOn, setToggleOn] = useState(modes.map((_) => false));
    useEffect(()=>{
        setToggleOn(prev=>{
            prev[0] = true;
            return [...prev];
        })
    }, [])
    const handleToggle = (index) => {
        setToggleOn([false, false].map((_, i) => i === index));
    }

    return (
        <div className='toggle-mode'>
            <div className="options">
                {
                    modes.map((mode, index) => (
                        <div
                            key={index}
                            className={toggleOn[index] ? "active" : ""}
                            onClick={() => handleToggle(index)}>
                            {mode}
                        </div>
                    ))
                }
                <div className={toggleOn[1] === true ? "bg active" :'bg'}></div>
            </div>
        </div>
    )
}
