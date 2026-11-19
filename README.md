# PUREY wholesale presentation

Arabic RTL storefront, Lavermo private-label collection, wholesale basket and Libyan Arabic shopping assistant. Prices are never quoted in the storefront chat. Product availability and commercial terms require team confirmation.

The committed `site/` folder is the complete static presentation, including optimised product imagery. GitHub Pages publishes this folder without a build; search indexing stays disabled until launch approval.

## Local preview

Run `node source/serve.js` and open the URL it reports.

## Rebuild locally

From `source/`, run:

```
node build-pages.js purey-src.html ../site
node make-deploy.js ../site
```

The catalogue preparation scripts refer to the owner's local photo archive. The static presentation does not require that archive or any secret credentials. Chat policy and product selection live in `source/purey-chat.js`; both the floating widget and the homepage form share it. General questions use the existing Flann endpoint, with grounded local guidance when it is unavailable. Confirmed brand, quantity, price-policy and product-photo questions are handled directly from the published catalogue.
