// import logo from './logo.svg';
import './WalletChecker.scss';
import { ConnectWallet, useAddress } from "@thirdweb-dev/react";
import React, { useState, useEffect } from 'react'
import logo from '../../shylock-logo.png';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import Modal from "../common/Modal";

function WalletChecker() {
    const address = useAddress();
    let navigate = useNavigate();

    const [isWhiteListUser, setIsWhiteListUser] = useState("");
    const [isOpenWalletChecker, setisOpenWalletChecker] = useState(false);
const [addressChecker, setAddressChecker] = useState("");

    // All Whitelisted Address
    let whitelist = [
        '0x624deBbC5c3Ff951b257cB4E06975Aa82a36E642', // metamask id ben
        '0xCEa3506e61c9F3f839eB881E4E1e5ebfA19B13F1', // metamask id ben
        '0xf3f91d957D142703cc26E3C6a70df14036906F27', // metamask id ben
        '0xf6D14956e5c77390C8367CCDbcb5b845244365dE',
        '0x4f6Cb155B513c6b917Beab345a01be235a2DB28E',
        '0xE4C70800F7fBf773A5E18BC96b0eF4135f63f63E',
        '0x97557dB165c299663Ef134F18E1Fb3F093a1F15e',
        '0x670f8FE66F551cdeDa29eAF0Bf380A412e404127',
        '0xb9395AfB1a1a42050fa11562C4c9cA35D1Ec7cF3',
        '0xB282100108E572c21A199ec9B0B4E9cCA3BB641C',
        '0x0Ba6D5893166676B18Ab798a865671d36F11b793'
    ]

const handleSearchChange = (e) => {
    setAddressChecker(e.target.value)
}

const handleCheckAddress = () => {
    if (whitelist.includes(addressChecker)) {
        setIsWhiteListUser("whiteList");
    } else {
        setIsWhiteListUser("notWhiteList");
    }
}

    return (
        <div className="App">

            <div className="mint-container text-center">
                <div className="header d-flex">
                    <div className="twitter-id back-btn ms-3">

                    </div>
                    <div className="logo-container cursor-pointer" onClick={() => navigate('/')}>
                        <img src={logo} className="shylock-logo" alt="logo" />
                    </div>
                    <div className='d-flex align-items-center'>
                        {/* <div className='cursor-pointer me-4' onClick={() => navigate('/wallet-checker')}>Wallet Checker</div> */}
                        <div className={`metakey me-2 ${address ? "border-orange" : ""}`}>
                            <ConnectWallet
                                accentColor="#000"
                            />
                        </div>
                    </div>
                </div>

                <div className='main-container d-flex align-items-center justify-content-center'>
                    <button className="wallet-checker-btn dapp_btn" onClick={() => setisOpenWalletChecker(!isOpenWalletChecker)}>
                        Wallet Checker
                    </button>
                </div>

            </div>
            <Modal
            isOpen={isOpenWalletChecker}
            toggle={() => setisOpenWalletChecker(!isOpenWalletChecker)}
            size="md"
            headTitle="WHITELIST CHECKER"
          >
           <div className='d-flex'>
           <input type="text" className="input-field me-2" name='whiteListAddress' value={addressChecker} onChange={handleSearchChange}/>
           <button className="dapp_btn" onClick={handleCheckAddress}>Check</button>
           </div>
           <div className={`mt-2 ${isWhiteListUser === 'whiteList' ? "green-text" : isWhiteListUser === 'notWhiteList' ? "red-text" : ""}`}>
           {isWhiteListUser === 'whiteList' ? "Congratulations you are whiteListed" : isWhiteListUser === 'notWhiteList' ? "Sorry, you are not Whitelisted" : ""}
           </div>
          </Modal>
        </div>
    );
}

export default WalletChecker;
