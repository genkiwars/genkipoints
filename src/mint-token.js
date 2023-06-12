const { cardanocliJs } = require("./cardanocli");
const hex = require('string-hex')
const walletName  = require("./active-wallet.json");
const mintPolicy  = require("./mint-policy.json");

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

exports.initateMint = async (_utxo, _claimInfo) => {

  const wallet = cardanocliJs.wallet(walletName);
  const utxo = JSON.parse(JSON.stringify(_utxo));
  // const amount = Math.floor(_claimInfo.points_to_claim)
  const amount = 1
  const mintReceiver = _claimInfo.wallet_address

  const mintScript = {
    type: "all",
    scripts: [
      mintPolicy
    ],
  };

  const policy = cardanocliJs.transactionPolicyid(mintScript);
  const ASSET_NAME = policy + `.${hex(`GenkiPoints`)}`;

  const tx = {
    txIn: [utxo],
    txOut: [
      {
        address: mintReceiver,
        value: {
          [ASSET_NAME]: amount,
          lovelace: utxo.value.lovelace
        },
      },
    ],
    mint: [{action: "mint", quantity: amount, asset: ASSET_NAME, script: mintScript}],
    witnessCount: 1,
  };

  const raw = createTransaction(tx);
  const signed = signTransaction(wallet, raw, mintScript);
  const txHash = cardanocliJs.transactionSubmit(signed);
  return txHash;
};
