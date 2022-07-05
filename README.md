# wallet-lnd
This is my personal implementation of a wallet service as part of my LnD.
You can check the exercise documentation here: https://github.com/VGW/lnd-web-api

tl;dr
```
Requests for an unknown wallet's coin balance return 404 HTTP response code.

Requests for an known wallet's coin balance return the balance with a 200 HTTP response code.

Credits to a wallet will return the updated balance and a 201/Created HTTP response code.

Debits to a wallet will return the updated balance and a 201/Created HTTP response code.

Debit for more than the balance will be rejected with a 400/BadRequest HTTP response code.

If the same Credit or Debit is issued immediately after each other, the request is acknowledged as successful, but is not actually processed. The balance is returned with a 202/Accepted HTTP response code.

A wallet is created simply by crediting it.
```