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

exports.initiateTransfer = async (receiver, stakedAssets) => {

    const wallet = cardanocliJs.wallet("TransferNFT");
    const utxos = wallet.balance().utxo;
    const balance = wallet.balance().value.lovelace;

    if (utxos.length != 1){
        console.log("Isa lang dapat yung utxo, please consolidate")
        return
    }

    const allAssets = utxos[0].value
    delete allAssets.lovelace;

    // alisin yung stakedAssets(yung isosoli kay user) tapos matitira is yung remaining assets na isosoli naman sa wallet naten
    for (asset in stakedAssets) {
        delete allAssets[asset]
    }
    
    const txOutValue = [
            // eto yung sukli na babalik sa wallet naten matapos bawasan ng 1.5 ada
            {
                address: wallet.paymentAddr,
                value: {
                    lovelace: balance - 1500000,
                    ...allAssets
                }
            },

            // eto yung genkivice ni user + 1.5 ada fee
            {
                address: receiver,
                value: {
                        lovelace: 1500000,
                        ...stakedAssets
                }
            }
    ]

    const tx = {
        txIn: utxos,
        txOut: txOutValue,
        witnessCount: 1,
    };

    const raw = createTransaction(tx);
    const signed = signTransaction(wallet, raw);
    const txHash = cardanocliJs.transactionSubmit(signed);

    console.log("Transfer successful: " + txHash)

    return txHash;
};
