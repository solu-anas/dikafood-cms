import "./styles.scss";

const BurgerOptions = ({ options }) => {
    return (
        <div className="burger-options">
            {
                options.map(({ title, Icon, srcImg, onClick, isActive, theme }, index) => (
                    <div key={index} className={isActive ? `option active ${theme}` : `option ${theme}`} onClick={onClick}>
                        {
                            Icon &&
                            <span><Icon /></span>
                        }
                        {
                            srcImg &&
                            <img src={srcImg} alt={title} />
                        }
                        <p>{title}</p>
                    </div>
                ))
            }
        </div>
    )
}

export default BurgerOptions