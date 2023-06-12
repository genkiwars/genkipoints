const { cardanocliJs } = require("./cardanocli");
const fetch = require("node-fetch");
const metadata = require("./metadata.json");
const POLICY_ID = "f73e3bee69f81d5c33f83bda21c25b7e76b6272d2105600e3480fcb1";
const hex = require('string-hex')

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

const signTransactionRefund = (wallet, tx) => {
  return cardanocliJs.transactionSign({
    signingKeys: [wallet.payment.skey],
    txBody: tx,
  });
};

exports.initateMint = async (_utxo, _databaseRecord) => {

  const wallet = cardanocliJs.wallet("ADAPI");
  const utxo = JSON.parse(JSON.stringify(_utxo));

  // CHANGE THIS (GET FROM mint-policy.json)
  const mintScript = {
    type: "all",
    scripts: [
      { slot: 72998790, type: "before" },
      {
        keyHash: "4258384412e138f99268b0a0e662aaf130420846eef59b0efe97607d",
        type: "sig",
      },
    ],
  };

  const policy = cardanocliJs.transactionPolicyid(mintScript);

  const GENKI = policy + `.${hex(`Genki${_databaseRecord.id}`)}`;

  const tx = {
    txIn: [utxo],
    txOut: [
      {
        address: "addr1q9p9swzyztsn37vjdzc2penz4tcnqssggmh0txcwl6tkqldr5dhjfgxt0lqyzlpplrh0ptxv488zaqg593fm0lpmkxaqa7jn8y",
        value: { lovelace: utxo.value.lovelace - cardanocliJs.toLovelace(1.5) },
      },
      {
        address: _databaseRecord.wallet_address,
        value: {
          // [GENKI]: 1,
          [GENKI]: 1,
          lovelace: cardanocliJs.toLovelace(1.5), // REFUND THE MIN ADA
        },
      },
    ],
    mint: [{action: "mint", quantity: 1, asset: POLICY_ID + "." + hex(`Genki${_databaseRecord.id}`), script: mintScript}],
    metadata: { 721: { [POLICY_ID]: { [`Genki${_databaseRecord.id}`]: metadata[_databaseRecord.id] } }} ,
    witnessCount: 2,
  };

  const raw = createTransaction(tx);
  const signed = signTransaction(wallet, raw, mintScript);
  const txHash = cardanocliJs.transactionSubmit(signed);
  return txHash;
};

exports.initateRefund = async (_utxo) => {
  const wallet = cardanocliJs.wallet("ADAPI");
  const mintScript = {
    keyHash: cardanocliJs.addressKeyHash(wallet.name),
    type: "sig",
  };

  const utxo = JSON.parse(JSON.stringify(_utxo));

  const receiver = await fetch(
    `https://cardano-mainnet.blockfrost.io/api/v0/txs/${utxo.txHash}/utxos`,
    { headers: { project_id: "mainnet7lBg6IqZiHw8nNJmSbZdMy30rngAvcKd" } }
  )
    .then((res) => res.json())
    .then((res) => res.inputs[0].address);

  const balance = utxo.amount;

  const tx = {
    txIn: [utxo],
    txOut: [
      {
        address: receiver,
        lovelace: balance,
      },
    ],
    witnessCount: 1,
    metadata: {
      0: {
        message:
          "Refund. Amount matches no SpaceBud. Please send the exact amount",
      },
    },
  };

  const raw = createTransaction(tx);
  const signed = signTransactionRefund(wallet, raw, mintScript);
  const txHash = cardanocliJs.transactionSubmit(signed);
  return txHash;
};
