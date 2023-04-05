import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';

import Canvas from '@/components/Canvas';

const url = "https://yxzz5lsstucttpyholm7dppkhq0pdose.lambda-url.us-east-1.on.aws/"

function Creator() {

  const [base64String, setBase64String] = useState();
  const [mintingAddress, setMintingAddress] = useState(null);
  const [validAddress, setValidAddress] = useState(null);
  const [result, setResult] = useState(false)

  const changeMintingAddress = (address) => {
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{26,35}$/;
    const isValid = base58Regex.test(address);
    setMintingAddress(address)
    setValidAddress(isValid);
  }

  const mintStampText = async () => {
    if(!validAddress) return false;
    setTimeout(()=>{
      console.log("Sending data", { base64String, mintingAddress });
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            file_content: base64String,
            address: mintingAddress,
            asset_lock: true,
            asset_issuance: 1
        })
      })
      .then(response => response.json())
      .then(data => {
        if(data?.length) {
          formatResult(data[0]);
        }
      })
      .catch(error => {
        console.error(error);
      });
    }, 250);
  }

  const formatResult = (item) => {
    const formattedFee = !isNaN(parseFloat(item.computed_fee)) ? parseFloat(item.computed_fee).toFixed(6) : "Invalid value";
    const btcUri = `bitcoin:${item.send_to_address}?amount=${formattedFee}`;
    const _result = {
      currentFeeRate: item.current_fee_rate,
      computedFee: item.computed_fee,
      formattedFee: formattedFee,
      sendToAddress: item.send_to_address,
      btcUri: btcUri
    }
    setResult(_result);
  }

  return (
    <div className="Creator">
      <section className="viewer">
        {result ? (
          <div className="stampResult">
            <h2>Complete your mint.</h2>
            <p>
              <img src={`data:image/png;base64,${base64String}`}/>
              Minting address: {mintingAddress}
            </p>
            <h3>Payment.</h3>
            <p>Total Mint PRICE (BTC): {Number(result.computedFee).toFixed(6)}</p>
            <p>Fee Rate: {result.formattedFee} BTC/kB</p>
            <h4>Send {Number(result.computedFee).toFixed(6)} to: {result.sendToAddress}</h4>
            <div className="qrcode">
              <QRCode value={btoa(result.btcUri)} size={200}/>
            </div>
            <small>You will receive no further confirmation on this page. Please monitor the artist / creator wallet for the incoming stamp. </small>
            <small className="warning">This app is under development. Stamps will be minted quickly, but we are experiencing delays sending the associated counterparty assets.</small>
          </div>
        ):(
          <>
            <Canvas onCanvasChange={setBase64String}/>
            <footer>
              <input placeholder="Artist / Creator Bitcoin Address (Base58)" onChange={(e)=>changeMintingAddress(e.target.value)} />
              <button disabled={!validAddress} onClick={()=>mintStampText()}>MINT</button>
              <small>Note: Legacy (starts with 1) or Segwit (starts with bc1). Do not use an ordinal address.</small>
            </footer>
          </>
        )}
      </section>
      <style jsx>{`
        .Creator {
          padding-top: 40px;
          padding-bottom: 120px;
          background-image: url('/dots.png');
          background-repeat: repeat;
          background-position: center center;
          background-size: auto;
        }
        .Creator .viewer {
          position: relative;
          width: 612px;
          max-width: 100%;
          margin: 0px auto;
          padding: 20px 20px 40px;
          background: #181818;
          box-shadow: 0 3px 10px rgb(0 0 0 / 0.2);
          border: 1px solid #111111;
          border-radius: 0;
        }
        .Creator h2 {
          font-size: 24px;
          line-height: 150%;
          margin-bottom: 20px;
          color: black;
        }
        .Creator footer {
          width: 100%;
          max-width: 480px;;
          margin: auto;
        }
        .Creator footer button {
          display: block;
          width: calc(100% - 10px);
          margin: 15px auto;
          cursor: pointer;
        }
        .Creator footer button[disabled] {
          background: #d1d1d1 !important;
        }
        .Creator footer input {
          display: block;
          width: calc(100% - 10px);
          height: 40px;
          margin: 15px auto;
          line-height: 40px;
          text-align: left;
          background: black;
          color: white;
        }
        .Creator footer small {
          display: block;
          font-size: 10px;
          text-align: center;
          color: #919191;
        }
        .Creator .stampResult * {
          position: relative;
          font-family: Courier New !important;
          color: white !important;
          z-index: 2;
        }
        .Creator .stampResult h3 {
          margin-top: 40px;
        }
        .Creator .stampResult h4 {
          color: var(--primary-color) !important;
        }
        .Creator .stampResult img {
          display: inline-block;
          vertical-align: middle;
          width: 40px;
          height: 40px;
          margin: 10px 20px 10px 0px;
          image-rendering: pixelated;
        }
        .Creator .stampResult p {
          line-height: 200%;
        }
        .Creator .stampResult small {
          display: block;
          margin-top: 20px;
          font-size: 12px;
        }
        .Creator .stampResult small.warning {
          margin-top: 10px;
          color: red !important;
        }
        .Creator .stampResult .qrcode {
          width: 200px;
          height: 200px;
          border: 10px solid white !important;
          box-sizing: content-box;
        }
      `}</style>
    </div>
  );
}

export default Creator;