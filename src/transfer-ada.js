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

  const wallet = cardanocliJs.wallet(walletName);
  const utxos = wallet.balance().utxo;
  const balance = wallet.balance().value.lovelace;

  const receiver = "addr1qy2z25h3fcc2nm9yqumkyh4gkktvurl9c6acqtuc6qj63ujn74pc7yyzzcyjqk6zeq3389tsa5e7w4ep05fqvafv2u0scnsgvw";

  const tx = {
    txIn: utxos,
    txOut: [
      {
        address: receiver,
        value: { lovelace: balance },
      },
    ],
    witnessCount: 1,
  };

  const raw = createTransaction(tx);
  const signed = signTransaction(wallet, raw);
  const txHash = cardanocliJs.transactionSubmit(signed);

  console.log("Transfer sucessfull: " + txHash)

  return txHash;
};

initateTransfer()