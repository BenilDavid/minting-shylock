// import logo from './logo.svg';
import './App.scss';
import { ConnectWallet, useAddress } from "@thirdweb-dev/react";
import React, { useState, useEffect } from 'react'
import { ethers } from "ethers";
import contractABI from './abi/contractABI.json';
// import web3 from 'web3';
// import { whitelist } from './whitelist';
import MerkleTree from 'merkletreejs';
// import SHA256 from 'crypto-js/sha256';
import keccak256 from 'keccak256';
import logo from './shylock-logo.png';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

const contractAddress = "0x06E37CdB5E7b8AA2C94945A5eC922a48216B9ad4";

function App() {
  const address = useAddress();
  let navigate = useNavigate();

  const [isWhiteListUser, setIsWhiteListUser] = useState(false);
  const [tokenCount, setTokenCount] = useState(1);
  const [hexProof, setHexProof] = useState([]);
  // const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  // const [maxTokens, setMaxTokens] = useState(0);
  const [contractDetails, setContractDetails] = useState({
    MAX_TOKENS: "",
    allowlistMints: "",
    price: "",
    presalePrice: "",
    maxPerALWallet: "",
    maxPerWallet: "",
    totalMinted: "",
    preSaleStarted: true,
    freeMax: null,
  })

  // All Whitelisted Address
  let whitelist = [
    '0x2B9BbC63e0751b460b0423DA967a27Eab12B96cb', // metamask id ben
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

  useEffect(() => {

    const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
    const tempSigner = tempProvider.getSigner();
    setSigner(tempSigner);
    // setProvider(tempProvider);
    getContractDetails();
    findMerkleRoot();
    findHexProof();
    const idx = whitelist.indexOf(address);
    console.log(idx);

    if (whitelist.includes(address)) {
      setIsWhiteListUser(true);
      // setTokenCount(2);

    } else {
      setIsWhiteListUser(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  const getContractDetails = async () => {
    const nftContract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );
    try {
      if (window.ethereum) {
        // let MAX_TOKENS = await nftContract.MAX_TOKENS();
        let MAX_TOKENS = await nftContract.maxSupply();
        let tempPrice = await nftContract.mintPrice();
        let price = ethers.utils.formatEther(tempPrice)
        let tempPresalePrice = await nftContract.wlMintPrice();
        let presalePrice = ethers.utils.formatEther(tempPresalePrice)
        let maxPerALWallet = await nftContract.wlMaxMint();
        let maxPerWallet = await nftContract.publicMaxMint();
        let totalMinted = await nftContract.totalSupply();
        let isPreSaleStarted = await nftContract.wlMintEnabled();
        let freeMax = await nftContract.freeMax();
        console.log('freemax', freeMax.toNumber());

        setContractDetails((prev) => {
          return { ...prev, "MAX_TOKENS": MAX_TOKENS.toString(), "price": price.toString(), "presalePrice": presalePrice.toString(), "maxPerALWallet": maxPerALWallet.toString(), "maxPerWallet": maxPerWallet.toString(), "totalMinted": totalMinted.toString(), "preSaleStarted": isPreSaleStarted, "freeMax": freeMax.toNumber() }
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  //public Mint
  const publicMinting = async () => {

    if (window.ethereum) {

      const nftContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      try {

          await nftContract.publicMint(
            ethers.BigNumber.from(tokenCount), {
            value: ethers.utils.parseEther((contractDetails.price * tokenCount).toString()),
          });

        // let tx = await nftMinting.wait();
        // console.log(tx);
      } catch (error) {
        toast.error("User rejected transaction", {
          position: toast.POSITION.BOTTOM_RIGHT,
          className: 'foo-bar',
          theme: "dark"
        })
        console.log(error);
      }
    } else {
      toast.error("wallet not connected", {
        position: toast.POSITION.BOTTOM_RIGHT,
        className: 'foo-bar',
        theme: "dark"
      })
    }
  };

  //white list Mint
  const whiteListMinting = async () => {

    if (window.ethereum) {
      const nftContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      try {
        console.log(contractDetails.freeMax);
        if(contractDetails.freeMax < 4){
          console.log("1 nft free", contractDetails.price * (tokenCount - 1));
        await nftContract.whitelistMint(ethers.BigNumber.from(tokenCount), hexProof,
          {
            value: ethers.utils.parseEther((contractDetails.presalePrice * (tokenCount - 1)).toString()),
          },
        );
        }else{
          await nftContract.whitelistMint(ethers.BigNumber.from(tokenCount), hexProof,
          {
            value: ethers.utils.parseEther((contractDetails.presalePrice * tokenCount).toString()),
          },
        );
        }
      } catch (error) {
        toast.error("User rejected transaction", {
          position: toast.POSITION.BOTTOM_RIGHT,
          className: 'foo-bar',
          theme: "dark"
        })
        console.log(error);
      }
    } else {
      toast.error("wallet not connected", {
        position: toast.POSITION.BOTTOM_RIGHT,
        className: 'foo-bar',
        theme: "dark"
      })
    }
  };

  const findMerkleRoot = () => {
    let leafNode = whitelist.map(addr => keccak256(addr));
    const merkleTree = new MerkleTree(leafNode, keccak256, { sortPairs: true });
    const rootHash = merkleTree.getHexRoot();
    console.log('roothash', rootHash);
  }

  // new Hex Proof
  const findHexProof = async () => {
    let leafNode = whitelist.map(addr => keccak256(addr));
    // eslint-disable-next-line array-callback-return
    whitelist.map((whiteAddress, index) => {
      // console.log(whiteAddress, index);
      const merkleTree = new MerkleTree(leafNode, keccak256, { sortPairs: true });
      const clamingAddress = leafNode[index];
      const hexProof = merkleTree.getHexProof(clamingAddress);
      const idx = whitelist.indexOf(address);
      if (idx === index) {
        console.log(hexProof, 'hexProof');
        setHexProof(hexProof);
      }
      // return hexProof;
    })
  }

  function handleTokenDecrease() {
  //   if (isWhiteListUser && contractDetails.preSaleStarted) {
  //   if (tokenCount > 2) {
  //     setTokenCount(tokenCount - 1);
  //   }
  // }else{
    if (tokenCount > 1) {
      setTokenCount(tokenCount - 1);
    }
  // }
  }
  const handleTokenIncrease = () => {
    if (isWhiteListUser && contractDetails.preSaleStarted) {
      if (tokenCount < contractDetails.maxPerALWallet) {
        setTokenCount(tokenCount + 1);
      }
    } else {
      if (tokenCount < contractDetails.maxPerWallet) {
        setTokenCount(tokenCount + 1);
      }
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
            <div className='cursor-pointer me-4' onClick={() => navigate('/wallet-checker')}>Wallet Checker</div>
            <div className={`metakey me-2 ${address ? "border-orange" : ""}`}>
              <ConnectWallet
                accentColor="#000"
              />
            </div>
          </div>

        </div>
        {/* <div className="header row align-items-center">
          <div className="col-md-2"></div>
          <div className="col-md-8 logo-container my-2 cursor-pointer">
            <img src={logo} className="shylock-logo" alt="logo" />
          </div>
          <div className="col-md-2 connect-wallet">
            <ConnectWallet
              accentColor="#000"
            />
          </div>
        </div> */}

        <div className='row main-container'>
          <div className="col-md-4 d-flex flex-column justify-content-center">
            <div className='contract-details'>
              <div>
                {/* <div>Metamask address : <span className='orange-text'>{address}</span></div> */}
                {/* <div><b>CONTRACT DETAILS</b></div> */}
                <div>Supply : <span className='orange-text'>{contractDetails.totalMinted ? contractDetails.totalMinted : "XXXX"} / {contractDetails.MAX_TOKENS ? contractDetails.MAX_TOKENS : "XXXX"}</span></div>
                {/* <div>allowlistMints : <span className='orange-text'>{contractDetails.allowlistMints}</span></div> */}
                {/* {!isWhiteListUser ? */}
                <div>price : <span className='orange-text'>{contractDetails.price} ETH</span></div>
                {/* : */}
                <div>Whitelist Price : <span className='orange-text'>{contractDetails.presalePrice} ETH</span></div>
                {/* } */}


                {/* <div>max Whitelist token : <span className='orange-text'>{contractDetails.maxPerALWallet}</span></div>
          <div>max token : <span className='orange-text'>{contractDetails.maxPerWallet}</span></div> */}
              </div>
            </div>

          </div>
          <div className="col-md-4 d-flex flex-column justify-content-center">
            <div className='minting-box'>
              <div>
                <div className='orange-text my-2'>Token Count</div>
                <div className="token-input-container d-flex justify-content-center align-items-center">
                  <button className="decrease-count dapp_btn" onClick={handleTokenDecrease}>-</button>
                  <div className="token-value dapp_btn mx-2">{tokenCount}</div>
                  <button className="increase-count dapp_btn" onClick={handleTokenIncrease}>+</button>
                </div>
                <div className='my-2 orange-text cursor-pointer' onClick={isWhiteListUser && contractDetails.preSaleStarted ? () => setTokenCount(contractDetails.maxPerALWallet) : () => setTokenCount(contractDetails.maxPerWallet)}>max : {isWhiteListUser ?
                  contractDetails.preSaleStarted ? contractDetails.maxPerALWallet : contractDetails.maxPerWallet
                  : contractDetails.maxPerWallet}
                </div>
              </div>

              <div className='text-center d-flex flex-column justify-content-center align-items-center'>

                {address && (
                  isWhiteListUser ?
                    contractDetails.preSaleStarted ?
                      <button className='ms-2 my-2 dapp_btn' onClick={whiteListMinting}>WhiteList Mint</button>
                      :
                      <button className='ms-2 my-2 dapp_btn' onClick={publicMinting}>Mint</button>
                    :
                    <button className='ms-2 my-2 dapp_btn' onClick={publicMinting}>Mint</button>
                )
                }
                {
                  address && (
                    isWhiteListUser ?
                      contractDetails.preSaleStarted ? 
                      <div className='my-2'>You are Whitelisted</div> 
                      : 
                      <div className='my-2'>Your Whitelist Tokens are completed</div>
                      :
                      <div className='my-2'>You are not WhiteListed</div>
                  )
                }
              </div>
            </div>

          </div>
          <div className="col-md-4"></div>
        </div>

      </div>
    </div>
  );
}

export default App;
