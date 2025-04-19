import { PiCaretDown, PiCaretUp, PiCornersOut, PiPencilSimple, PiStar, PiStarFill, PiTrash } from "react-icons/pi"
import "./image.scss"

export default function Image({img, name, onDelete, isMain, onMakeMain}) {
    return (
        <div className="image">
            <div className="img-prod">
                <img src={img} alt="" />
                <span><PiCornersOut size={"16px"} /></span>
            </div>
            <div className="prod-name">
                <p>{name}</p>
            </div>
            <div className="actions">
                <span><PiPencilSimple /></span>
                <span onClick={onDelete}><PiTrash /></span>
            </div>
            <div className={isMain ? "star active" :"star"} onClick={onMakeMain}>
                <span>
                {
                    isMain ? <PiStarFill />
                    : <PiStar />
                }
                </span>
            </div>
            <div className={isMain? "arrows active" :"arrows"}>
                <span><PiCaretUp /></span>
                <span><PiCaretDown /></span>
            </div>
        </div>
    )
}
