import { PiCornersOut, PiUploadSimpleBold } from "react-icons/pi"
import "./styles.scss"

const UploadImage = ({img, name, onUpload}) => {
    return (
        <div className="upload-image">
            <div className="img">
                <img src={img} alt="" />
                <span><PiCornersOut /></span>
            </div>
            <div className="title">
                <p>{name}</p>
                <button>
                    <input type="file" onChange={onUpload} />
                    <span><PiUploadSimpleBold /></span>
                    <p>Upload logo</p>
                </button>
            </div>
        </div>
    )
}

export default UploadImage