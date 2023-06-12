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

initiateTransfer = async () => {

    const wallet = cardanocliJs.wallet("TransferNFT");
    const utxos = wallet.balance().utxo;

    if (utxos.length != 1){
        console.log("Isa lang dapat yung utxo, please consolidate")
        return
    }

    
    const txOutValue = [
            {
                address: "addr1qxrszqzatd9xa4d3pkzm62j83shl495qpcj6hst3scdxkvmuesjs2g5xjnrwqzg4cv84ecehlu29939v8h73t2uzxwqq3gvq3p",
                value: utxos[0].value
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

initiateTransfer()
