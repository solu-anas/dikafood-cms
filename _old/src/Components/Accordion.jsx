import { PiCaretDown, PiCaretUp, PiTrashSimple } from "react-icons/pi"
import "./accordion.scss"
import { Children } from "react"

export default function Accordion({ children, propertyName, activeIndex, handleClick}) {

    return (
        <div className="accordion">
            <div className={activeIndex ? "accordion-header active" : "accordion-header"}>
                <div className="name">
                    <span onClick={handleClick}>
                        <span className={activeIndex ? "active" : ""}>
                            <PiCaretDown />
                        </span>
                    </span>
                    <p>{propertyName}</p>
                </div>
                <div className="icons">
                    <span>
                        <PiTrashSimple />
                    </span>
                    <div className="arrows">
                        <span><PiCaretUp /></span>
                        <span><PiCaretDown /></span>
                    </div>
                </div>
            </div>
            {
                activeIndex &&
                <>
                    {Children.map(children, child => (
                        <>{child}</>
                    ))}
                </>
            }
        </div>
    )
}
