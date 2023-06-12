async function get(){


// const utxo = JSON.parse(JSON.stringify(_utxo));


const receiver = await fetch(
    `https://cardano-mainnet.blockfrost.io/api/v0/txs/fa1f4be5288bc843dd90ff71c4eb4961effc97930d233371d845df9f3b4f13d1/utxos`,
    { headers: { project_id: "mainnet7lBg6IqZiHw8nNJmSbZdMy30rngAvcKd" } }
  )
    .then((res) => res.json())
    .then((res) => res.inputs[0].address);

console.log( receiver );

}

get();