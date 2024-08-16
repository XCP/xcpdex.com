'use client';

import { useState } from 'react';
import { Button } from '@/components/button';
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/dialog';
import { Field, FieldGroup, Label } from '@/components/fieldset';
import { Input } from '@/components/input';
import { Select } from '@/components/select';

export function MatchOrder({
  market,
  giveAsset,
  giveQuantity,
  getAsset,
  getQuantity,
  ...props
}: {
  market: string;
  giveAsset: string;
  giveQuantity: string;
  getAsset: string;
  getQuantity: string;
} & React.ComponentPropsWithoutRef<typeof Button>) {
  const [isOpen, setIsOpen] = useState(false);
  const [giveAssetState, setGiveAssetState] = useState(giveAsset);
  const [giveQuantityState, setGiveQuantityState] = useState(giveQuantity);
  const [getAssetState, setGetAssetState] = useState(getAsset);
  const [getQuantityState, setGetQuantityState] = useState(getQuantity);

  const handleMatch = async () => {
    try {
      const response = await fetch(
        `https://api.counterparty.io:4000/v2/addresses/${market}/compose/order?give_asset=${giveAssetState}&give_quantity=${giveQuantityState}&get_asset=${getAssetState}&get_quantity=${getQuantityState}`,
        {
          method: 'POST',
        }
      );
      const result = await response.json();
      if (result.success) {
        alert('Order matched successfully!');
      } else {
        alert('Failed to match order: ' + result.error);
      }
      setIsOpen(false);
    } catch (error) {
      alert('Error matching order: ' + error.message);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)} {...props}>
        Match
      </Button>
      <Dialog open={isOpen} onClose={setIsOpen}>
        <DialogTitle>Match Order</DialogTitle>
        <DialogDescription>
          Review and confirm the order details before proceeding with the match.
        </DialogDescription>
        <DialogBody>
          <FieldGroup>
            <Field>
              <Label>Give Asset</Label>
              <Input
                name="giveAsset"
                value={giveAssetState}
                onChange={(e) => setGiveAssetState(e.target.value)}
              />
            </Field>
            <Field>
              <Label>Give Quantity</Label>
              <Input
                name="giveQuantity"
                value={giveQuantityState}
                onChange={(e) => setGiveQuantityState(e.target.value)}
              />
            </Field>
            <Field>
              <Label>Get Asset</Label>
              <Input
                name="getAsset"
                value={getAssetState}
                onChange={(e) => setGetAssetState(e.target.value)}
              />
            </Field>
            <Field>
              <Label>Get Quantity</Label>
              <Input
                name="getQuantity"
                value={getQuantityState}
                onChange={(e) => setGetQuantityState(e.target.value)}
              />
            </Field>
          </FieldGroup>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleMatch}>Confirm Match</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
