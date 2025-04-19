import { PiDownloadSimple, PiEye } from "react-icons/pi";
import "./styles.scss";

const File = ({fileName, fileType, onDownloadFile, onShowFile}) => {
    return (
        <div className="file">
            <div className="file-name">
                <p>{fileName}</p>
                <span>{fileType}</span>
            </div>
            <div className="icons">
                <span onClick={onShowFile}>
                    <PiEye />
                </span>
                <span onClick={onDownloadFile}>
                    <PiDownloadSimple />
                </span>
            </div>
        </div>
    )
}

export default File