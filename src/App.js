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
  const [publicTokenCount, setPublicTokenCount] = useState(1);
  const [whitelistTokenCount, setWhitelistTokenCount] = useState(1);
  const [hexProof, setHexProof] = useState([]);
  // const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  // const [maxTokens, setMaxTokens] = useState(0);
  const [contractDetails, setContractDetails] = useState({
    MAX_TOKENS: "",
    allowlistMints: "",
    price: "",
    presalePrice: "",
    whiteListMaxToken: "",
    publicMaxToken: "",
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
      // setPublicTokenCount(2);

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
        let whiteListMaxToken = await nftContract.wlMaxMint();
        let publicMaxToken = await nftContract.publicMaxMint();
        let totalMinted = await nftContract.totalSupply();
        let isPreSaleStarted = await nftContract.wlMintEnabled();
        let freeMax = await nftContract.freeMax();
        console.log('freemax', freeMax.toNumber());

        setContractDetails((prev) => {
          return { ...prev, "MAX_TOKENS": MAX_TOKENS.toString(), "price": price.toString(), "presalePrice": presalePrice.toString(), "whiteListMaxToken": whiteListMaxToken.toString(), "publicMaxToken": publicMaxToken.toString(), "totalMinted": totalMinted.toString(), "preSaleStarted": isPreSaleStarted, "freeMax": freeMax.toNumber() }
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
          ethers.BigNumber.from(publicTokenCount), {
          value: ethers.utils.parseEther((contractDetails.price * publicTokenCount).toString()),
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
        if (contractDetails.freeMax < 4) {
          console.log("1 nft free", contractDetails.price * (publicTokenCount - 1));
          await nftContract.whitelistMint(ethers.BigNumber.from(publicTokenCount), hexProof,
            {
              value: ethers.utils.parseEther((contractDetails.presalePrice * (publicTokenCount - 1)).toString()),
            },
          );
        } else {
          await nftContract.whitelistMint(ethers.BigNumber.from(publicTokenCount), hexProof,
            {
              value: ethers.utils.parseEther((contractDetails.presalePrice * publicTokenCount).toString()),
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

  function handleWhiteListTokenDecrease() {
    if (whitelistTokenCount > 1) {
      setWhitelistTokenCount(whitelistTokenCount - 1);
    }
  }

  const handleWhiteListTokenIncrease = () => {
    if (whitelistTokenCount < contractDetails.whiteListMaxToken) {
      setWhitelistTokenCount(whitelistTokenCount + 1);
    }
  }

  function handlePublicTokenDecrease() {
    if (publicTokenCount > 1) {
      setPublicTokenCount(publicTokenCount - 1);
    }
  }

  const handlePublicTokenIncrease = () => {
    if (publicTokenCount < contractDetails.publicMaxToken) {
      setPublicTokenCount(publicTokenCount + 1);
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

        <div className='row mx-5 main-container'>

          {isWhiteListUser ?
            <>
              <div className="col-md-4 d-flex flex-column justify-content-center">
                <div className='minting-box'>
                  <div>
                    <div className='orange-text my-2'>Token Count</div>
                    <div className="token-input-container d-flex justify-content-center align-items-center">
                      <button className="decrease-count dapp_btn" onClick={handleWhiteListTokenDecrease}>-</button>
                      <div className="token-value dapp_btn mx-2">{whitelistTokenCount}</div>
                      <button className="increase-count dapp_btn" onClick={handleWhiteListTokenIncrease}>+</button>
                    </div>
                    <div className='my-2 orange-text cursor-pointer' onClick={() => setWhitelistTokenCount(contractDetails.whiteListMaxToken)}>max : {contractDetails.whiteListMaxToken}
                    </div>
                  </div>
                  <div className='text-center d-flex flex-column justify-content-center align-items-center'>
                    <button className='ms-2 my-2 dapp_btn' onClick={whiteListMinting}>WhiteList Mint</button>
                  </div>
                </div>
              </div>
            </>
            :
            ""
          }

          <div className="col-md-4 d-flex flex-column justify-content-center">
            <div className='contract-details'>
              <div>
                <div>Supply : <span className='orange-text'>{contractDetails.totalMinted ? contractDetails.totalMinted : "XXXX"} / {contractDetails.MAX_TOKENS ? contractDetails.MAX_TOKENS : "XXXX"}</span></div>
                <div>price : <span className='orange-text'>{contractDetails.price} ETH</span></div>
                <div>Whitelist Price : <span className='orange-text'>{contractDetails.presalePrice} ETH</span></div>
              </div>
            </div>
          </div>

          <div className="col-md-4 d-flex flex-column justify-content-center">
            <div className='minting-box'>
              <div>
                <div className='orange-text my-2'>Token Count</div>
                <div className="token-input-container d-flex justify-content-center align-items-center">
                  <button className="decrease-count dapp_btn" onClick={handlePublicTokenDecrease}>-</button>
                  <div className="token-value dapp_btn mx-2">{publicTokenCount}</div>
                  <button className="increase-count dapp_btn" onClick={handlePublicTokenIncrease}>+</button>
                </div>
                <div className='my-2 orange-text cursor-pointer' onClick={() => setPublicTokenCount(contractDetails.publicMaxToken)}>max : {contractDetails.publicMaxToken}
                </div>
              </div>
              <div className='text-center d-flex flex-column justify-content-center align-items-center'>
                <button className='ms-2 my-2 dapp_btn' onClick={publicMinting}>Public Mint</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
