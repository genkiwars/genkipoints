const { cardanocliJs } = require("./cardanocli");
const walletName  = require("./active-wallet.json");

const createTransaction = (tx) => {
  let raw = cardanocliJs.transactionBuildRaw(tx);
  let fee = cardanocliJs.transactionCalculateMinFee({
    ...tx,
    txBody: raw,
  });
  tx.txOut[0].value.lovelace -= fee;
  return cardanocliJs.transactionBuildRaw({ ...tx, fee });
};

const signTransaction = (wallet, tx, script) => {
  return cardanocliJs.transactionSign({
    signingKeys: [wallet.payment.skey, wallet.payment.skey],
    scriptFile: script,
    txBody: tx,
  });
};

initateTransfer = async () => {

    const wallet = cardanocliJs.wallet("TransferNFT");
    const address = wallet.paymentAddr
    const utxos = wallet.balance().utxo;
    const balance = wallet.balance().value.lovelace;

    // Eto yung lahat ng genkivice na nasa ng wallet
    var allAssets = {}

    for (utxo of utxos) {

        const assets = utxo.value
        delete assets.lovelace;
        allAssets = {...allAssets, ...assets}

    }

    const tx = {
        txIn: utxos,
        txOut: [
                {
                    address: address,
                    value: {
                            lovelace: balance,
                            ...allAssets
                    }
                }
        ],
        witnessCount: 1,
    };

    const raw = createTransaction(tx);
    const signed = signTransaction(wallet, raw);
    const txHash = cardanocliJs.transactionSubmit(signed);

    console.log("Transfer successful: " + txHash)

    return txHash;
};

initateTransfer()