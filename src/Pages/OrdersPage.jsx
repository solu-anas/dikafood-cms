import "./orders-page.scss"
import Tabs from '../Components/Tabs'
import { PiBank, PiChatText, PiClipboardText, PiGridFour, PiTruck, PiUserList } from 'react-icons/pi'
import Orders from '../Sections/Orders'
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../App";
import Loader from "../Components/Loader";

export default function OrdersPage() {
  const { isAuthenticated, isChecked, isManager } = useContext(Context);
  const [pageVisible, setPageVisible] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (isChecked && isAuthenticated && isManager) {
      navigate('/manage/orders');
      setPageVisible(true)
    };
    if (isChecked && (!isAuthenticated || !isManager)) {
      setPageVisible(false)
      navigate("/login")
    }
  }, [isChecked, isAuthenticated, navigate, isManager])
  if (pageVisible) {
    const tabTitles = [
      {
        tabName: "Orders",
        icon: <PiClipboardText size={"20px"} />,
        link: "/manage/orders",
        refreshable: true
      },
      { icon: <PiGridFour size={"24px"} color={window.location.pathname === "/manage/products" ? "var(--dark-green-1)" : "var(--dark-grey)"} />, tabName: "Products", link: "/manage/products" },
      { icon: <PiUserList size={"24px"} color={window.location.pathname === "/manage/customers" ? "var(--dark-green-1)" : "var(--dark-grey)"} />, tabName: "Customers", link: "/manage/customers" },
      { icon: <PiChatText size={"24px"} color={window.location.pathname === "/manage/reviews" ? "var(--dark-green-1)" : "var(--dark-grey)"} />, tabName: "Reviews", link: "/manage/reviews" },
      { icon: <PiTruck size={"24px"} color={window.location.pathname === "/manage/delivery" ? "var(--dark-green-1)" : "var(--dark-grey)"} />, tabName: "Delivery", link: "/manage/delivery" },
      { icon: <PiBank size={"24px"} color={window.location.pathname === "/manage/payment" ? "var(--dark-green-1)" : "var(--dark-grey)"} />, tabName: "Payment", link: "/manage/payment" }
    ];
    return (
      <div className='orders-page'>
        <Tabs titles={tabTitles} />
        <Orders />
      </div>
    )
  }
  else {
    return <div className="orders-page"><Loader /></div>
  }
}
