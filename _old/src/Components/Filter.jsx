import { PiCheck, PiMinus } from "react-icons/pi";
import "./filter.scss";
import ToggleButton from "./ToggleButton.jsx";
import { useEffect, useState } from "react";


export default function Filter({ options, isOn, onToggle, checked, onCheck, onSeletAll, count }) {


    const [theme, setTheme] = useState("")
    useEffect(() => {
        if (checked.every(item => item === true)) {
            setTheme("all");
        } else if (checked.some(item => item === true)) {
            setTheme("almost");
        }
        else {
            setTheme("");
        }
    }, [checked]);
    
    return (
        <div className="filter-container">
            <div className="filter">
                <div className="header">
                    <div className="check" onClick={()=>onSeletAll(options.map(o=>o.name))}>
                        <div className={theme}>
                            {
                                theme === "almost" ?
                                    <PiMinus size={"12px"} color="var(--dark-green-1)" />
                                    :
                                    <PiCheck
                                        size={"12px"}
                                        color={theme === "all" ? "var(--dark-green-1)" : "#CCC"}
                                    />
                            }
                        </div>
                        <p>All ({count})</p>
                    </div>
                    <ToggleButton toggleButton={onToggle} isOn={isOn} />
                </div>
                <div className="body">
                    {
                        options.map((item, index) => (
                            <div className="item" onClick={() => onCheck(index, item.name)} key={index}>
                                <div className={checked[index] ? "checkbox active" : "checkbox"}>
                                    <PiCheck size={"12px"} />
                                </div>
                                <p>{item.name}({item.count})</p>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}
