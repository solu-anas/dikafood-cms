import { PiDownloadSimple, PiEye } from "react-icons/pi";
import "./file.scss";

export default function File({fileName, fileType, onDownloadFile, onShowFile}) {
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
