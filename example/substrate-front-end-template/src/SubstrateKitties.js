import React, { useState, useEffect } from 'react';
import { Form, Grid } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import KittyCards from './KittyCard';
import { TxButton } from './substrate-lib/components';

// Based on the SubstrateKitties module
// https://github.com/shawntabrizi/substratekitties

export default function SubstrateKitties (props) {
  const { api } = useSubstrate();
  const [status, setStatus] = useState('');
  const [allKittiesCount, setAllKittiesCount] = useState(0);
  const [allKittiesArray, setAllKittiesArray] = useState([]);

  useEffect(() => {
    let unsubKittyCnt = null;
    const rpc = api.query.kittyStorage;

    const fetchKitties = async () => {
      unsubKittyCnt = await rpc.allKittiesCount(async kittyCnt => {
        kittyCnt = kittyCnt.toNumber();
        setAllKittiesCount(kittyCnt);
        const allKitties = [];

        // Retrieve all kitties, owners, and its price
        // const kittyRange = Array.from(Array(kittyCnt).keys());
        for (let i = 0; i < kittyCnt; i++) {
          const kittyId = await rpc.allKittiesArray(i).then(a => a.toJSON());
          const [dnas, kittyOwner] = await Promise.all([
            rpc.kitties(kittyId).then(a => a.toJSON()),
            rpc.kittyOwner(kittyId).then(a => a.toJSON())
          ]);
          const kitties = {
            dna: dnas,
            owner: kittyOwner,
            price: 0
          };
          allKitties.push(kitties);
        }
        // const [dnas, kittyOwner, kittyPrice] = await Promise.all([
        //   rpc.kitties.multi(kittyRange),
        //   rpc.kittyOwner.multi(kittyRange),
        //   rpc.kittyOwner.multi(kittyRange)
        // ]);
        // const kitties = kittyRange.map(i => ({
        //   dna: dnas[i].unwrapOr(null),
        //   owner: kittyOwner[i].unwrapOr(null),
        //   price: kittyPrice[i].unwrapOr(null)
        // }));
        setAllKittiesArray(allKitties);
      });
    };

    fetchKitties();

    return () => {
      // clean up function
      unsubKittyCnt && unsubKittyCnt();
    };
  }, [allKittiesCount, api.query.kittyStorage]);

  return (
    <Grid.Column>
      <h1>Substrate Kitties</h1>
      <h3>Number of Kitties Purring: {allKittiesCount.toString()}</h3>
      {allKittiesArray.length > 0 ? (
        <KittyCards kitties={allKittiesArray} />
      ) : (
        'No Kitty Found.'
      )}

      <Grid stackable columns='2'>
        <Grid.Row>
          <Grid.Column>
            <Form>
              <h3>Create 10 Kitties</h3>
              <Form.Field>
                <TxButton
                  accountPair={props.accountPair}
                  label={'Create 10 Kitties'}
                  setStatus={setStatus}
                  type='TRANSACTION'
                  attrs={{ params: [], tx: api.tx.kittyStorage.createKitties }}
                />
              </Form.Field>
            </Form>
          </Grid.Column>
        </Grid.Row>
        {status ? (
          <Grid.Row>
            <Grid.Column>{status}</Grid.Column>
          </Grid.Row>
        ) : null}
      </Grid>
    </Grid.Column>
  );
}
