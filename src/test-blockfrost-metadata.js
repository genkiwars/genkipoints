async function get(){


    // const utxo = JSON.parse(JSON.stringify(_utxo));
    
    
    const receiver = await fetch(
        `https://cardano-mainnet.blockfrost.io/api/v0/assets/f73e3bee69f81d5c33f83bda21c25b7e76b6272d2105600e3480fcb147656e6b6933`,
        { headers: { project_id: "mainnet7lBg6IqZiHw8nNJmSbZdMy30rngAvcKd" } }
      )
        .then((res) => res.json());
    
    console.log( receiver );
    
    }
    
    get();