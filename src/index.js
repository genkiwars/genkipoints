const fs = require("fs");
const { default: fetch } = require("node-fetch");
const { cardanocliJs } = require("./cardanocli");
const { initateMint } = require("./mint-token");
const { initiateTransfer } = require("./transfer-asset");
const { db } = require("./util/db");
const { setTimeout } = require("timers/promises");

const walletName  = require("./active-wallet.json");

var txQueue = [];

// check valid transaction for mint
const checkMint = async () => {

  // GET ALL TRANSACTIONS
  const utxos = cardanocliJs.wallet(walletName).balance().utxo;

  // LOOP THROUGH TRANSACTIONS
  for (const utxo of utxos) {

    // DB CHECK
    var docRef = db.collection("genki_points_claim_requests").doc(utxo.txHash);
    const claimInfo = await docRef.get().then(doc => doc.data()); // data na sine-save pagka-mint sa website app
    const safetyCheck = claimInfo != undefined;

    if (safetyCheck && !txQueue.includes(utxo.txHash)) {

      txQueue.push(utxo.txHash)

      console.log("Minting for txHash: " + utxo.txHash);

      // RETURN STAKED GENKIVICE
      const genkiTeam = await db.collection("teams").doc(claimInfo.unstake_this_team).get().then(doc => doc.data());
      const stakedGenkiVice = genkiviceAssetIDs(genkiTeam.members)
      const txHash2 = await initiateTransfer(claimInfo.wallet_address, stakedGenkiVice);
      console.log("Genkivice Returned, TxHash: " + txHash2);

      if (txHash2 && txHash2 != undefined){
        
        // GIVE GENKIPOINTS
        const txHash = await initateMint(utxo, claimInfo);
        console.log("Token Minted, TxHash: " + txHash);

        if (txHash && txHash != undefined){
          updateDB(txHash, claimInfo)
          await setTimeout(60000);
        }

      }
      
    }

    // 
  }

  await setTimeout(10000)
  checkMint()
};

checkMint();

function genkiviceAssetIDs(genkiTeam){

  var genkiViceAssetID = {}

  genkiTeam.forEach(genki => {

    // eto yung gagamitin as tx output sa pagsend ng transaction
    genkiViceAssetID[genki.policy_id + '.' + genki.asset_name] = 1 // Sample output: '13f180823269e75f00d2001a47764afdd581b016687fdf4710c17c0e.47656e6b6956696365323536': 1 

  });

  return genkiViceAssetID

}

function updateDB(txHash, claimInfo){

  const claimRef = db.collection('genki_points_claim_requests').doc(claimInfo.claim_request_tx_hash);

  claimRef.update({redeemd_tx_hash: txHash}).then(() => {
      console.log("Document successfully written!");
  })
  .catch((error) => {
      console.error("Error writing document: ", error);
  });

  const teamRef = db.collection('teams').doc(claimInfo.unstake_this_team);

  teamRef.update({unstaked: true}).then(() => {
      console.log("Document successfully written!");
  })
  .catch((error) => {
      console.error("Error writing document: ", error);
  });
  
}

console.log("Wallet waiting for transactions...");